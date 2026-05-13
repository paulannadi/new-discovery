// ─────────────────────────────────────────────────────────────────────────────
// seedTimeline
//
// Turns a StartingContext into a flat list of timeline items.
// This is the "hybrid" part of the Smart Planner: the prototype still cares
// about how the user arrived (Tour / Hotel / Flight / Holiday / Activity / AI),
// but the *rendering* is uniform — every context produces the same shape of
// timeline items, just with different products seeded in.
// ─────────────────────────────────────────────────────────────────────────────

import { addDays, format, parseISO } from "date-fns";
import type {
  StartingContext,
  HotelData,
  FlightData,
} from "../pages/SmartPlannerPage";
import type { TourStop, TourTransfer, Activity } from "../../../types";

// ─── Item shapes ─────────────────────────────────────────────────────────────
// Each timeline item is one of these. The discriminating `kind` lets the
// timeline component dispatch to the right card without a big switch.

export type FlightItem = {
  kind: "flight";
  id: string;                          // stable key for React
  direction: "outbound" | "inbound" | "leg";
  legLabel?: string;                   // e.g. "Flight 1 · 15 Jul" (multi-city)
  date: Date;
  flight: FlightData;
};

export type AccommodationItem = {
  kind: "accommodation";
  id: string;
  checkIn: Date;
  nights: number;
  hotel: HotelData;
  showPrice?: boolean;                 // hide for package hotels (price is in pkg)
};

export type ActivityItem = {
  kind: "activity";
  id: string;
  date: Date;
  title: string;
  description: string;
  duration: string;                    // e.g. "2 hours", "Half day"
  location: string;
  image: string;
  price?: string;                      // e.g. "€45 pp"
};

export type TransferItem = {
  kind: "transfer";
  id: string;
  date: Date;
  from: string;
  to: string;
  vehicle: string;                     // e.g. "Private car"
};

export type TimelineItem =
  | FlightItem
  | AccommodationItem
  | ActivityItem
  | TransferItem;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Generate a picsum image URL deterministically from a seed string.
// Same seed always returns the same image — useful for stable previews.
const img = (seed: string, w = 800, h = 400) =>
  `https://picsum.photos/seed/${seed.toLowerCase().replace(/\s+/g, "-")}/${w}/${h}`;

// Returns the "home airport" we depart from in mock flights.
// Hard-coded to London for the prototype.
const HOME_CITY = "London";

// Build a generic round-trip outbound flight for any destination.
function mockOutboundFlight(toCity: string, date: Date): FlightItem {
  return {
    kind: "flight",
    id: `flight-out-${toCity}-${date.toISOString()}`,
    direction: "outbound",
    date,
    flight: {
      from: HOME_CITY,
      to: toCity,
      stops: "Direct",
      duration: "8h 25m",
      airline: "British Airways",
      price: "",
    },
  };
}

function mockInboundFlight(fromCity: string, date: Date): FlightItem {
  return {
    kind: "flight",
    id: `flight-in-${fromCity}-${date.toISOString()}`,
    direction: "inbound",
    date,
    flight: {
      from: fromCity,
      to: HOME_CITY,
      stops: "Direct",
      duration: "8h 25m",
      airline: "British Airways",
      price: "",
    },
  };
}

// Build a generic hotel for a destination when the user didn't pick one.
function mockHotel(cityName: string, stars = 4): HotelData {
  return {
    name: `${cityName} Grand Hotel`,
    image: img(`${cityName}-hotel`, 800, 400),
    stars,
    rating: 8.6,
    reviewCount: 412,
    location: cityName,
    price: 0,
  };
}

// ─── Tour-stop expansion ─────────────────────────────────────────────────────
// Tour and some Activities (multi-day-tour, walking-tour, etc.) carry a list
// of TourStops — each with its own accommodation, optional activities, and a
// dateRange. Expand that into the flat TimelineItem array the timeline
// component renders, splicing inter-stop transfers in between.

