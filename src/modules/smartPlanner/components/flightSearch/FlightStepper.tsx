// FlightStepper — text-pill breadcrumb showing the trip's legs + a
// terminal "Summary" step.
//
// Example for a round trip on leg 1:
//   [ZRH → New York]  >  [New York → ZRH]  >  [Summary]
//   ^current/filled    ^future/outlined    ^future/outlined
//
// We always append a synthetic "Summary" pill that the user reaches AFTER
// picking flights for every leg. While the user is on FlightListPage, the
// Summary pill is always in the "future" state.

import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../../shared/components/ui/utils";
import type { FlightLeg } from "../../../../App";

type FlightStepperProps = {
  legs: FlightLeg[];
  currentLegIndex: number;
};

type StepStatus = "done" | "current" | "future";

function StepperPill({
  label,
  status,
}: {
  label: string;
  status: StepStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap max-w-[260px] truncate transition-colors",
        status === "done" &&
          "bg-success/10 border-success/30 text-success",
        status === "current" &&
          "bg-primary border-primary text-primary-foreground",
        status === "future" &&
          "bg-card border-border text-muted-foreground",
      )}
      title={label} // tooltip on hover so the user can read long city names that get truncated
    >
      {label}
    </span>
  );
}

export function FlightStepper({ legs, currentLegIndex }: FlightStepperProps) {
  // Build a flat array of steps: one per real leg, plus the synthetic Summary.
  // We give each item its own status so the rendering loop stays simple.
  const steps: Array<{ key: string; label: string; status: StepStatus }> = legs.map((leg, i) => ({
    key: `leg-${leg.id}`,
    label: `${leg.from || "?"} → ${leg.to || "?"}`,
    status:
      i < currentLegIndex
        ? "done"
        : i === currentLegIndex
        ? "current"
        : "future",
  }));
  steps.push({
    key: "summary",
    label: "Summary",
    status: "future", // user hasn't reached it yet from this page
  });

  return (
    // overflow-x-auto so on narrow screens the user can scroll instead of the
    // pills wrapping awkwardly — matches Paula's preference for clean rows.
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 -mx-1 px-1">
      {steps.map((step, i) => (
        <Fragment key={step.key}>
          {i > 0 && (
            <ChevronRight
              size={16}
              className="text-grey shrink-0"
              aria-hidden="true"
            />
          )}
          <StepperPill label={step.label} status={step.status} />
        </Fragment>
      ))}
    </div>
  );
}
