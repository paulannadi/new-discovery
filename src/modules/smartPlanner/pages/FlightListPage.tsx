import React, { useState, useMemo } from "react";
import { BackButton } from "../../../shared/components/BackButton";
import { cn } from "../../../shared/components/ui/utils";
import {
  Plane,
  Clock,
  Check,
  ArrowRight,
  Users,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import type {
  FlightSearchCriteria,
  FlightOption,
  SelectedFlightLeg,
} from "../../../App";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type FlightListPageProps = {
  searchCriteria: FlightSearchCriteria;
  currentLegIndex: number;
  selectedLegs: SelectedFlightLeg[];
  onFlightLegSelect: (option: FlightOption) => void;
  onBack: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock flight data
//
// getMockFlightsForLeg returns 8 flight options. To make the results feel
// realistic (not random), we apply a small price offset based on the
// destination city's string length. Same destination = same prices every time.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_FLIGHTS: Omit<FlightOption, "id">[] = [
  {
    airline: "British Airways",
    airlineCode: "BA",
    departure: "06:30",
    arrival: "20:15",
    duration: "13h 45m",
    stops: "1 stop",
    stopInfo: "via London Heathrow",
    price: 680,
    badge: "Best",
  },
  {
    airline: "easyJet",
    airlineCode: "EZY",
    departure: "07:00",
    arrival: "18:20",
    duration: "11h 20m",
    stops: "Direct",
    price: 390,
    badge: "Cheapest",
  },
  {
    airline: "Emirates",
    airlineCode: "EK",
    departure: "09:15",
    arrival: "21:30",
    duration: "12h 15m",
    stops: "Direct",
    stopInfo: "via Dubai",
    price: 520,
  },
  {
    airline: "KLM",
    airlineCode: "KL",
    departure: "11:00",
    arrival: "01:45",
    duration: "14h 45m",
    stops: "1 stop",
    stopInfo: "via Amsterdam",
    price: 445,
  },
  {
    airline: "Thai Airways",
    airlineCode: "TG",
    departure: "13:30",
    arrival: "06:15",
    duration: "16h 45m",
    stops: "1 stop",
    price: 510,
  },
  {
    airline: "Lufthansa",
    airlineCode: "LH",
    departure: "15:00",
    arrival: "05:30",
    duration: "14h 30m",
    stops: "1 stop",
    stopInfo: "via Frankfurt",
    price: 465,
  },
  {
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    departure: "17:45",
    arrival: "09:00",
    duration: "15h 15m",
    stops: "1 stop",
    price: 595,
    badge: "Fastest",
  },
  {
    airline: "Turkish Airlines",
    airlineCode: "TK",
    departure: "22:00",
    arrival: "14:20",
    duration: "16h 20m",
    stops: "2 stops",
    stopInfo: "via Istanbul",
    price: 340,
  },
];

function getMockFlightsForLeg(from: string, to: string): FlightOption[] {
  // Deterministic price offset based on origin + destination length.
  // This means "London → Bangkok" always has the same prices across legs.
  const offset = ((from.length + to.length) % 5) * 20;
  return BASE_FLIGHTS.map((f, i) => ({
    ...f,
    id: `${from}-${to}-${i}`,
    price: f.price + offset,
  }));
}

// Parse "13h 45m" → minutes, used for the Fastest sort
function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// The 2-letter airline code shown as a small square badge
function AirlineBadge({ code }: { code: string }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-grey-light flex items-center justify-center shrink-0">
      <span className="text-xs font-extrabold text-foreground tracking-tight">{code}</span>
    </div>
  );
}