function stopsToTimelineItems(
  stops: TourStop[],
  transfers: TourTransfer[],
): TimelineItem[] {
  const out: TimelineItem[] = [];

  stops.forEach((stop, idx) => {
    const checkIn = parseISO(stop.accommodation.checkInISO);

    // Accommodation card for this stop
    out.push({
      kind: "accommodation",
      id: `acc-stop-${idx}-${stop.destinationName}`,
      checkIn,
      nights: Math.max(1, stop.nights),
      hotel: {
        name: stop.accommodation.hotelName,
        image: stop.accommodation.image ?? img(`${stop.destinationName}-hotel`),
        stars: stop.accommodation.stars,
        rating: 8.6,
        reviewCount: 0,
        location: stop.destinationName,
        price: 0,
        roomType: stop.accommodation.roomType,
        boardType: stop.accommodation.boardType,
      },
    });

    // Per-stop activities (TourActivity has date/name/description, sometimes image)
    stop.activities?.forEach((act, actIdx) => {
      const actDate = (() => {
        const parsed = new Date(act.date);
        return isNaN(parsed.getTime()) ? checkIn : parsed;
      })();
      out.push({
        kind: "activity",
        id: `act-stop-${idx}-${actIdx}-${act.name}`,
        date: actDate,
        title: act.name,
        description: act.description,
        duration: "Included",
        location: stop.destinationName,
        image: act.image ?? img(`${stop.destinationName}-${act.name}`),
        price: "Included",
      });
    });

    // Transfer between this stop and the next, if one is defined
    if (idx < stops.length - 1) {
      const nextStop = stops[idx + 1];
      const transfer = transfers.find(
        (t) => t.from === stop.destinationName && t.to === nextStop.destinationName,
      );
      if (transfer) {
        out.push({
          kind: "transfer",
          id: `transfer-${idx}-${transfer.from}-${transfer.to}`,
          date: parseISO(nextStop.accommodation.checkInISO),
          from: transfer.from,
          to: transfer.to,
          // TransferCard formats this as "{vehicle} from {from} to {to}".
          // `mode` (e.g. "Bullet train", "Private car") is a short noun that
          // reads naturally in the sentence; `description` is long and prose-y
          // so we don't use it as the title.
          vehicle: transfer.mode,
        });
      }
    }
  });

  return out;
}

// ─── Activity expansion ──────────────────────────────────────────────────────
// Each activity type unfolds differently:
//   • cruise-ship / river-cruise → ship as Accommodation + each port as Activity
//   • multi-day-tour / safari / expedition / event → walk routeStops (if set)
//     or unpack itineraryDays into per-day activities
//   • walking-tour / bicycle-tour → walk routeStops
// Falls back to a single activity card if none of the rich blocks are present.

