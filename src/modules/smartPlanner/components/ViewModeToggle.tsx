// ─────────────────────────────────────────────────────────────────────────────
// ViewModeToggle
//
// Fixed top-right pill button group: Timeline | Map.
// Mirrors the live TripBuilder ViewModeToggle.
//
// In this prototype the Map button is **disabled** (visually muted, no click)
// since we're not building the map view per the plan. Hover shows a tooltip.
//
// The pointer-events trick on the wrapper means the rest of the page stays
// clickable behind the toggle — only the pill itself receives pointer events.
// ─────────────────────────────────────────────────────────────────────────────

import { List, Map as MapIcon } from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../shared/components/ui/utils";

interface ViewModeToggleProps {
  isMapView: boolean;
  onSelectTimeline: () => void;
  onSelectMap?: () => void;             // Not wired in this prototype
}

export function ViewModeToggle({
  isMapView,
  onSelectTimeline,
  onSelectMap,
}: ViewModeToggleProps) {
  return (
    // Outer wrapper is fixed across the viewport so the pill sits on the
    // right edge regardless of scroll. `pointer-events-none` lets clicks
    // pass through everywhere except the pill itself (which restores them).
    <div className="fixed top-4 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-5xl mx-auto flex justify-end lg:px-0 pr-4">
        <fieldset
          className="pointer-events-auto flex gap-0.5 items-center border rounded-full overflow-hidden bg-white shadow-lg p-1"
          aria-label="View mode"
        >
          {/* Timeline button — selected by default */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full h-8 px-2 border border-transparent",
              !isMapView && "bg-grey-light text-foreground border-grey",
            )}
            onClick={() => isMapView && onSelectTimeline()}
            aria-pressed={!isMapView}
            aria-label="Timeline view"
            title="Timeline view"
          >
            <List className="size-4" aria-hidden="true" />
            <span className={cn("hidden", !isMapView && "md:inline")}>Timeline</span>
          </Button>

          {/* Map button — disabled in the prototype.
              We render it greyed-out + tooltipped so designers can see the
              shape without it being clickable. */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled
            className="rounded-full h-8 px-2 border border-transparent opacity-50 cursor-not-allowed"
            onClick={onSelectMap}
            aria-pressed={isMapView}
            aria-label="Map view (coming soon)"
            title="Map view — coming soon"
          >
            <MapIcon className="size-4" aria-hidden="true" />
          </Button>
        </fieldset>
      </div>
    </div>
  );
}
