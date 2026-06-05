// FlightListPage — the search-results screen the user lands on after
// submitting the Flights form. Composes a stack of small components from
// `../components/flightSearch/`.
//
// Layout (top → bottom):
//   1. BackButton (back to Discovery)
//   2. <h1>Search for flights</h1>
//   3. <FlightTripSummary> ↔ <FlightSearchForm> — same spot toggles between
//      the read-only summary row and the full Discovery flights form when
//      "Edit search" is clicked (no modal).
//   4. <FlightStepper>     — text-pill breadcrumb for legs + Summary
//   5. Sub-heading row — "Flight N: from to" + date · "Selecting flight N of M"
//   6. <FlightFilterBar>   — 5 working filters (sort, stops, airlines, time, duration)
//   7. Results list / loading skeletons + streaming banner
//   8. (optional) selected-legs summary box at the bottom

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Plane } from "lucide-react";
import { BackButton } from "../../../shared/components/BackButton";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import {
  StaggeredList,
  StreamingStatusBanner,
} from "../../../shared/components/loading";
import { Button } from "../../../shared/components/ui/button";
import type {
  FlightSearchCriteria,
  FlightOption,
  SelectedFlightLeg,
} from "../../../App";

// New flightSearch building blocks
import { FlightTripSummary } from "../components/flightSearch/FlightTripSummary";
import { FlightStepper } from "../components/flightSearch/FlightStepper";
import { FlightFilterBar } from "../components/flightSearch/FlightFilterBar";
import { FlightResultCard } from "../components/flightSearch/FlightResultCard";
// FlightSearchForm — the SAME form used on the Discovery "Flights" tab. When
// the user clicks "Edit search" it replaces the trip summary row in-place,
// pre-filled with the current criteria.
import { FlightSearchForm } from "../components/flightSearch/FlightSearchForm";
import { getMockFlightsForLeg } from "../components/flightSearch/mockFlights";
import { applyFilters } from "../components/flightSearch/filterFlights";
import { DEFAULT_FILTERS, type FlightFilters } from "../components/flightSearch/types";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type FlightListPageProps = {
  searchCriteria: FlightSearchCriteria;
  currentLegIndex: number;
  selectedLegs: SelectedFlightLeg[];
  onFlightLegSelect: (option: FlightOption) => void;
  // New — Edit Search modal commits via this callback. The parent (App.tsx)
  // updates searchCriteria, clears selected legs, and resets the leg index.
  onSearchCriteriaChange: (next: FlightSearchCriteria) => void;
  onBack: () => void;
};

// Cabin labels matching App.tsx's `cabinClass` union.
const CABIN_LABELS: Record<FlightSearchCriteria["cabinClass"], string> = {
  economy: "Economy",
  "premium-economy": "Premium Economy",
  business: "Business",
  first: "First Class",
};