function activityToTimelineItems(activity: Activity, startDate: Date): TimelineItem[] {
  const out: TimelineItem[] = [];

  // Cruises: ship is the accommodation for the whole trip; ports are activities
  if (activity.cruise) {
    const cruise = activity.cruise;
    out.push({
      kind: "accommodation",
      id: `acc-cruise-${cruise.ship}`,
      checkIn: startDate,
      nights: activity.durationDays,
      hotel: {
        name: cruise.ship,
        image: activity.mainImage,
        stars: 5,
        rating: activity.rating.score,
        reviewCount: activity.rating.reviewCount,
        location: activity.location,
        price: 0,
        roomType: cruise.cabinTypes[0]?.name ?? "Stateroom",
        boardType: "Full board",
      },
    });
    cruise.ports.forEach((port, idx) => {
      out.push({
        kind: "activity",
        id: `port-${idx}-${port.name}`,
        date: addDays(startDate, port.day - 1),
        title: port.isSeaDay ? "At sea" : port.name,
        description:
          port.description ??
          (port.arrives && port.departs
            ? `In port ${port.arrives}–${port.departs}`
            : port.departs
              ? `Departs ${port.departs}`
              : port.arrives
                ? `Arrives ${port.arrives}`
                : "Port of call"),
        duration: port.arrives && port.departs ? `${port.arrives}–${port.departs}` : "Full day",
        location: port.isSeaDay ? "At sea" : port.name,
        image: img(`${port.name}-port`),
        price: "Included",
      });
    });
    return out;
  }

  // Multi-stop routes: walking/bicycle tours, multi-day tours with routeStops
  if (activity.routeStops && activity.routeStops.length > 0) {
    return stopsToTimelineItems(activity.routeStops, []);
  }

  // Multi-day tours with day-by-day itinerary (no routeStops)
  if (activity.itineraryDays && activity.itineraryDays.length > 0) {
    out.push({
      kind: "accommodation",
      id: `acc-act-${activity.activityId}`,
      checkIn: startDate,
      nights: activity.durationDays,
      hotel: {
        name: `${activity.title} — Lodging`,
        image: activity.mainImage,
        stars: 4,
        rating: activity.rating.score,
        reviewCount: activity.rating.reviewCount,
        location: activity.location,
        price: 0,
      },
    });
    activity.itineraryDays.forEach((day) => {
      // Pick the first highlight item as the headline description
      const headline = day.items.find((i) => i.type === "highlight") ?? day.items[0];
      out.push({
        kind: "activity",
        id: `day-${day.dayNumber}-${day.title}`,
        date: addDays(startDate, day.dayNumber - 1),
        title: `Day ${day.dayNumber}: ${day.title}`,
        description: headline?.description ?? headline?.label ?? "",
        duration: "Full day",
        location: day.location ?? activity.location,
        image: day.image ?? img(`${activity.title}-day-${day.dayNumber}`),
        price: "Included",
      });
    });
    return out;
  }

  // Fallback: single-day or sparse activities — one card with the activity itself
  out.push({
    kind: "activity",
    id: `act-fallback-${activity.activityId}`,
    date: startDate,
    title: activity.title,
    description: activity.subtitle,
    duration: `${activity.durationDays} day${activity.durationDays !== 1 ? "s" : ""}`,
    location: activity.location,
    image: activity.mainImage,
    price: `${activity.price.currency} ${activity.price.perPerson} pp`,
  });
  return out;
}

// ─── AI activity seeding ─────────────────────────────────────────────────────
// For AI prompts we pick a couple of activities that loosely match the keywords.
// This is purely cosmetic for the prototype — the live app would pull from real
// supply.

function seedAIActivities(prompt: string, cityName: string, startDate: Date): ActivityItem[] {
  const p = prompt.toLowerCase();
  const activities: ActivityItem[] = [];

  // Day 2 — always a city / culture activity
  activities.push({
    kind: "activity",
    id: `act-ai-${cityName}-tour`,
    date: addDays(startDate, 1),
    title: `Guided ${cityName} city tour`,
    description: "Morning walking tour of the key landmarks with a local expert guide.",
    duration: "3 hours",
    location: cityName,
    image: img(`${cityName}-tour`),
    price: "€45 pp",
  });

  // Day 3 — pick a flavour based on prompt keywords
  if (p.includes("beach") || p.includes("tropical") || p.includes("bali")) {
    activities.push({
      kind: "activity",
      id: `act-ai-${cityName}-beach`,
      date: addDays(startDate, 2),
      title: "Sunset beach experience",
      description: "Relaxed afternoon on the white-sand coast, ending with cocktails at sunset.",
      duration: "Half day",
      location: cityName,
      image: img(`${cityName}-beach`),
      price: "€60 pp",
    });
  } else if (p.includes("food") || p.includes("cuisine") || p.includes("paris") || p.includes("italy")) {
    activities.push({
      kind: "activity",
      id: `act-ai-${cityName}-food`,
      date: addDays(startDate, 2),
      title: "Local cuisine food tour",
      description: "Evening tasting tour through the old quarter with three signature stops.",
      duration: "3 hours",
      location: cityName,
      image: img(`${cityName}-food`),
      price: "€75 pp",
    });
  } else if (p.includes("adventure") || p.includes("hiking") || p.includes("nature")) {
    activities.push({
      kind: "activity",
      id: `act-ai-${cityName}-hike`,
      date: addDays(startDate, 2),
      title: "Scenic hiking excursion",
      description: "Half-day guided hike through the region's most photographed landscapes.",
      duration: "Half day",
      location: cityName,
      image: img(`${cityName}-hike`),
      price: "€55 pp",
    });
  } else {
    activities.push({
      kind: "activity",
      id: `act-ai-${cityName}-museum`,
      date: addDays(startDate, 2),
      title: "Museum & cultural visit",
      description: "Skip-the-line entry to the city's most popular cultural site.",
      duration: "2 hours",
      location: cityName,
      image: img(`${cityName}-museum`),
      price: "€35 pp",
    });
  }

  return activities;
}

