// AiCanvasStageSwitcher — a demo/preview control for jumping between the
// canvas stages (Countries · Cities · Templates · Itinerary).
//
// This is a *prototype affordance*, not a production UI element — it lets the
// designer preview each generative state directly without having to click
// through the whole conversation. It's labelled "Preview" to make that clear.

import { Layers } from "lucide-react";

import { cn } from "../../../../shared/components/ui/utils";
import { STAGE_LABEL, type CanvasStage } from "./useAiPlanState";

const STAGES: CanvasStage[] = ["countries", "cities", "templates", "itinerary"];

interface AiCanvasStageSwitcherProps {
  stage: CanvasStage;
  onChange: (stage: CanvasStage) => void;
}

export default function AiCanvasStageSwitcher({
  stage,
  onChange,
}: AiCanvasStageSwitcherProps) {
  return (
    <div className="shrink-0 flex items-center gap-2.5 px-4 md:px-6 py-2 border-b border-border bg-card/70 backdrop-blur-sm overflow-x-auto">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-grey shrink-0">
        <Layers className="size-3.5" aria-hidden="true" />
        Preview
      </span>
      <div
        role="tablist"
        aria-label="Canvas stage preview"
        className="flex items-center gap-1 p-0.5 rounded-full border border-border bg-grey-lightest"
      >
        {STAGES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={stage === s}
            onClick={() => onChange(s)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap",
              stage === s
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-grey hover:text-foreground",
            )}
          >
            {STAGE_LABEL[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
