// ─────────────────────────────────────────────────────────────────────────────
// SmartPlannerPage
//
// Top-level page for the Smart Planner prototype.
//
// Rewritten to match the live TripBuilder app's structure:
//   • Hero is now an immersive image card with overlay title + ticket capsule
//   • A fixed top-right View Mode toggle replaces the old Expert Mode switch
//   • The content area renders a single unified Timeline of product cards,
//     seeded by `seedTimeline(startingContext)` — keeps the prototype's
//     "different entry points show different things" feel
//   • A sticky bottom summary bar with an expandable trip-summary panel
//
// All the shared TYPE EXPORTS at the top of the file are unchanged because
// App.tsx imports them — don't touch the type names or shapes here.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { addDays, parseISO } from "date-fns";
import { Button } from "../../../shared/components/ui/button";
import { BackButton } from "../../../shared/components/BackButton";
// Activity and tour types — passed straight through from the detail pages so
// the timeline can render the actual stops/days/ports rather than mock data.
import type { Activity, TourStop, TourTransfer } from "../../../types";
// New Smart Planner building blocks
import { ItineraryHero } from "../components/ItineraryHero";
import { ItineraryTimeline } from "../components/ItineraryTimeline";
import { StickySummaryBar } from "../components/StickySummaryBar";
import { seedTimeline } from "../utils/seedTimeline";

// ─────────────────────────────────────────────────────────────────────────────
// Types (exported — App.tsx imports these)
// ─────────────────────────────────────────────────────────────────────────────

export type TourData = {
  country: string;
  flag: string;
  title: string;
  desc: string;
  duration: string;
  price: string;
  image: string;
  // Rich detail-page fields — when present, seedTimeline expands them into
  // per-stop hotels, activities, and inter-stop transfers. App.tsx sets these
  // when launching SmartPlanner from TourDetailPage. Optional so old callers
  // that only carry the summary fields still compile.
  stops?: TourStop[];
  transfers?: TourTransfer[];
  startDateISO?: string;  // ISO date, e.g. "2026-03-31"
  // For coach / bus tours: the pickup point the user selected on TourDetailPage
  // (e.g. "Freiburg"). When set, seedTimeline replaces the mock outbound/inbound
  // flights with bus TransferCards routed from/to the chosen pickup point.
  departurePoint?: string;
};

export type HotelData = {
  name: string;
  image: string;
  stars: number;
  rating: number;
  reviewCount: number;
  location: string;
  price: number;
  // ISO date strings passed from the Hotels search form, e.g. "2026-04-09"
  checkIn?: string;
  checkOut?: string;
  // Optional room/board info passed through from HotelDetailPage when the user
  // selected a specific room. When set, the AccommodationCard shows this
  // instead of the generic "1 Standard Room" placeholder.
  roomType?: string;
  boardType?: string;
};

export type FlightData = {
  from: string;
  to: string;
  stops: string;
  duration: string;
  airline: string;
  price: string;
  // All legs — present for both round-trip (2 legs) and multi-city (2+ legs).
  legs?: Array<{
    from: string;
    to: string;
    date: string;       // display-formatted, e.g. "15 Jul"
    dateISO?: string;   // machine-readable, e.g. "2026-07-15"
    airline: string;
    duration: string;
    stops: string;
  }>;
};

export type HolidayPackageData = {
  destination: string;
  hotelName: string;
  hotelStars: number;
  flightFrom: string;
  flightAirline: string;
  flightDuration: string;
  nights: number;
  checkIn?: string;
};

export type StartingContext =
  | { type: "tour"; tour: TourData }
  | { type: "hotel"; hotel: HotelData; nights: number }
  | { type: "flight"; flight: FlightData }
  | { type: "holiday"; pkg: HolidayPackageData }
  | { type: "activity"; activity: Activity; travelDate?: string }
  | { type: "ai"; prompt: string };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — work out the destination / nights / start date from any context
// ─────────────────────────────────────────────────────────────────────────────