// ─── Main entry point ────────────────────────────────────────────────────────

export function seedTimeline(
  ctx: StartingContext,
  cityName: string,
  startDate: Date,
  nights: number,
): TimelineItem[] {
  const items: TimelineItem[] = [];
  const endDate = addDays(startDate, nights);

  switch (ctx.type) {
    // ── TOUR ──────────────────────────────────────────────────────────────
    // When the TourDetailPage hands us a full `stops` array, walk it: each
    // stop becomes its own AccommodationItem, each stop.activity an
    // ActivityItem, and each entry in `tour.transfers` slots between stops
    // as a TransferItem. If the tour came through without stops (shouldn't
    // happen post-refactor, but kept as a fallback), we render a single
    // generic accommodation + the tour card so we don't show an empty page.
    case "tour": {
      const tourStart = ctx.tour.startDateISO ? parseISO(ctx.tour.startDateISO) : startDate;

      // ── Coach / bus tours ───────────────────────────────────────────────
      // When the user picked a pickup point on the TourDetailPage, replace
      // the mock flights with bus TransferCards routed from/to that point.
      // The first stop's hotel name becomes the "to" of the outbound transfer
      // (and the "from" of the inbound one) so the cards read naturally:
      //   "Freiburg → Hotel Bella Lazise"
      //   "Hotel Bella Lazise → Freiburg"
      const firstStop = ctx.tour.stops?.[0];
      const lastStop = ctx.tour.stops?.[ctx.tour.stops.length - 1];
      if (ctx.tour.departurePoint && firstStop && lastStop) {
        const pickup = ctx.tour.departurePoint;
        const firstHotel = firstStop.accommodation.hotelName;
        const lastHotel = lastStop.accommodation.hotelName;
        // The TransferCard composes this as "{vehicleLabel} from {from} to {to}",
        // so we use a short single-noun mode rather than a long description.
        const vehicleLabel = "Bus";

        items.push({
          kind: "transfer",
          id: `transfer-bus-out-${pickup}`,
          date: parseISO(firstStop.accommodation.checkInISO),
          from: pickup,
          to: firstHotel,
          vehicle: vehicleLabel,
        });

        items.push(...stopsToTimelineItems(ctx.tour.stops!, ctx.tour.transfers ?? []));

        items.push({
          kind: "transfer",
          id: `transfer-bus-in-${pickup}`,
          date: parseISO(lastStop.accommodation.checkOutISO),
          from: lastHotel,
          to: pickup,
          vehicle: vehicleLabel,
        });
        break;
      }

      items.push(mockOutboundFlight(ctx.tour.stops?.[0]?.destinationName ?? cityName, tourStart));

      if (ctx.tour.stops && ctx.tour.stops.length > 0) {
        items.push(...stopsToTimelineItems(ctx.tour.stops, ctx.tour.transfers ?? []));
      } else {
        // Fallback for old callsites
        items.push({
          kind: "accommodation",
          id: `acc-tour-${cityName}`,
          checkIn: tourStart,
          nights,
          hotel: mockHotel(cityName),
        });
        items.push({
          kind: "activity",
          id: `act-tour-${cityName}-fallback`,
          date: addDays(tourStart, 1),
          title: ctx.tour.title,
          description: ctx.tour.desc,
          duration: ctx.tour.duration,
          location: ctx.tour.country,
          image: ctx.tour.image,
          price: ctx.tour.price,
        });
      }

      // Use the last stop's last day for the return flight. `lastStop` is
      // already declared at the top of the case for the coach-tour branch
      // above — we reuse it here rather than re-declaring it.
      const tourEnd = lastStop?.accommodation.checkOutISO
        ? parseISO(lastStop.accommodation.checkOutISO)
        : addDays(tourStart, nights);
      items.push(mockInboundFlight(lastStop?.destinationName ?? cityName, tourEnd));
      break;
    }

    // ── HOTEL ─────────────────────────────────────────────────────────────
    case "hotel": {
      items.push(mockOutboundFlight(cityName, startDate));
      items.push({
        kind: "accommodation",
        id: `acc-hotel-${ctx.hotel.name}`,
        checkIn: startDate,
        nights: ctx.nights,
        hotel: ctx.hotel,
      });
      items.push(mockInboundFlight(cityName, endDate));
      break;
    }

    // ── FLIGHT ────────────────────────────────────────────────────────────
    case "flight": {
      // Multi-city: render each leg as a separate flight card
      if (ctx.flight.legs && ctx.flight.legs.length > 1) {
        ctx.flight.legs.forEach((leg, i) => {
          const legDate = leg.dateISO ? new Date(leg.dateISO) : addDays(startDate, i * 3);
          items.push({
            kind: "flight",
            id: `flight-leg-${i}`,
            direction: "leg",
            legLabel: `Flight ${i + 1} · ${leg.date}`,
            date: legDate,
            flight: {
              from: leg.from,
              to: leg.to,
              stops: leg.stops,
              duration: leg.duration,
              airline: leg.airline,
              price: "",
            },
          });
        });
      } else {
        // Single round-trip flight
        items.push({
          kind: "flight",
          id: `flight-rt-${cityName}`,
          direction: "outbound",
          date: startDate,
          flight: ctx.flight,
        });
      }
      items.push({
        kind: "accommodation",
        id: `acc-flight-${cityName}`,
        checkIn: startDate,
        nights,
        hotel: mockHotel(cityName),
      });
      break;
    }

    // ── HOLIDAY PACKAGE ───────────────────────────────────────────────────
    case "holiday": {
      const pkgFlight: FlightData = {
        from: ctx.pkg.flightFrom,
        to: cityName,
        stops: "Direct",
        duration: ctx.pkg.flightDuration,
        airline: ctx.pkg.flightAirline,
        price: "",
      };
      const pkgHotel: HotelData = {
        name: ctx.pkg.hotelName,
        image: img(`${cityName}-hotel`),
        stars: ctx.pkg.hotelStars,
        rating: 8.6,
        reviewCount: 412,
        location: cityName,
        price: 0,
      };
      items.push({
        kind: "flight",
        id: `flight-pkg-out-${cityName}`,
        direction: "outbound",
        date: startDate,
        flight: pkgFlight,
      });
      items.push({
        kind: "accommodation",
        id: `acc-pkg-${cityName}`,
        checkIn: startDate,
        nights: ctx.pkg.nights || nights,
        hotel: pkgHotel,
        showPrice: false,
      });
      items.push({
        kind: "flight",
        id: `flight-pkg-in-${cityName}`,
        direction: "inbound",
        date: endDate,
        flight: {
          ...pkgFlight,
          from: cityName,
          to: ctx.pkg.flightFrom,
        },
      });
      break;
    }

    // ── ACTIVITY ──────────────────────────────────────────────────────────
    // Activities carry rich detail-page data: cruises have ports + cabins,
    // multi-day tours have itineraryDays, walking/bicycle tours have routeStops.
    // activityToTimelineItems picks the right rendering based on `type`.
    case "activity": {
      items.push(mockOutboundFlight(cityName, startDate));
      items.push(...activityToTimelineItems(ctx.activity, startDate));
      items.push(mockInboundFlight(cityName, endDate));
      break;
    }

    // ── AI ────────────────────────────────────────────────────────────────
    case "ai": {
      items.push(mockOutboundFlight(cityName, startDate));
      items.push({
        kind: "accommodation",
        id: `acc-ai-${cityName}`,
        checkIn: startDate,
        nights,
        hotel: mockHotel(cityName),
      });
      seedAIActivities(ctx.prompt, cityName, startDate).forEach((a) => items.push(a));
      items.push(mockInboundFlight(cityName, endDate));
      break;
    }
  }

  return items;
}

// Returns a short label for the timeline header, e.g. "Sun, 15 Jul 2026".
// Used by cards to show their date in a consistent format.
export function formatItemDate(date: Date): string {
  return format(date, "EEE, dd MMM yyyy");
}
