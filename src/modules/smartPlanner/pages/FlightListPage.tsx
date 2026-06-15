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
import { PageContainer } from "../../../shared/components/PageContainer";
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
// Banner that nudges the traveller to add a stopover when they didn't opt in.
import { StopoverPromoBanner } from "../components/flightSearch/StopoverPromoBanner";
import { getMockFlightsForLeg, getStopoverOffersForLeg, routeHasStopover } from "../components/flightSearch/mockFlights";
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
  // Click a completed step in the stepper to jump back to that flight leg.
  onStepSelect?: (legIndex: number) => void;
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
  onStepSelect,
  onBack,
}: FlightListPageProps) {
  // ── Edit Search inline-editor open state ───────────────────────────────
  // When true, <FlightSearchForm> replaces <FlightTripSummary> in the
  // same vertical spot on the page (no modal).
  const [isEditingSearch, setIsEditingSearch] = useState(false);

  // ── Filters state — single object so resets are one line ──────────────
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

  // ── Stopover suggestion banner ─────────────────────────────────────────
  // Once the traveller dismisses the "add a stopover" nudge, we keep it hidden
  // for the rest of the session so we don't keep pestering them.
  const [stopoverPromoDismissed, setStopoverPromoDismissed] = useState(false);

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

  // Is THIS the leg the user opted into a stopover on? (round trip only —
  // leg 0 = outbound, leg 1 = return). If so, we surface stopover offers
  // alongside the normal results for this connection.
  const stop = searchCriteria.stopover;
  const isStopoverLeg =
    searchCriteria.tripType === "roundtrip" &&
    !!stop?.enabled &&
    ((stop.leg === "outbound" && currentLegIndex === 0) ||
      (stop.leg === "return" && currentLegIndex === 1));

  // Dedicated Stopover-tab search (from the new Discovery "Stopover" tab). When
  // true we show ONLY stopover offers on the chosen leg, flat flights only on
  // the other leg, and restrict every result to Fiji Airways.
  const stopoverOnly = !!searchCriteria.stopoverOnly;

  // Should we show the "add a stopover" nudge? Only when ALL of these hold:
  //   • it's a round trip (stopovers only apply to round trips)
  //   • the traveller hasn't already opted into a stopover
  //   • they haven't dismissed the banner this session
  //   • the outbound route actually HAS a sensible stopover hub — otherwise
  //     enabling the option would surface zero offers, so the nudge would be a
  //     dead end. `routeHasStopover` is the same gate the stepper uses.
  const outboundLeg = searchCriteria.legs[0];
  const showStopoverPromo =
    searchCriteria.tripType === "roundtrip" &&
    !stop?.enabled &&
    !stopoverOnly &&
    !stopoverPromoDismissed &&
    !!outboundLeg &&
    routeHasStopover(outboundLeg.from, outboundLeg.to);

  // CTA handler — re-run the SAME search with the stopover option turned on.
  // We hand the updated criteria to the parent (App.tsx), which clears the
  // selected legs and resets to leg 0; the effect above then re-runs the
  // simulated search, so the results refresh with stopover offers mixed in.
  // We default to a 2-night stopover on the OUTBOUND leg — the most common
  // choice, and the one the traveller lands back on after the reset.
  const handleEnableStopover = () => {
    onSearchCriteriaChange({
      ...searchCriteria,
      stopover: { enabled: true, leg: "outbound", nights: 2 },
    });
  };

  // Raw mock results for this leg (the normal flights). In the dedicated
  // Stopover flow we keep only Fiji Airways (FJ) flights, so the flat leg shows
  // Fiji fares only — matching the stopover offers, which already fly Fiji.
  const flights = useMemo(() => {
    const all = getMockFlightsForLeg(currentLeg?.from || "", currentLeg?.to || "");
    return stopoverOnly ? all.filter((f) => f.airlineCode === "FJ") : all;
  }, [currentLeg?.from, currentLeg?.to, stopoverOnly]);

  // Stopover offers for the chosen leg. Kept separate from `flights` so they
  // aren't reordered by the price/duration sort or hidden by the airline
  // filters — they're the whole reason the user opted in, so they stay pinned
  // at the top of the list.
  const stopoverOffers = useMemo(
    () =>
      isStopoverLeg && stop
        ? getStopoverOffersForLeg(currentLeg?.from || "", currentLeg?.to || "", stop.nights)
        : [],
    [isStopoverLeg, currentLeg?.from, currentLeg?.to, stop?.nights],
  );

  // Apply the active filters + sort to the normal flights, then pin the
  // stopover offers on top.
  //
  // In the dedicated Stopover flow the chosen leg shows ONLY stopover offers —
  // no flat flights — so the traveller picks from stopover journeys alone. On
  // the other leg `stopoverOffers` is empty and `flights` is Fiji-filtered, so
  // the same expression naturally yields Fiji flat flights only.
  const filteredFlights = useMemo(
    () =>
      stopoverOnly && isStopoverLeg
        ? stopoverOffers
        : [...stopoverOffers, ...applyFilters(flights, filters)],
    [stopoverOnly, isStopoverLeg, stopoverOffers, flights, filters],
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
        <PageContainer tier="narrow" className="px-4 py-4">

          {/* 1. Back to discovery */}
          <BackButton label="Back to discovery" onClick={onBack} className="mb-3" />

          {/* 2. Trip summary ↔ inline editor. Clicking any criteria box or the
                Edit search button swaps this row for <FlightSearchForm>;
                submitting brings the summary back. We don't pass `onCancel`
                here, so the form's Cancel button is hidden — submitting the
                search is the only way out, which keeps the row uncluttered. */}
          {isEditingSearch ? (
            <FlightSearchForm
              initialCriteria={searchCriteria}
              // Keep the stopover-only form (round-trip, no opt-in checkbox,
              // Fiji-restricted airports) when editing a stopover search, so the
              // edit can't accidentally drop back to the normal flights form.
              stopoverMode={stopoverOnly}
              submitLabel="Search flights"
              onSearch={(next) => {
                onSearchCriteriaChange(next);
                setIsEditingSearch(false);
              }}
            />
          ) : (
            <FlightTripSummary
              criteria={searchCriteria}
              onEditSearch={() => setIsEditingSearch(true)}
            />
          )}
        </PageContainer>
      </header>

      <PageContainer as="main" tier="narrow" className="px-4 py-6 md:py-8">

        {/* 4. Stepper — one card per flight leg (+ a stopover-hotel card when
            the round trip opted into a stopover).
            No divider here — we rely on generous whitespace (`mb-10`) to
            separate the stepper from the title below instead of a border line. */}
        <div className="mb-10">
          <FlightStepper
            legs={searchCriteria.legs}
            currentLegIndex={currentLegIndex}
            tripType={searchCriteria.tripType}
            stopover={searchCriteria.stopover}
            onStepSelect={onStepSelect}
          />
        </div>

        {/* 4b. Stopover nudge — sits directly below the stepper. Only for round
            trips where the traveller hasn't opted into a stopover and the route
            has a sensible hub. The CTA re-runs the search with stopovers on. */}
        {showStopoverPromo && (
          <div className="mb-8">
            <StopoverPromoBanner
              onEnableStopover={handleEnableStopover}
              onDismiss={() => setStopoverPromoDismissed(true)}
            />
          </div>
        )}

        {/* 5. Per-leg sub-heading row */}
        {currentLeg && (
          <div className="flex flex-wrap items-start justify-between gap-2 mb-6">
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
            resultCount={filteredFlights.length}
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
      </PageContainer>
    </div>
  );
}