function getDestination(ctx: StartingContext): string {
  switch (ctx.type) {
    case "tour":     return ctx.tour.country;
    case "hotel":    return ctx.hotel.location;
    case "flight":   return ctx.flight.to;
    case "holiday":  return ctx.pkg.destination;
    case "activity": return ctx.activity.location;
    case "ai":       return extractAIDestination(ctx.prompt);
  }
}

function extractAIDestination(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("bali") || p.includes("indonesia"))     return "Bali, Indonesia";
  if (p.includes("japan") || p.includes("tokyo"))        return "Tokyo, Japan";
  if (p.includes("paris") || p.includes("france"))       return "Paris, France";
  if (p.includes("new york") || p.includes("nyc"))       return "New York, USA";
  if (p.includes("barcelona") || p.includes("spain"))    return "Barcelona, Spain";
  if (p.includes("morocco") || p.includes("marrakech"))  return "Marrakech, Morocco";
  if (p.includes("thailand") || p.includes("bangkok"))   return "Bangkok, Thailand";
  if (p.includes("beach") || p.includes("tropical"))     return "Bali, Indonesia";
  if (p.includes("europe") || p.includes("culture"))     return "Paris, France";
  return "Barcelona, Spain";
}

function getNights(ctx: StartingContext): number {
  if (ctx.type === "hotel") return ctx.nights;
  if (ctx.type === "holiday") return ctx.pkg.nights || 7;
  if (ctx.type === "tour") {
    const match = ctx.tour.duration.match(/(\d+)/);
    return match ? parseInt(match[1]) - 1 : 7;
  }
  if (ctx.type === "activity") {
    return Math.max(1, ctx.activity.durationDays - 1);
  }
  return 7;
}