// Badge pill shown on certain flights: "Best", "Cheapest", or "Fastest"
function ResultBadge({ label }: { label: "Best" | "Cheapest" | "Fastest" }) {
  const styles = {
    Best: "bg-success/10 text-success",
    Cheapest: "bg-warning/10 text-warning",
    Fastest: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${styles[label]}`}>
      {label}
    </span>
  );
}

// One flight result card
function FlightCard({
  option,
  cabinLabel,
  onSelect,
}: {
  option: FlightOption;
  cabinLabel: string;
  onSelect: () => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden">
      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">

        {/* Left: airline info + flight bar */}
        <div className="flex-1 flex flex-col gap-3">

          {/* Top row: airline badge + name + optional badge pill */}
          <div className="flex items-center gap-3">
            <AirlineBadge code={option.airlineCode} />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {option.airline}
                </span>
                {option.badge && <ResultBadge label={option.badge} />}
              </div>
              <span className="text-xs text-grey">
                {cabinLabel} · 1 checked bag included
              </span>
            </div>
          </div>

          {/* Flight times bar: departure → duration → arrival */}
          <div className="flex items-center gap-3">
            {/* Departure time */}
            <div className="text-center shrink-0 min-w-[44px]">
              <div className="text-lg font-extrabold text-foreground leading-none">
                {option.departure}
              </div>
            </div>

            {/* Connecting bar */}
            <div className="flex-1 flex flex-col gap-1 items-center">
              <div className="text-xs font-semibold text-grey">
                {option.stops}
                {option.stopInfo ? ` · ${option.stopInfo}` : ""}
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane size={12} className="text-grey shrink-0" aria-hidden="true" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex items-center gap-1 text-xs text-grey">
                <Clock size={10} aria-hidden="true" />
                {option.duration}
              </div>
            </div>

            {/* Arrival time */}
            <div className="text-center shrink-0 min-w-[44px]">
              <div className="text-lg font-extrabold text-foreground leading-none">
                {option.arrival}
              </div>
            </div>
          </div>
        </div>

        {/* Right: price + select button */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:min-w-[140px] pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-muted md:pl-5">
          <div className="text-right">
            <div className="text-xs text-grey">per person</div>
            <div className="text-2xl font-extrabold text-foreground leading-tight">
              ${option.price}
            </div>
          </div>
          <button
            onClick={onSelect}
            className="bg-primary hover:brightness-85 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

// Step dot used in the progress indicator
function StepDot({
  status,
  label,
}: {
  status: "done" | "current" | "future";
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center transition-all",
          status === "done"
            ? "bg-success text-white"
            : status === "current"
            ? "bg-primary text-white ring-4 ring-primary/20"
            : "bg-card border-2 border-border text-grey"
        )}
      >
        {status === "done" ? (
          <Check size={14} strokeWidth={3} aria-hidden="true" />
        ) : (
          <span className="text-xs font-extrabold">{label}</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function FlightListPage({
  searchCriteria,
  currentLegIndex,
  selectedLegs,
  onFlightLegSelect,
  onBack,
}: FlightListPageProps) {
  // Sort state: which sort mode is active
  type SortMode = "best" | "cheapest" | "fastest";
  const [activeSort, setActiveSort] = useState<SortMode>("best");

  // The leg currently being picked
  const currentLeg = searchCriteria.legs[currentLegIndex];

  // Generate mock results for this leg
  const flights = getMockFlightsForLeg(
    currentLeg?.from || "",
    currentLeg?.to || ""
  );

  // Sort the results based on the active sort mode
  const sortedFlights = useMemo(() => {
    if (activeSort === "cheapest") return [...flights].sort((a, b) => a.price - b.price);
    if (activeSort === "fastest") return [...flights].sort((a, b) => parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration));
    return flights; // "best" = our curated default order
  }, [flights, activeSort]);

  const totalLegs = searchCriteria.legs.length;

  // Format a leg for the criteria bar: "London → Bangkok · 15 Jul"
  function formatLegPill(leg: typeof currentLeg) {
    const fromLabel = leg.from || "?";
    const toLabel = leg.to || "?";
    const dateLabel = leg.date ? format(leg.date, "d MMM") : "any date";
    return `${fromLabel} → ${toLabel} · ${dateLabel}`;
  }

  const CABIN_LABELS: Record<NonNullable<FlightSearchCriteria["cabinClass"]>, string> = {
    "economy": "Economy",
    "premium-economy": "Premium Economy",
    "business": "Business",
    "first": "First Class",
  };
  const cabinLabel = CABIN_LABELS[searchCriteria.cabinClass];

  const total = searchCriteria.adults + searchCriteria.children;
  const passengersLabel = `${total} passenger${total !== 1 ? "s" : ""} · ${cabinLabel}`;

  return (
    <div className="min-h-screen bg-grey-lightest">

      {/* ── STICKY CRITERIA BAR ─────────────────────────────────────────────
          Shows all legs as pills. Done = green check, current = blue border,
          future = grey. Stays on screen while scrolling results. */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">

            {/* Back to Discovery */}
            <BackButton label="Back to discovery" onClick={onBack} />

            {/* Divider */}
            <span className="hidden sm:block w-px h-5 bg-border" />

            {/* Leg pills — map over all legs and show status */}
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              {searchCriteria.legs.map((leg, i) => {
                const isDone = i < currentLegIndex;
                const isCurrent = i === currentLegIndex;
                return (
                  <React.Fragment key={leg.id}>
                    {/* Show connector arrow between legs */}
                    {i > 0 && (
                      <ArrowRight size={12} className="text-grey shrink-0 hidden sm:block" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all",
                        isDone
                          ? "bg-success/10 border-success/30 text-success"
                          : isCurrent
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-grey-light border-border text-grey"
                      )}
                    >
                      {isDone && <Check size={10} strokeWidth={3} aria-hidden="true" />}
                      {formatLegPill(leg)}
                    </span>
                  </React.Fragment>
                );
              })}

              {/* Passengers pill */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-grey-light border border-border text-muted-foreground">
                <Users size={10} aria-hidden="true" />
                {passengersLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">

        {/* ── PROGRESS + HEADING ──────────────────────────────────────────── */}
        <div className="mb-6">
          {/* Step dots — one per leg */}
          {totalLegs > 1 && (
            <div className="flex items-center gap-0 mb-4">
              {searchCriteria.legs.map((leg, i) => {
                const status =
                  i < currentLegIndex
                    ? "done"
                    : i === currentLegIndex
                    ? "current"
                    : "future";
                return (
                  <React.Fragment key={leg.id}>
                    <StepDot status={status} label={String(i + 1)} />
                    {/* Connecting line between dots */}
                    {i < totalLegs - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 min-w-[24px] max-w-[60px]",
                          i < currentLegIndex ? "bg-success" : "bg-border"
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Heading */}
          <div className="flex items-center gap-2.5">
            <Plane size={24} className="text-primary shrink-0" aria-hidden="true" />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
                {totalLegs > 1
                  ? `Choose flight ${currentLegIndex + 1} of ${totalLegs}`
                  : "Choose your flight"}
              </h1>
              {currentLeg && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentLeg.from || "Origin"} → {currentLeg.to || "Destination"}
                  {currentLeg.date ? ` · ${format(currentLeg.date, "EEE d MMM yyyy")}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── SORT / FILTER BAR ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} className="text-grey" aria-hidden="true" />
          <span className="text-xs text-grey font-bold mr-1">Sort:</span>
          {(["best", "cheapest", "fastest"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveSort(mode)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                activeSort === mode
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs text-grey">
            {sortedFlights.length} flights found
          </span>
        </div>

        {/* ── RESULTS LIST ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {sortedFlights.map((option) => (
            <FlightCard
              key={option.id}
              option={option}
              cabinLabel={cabinLabel}
              onSelect={() => onFlightLegSelect(option)}
            />
          ))}
        </div>

        {/* Already selected legs summary (shown after leg 1 is chosen) */}
        {selectedLegs.length > 0 && (
          <div className="mt-8 p-4 bg-success/10 border border-success/30 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Check size={16} className="text-success" aria-hidden="true" />
              <span className="text-xs font-bold text-success">
                Flights chosen so far
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {selectedLegs.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-success">
                  <span className="font-bold">
                    {s.leg.from} → {s.leg.to}
                  </span>
                  <span className="text-success/60">·</span>
                  <span>{s.option.airline}</span>
                  <span className="text-success/60">·</span>
                  <span>{s.option.departure} → {s.option.arrival}</span>
                  <span className="text-success/60">·</span>
                  <span className="font-bold">${s.option.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
