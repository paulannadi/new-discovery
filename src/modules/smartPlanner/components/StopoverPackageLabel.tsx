// StopoverPackageLabel — the shared "Stopover package" caption + info bubble.
//
// We use this everywhere a price is shown in the stopover flow (flight cards,
// hotel cards, room cards, the trip summary) so the wording AND the explanatory
// tooltip stay identical. The price is always one bundled figure, never a
// separate flight/hotel price — the tooltip says what's inside.

import { Info } from "lucide-react";
import { cn } from "../../../shared/components/ui/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../../shared/components/ui/tooltip";

export function StopoverPackageLabel({
  // Text shown before the info icon — e.g. "Stopover package" or, when the price
  // is a starting estimate, "Stopover package from".
  label = "Stopover package",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-foreground", className)}>
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="What does the stopover package include?"
            // Stop the click from bubbling up to the surrounding card (which would
            // otherwise trigger its select/navigate handler).
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Info size={13} aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6} className="max-w-[240px] text-center">
          The stopover package covers your flights and a hotel in the stopover city.
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
