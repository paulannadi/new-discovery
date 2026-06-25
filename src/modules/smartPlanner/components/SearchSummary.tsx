// SearchSummary — the shared read-only "search at a glance" row that sits in a
// list-page header and toggles with the full search form.
//
// A single wrapping line of facts separated by thin light-grey dividers, with an
// outlined "Edit search" button pushed to the right:
//
//   Lisbon, Portugal  │  18 Jun – 25 Jun 2026  │  2 Guests, 1 Room   [ ✎ Edit search ]
//
//   - The FIRST item is rendered bold — it's the headline fact (destination on
//     hotels/experiences, trip type on flights).
//   - Every other item is regular weight.
//   - Falsy items (null / "" / undefined) are skipped, and dividers only appear
//     BETWEEN visible items, so an optional date that isn't set just disappears
//     cleanly with no dangling divider.
//
// This started life as the Flights-only <FlightTripSummary>. It's been lifted
// here so Flights, Hotels and Experiences all render the SAME row from one
// place — change the look once and every list page stays in sync. Each page
// builds its own `items` array, so this component stays purely presentational.

import { Fragment, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../shared/components/ui/utils";

// A small, explicit light-grey divider. We render a plain <span> rather than the
// shared <Separator> because that component forces `h-full` on vertical dividers
// (via a higher-specificity data-variant class), and inside this center-aligned
// flex row `h-full` collapses to 0 height — so the divider would be invisible.
// A fixed `h-5` + `w-px` + the `grey-light` token avoids all that.
function Divider() {
  return <span aria-hidden="true" className="h-5 w-px shrink-0 bg-grey-light" />;
}

type SearchSummaryProps = {
  /** Facts to show, left → right. The first is bold; falsy entries are skipped. */
  items: ReactNode[];
  /** Fired when the Edit button is clicked — the page swaps in its full form.
   *  Optional: when omitted, the Edit button is hidden and the row is purely
   *  read-only (used by the stopover-flow steps, which have no form to edit). */
  onEdit?: () => void;
  /** Edit button label. Defaults to "Edit search" (matches the flight header). */
  editLabel?: string;
  /** Extra classes for the outer row (e.g. responsive gating from the caller). */
  className?: string;
};

export function SearchSummary({
  items,
  onEdit,
  editLabel = "Edit search",
  className,
}: SearchSummaryProps) {
  // Drop any empty facts up front so divider placement only ever considers the
  // items that will actually render.
  const visible = items.filter(Boolean);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {visible.map((item, i) => (
        <Fragment key={i}>
          {/* Divider before every item except the first. */}
          {i > 0 && <Divider />}
          <span className={cn("text-sm text-foreground", i === 0 && "font-extrabold")}>
            {item}
          </span>
        </Fragment>
      ))}

      {/* Edit search — canonical design-system "secondary" button (primary
          border + text on white, fills on hover). `size-3.5` keeps the Pencil
          from defaulting to 20px inside the button. `ml-auto` pins it right.
          Only rendered when an `onEdit` handler is supplied; the read-only
          stopover-flow steps omit it. */}
      {onEdit && (
        <Button variant="secondary" size="sm" onClick={onEdit} className="ml-auto">
          <Pencil className="size-3.5" aria-hidden="true" />
          {editLabel}
        </Button>
      )}
    </div>
  );
}