// ─────────────────────────────────────────────────────────────────────────────
// FlightCardSkeleton — used during the simulated streaming search
// ─────────────────────────────────────────────────────────────────────────────
function FlightCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading flight"
      className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
    >
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 shrink-0" />
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
  onSearchCriteriaChange,
  onBack,
}: FlightListPageProps) {
  // ── Edit Search inline-editor open state ───────────────────────────────
  // When true, <FlightSearchForm> replaces <FlightTripSummary> in the
  // same vertical spot on the page (no modal).
  const [isEditingSearch, setIsEditingSearch] = useState(false);

  // ── Filters state — single object so resets are one line ──────────────
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

  // ── Simulated streaming search ─────────────────────────────────────────
  // Real queries take several seconds across multiple carriers. We mimic
  // that with two phases (isSearching → cards arrive, then streaming
  // progress 1/3 → 2/3 → 3/3) and re-run on every criteria/leg change.
  const [isSearching, setIsSearching] = useState(true);
  const [streamingProgress, setStreamingProgress] = useState({ completed: 0, total: 3 });

  useEffect(() => {
    setIsSearching(true);
    setStreamingProgress({ completed: 0, total: 3 });
    // Reset filters when we switch legs / commit new criteria so each leg
    // starts from a clean filter slate. Avoids stale "Direct only" surprises.
    setFilters(DEFAULT_FILTERS);

    const t1 = setTimeout(() => {
      setIsSearching(false);
      setStreamingProgress({ completed: 1, total: 3 });
    }, 2500);
    const t2 = setTimeout(() => setStreamingProgress({ completed: 2, total: 3 }), 3500);
    const t3 = setTimeout(() => setStreamingProgress({ completed: 3, total: 3 }), 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentLegIndex, searchCriteria]);

  const currentLeg = searchCriteria.legs[currentLegIndex];
  const totalLegs = searchCriteria.legs.length;
  const cabinLabel = CABIN_LABELS[searchCriteria.cabinClass];

  // Raw mock results for this leg
  const flights = useMemo(
    () => getMockFlightsForLeg(currentLeg?.from || "", currentLeg?.to || ""),
    [currentLeg?.from, currentLeg?.to],
  );

  // Apply the active filters + sort
  const filteredFlights = useMemo(
    () => applyFilters(flights, filters),
    [flights, filters],
  );

  // List of airlines available in the current result set — feeds the
  // Airlines filter checkbox list. We always use the full catalogue
  // (not the post-filter list) so toggling an airline off doesn't make
  // that airline impossible to re-enable.
  const availableAirlines = useMemo(
    () =>
      Array.from(new Map(flights.map((f) => [f.airlineCode, f.airline])))
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [flights],
  );

  return (
    <div className="min-h-screen bg-grey-lightest">

      {/* ── Header bar — mirrors the HotelListPage header: a white `bg-card`
            strip with a bottom border holding the back button and the search
            criteria. Full-bleed background, inner content constrained to the
            same max-w-5xl as the results below so everything stays aligned. */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">

          {/* 1. Back to discovery */}
          <BackButton label="Back to discovery" onClick={onBack} className="mb-3" />

          {/* 2. Trip summary ↔ inline editor. Clicking any criteria box or the
                Edit search button swaps this row for <FlightSearchForm>;
                submitting or cancelling brings the summary back. */}
          {isEditingSearch ? (
            <FlightSearchForm
              initialCriteria={searchCriteria}
              submitLabel="Search flights"
              onSearch={(next) => {
                onSearchCriteriaChange(next);
                setIsEditingSearch(false);
              }}
              onCancel={() => setIsEditingSearch(false)}
            />
          ) : (
            <FlightTripSummary
              criteria={searchCriteria}
              onEditSearch={() => setIsEditingSearch(true)}
            />
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">

        {/* 4. Stepper — legs + Summary */}
        <div className="mb-6 pb-5 border-b border-border">
          <FlightStepper legs={searchCriteria.legs} currentLegIndex={currentLegIndex} />
        </div>

        {/* 5. Per-leg sub-heading row */}
        {currentLeg && (
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div className="flex items-start gap-2.5">
              <Plane size={22} className="text-primary shrink-0 mt-1" aria-hidden="true" />
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-foreground leading-tight">
                  Flight {currentLegIndex + 1}: {currentLeg.from || "Origin"} to {currentLeg.to || "Destination"}
                </h2>
                {currentLeg.date && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {format(currentLeg.date, "EEE, dd MMM yyyy")}
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              Selecting flight {currentLegIndex + 1} of {totalLegs}
            </span>
          </div>
        )}

        {/* 6. Filter bar — 5 working filters */}
        <div className="mb-5">
          <FlightFilterBar
            filters={filters}
            onChange={setFilters}
            availableAirlines={availableAirlines}
          />
        </div>

        {/* 7. Results list — skeletons while loading, then the cards */}
        {isSearching ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <FlightCardSkeleton key={i} />
            ))}
            <StreamingStatusBanner
              isStreaming
              message="Searching flights across carriers…"
            />
          </div>
        ) : filteredFlights.length === 0 ? (
          // Empty state — happens when the user cranks Max duration down
          // below the shortest available flight, or filters every airline out.
          <div className="bg-card rounded-xl border border-border p-8 text-center flex flex-col items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              No flights match your filters
            </span>
            <span className="text-xs text-muted-foreground">
              Try widening the duration or clearing airline / time filters.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <>
            <StaggeredList className="flex flex-col gap-3">
              {filteredFlights.map((option) => (
                <FlightResultCard
                  key={option.id}
                  option={option}
                  legDate={currentLeg?.date}
                  fromCode={currentLeg?.from || ""}
                  toCode={currentLeg?.to || ""}
                  legIndex={currentLegIndex}
                  totalLegs={totalLegs}
                  cabinLabel={cabinLabel}
                  onSelect={() => onFlightLegSelect(option)}
                />
              ))}
            </StaggeredList>
            <StreamingStatusBanner
              isStreaming={streamingProgress.completed < streamingProgress.total}
              progress={streamingProgress}
              message="Checking remaining carriers…"
            />
          </>
        )}

        {/* 8. Already selected legs summary (shown after leg 1 is chosen) */}
        {selectedLegs.length > 0 && (
          <div className="mt-8 p-4 bg-success/10 border border-success/30 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-success">
                Flights chosen so far
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {selectedLegs.map((s, i) => (
                <div key={i} className="flex flex-wrap items-center gap-3 text-xs text-success">
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
