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
} from "../../../shared/components/loading";
import { Button } from "../../../shared/components/ui/button";
import type {
  FlightSearchCriteria,
  FlightOption,
  SelectedFlightLeg,
} from "../../../App";

// New flightSearch building blocks
import { FlightStepper } from "../components/flightSearch/FlightStepper";
import { FlightFilterBar } from "../components/flightSearch/FlightFilterBar";
import { FlightResultCard } from "../components/flightSearch/FlightResultCard";
// EditableFlightSearch — the collapsed trip summary that expands into the search
// form in-place ("Edit search" reveals it, "Update search" re-runs it, a chevron
// folds it back). Shared with every stopover-flow step.
import { EditableFlightSearch } from "../components/flightSearch/EditableFlightSearch";
// Banner that nudges the traveller to add a stopover when they didn't opt in.
import { StopoverPromoBanner } from "../components/flightSearch/StopoverPromoBanner";
import { getMockFlightsForLeg, getStopoverOffersForLeg, routeHasStopover } from "../components/flightSearch/mockFlights";
import { findAirportByCode } from "../components/flightSearch/airports";
// The stopover airline (from Settings) decides which carrier the flat flights are
// filtered to in stopover-only mode.
import { useSettings } from "../../../shared/contexts/SettingsContext";
import { STOPOVER_AIRLINES } from "../components/flightSearch/stopoverAirlines";
import { applyFilters } from "../components/flightSearch/filterFlights";
import { DEFAULT_FILTERS, type FlightFilters } from "../components/flightSearch/types";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type FlightListPageProps = {
  searchCriteria: FlightSearchCriteria;
  currentLegIndex: number;
  selectedLegs: SelectedFlightLeg[];
  // Cheapest-package anchoring (stopover flow only). The running package floor
  // BEFORE this leg: the cheapest flight on this leg shows exactly this price,
  // pricier ones add their premium. Undefined on a plain flight search, where
  // each flight just shows its own fare.
  packageFloor?: number;
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
  packageFloor,
  onFlightLegSelect,
  onSearchCriteriaChange,
  onStepSelect,
  onBack,
}: FlightListPageProps) {
  // The selected stopover airline decides which carrier the flat flights are
  // filtered to when this page is in stopover-only mode (see `flights` below).
  const { settings } = useSettings();

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
  // Hotel-style horizontal loader: a thin bar fills over ~1.5s, then the
  // results reveal and the bar fades out. This replaces the old streaming
  // status banners ("Searching flights…" / "Checking remaining carriers…").
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoadingBar, setShowLoadingBar] = useState(true);

  useEffect(() => {
    setIsSearching(true);
    setLoadingProgress(0);
    setShowLoadingBar(true);
    // Reset filters when we switch legs / commit new criteria so each leg
    // starts from a clean filter slate. Avoids stale "Direct only" surprises.
    setFilters(DEFAULT_FILTERS);

    const duration = 1500;      // total fill time, matching HotelListPage
    const intervalTime = 20;    // tick cadence
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Reveal the cards when the fill completes, then fade the bar out 500ms later.
    const reveal = setTimeout(() => setIsSearching(false), duration);
    const fade = setTimeout(() => setShowLoadingBar(false), duration + 500);

    return () => {
      clearInterval(timer);
      clearTimeout(reveal);
      clearTimeout(fade);
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
  // Stopover flow we keep only the selected airline's flights, so the flat leg
  // shows that carrier's fares only — matching the stopover offers on the other
  // leg, which already fly the same airline (Fiji via Nadi / Caribbean via POS).
  const stopoverAirlineCode = STOPOVER_AIRLINES[settings.stopoverAirline].airlineCode;
  const flights = useMemo(() => {
    const all = getMockFlightsForLeg(currentLeg?.from || "", currentLeg?.to || "");
    return stopoverOnly ? all.filter((f) => f.airlineCode === stopoverAirlineCode) : all;
  }, [currentLeg?.from, currentLeg?.to, stopoverOnly, stopoverAirlineCode]);

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
        {/* `px-4 md:px-6` matches the white strip on every other stopover step
            so the back button + search row sit at the same inset throughout. */}
        <PageContainer tier="narrow" className="px-4 md:px-6 py-4">

          {/* 1. Back to discovery */}
          <BackButton label="Back to discovery" onClick={onBack} className="mb-3" />

          {/* 2. Trip summary ↔ inline editor, encapsulated in one component so
                this page and every stopover-flow step share the exact same
                behaviour: "Edit search" only reveals the form, "Update search"
                re-runs it, and a folding chevron collapses it back unchanged. */}
          <EditableFlightSearch
            criteria={searchCriteria}
            onUpdateSearch={onSearchCriteriaChange}
          />
        </PageContainer>
      </header>

      {/* `px-4 md:px-6` keeps the same horizontal inset as the white strip
          above and as steps 2–4. `pt-4` drops the stepper exactly 16px below
          the white strip — matching the `pt-4` grey band on the other steps
          (was `py-6 md:py-8`, which sat the stepper 24/32px lower). Bottom
          padding stays generous (`pb-6 md:pb-8`) for the scrolling results. */}
      <PageContainer as="main" tier="narrow" className="px-4 md:px-6 pt-4 pb-6 md:pb-8">

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
                  {/* Full city names ("Los Angeles to Sydney"), with "with
                      stopover" appended when this leg is the stopover leg. */}
                  Flight {currentLegIndex + 1}:{" "}
                  {findAirportByCode(currentLeg.from)?.city || currentLeg.from || "Origin"} to{" "}
                  {findAirportByCode(currentLeg.to)?.city || currentLeg.to || "Destination"}
                  {isStopoverLeg && " with stopover"}
                </h2>
                {currentLeg.date && (
                  <p className="text-sm text-foreground mt-0.5">
                    {format(currentLeg.date, "EEE, dd MMM yyyy")}
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm text-foreground">
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

        {/* 7. Loading bar — hotel-style thin horizontal loader that fills then
            fades out once results arrive. Sits just above the results list. */}
        {showLoadingBar && (
          <div
            className={`h-1 w-full bg-muted rounded-full overflow-hidden transition-opacity duration-500 mb-4 ${loadingProgress >= 100 ? "opacity-0" : "opacity-100"}`}
          >
            <div
              className="h-full bg-primary transition-all duration-75 ease-linear"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        )}

        {/* 8. Results list — skeletons while loading, then the cards */}
        {isSearching ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <FlightCardSkeleton key={i} />
            ))}
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
          <StaggeredList className="flex flex-col gap-3">
              {(() => {
                // Cheapest-package anchoring: when a package floor is supplied
                // (stopover flow), every card shows floor + (its fare − cheapest
                // fare here). The cheapest flight lands exactly on the floor.
                const packageMode = packageFloor != null;
                const minFare = filteredFlights.length
                  ? Math.min(...filteredFlights.map((o) => o.price))
                  : 0;
                return filteredFlights.map((option) => (
                  <FlightResultCard
                    key={option.id}
                    option={option}
                    legDate={currentLeg?.date}
                    fromCode={currentLeg?.from || ""}
                    toCode={currentLeg?.to || ""}
                    legIndex={currentLegIndex}
                    totalLegs={totalLegs}
                    cabinLabel={cabinLabel}
                    packageMode={packageMode}
                    displayPrice={packageMode ? packageFloor! + (option.price - minFare) : undefined}
                    onSelect={() => onFlightLegSelect(option)}
                  />
                ));
              })()}
          </StaggeredList>
        )}
      </PageContainer>
    </div>
  );
}
