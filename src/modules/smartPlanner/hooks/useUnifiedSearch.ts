// ─────────────────────────────────────────────────────────────────────────────
// useUnifiedSearch Hook — Simulated SSE Stream
//
// This hook mimics what the real backend would do via Server-Sent Events (SSE):
// first returning fast cached results, then progressively merging in live
// supplier results as they arrive.
//
// For this prototype, we use setTimeout instead of a real EventSource.
// The sequence matches what production would look like:
//
//   t=0ms     → reset state (new search started)
//   t=200ms   → cached results arrive instantly (Step 1)
//   t=2000ms  → supplier 1 checked in (progress update only, no results yet)
//   t=3500ms  → supplier 2 returns first batch of results → merge into list
//   t=5000ms  → supplier 3 returns remaining results → merge, loading done
//
// If the destination is NOT cached (isCachedDestination === false):
//   t=200ms   → direct live results arrive (no loading phase)
//   Done.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { UnifiedPackage } from '../../../types';
import { HolidaySearchCriteria } from '../../../App';
import { mergeDeduplicated } from '../utils/mergeDeduplicated';
import { CACHED_PACKAGES } from '../../../mocks/packages/cachedPackages';
import { LIVE_PACKAGES, NON_CACHED_PACKAGES_BY_DESTINATION } from '../../../mocks/packages/livePackages';
import { DESTINATIONS } from '../../../mocks/destinations';

