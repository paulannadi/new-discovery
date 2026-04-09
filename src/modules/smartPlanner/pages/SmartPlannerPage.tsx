import React, { useState } from "react";
import {
  ChevronLeft,
  Share,
  Plane,
  Building2,
  MapPin,
  Clock,
  Plus,
  Sparkles,
  ArrowRight,
  User,
  CalendarDays,
  Briefcase,
  Star,
} from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../shared/components/ui/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
//
// Exported so App.tsx can import and pass them as startingContext.
// These stay exactly the same — App.tsx doesn't need any changes.
// ─────────────────────────────────────────────────────────────────────────────

export type TourData = {
  country: string;
  flag: string;
  title: string;
  desc: string;
  duration: string;
  price: string;
  image: string;
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
};

export type FlightData = {
  from: string;
  to: string;
  stops: string;
  duration: string;
  airline: string;
  price: string;
  // All legs — present for both round-trip (2 legs) and multi-city (2+ legs).
  // SmartPlanner uses this to show one FlightCard per leg.
  legs?: Array<{
    from: string;
    to: string;
    date: string;       // display-formatted, e.g. "15 Jul"
    dateISO?: string;   // machine-readable, e.g. "2026-07-15" — used to work out trip start date
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
  nights: number;       // actual nights from the selected package
  checkIn?: string;     // ISO date string from the Holidays search form, e.g. "2026-04-09"
};

export type StartingContext =
  | { type: "tour"; tour: TourData }
  | { type: "hotel"; hotel: HotelData; nights: number }
  | { type: "flight"; flight: FlightData }
  | { type: "holiday"; pkg: HolidayPackageData }
  | { type: "ai"; prompt: string };

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

function getDestination(ctx: StartingContext): string {
  switch (ctx.type) {
    case "tour":    return ctx.tour.country;
    case "hotel":   return ctx.hotel.location;
    case "flight":  return ctx.flight.to;
    case "holiday": return ctx.pkg.destination;
    case "ai":      return extractAIDestination(ctx.prompt);
  }
}

function extractAIDestination(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("bali") || p.includes("indonesia"))       return "Bali, Indonesia";
  if (p.includes("japan") || p.includes("tokyo"))         return "Tokyo, Japan";
  if (p.includes("paris") || p.includes("france"))        return "Paris, France";
  if (p.includes("new york") || p.includes("nyc"))        return "New York, USA";
  if (p.includes("barcelona") || p.includes("spain"))     return "Barcelona, Spain";
  if (p.includes("morocco") || p.includes("marrakech"))   return "Marrakech, Morocco";
  if (p.includes("thailand") || p.includes("bangkok"))    return "Bangkok, Thailand";
  if (p.includes("beach") || p.includes("tropical"))      return "Bali, Indonesia";
  if (p.includes("europe") || p.includes("culture"))      return "Paris, France";
  return "Barcelona, Spain";
}

function getNights(ctx: StartingContext): number {
  if (ctx.type === "hotel") return ctx.nights;
  if (ctx.type === "holiday") return ctx.pkg.nights || 7;  // use actual package nights
  if (ctx.type === "tour") {
    const match = ctx.tour.duration.match(/(\d+)/);
    return match ? parseInt(match[1]) - 1 : 7;
  }
  return 7;
}

// Returns a Date object for the trip start.
// Reads the actual date the user picked, falling back to ~1 month from now
// if no date was chosen (e.g. a tour card click with no search form).
function getTripStartDate(ctx: StartingContext): Date {
  if (ctx.type === "hotel" && ctx.hotel.checkIn) return parseISO(ctx.hotel.checkIn);
  if (ctx.type === "holiday" && ctx.pkg.checkIn) return parseISO(ctx.pkg.checkIn);
  if (ctx.type === "flight" && ctx.flight.legs?.[0]?.dateISO) return parseISO(ctx.flight.legs[0].dateISO);
  return addDays(new Date(), 30); // fallback when no date was entered
}