function getTripStartDate(ctx: StartingContext): Date {
  if (ctx.type === "hotel" && ctx.hotel.checkIn) return parseISO(ctx.hotel.checkIn);
  if (ctx.type === "holiday" && ctx.pkg.checkIn) return parseISO(ctx.pkg.checkIn);
  if (ctx.type === "flight" && ctx.flight.legs?.[0]?.dateISO) return parseISO(ctx.flight.legs[0].dateISO);
  if (ctx.type === "activity") {
    if (ctx.travelDate) {
      const d = new Date(ctx.travelDate);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(ctx.activity.startDate);
    if (!isNaN(d.getTime())) return d;
  }
  return addDays(new Date(), 30);
}

// Builds the hero title — "Individual trip to {city}".
// Matches the live SmartPlanner pattern of always prefixing with "Individual trip to".
function getTitle(cityName: string): string {
  return `Individual trip to ${cityName}`;
}

// Builds the page-top BackButton label based on where the user came from.
// Matches the contextual labels used on other detail pages (TourDetailPage,
// HotelDetailPage, etc.) so the back link always names a real destination.
function getBackLabel(ctx: StartingContext): string {
  switch (ctx.type) {
    case "tour":     return "Back to tour";
    case "hotel":    return "Back to hotel";
    case "flight":   return "Back to flights";
    case "holiday":  return "Back to package";
    case "activity": return "Back to activity";
    case "ai":       return "Back to discovery";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SmartPlannerPage({
  startingContext,
  onBack,
}: {
  startingContext: StartingContext;
  onBack: () => void;
}) {
  // Derive trip-level metadata from the starting context
  const destination = getDestination(startingContext);
  const cityName    = destination.split(",")[0].trim();
  const heroSeed    = cityName.toLowerCase().replace(/\s+/g, "-");
  const nights      = getNights(startingContext);
  const startDate   = getTripStartDate(startingContext);
  const endDate     = addDays(startDate, nights);

  // Build the unified timeline of product cards from the starting context.
  // This is the "hybrid" hook — different contexts seed different cards,
  // but they all render through the same ItineraryTimeline component.
  const timelineItems = seedTimeline(startingContext, cityName, startDate, nights);

  // Hero image — when the user came from a tour detail page we use that tour's
  // own mainImage, so the SmartPlanner header matches the tour they just
  // looked at instead of a random picsum landscape. Every other entry point
  // still falls back to the deterministic picsum seed.
  const heroImageUrl =
    startingContext.type === "tour"
      ? startingContext.tour.image
      : `https://picsum.photos/seed/${heroSeed}-landscape/1600/620`;

  // Show the AI banner only when the trip was started from a prompt
  const aiPrompt = startingContext.type === "ai" ? startingContext.prompt : undefined;

  // Hard-coded for the prototype — real app reads from passenger context
  const adults: number = 2;
  const totalPriceLabel = "from €2,499";

  // Track whether the user has scrolled past the hero's dates+price capsule.
  // Until they have, the sticky bottom bar stays hidden (avoids duplicating
  // information they can already see on screen). The moment the sentinel below
  // the hero exits the top of the viewport, we show the bar with a slide-up.
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const sentinel = heroSentinelRef.current;
    if (!sentinel) return;

    // IntersectionObserver fires whenever the sentinel enters/leaves the
    // viewport. We only want to show the bar when the sentinel has passed
    // ABOVE the viewport (i.e. user scrolled down past the hero), not when
    // it's below (initial state on tall screens).
    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolledPastHero =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setShowStickyBar(scrolledPastHero);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-grey-lightest">
      {/* Page-top back link — same shared BackButton style as every other page
          (TourDetailPage, HotelDetailPage, etc.). The label adapts to where the
          user came from, so they always know which screen "Back" leads to. */}
      <div className="max-w-5xl mx-auto px-4 lg:px-0 pt-5">
        <BackButton label={getBackLabel(startingContext)} onClick={onBack} />
      </div>

      {/* Immersive hero — image + overlay title + 3 icon buttons + ticket capsule.
          Map / Share / Expert-mode callbacks are stubs for now — we'll wire each
          to its real surface (map takeover, share modal, expert toggle) next. */}
      <ItineraryHero
        title={getTitle(cityName)}
        travelersLabel={`${adults} adult${adults !== 1 ? "s" : ""}`}
        nights={nights}
        startDate={startDate}
        endDate={endDate}
        heroImageUrl={heroImageUrl}
        totalPriceLabel={totalPriceLabel}
        onOpenMap={() => {
          // TODO: open the map-mode takeover (cards on left + map on right)
        }}
        onShareItinerary={() => {
          // TODO: open ShareItineraryModal
        }}
        onToggleExpertMode={() => {
          // TODO: toggle Expert mode
        }}
      />

      {/* Invisible sentinel — watched by IntersectionObserver above.
          Sits directly below the hero, so once it scrolls off the top of the
          viewport we know the user has passed the dates+price capsule and we
          can reveal the sticky summary bar. Zero-height + aria-hidden so it
          never affects layout or screen readers. */}
      <div ref={heroSentinelRef} aria-hidden className="h-0 w-0" />

      {/* Content area — single unified timeline.
          pl-1 on mobile so the dashed timeline rail is visible at the screen edge. */}
      <div className="max-w-5xl mx-auto pl-1 pr-4 md:px-4 pt-5 md:pt-8 pb-32 box-content">
        <ItineraryTimeline items={timelineItems} aiPrompt={aiPrompt} passengerCount={adults} />

        {/* Footer — Book CTA only. The top-of-page BackButton handles
            back-nav; no need for a second one down here. */}
        <div className="flex justify-end items-center mt-8 pt-6 border-t border-border">
          <Button size="lg">Book · {totalPriceLabel}</Button>
        </div>
      </div>

      {/* Sticky bottom bar with expandable trip-summary panel.
          Slides up only once the user has scrolled past the hero capsule —
          driven by the sentinel + IntersectionObserver above. */}
      <StickySummaryBar
        startDate={startDate}
        endDate={endDate}
        adults={adults}
        nights={nights}
        totalPriceLabel={totalPriceLabel}
        items={timelineItems}
        show={showStickyBar}
      />
    </div>
  );
}