// ─────────────────────────────────────────────────────────────────────────────
// updateFlightDates
//
// Rewrites the outbound + return flight ISO date strings to match the newly
// selected departure date, while keeping the original time-of-day intact.
//
// Example: "2026-04-28T11:00:00Z" + newDate "2026-06-10" → "2026-06-10T11:00:00Z"
// ─────────────────────────────────────────────────────────────────────────────
function updateFlightDates(
  pkg: UnifiedPackage,
  departureDateStr: string,
  returnDateStr: string,
): UnifiedPackage['flights'] {
  // Split on "T" to isolate the time portion — e.g. "11:00:00Z"
  const outDepTime    = pkg.flights.outbound.departureTime.split('T')[1] ?? '00:00:00Z';
  const outArrTime    = pkg.flights.outbound.arrivalTime.split('T')[1]   ?? '00:00:00Z';
  const retDepTime    = pkg.flights.return.departureTime.split('T')[1]   ?? '00:00:00Z';
  const retArrTime    = pkg.flights.return.arrivalTime.split('T')[1]     ?? '00:00:00Z';

  return {
    outbound: {
      ...pkg.flights.outbound,
      departureTime: `${departureDateStr}T${outDepTime}`,
      arrivalTime:   `${departureDateStr}T${outArrTime}`,
    },
    return: {
      ...pkg.flights.return,
      departureTime: `${returnDateStr}T${retDepTime}`,
      arrivalTime:   `${returnDateStr}T${retArrTime}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// applyDateToPackages
//
// Adjusts each package in a list to reflect the user's date selection.
// Handles two modes:
//
//   "specific" — user picked an exact departure date:
//       • Cache packages: look up that date in the rateCalendar to get the
//         correct price. Filter out packages where that date is sold out.
//       • Live packages: rewrite flight dates only (price stays as-is).
//
//   "flexible" — user picked one or more whole months (cache-only):
//       • Each package gets a different available departure date spread across
//         the selected month(s), so every card shows a distinct date.
//       • Price comes from the rateCalendar entry for that picked date.
//       • Return date = departure + criteria.nights (respects stay length).
//       • If no available dates exist in the selected months, package is kept
//         with its original dates (graceful fallback).
//
// ─────────────────────────────────────────────────────────────────────────────
function applyDateToPackages(
  packages: UnifiedPackage[],
  criteria: HolidaySearchCriteria,
): UnifiedPackage[] {
  const nights = criteria.nights || 7;

  // ── Specific date mode ────────────────────────────────────────────────────
  if (criteria.dateMode === 'specific' && criteria.dateRange?.from) {
    const departureDateStr = format(criteria.dateRange.from, 'yyyy-MM-dd');
    const returnDateStr    = format(addDays(criteria.dateRange.from, nights), 'yyyy-MM-dd');

    return packages
      .map((pkg): UnifiedPackage | null => {
        if (pkg.rateCalendar) {
          const entry = pkg.rateCalendar.find((e) => e.departureDate === departureDateStr);

          // Sold out on this date — hide the package entirely
          if (entry && !entry.available) return null;

          const updatedFlights = updateFlightDates(pkg, departureDateStr, returnDateStr);

          if (entry) {
            // Available — use the calendar price for this date
            return {
              ...pkg,
              price: {
                ...pkg.price,
                perPerson: entry.pricePerPerson,
                total: entry.pricePerPerson * (criteria.adults + (criteria.children || 0)),
              },
              flights: updatedFlights,
            };
          }

          // Date is outside the calendar range — keep original price, update dates
          return { ...pkg, flights: updatedFlights };
        }

        // Live package — just rewrite the flight dates
        return { ...pkg, flights: updateFlightDates(pkg, departureDateStr, returnDateStr) };
      })
      .filter((pkg): pkg is UnifiedPackage => pkg !== null);
  }

  // ── Flexible date mode ────────────────────────────────────────────────────
  // User picked one or more whole months. Each card gets a different available
  // departure date spread across those months, so the list feels varied.
  // Packages with no available dates in the selected months are filtered out.
  if (criteria.dateMode === 'flexible' && criteria.selectedMonths.length > 0) {
    return packages
      .map((pkg, index): UnifiedPackage | null => {
        // Flexible mode is cache-only — packages without a rateCalendar cannot
        // be matched to a month, so they don't belong in the results.
        if (!pkg.rateCalendar) return null;

        // Collect every available date that falls inside any selected month.
        // selectedMonths entries look like "2026-04" — we match the date prefix.
        const datesInMonths = pkg.rateCalendar.filter(
          (e) => e.available && criteria.selectedMonths.some((m) => e.departureDate.startsWith(m)),
        );

        // No available dates in the selected months → this package doesn't match
        if (datesInMonths.length === 0) return null;

        // Spread packages evenly across the available dates so each card shows
        // a different day. Math.floor(index * total / pkgCount) divides the
        // date range into equal bands and picks one date per band.
        const spreadIdx = Math.floor((index * datesInMonths.length) / Math.max(packages.length, 1)) % datesInMonths.length;
        const entry = datesInMonths[spreadIdx];

        const returnDateStr = format(addDays(new Date(entry.departureDate), nights), 'yyyy-MM-dd');

        return {
          ...pkg,
          price: {
            ...pkg.price,
            perPerson: entry.pricePerPerson,
            total: entry.pricePerPerson * (criteria.adults + (criteria.children || 0)),
          },
          flights: updateFlightDates(pkg, entry.departureDate, returnDateStr),
        };
      })
      .filter((pkg): pkg is UnifiedPackage => pkg !== null);
  }

  // No date selected yet — return packages unchanged
  return packages;
}

// The shape of state this hook returns
export interface UnifiedSearchState {
  packages: UnifiedPackage[];
  // True while live suppliers are still responding (drives the progress banner)
  isLiveLoading: boolean;
  // Progress counter: how many of the total suppliers have responded
  liveProgress: { completed: number; total: number } | null;
  error: string | null;
  // Non-cached destination loading state:
  // isNonCachedLoading is true for the full 5s while we're fetching live results.
  // pricesReady flips to true at the end once prices are confirmed.
  isNonCachedLoading: boolean;
  pricesReady: boolean;
}

export function useUnifiedSearch(criteria: HolidaySearchCriteria): UnifiedSearchState {
  const [state, setState] = useState<UnifiedSearchState>({
    packages: [],
    isLiveLoading: false,
    liveProgress: null,
    error: null,
    isNonCachedLoading: false,
    pricesReady: false,
  });

  useEffect(() => {
    // Reset to empty state every time the search criteria changes.
    // This gives the user visual feedback that a new search has started.
    setState({ packages: [], isLiveLoading: false, liveProgress: null, error: null, isNonCachedLoading: false, pricesReady: false });

    // ── Filter packages to the searched destination ──────────────────────────
    // criteria.to holds the destination *label* (e.g. "Cancún, Mexico") because
    // that's what PackageSearchForm stores. We need to look up the *code* (e.g.
    // "CANCUN") to match against the destinationCode field on each package.
    const destCode = DESTINATIONS.find(d => d.label === criteria.to)?.code ?? criteria.to;

    // "Anywhere" means no specific destination — show everything across all destinations.
    const isAnywhere = criteria.to === "Anywhere" || criteria.to === "";
    const cachedForDest = isAnywhere ? CACHED_PACKAGES : CACHED_PACKAGES.filter(p => p.destinationCode === destCode);
    const liveForDest   = isAnywhere ? LIVE_PACKAGES   : LIVE_PACKAGES.filter(p => p.destinationCode === destCode);
    const nonCachedForDest = isAnywhere
      ? Object.values(NON_CACHED_PACKAGES_BY_DESTINATION).flat()
      : NON_CACHED_PACKAGES_BY_DESTINATION[destCode] ?? [];

    // ── Step 1 — Cached results (t=200ms) ───────────────────────────────────
    // For cached destinations: show cached packages immediately, then start
    // live loading. For non-cached: show live-only results and stop there.
    const t1 = setTimeout(() => {
      if (criteria.isCachedDestination) {
        // Cached destination path: show cache first, then live suppliers kick in
        setState(prev => ({
          ...prev,
          packages: applyDateToPackages(cachedForDest, criteria),
          isLiveLoading: true,
          liveProgress: { completed: 0, total: 3 },
        }));
      } else {
        // Non-cached destination path:
        // Phase 1 — mark loading as started. Packages are still empty here,
        // so HolidayListPage will show skeleton cards + progress bar.
        setState(prev => ({
          ...prev,
          packages: [],
          isNonCachedLoading: true,
          pricesReady: false,
        }));
      }
    }, 200);

    // For non-cached destinations, we run a 3-phase sequence instead of stopping here.
    if (!criteria.isCachedDestination) {
      // Phase 2 — at t=2.5s: package details arrive (image, name, room, etc.)
      // but prices are still being confirmed by suppliers.
      const tNc2 = setTimeout(() => {
        setState(prev => ({
          ...prev,
          packages: applyDateToPackages(nonCachedForDest, criteria),
          isNonCachedLoading: true,
          pricesReady: false,
        }));
      }, 2500);

      // Phase 3 — at t=5s: prices are confirmed. Loading complete.
      const tNc3 = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isNonCachedLoading: false,
          pricesReady: true,
        }));
      }, 5000);

      return () => {
        clearTimeout(t1);
        clearTimeout(tNc2);
        clearTimeout(tNc3);
      };
    }

    // ── Step 2 — Supplier 1 checks in (t=2s) ────────────────────────────────
    // No results yet, just a progress tick. Shows the user things are happening.
    const t2 = setTimeout(() => {
      setState(prev => ({
        ...prev,
        liveProgress: { completed: 1, total: 3 },
      }));
    }, 2000);

    // ── Step 3 — Supplier 2 returns first batch (t=3.5s) ───────────────────
    // First half of live packages for this destination arrive.
    // mergeDeduplicated handles replacements (same dedup key = update in place).
    const t3 = setTimeout(() => {
      const firstBatch = liveForDest.slice(0, Math.ceil(liveForDest.length / 2));
      setState(prev => ({
        ...prev,
        packages: applyDateToPackages(mergeDeduplicated(prev.packages, firstBatch), criteria),
        liveProgress: { completed: 2, total: 3 },
      }));
    }, 3500);

    // ── Step 4 — Supplier 3 returns remaining results (t=5s) ────────────────
    // Remaining live packages arrive. Loading is now complete.
    const t4 = setTimeout(() => {
      const secondBatch = liveForDest.slice(Math.ceil(liveForDest.length / 2));
      setState(prev => ({
        ...prev,
        packages: applyDateToPackages(mergeDeduplicated(prev.packages, secondBatch), criteria),
        isLiveLoading: false,
        liveProgress: null,
      }));
    }, 5000);

    // Cleanup: cancel all pending timers if the search criteria changes
    // before the sequence completes (e.g. user edits the search form).
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Re-run the sequence when any search criterion changes.
    // We stringify arrays because useEffect does a shallow comparison by default.
    criteria.from,
    criteria.to,
    criteria.isCachedDestination,
    criteria.dateMode,
    JSON.stringify(criteria.selectedMonths),
    JSON.stringify(criteria.dateRange),
    criteria.nights,
    criteria.adults,
    criteria.children,
  ]);

  return state;
}
