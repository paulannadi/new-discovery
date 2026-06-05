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
import { Pencil } from "lucide-react";
import { Button } from "../../../../shared/components/ui/button";
import type { FlightSearchCriteria } from "../../../../App";

// A small, explicit light-grey divider. We render a plain <span> rather than the
// shared <Separator> here because that component forces `h-full` on vertical
// dividers (via a higher-specificity data-variant class), and inside this
// center-aligned flex row `h-full` collapses to 0 height — so the divider would
// be invisible. A fixed `h-5` + `w-px` + the `grey-light` token avoids all that.
function Divider() {
  return <span aria-hidden="true" className="h-5 w-px shrink-0 bg-grey-light" />;
}

type FlightTripSummaryProps = {
  criteria: FlightSearchCriteria;
  onEditSearch: () => void;
};

export function FlightTripSummary({ criteria, onEditSearch }: FlightTripSummaryProps) {
  const isRoundTrip = criteria.tripType === "roundtrip";
  const tripTypeLabel = isRoundTrip ? "Round trip" : "Multi-city";

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

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* Trip type — bold */}
      <span className="text-sm font-extrabold text-foreground">{tripTypeLabel}</span>

      <Divider />

      {/* Number of flights */}
      <span className="text-sm text-foreground">{legsLabel}</span>

      {dateLabel && (
        <>
          <Divider />
          {/* Date range */}
          <span className="text-sm text-foreground">{dateLabel}</span>
        </>
      )}

      {/* Edit search — canonical design-system "secondary" button (primary
          border + text on white, fills on hover). `size-3.5` keeps the Pencil
          from defaulting to 20px inside the button. */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onEditSearch}
        className="ml-auto"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
        Edit search
      </Button>
    </div>
  );
}
