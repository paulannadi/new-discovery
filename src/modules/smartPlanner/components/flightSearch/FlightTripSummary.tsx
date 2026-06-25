// FlightTripSummary — the read-only "trip at a glance" row that sits in the
// page header and toggles with <FlightSearchForm>.
//
// A clean single line of facts separated by thin vertical dividers, with an
// outlined "Edit search" button on the right:
//
//   Multi-city  │  3 flights  │  10 Feb – 24 Feb 2026        [ ✎ Edit search ]
//
//   - Group 1 (trip type): bold — it's the biggest shape-of-search decision.
//   - Group 2 (legs):      "N flights" — how many legs the search covers.
//   - Group 3 (dates):     first-leg → last-leg date range.
//
// The city pair (origin / destination) is intentionally NOT shown here — the
// FlightStepper underneath already lists each leg with its route.

import { format } from "date-fns";
import { SearchSummary } from "../SearchSummary";
import type { FlightSearchCriteria } from "../../../../App";

type FlightTripSummaryProps = {
  criteria: FlightSearchCriteria;
  // Optional: when omitted, the row is purely read-only (no "Edit search"
  // button). The flight results page passes this to toggle the search form;
  // the later stopover-flow steps leave it out so the criteria just shows as
  // an at-a-glance recap.
  onEditSearch?: () => void;
};

export function FlightTripSummary({ criteria, onEditSearch }: FlightTripSummaryProps) {
  const isRoundTrip = criteria.tripType === "roundtrip";

  // A stopover is "active" either when the round-trip opted into one
  // (`stopover.enabled`) or when the search came from the dedicated Stopover
  // tab (`stopoverOnly`). Both imply a round trip, so when either is set we
  // show the fuller "Round trip with stopover" headline. This is what makes
  // the flight results page say it once a stopover is chosen — and, because
  // every step of the stopover flow carries one of these flags, those steps
  // always show it too.
  const hasStopover = Boolean(criteria.stopover?.enabled || criteria.stopoverOnly);
  const tripTypeLabel = hasStopover
    ? "Round trip with stopover"
    : isRoundTrip
      ? "Round trip"
      : "Multi-city";

  // ── Legs count ───────────────────────────────────────────────────────
  const legCount = criteria.legs.length;
  const legsLabel = `${legCount} flight${legCount !== 1 ? "s" : ""}`;

  // ── Dates: first-leg outbound → last-leg outbound ─────────────────────
  const firstDate = criteria.legs[0]?.date;
  const lastDate = criteria.legs[criteria.legs.length - 1]?.date;
  let dateLabel = "";
  if (firstDate && lastDate) {
    dateLabel =
      firstDate.getTime() === lastDate.getTime()
        ? format(firstDate, "d MMM yyyy")
        : `${format(firstDate, "d MMM")} – ${format(lastDate, "d MMM yyyy")}`;
  }

  // Trip type is the headline (bold) fact; legs and the date range follow. The
  // empty dateLabel is filtered out by SearchSummary, so an undated search just
  // shows "Round trip · 2 flights" with no trailing divider.
  return (
    <SearchSummary
      items={[tripTypeLabel, legsLabel, dateLabel]}
      onEdit={onEditSearch}
    />
  );
}