// Returns "09 Apr – 16 Apr 2026" style label, using the real trip start date
function getTripDatesLabel(ctx: StartingContext): string {
  const from = getTripStartDate(ctx);
  const to = addDays(from, getNights(ctx));
  return `${format(from, "dd MMM")} – ${format(to, "dd MMM yyyy")}`;
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
  // expertMode toggles the condensed/full view — visual only in this prototype
  const [expertMode, setExpertMode] = useState(false);

  const destination = getDestination(startingContext);
  // "Bali, Indonesia" → "Bali" for the hero image seed and title
  const cityName  = destination.split(",")[0].trim();
  const heroSeed  = cityName.toLowerCase().replace(/\s+/g, "-");
  const tripDates = getTripDatesLabel(startingContext);
  const nights    = getNights(startingContext);
  const startDate = getTripStartDate(startingContext);
  const endDate   = addDays(startDate, nights);

  return (
    // Page background is light grey — matches real TripBuilder's bg-grey-lightest
    <div className="min-h-screen bg-grey-lightest">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                                        */}
      {/* In the real app this is a white card at the top of the page.       */}
      {/* It contains: back button row → hero image → trip title + actions.  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-card">
        <div className="flex flex-col gap-5 py-5 max-w-5xl mx-auto">

          {/* Top row: back button on the left, expert mode toggle on the right */}
          <header className="flex items-center justify-between gap-4 px-4 lg:px-0">
            <Button
              variant="ghost"
              className="px-0 text-sm gap-1 hover:bg-transparent"
              onClick={onBack}
            >
              <ChevronLeft size={18} />
              Back
            </Button>

            {/* Expert Mode toggle — visual only, no additional UI change yet */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Expert</span>
              {/*
                Inline toggle switch — replicates TripBuilder's ViewModeToggle.
                The real app uses a Switch component from shadcn/ui.
              */}
              <button
                onClick={() => setExpertMode(!expertMode)}
                role="switch"
                aria-checked={expertMode}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative shrink-0",
                  expertMode ? "bg-primary" : "bg-grey-light"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    expertMode ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </header>

          {/* Hero image — same picsum.photos pattern as before, now with real-app rounding */}
          <img
            src={`https://picsum.photos/seed/${heroSeed}-landscape/1200/480`}
            alt={`${cityName} destination`}
            className="w-full object-cover max-h-48 md:max-h-96 lg:rounded-t-3xl"
          />

          {/*
            Below-image row: title + trip info on the left, share + book on the right.
            On mobile this stacks vertically; on md+ it sits side by side.
          */}
          <div className="px-4 lg:px-0 md:flex md:items-start md:justify-between md:gap-8">

            {/* Left: trip title and dates */}
            <div className="space-y-2 mb-1">
              {/*
                h1 matches real HeroSection: text-2xl md:text-3xl font-extrabold.
                The real app shows the full itinerary title here.
              */}
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-foreground">
                Individual trip to {cityName}
              </h1>
              {/* Dates + pax info — "flex-wrap" so it wraps cleanly on narrow screens */}
              <p className="flex flex-wrap items-center gap-1 font-semibold text-foreground leading-tight">
                <span>For 2 adults</span>
                <span className="text-grey">·</span>
                <span>from {format(startDate, "dd MMM")}</span>
                <span className="text-grey">to</span>
                <span>{format(endDate, "dd MMM yyyy")}</span>
              </p>
            </div>

            {/* Right: share icon + primary Book button */}
            <div className="flex items-center gap-2 justify-between max-md:mt-3">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent"
                aria-label="Share itinerary"
              >
                <Share size={20} aria-hidden="true" />
              </Button>
              {/* Book button — large, primary blue — same in hero, footer, and sticky bar */}
              <Button size="lg">
                Book · from €2,499
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CONTENT AREA                                                        */}
      {/* max-w-5xl container with asymmetric mobile padding (pl-1 so the   */}
      {/* dashed timeline line is visible at the very left edge on mobile). */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto pl-1 pr-4 md:px-4 py-5 md:py-8 box-content">

        {/* Render the correct itinerary layout based on how the user arrived */}
        {startingContext.type === "tour" && (
          <TourItinerary tour={startingContext.tour} cityName={cityName} startDate={startDate} />
        )}
        {startingContext.type === "hotel" && (
          <HotelItinerary hotel={startingContext.hotel} nights={startingContext.nights} cityName={cityName} startDate={startDate} />
        )}
        {startingContext.type === "flight" && (
          <FlightItinerary flight={startingContext.flight} cityName={cityName} startDate={startDate} />
        )}
        {startingContext.type === "holiday" && (
          <HolidayItinerary pkg={startingContext.pkg} cityName={cityName} startDate={startDate} />
        )}
        {startingContext.type === "ai" && (
          <AIItinerary prompt={startingContext.prompt} cityName={cityName} startDate={startDate} />
        )}

        {/* Add Stop — sits at the bottom of the timeline, inside the dashed border */}
        <AddStopButton />

        {/* Footer — back (text) on the left, Book (primary) on the right */}
        <PageFooter onBack={onBack} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STICKY SUMMARY BAR                                                  */}
      {/* Fixed to the bottom of the viewport. Shows key trip info + Book    */}
      {/* button. Appears once the hero section scrolls out of view.         */}
      {/* (In this prototype it's always visible for demo purposes.)         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <StickySummary
        startDate={startDate}
        endDate={endDate}
        adults={2}
        nights={nights}
      />

      {/*
        Bottom padding so page content isn't hidden behind the sticky bar.
        The sticky bar is ~80px tall — pb-24 gives enough clearance.
      */}
      <div className="pb-24" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Itinerary layouts — one per starting context type
// ─────────────────────────────────────────────────────────────────────────────

// Tour context → pre-loaded tour card + suggestions for flight & hotel
function TourItinerary({
  tour,
  cityName,
  startDate,
}: {
  tour: TourData;
  cityName: string;
  startDate: Date;
}) {
  return (
    <>
      {/* Tour product */}
      <ProductHeader
        icon={<MapPin className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title="Your Tour"
      >
        <p className="font-semibold mb-3 md:mb-4 text-foreground">
          {format(startDate, "EEE, dd MMM yyyy")}
        </p>
        <div className="border border-border rounded-lg md:rounded-3xl shadow-sm overflow-hidden mb-0">
          <img src={tour.image} alt={tour.title} className="w-full h-48 object-cover" />
          <div className="bg-card p-4 md:p-6">
            {/* Flag + country + "Added" badge */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src={`https://flagcdn.com/w40/${tour.flag}.png`}
                alt={tour.country}
                className="w-5 h-3.5 rounded-sm object-cover shrink-0"
              />
              <span className="text-sm text-muted-foreground">{tour.country}</span>
              <AddedBadge />
            </div>
            <p className="font-bold text-foreground mb-1">{tour.title}</p>
            <p className="text-sm text-muted-foreground leading-normal mb-4">{tour.desc}</p>
            {/* Duration + price */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <Clock size={14} aria-hidden="true" /> {tour.duration}
              </span>
              <div className="text-right">
                <div className="text-xs text-grey">Per person</div>
                <div className="text-lg font-bold text-foreground">{tour.price}</div>
              </div>
            </div>
          </div>
        </div>
      </ProductHeader>

      {/* Suggestion: add a flight */}
      <ProductHeader
        icon={<Plane className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title={`Flying to ${cityName}?`}
      >
        <RecommendationCard
          icon={<Plane size={20} className="text-primary" aria-hidden="true" />}
          title={`Flying to ${cityName}?`}
          description="Add a return flight to complete your itinerary."
          ctaLabel="Choose flight"
        />
      </ProductHeader>

      {/* Suggestion: add a hotel */}
      <ProductHeader
        icon={<Building2 className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title={`Where will you stay?`}
      >
        <RecommendationCard
          icon={<Building2 size={20} className="text-primary" aria-hidden="true" />}
          title={`Where will you stay in ${cityName}?`}
          description={`Browse hotels and accommodation in ${cityName}.`}
          ctaLabel="Browse hotels"
        />
      </ProductHeader>
    </>
  );
}

// Hotel context → flight suggestion first, then confirmed hotel
function HotelItinerary({
  hotel,
  nights,
  cityName,
  startDate,
}: {
  hotel: HotelData;
  nights: number;
  cityName: string;
  startDate: Date;
}) {
  return (
    <>
      {/* Suggestion: add a flight */}
      <ProductHeader
        icon={<Plane className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title={`Flying to ${cityName}?`}
      >
        <RecommendationCard
          icon={<Plane size={20} className="text-primary" aria-hidden="true" />}
          title={`Flying to ${cityName}?`}
          description="Add a return flight to complete your itinerary."
          ctaLabel="Choose flight"
        />
      </ProductHeader>

      {/* Confirmed hotel */}
      <ProductHeader
        icon={<Building2 className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title={`Stay in ${cityName} · ${nights} night${nights !== 1 ? "s" : ""}`}
      >
        <p className="font-semibold mb-3 md:mb-4 text-foreground">
          {format(startDate, "EEE, dd MMM yyyy")} – {format(addDays(startDate, nights), "dd MMM yyyy")}
        </p>
        <AccommodationCard hotel={hotel} nights={nights} />
      </ProductHeader>
    </>
  );
}

// Flight context → confirmed flight(s), then hotel suggestion.
// For multi-city trips (flight.legs exists), shows one card per leg.
function FlightItinerary({
  flight,
  cityName,
  startDate,
}: {
  flight: FlightData;
  cityName: string;
  startDate: Date;
}) {
  // Build a compact route label, e.g. "London → Bangkok → Bali" for multi-city.
  const routeLabel =
    flight.legs && flight.legs.length > 1
      ? flight.legs.map((l) => l.from).join(" → ") + " → " + flight.legs[flight.legs.length - 1].to
      : `${flight.from} → ${flight.to}`;

  const isMultiCity = flight.legs && flight.legs.length > 1;

  return (
    <>
      {/* Confirmed flight(s) */}
      <ProductHeader
        icon={<Plane className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title={isMultiCity ? `Your Flights · ${routeLabel}` : "Your Flight"}
      >
        {isMultiCity ? (
          // Multi-city: render one FlightCard per leg
          <div className="flex flex-col gap-4">
            {flight.legs!.map((leg, i) => (
              <div key={i}>
                {/* Leg label */}
                <p className="text-xs font-bold text-grey uppercase tracking-wide mb-2">
                  Flight {i + 1} · {leg.date}
                </p>
                <FlightCard
                  flight={{
                    from: leg.from,
                    to: leg.to,
                    airline: leg.airline,
                    duration: leg.duration,
                    stops: leg.stops,
                    price: "",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          // Single leg (round trip): show the single card with date
          <>
            <p className="font-semibold mb-3 md:mb-4 text-foreground">
              {format(startDate, "EEE, dd MMM yyyy")}
            </p>
            <FlightCard flight={flight} />
          </>
        )}
      </ProductHeader>

      {/* Suggestion: add a hotel */}
      <ProductHeader
        icon={<Building2 className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title={`Where will you stay in ${cityName}?`}
      >
        <RecommendationCard
          icon={<Building2 size={20} className="text-primary" aria-hidden="true" />}
          title={`Where will you stay in ${cityName}?`}
          description="We have over 500,000 hotels worldwide. Search now for the best rates."
          ctaLabel="Browse hotels"
        />
      </ProductHeader>
    </>
  );
}

// Holiday context → confirmed flight + confirmed hotel (full package)
function HolidayItinerary({
  pkg,
  cityName,
  startDate,
}: {
  pkg: HolidayPackageData;
  cityName: string;
  startDate: Date;
}) {
  const flight: FlightData = {
    from: pkg.flightFrom,
    to: cityName,
    stops: "Direct",
    duration: pkg.flightDuration,
    airline: pkg.flightAirline,
    price: "",
  };

  const hotel: HotelData = {
    name: pkg.hotelName,
    image: `https://picsum.photos/seed/${cityName.toLowerCase().replace(/\s/g, "-")}-hotel/800/400`,
    stars: pkg.hotelStars,
    rating: 8.6,
    reviewCount: 412,
    location: cityName,
    price: 0,
  };

  const nights = pkg.nights || 7;  // use actual package nights, fall back to 7

  return (
    <>
      {/* Confirmed flight */}
      <ProductHeader
        icon={<Plane className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title="Your Flight"
      >
        <p className="font-semibold mb-3 md:mb-4 text-foreground">
          {format(startDate, "EEE, dd MMM yyyy")}
        </p>
        <FlightCard flight={flight} />
      </ProductHeader>

      {/* Confirmed hotel */}
      <ProductHeader
        icon={<Building2 className="size-6 md:size-8 shrink-0" aria-hidden="true" />}
        title={`Stay in ${cityName} · ${nights} night${nights !== 1 ? "s" : ""}`}
      >
        <p className="font-semibold mb-3 md:mb-4 text-foreground">
          {format(startDate, "EEE, dd MMM yyyy")} – {format(addDays(startDate, nights), "dd MMM yyyy")}
        </p>
        <AccommodationCard hotel={hotel} nights={nights} showPrice={false} />
      </ProductHeader>
    </>
  );
}

// AI context → AI-generated banner + day-by-day breakdown
function AIItinerary({
  prompt,
  cityName,
  startDate,
}: {
  prompt: string;
  cityName: string;
  startDate: Date;
}) {
  const days = [
    {
      day: 1,
      label: "Arrival & settle in",
      items: [
        { icon: "flight",   label: "Inbound flight",          detail: `London → ${cityName}` },
        { icon: "hotel",    label: "Hotel check-in",           detail: `4-star hotel in ${cityName} city centre` },
      ],
    },
    {
      day: 2,
      label: "Explore the city",
      items: [
        { icon: "activity", label: "Guided city tour",         detail: "Morning walking tour of key landmarks" },
        { icon: "activity", label: "Local cuisine experience", detail: "Evening food tour in the old quarter" },
      ],
    },
    {
      day: 3,
      label: "Departure day",
      items: [
        { icon: "activity", label: "Morning at leisure",       detail: "Free time for shopping and last sights" },
        { icon: "flight",   label: "Return flight",            detail: `${cityName} → London` },
      ],
    },
  ];

  return (
    <div>
      {/* AI attribution banner — gradient from blue tint to green tint */}
      <div className="mb-6 flex items-center gap-3 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-lg p-4">
        <Sparkles size={20} className="text-primary shrink-0" aria-hidden="true" />
        <div>
          <div className="font-bold text-foreground">AI-generated itinerary</div>
          <div className="text-sm text-muted-foreground line-clamp-1">Based on: "{prompt}"</div>
        </div>
      </div>

      {/* Day-by-day timeline */}
      {days.map((dayItem, i) => (
        <div
          key={i}
          className="border-l border-dashed border-foreground pl-4 ml-3 md:pl-7 md:ml-4 relative pt-1 pb-6"
        >
          {/* Timeline dot */}
          <div className="absolute -left-[7px] top-4 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-sm" />

          {/* Day badge + heading */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
              Day {dayItem.day}
            </span>
            <span className="text-lg font-extrabold text-foreground">{dayItem.label}</span>
          </div>

          <div className="flex flex-col gap-2">
            {dayItem.items.map((item, j) => (
              <div
                key={j}
                className="bg-card rounded-lg border border-border p-3 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-grey-light border border-border shrink-0">
                  {item.icon === "flight"
                    ? <Plane size={15} className="text-primary" aria-hidden="true" />
                    : item.icon === "hotel"
                    ? <Building2 size={15} className="text-primary" aria-hidden="true" />
                    : <MapPin size={15} className="text-primary" aria-hidden="true" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
                <span className="shrink-0 bg-success/10 text-success text-xs font-bold px-2 py-0.5 rounded-full">
                  Suggested
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout building blocks
// ─────────────────────────────────────────────────────────────────────────────

/*
  ProductHeader wraps each product section with:
  1. A short vertical dashed connector line (links sections visually)
  2. An icon + h2 heading row
  3. A dashed left-border container for the card content

  This matches the real TripBuilder's Product.tsx structure exactly.
*/
function ProductHeader({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/*
        Vertical connector line — the dashed border that runs between sections.
        In the real app this is controlled by CSS on the first/last child,
        but for the prototype we just always show it.
      */}
      <div className="w-px ml-3 md:ml-4 mb-1 h-6 border-l border-dashed border-foreground" />

      {/* Icon + section title */}
      <div className="flex mb-1 items-center gap-1.5 md:gap-3">
        {icon}
        <h2 className="font-extrabold text-lg md:text-2xl leading-tight text-foreground mr-3">
          {title}
        </h2>
      </div>

      {/*
        Left dashed border — the "timeline rail" the cards hang off.
        pl-4 ml-3 matches the real app's Product.tsx.
      */}
      <div className="pl-4 ml-3 md:pl-7 md:ml-4 border-l border-dashed border-foreground pb-6">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product cards
// ─────────────────────────────────────────────────────────────────────────────

/*
  FlightCard — matches real TripBuilder's FlightManagementCard.
  Shows: airline badge | departure time → connecting bar → arrival time | baggage.
  On desktop a "Change Flight" button appears in a right column.
*/
function FlightCard({ flight }: { flight: FlightData }) {
  // Fake departure/arrival times for the prototype — real app pulls these from API
  const depTime = "08:35";
  const arrTime = "14:10";

  return (
    <div className="border border-border shadow-sm rounded-lg md:rounded-3xl">
      <div className="bg-card p-4 md:p-6 rounded-lg md:flex md:gap-6 md:rounded-3xl">

        {/* Left/main column: airline → flight bar → baggage */}
        <div className="space-y-5 md:grow">

          {/* Flight details row: airline logo | departure | bar | arrival */}
          <div className="flex items-center justify-between gap-4 md:gap-6">

            {/* Airline badge — shown as a grey pill since we don't have logos */}
            <div className="hidden sm:flex w-28 lg:w-36 shrink-0">
              {flight.airline ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-grey-light text-xs font-bold text-foreground">
                  {flight.airline}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-grey-light text-xs font-bold text-foreground">
                  <Plane size={12} aria-hidden="true" /> Unknown airline
                </span>
              )}
            </div>

            {/* Departure */}
            <div className="flex flex-col items-center text-center shrink-0">
              <span className="font-bold text-foreground">{depTime}</span>
              <span className="hidden sm:block text-xs text-muted-foreground max-w-28 leading-tight mt-0.5">
                {flight.from}
              </span>
              <span className="sm:hidden text-xs text-muted-foreground">
                {flight.from.split(" ")[0]}
              </span>
            </div>

            {/* Connecting bar: stops + duration + class */}
            <div className="flex-grow flex flex-col gap-1 text-center text-xs">
              <p className="font-semibold text-foreground">
                {flight.stops === "Direct" || !flight.stops ? "Non-stop" : flight.stops}
              </p>
              {/* The horizontal bar with a dot for each stop */}
              <div className="w-full h-0.5 bg-border flex items-center justify-center" />
              <p className="text-muted-foreground">{flight.duration} · Economy</p>
            </div>

            {/* Arrival */}
            <div className="flex flex-col items-center text-center shrink-0">
              <span className="font-bold text-foreground">{arrTime}</span>
              <span className="hidden sm:block text-xs text-muted-foreground max-w-28 leading-tight mt-0.5">
                {flight.to}
              </span>
              <span className="sm:hidden text-xs text-muted-foreground">
                {flight.to.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-border" />

          {/* Baggage info + "More details" link */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} aria-hidden="true" />
              <span>1 checked bag included</span>
            </div>
            <Button variant="link" size="sm" className="px-0 h-auto text-xs">
              More details
            </Button>
          </div>
        </div>

        {/*
          Right action column — only visible on md+.
          On mobile the button appears below the card in a border-top section.
          Matches real AccommodationCard / FlightManagementCard right-column pattern.
        */}
        <div className="mt-6 md:mt-0 max-md:pt-6 md:w-[160px] lg:w-[220px] md:min-w-[160px] max-md:border-t border-border md:border-l flex flex-row-reverse md:flex-col justify-between md:items-end">
          <Button variant="outline" className="max-sm:w-full">
            Change Flight
          </Button>
        </div>
      </div>
    </div>
  );
}

/*
  AccommodationCard — matches real TripBuilder's AccommodationCard.
  Uses a CSS grid: image on the left on desktop, full-width on mobile.
  Shows: stars + name + room count + meal info | Change Hotel + View Room Options.
*/
function AccommodationCard({
  hotel,
  nights,
  showPrice = true,
}: {
  hotel: HotelData;
  nights: number;
  showPrice?: boolean;
}) {
  return (
    <div className="border border-border rounded-lg md:rounded-3xl shadow-sm">
      <div className="bg-card rounded-lg md:rounded-3xl grid md:grid-cols-[160px_1fr] lg:grid-cols-[270px_1fr] md:grid-rows-[250px]">

        {/* Hotel image — full-width on mobile, fixed-width column on desktop */}
        <img
          src={hotel.image}
          alt={hotel.name}
          className="block w-full h-32 md:h-full object-cover max-md:rounded-t-lg md:rounded-l-3xl"
        />

        {/* Content grid: left info column | right actions column */}
        <div className="p-4 md:p-6 grid md:grid-cols-[1fr_160px] lg:grid-cols-[1fr_220px]">

          {/* Left: hotel details */}
          <div className="flex flex-col gap-6 justify-between md:border-r md:pr-6 border-border">
            <div className="space-y-1">
              {/* Star rating — rendered as gold star icons */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-warning text-warning" aria-hidden="true" />
                ))}
              </div>
              {/* Hotel name */}
              <h3 className="font-bold text-foreground leading-tight">{hotel.name}</h3>
              {/* Location */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={12} className="shrink-0" aria-hidden="true" />
                {hotel.location}
              </div>
              {/* Room info — "1x Standard Room" */}
              <p className="text-sm text-foreground">
                <span className="font-bold">1</span> Standard Room
              </p>
            </div>

            {/* Meal type + map toggle */}
            <div className="flex justify-between items-end gap-4">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Breakfast included</p>
                <p className="text-xs text-success font-semibold">Free cancellation</p>
              </div>
              <Button variant="link" size="sm" className="px-0 text-xs h-auto shrink-0">
                Show map
              </Button>
            </div>
          </div>

          {/*
            Right: action buttons.
            On mobile they appear in a row (flex-row-reverse) separated by a top border.
            On desktop they stack vertically (flex-col), right-aligned.
          */}
          <div className="flex flex-row-reverse md:flex-col justify-between items-center md:items-end border-t border-border pt-5 mt-5 md:border-0 md:pt-0 md:mt-0">
            <Button variant="outline" className="px-4">
              Change Hotel
            </Button>
            <Button variant="link" size="sm" className="px-0">
              View Room Options
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  RecommendationCard — the empty/suggestion state.
  Matches real TripBuilder's AccommodationEmptyWithRecommendations light-blue style.
  bg-primary/10 gives a soft blue tint — makes it clear this is "not yet chosen".
*/
function RecommendationCard({
  icon,
  title,
  description,
  ctaLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
}) {
  return (
    <div className="bg-primary/10 rounded-lg max-md:rounded-r-none max-md:-mr-4 p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Icon in a white circle */}
      <div className="p-3 bg-card rounded-lg border border-border shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-extrabold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button className="shrink-0 max-sm:w-full">
        {ctaLabel}
      </Button>
    </div>
  );
}

/*
  AddStopButton — matches real TripBuilder's AddStopButton exactly.
  The dashed lines on both sides + centered outlined button is the real pattern.
*/
function AddStopButton() {
  return (
    <div className="pl-4 md:pl-7 ml-3 md:ml-4 pt-8 border-l border-dashed border-foreground flex flex-row items-center justify-center">
      {/* Left dashed line — only shown on mobile (the border-l handles desktop) */}
      <span className="md:hidden w-full h-px m-auto mr-4 border-t border-dashed border-foreground" />
      <Button variant="outline">
        <Plus size={16} aria-hidden="true" />
        Add Stop
      </Button>
      {/* Right dashed line — always shown */}
      <span className="w-full h-px m-auto ml-4 md:ml-7 border-t border-dashed border-foreground" />
    </div>
  );
}

/*
  PageFooter — matches real TripBuilder's Footer.tsx.
  Back (text) on the left, Book (primary) on the right.
  Sits at the bottom of the scrollable content area.
*/
function PageFooter({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
      <Button
        variant="ghost"
        className="px-0 gap-1 hover:bg-transparent"
        onClick={onBack}
      >
        <ChevronLeft size={18} aria-hidden="true" />
        Back
      </Button>
      <Button size="lg">
        Book · from €2,499
      </Button>
    </div>
  );
}

/*
  StickySummary — matches real TripBuilder's StickySummary.tsx.
  Fixed to the bottom of the viewport. Shows:
  - Desktop: "Departing [date]" — hr — "Returning [date]" | "2 adults / 7 nights"
  - Mobile: User icon + pax | CalendarDays icon + date range
  - Always: Book button (primary, large)
*/
function StickySummary({
  startDate,
  endDate,
  adults,
  nights,
}: {
  startDate: Date;
  endDate: Date;
  adults: number;
  nights: number;
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full px-4 z-30 bg-card shadow-lg rounded-t-3xl">
      <div className="flex max-w-5xl mx-auto py-4 lg:py-5 justify-between items-center">

        {/* Desktop: full departure / return / pax details */}
        <div className="hidden lg:flex items-center gap-4 text-sm text-foreground">
          <p>
            Departing&nbsp;
            <span className="font-semibold">{format(startDate, "EEE, d MMM yyyy")}</span>
          </p>
          <hr className="w-12 border-border" />
          <p>
            Returning&nbsp;
            <span className="font-semibold">{format(endDate, "EEE, d MMM yyyy")}</span>
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-center font-semibold text-sm text-foreground">
          <p>{adults} adult{adults !== 1 ? "s" : ""}</p>
          <p>{nights} night{nights !== 1 ? "s" : ""}</p>
        </div>

        {/* Mobile: compact icon-based summary */}
        <div className="flex lg:hidden flex-col gap-1 text-sm text-foreground">
          <p className="flex items-center gap-1.5">
            <User size={15} className="text-grey" aria-hidden="true" />
            <span>{adults} adult{adults !== 1 ? "s" : ""}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarDays size={15} className="text-grey" aria-hidden="true" />
            <span>
              {format(startDate, "dd MMM")} – {format(endDate, "dd MMM yyyy")}
            </span>
          </p>
        </div>

        {/* Book button — primary blue, always visible */}
        <Button size="lg">
          Book · from €2,499
        </Button>
      </div>
    </div>
  );
}

// Small green "Added ✓" badge used on confirmed product cards
function AddedBadge() {
  return (
    <span className="ml-auto flex items-center gap-1 bg-success text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
      ✓ Added
    </span>
  );
}
