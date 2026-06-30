// FlightStepper — compact, single-line progress stepper for the flight flow.
//
// Each step is a small PILL with a numbered circle (or a plain green check once
// done) and ONE short uppercase label next to it — no second line. Pills are
// separated by a chevron.
//
// Example for a round trip with a stopover, sitting on leg 0:
//
//   (1) LAX – SYD  ›  (2) SYD – LAX  ›  (3) HOTEL IN NADI  ›  (4) ROOM SELECTION
//        ^current             ^future            ^future              ^future
//
// The stopover step is only shown for round trips that opted into a stopover
// AND where the chosen leg's route has a geographically sensible hub (so it
// stays in sync with the stopover offers in the results list). It always comes
// LAST — flights first, then the hotel: fly out → fly back → stopover stay.

import { Fragment } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "../../../../shared/components/ui/utils";
import { routeHasStopover } from "./mockFlights";
import type { FlightLeg } from "../../../../App";

type FlightStepperProps = {
  legs: FlightLeg[];
  currentLegIndex: number;
  /** Round trip → "Outbound/Inbound flight" labels; multi-city → "Flight N". */
  tripType?: "roundtrip" | "multicity";
  /** When enabled (round trip only) a "Stopover hotel" step is inserted. */
  stopover?: { enabled: boolean; leg: "outbound" | "return"; nights: number };
  /** Stopover hub city — appended to the hotel step's label ("Hotel in {city}"). */
  stopoverCity?: string;
  /**
   * Chosen stopover hotel name. Accepted for compatibility but no longer shown
   * in the compact stepper — the room step just reads "Room selection".
   */
  stopoverHotelName?: string;
  /**
   * Status for the stopover-hotel card. Defaults to "future" (we're still on a
   * flight step). On the stopover-hotel page itself, pass "current" so that
   * card lights up blue — and pass currentLegIndex = legs.length there so the
   * flight cards all read as "done".
   */
  stopoverStatus?: StepStatus;
  /**
   * Status for the "Your room" card — the step AFTER the stopover hotel, where
   * the traveller picks a room in the hotel they just chose. Defaults to
   * "future". On the stopover-hotel page it stays "future"; on the room page
   * pass "current" (and pass stopoverStatus="done" so the hotel reads as done).
   * The room card only appears when the stopover hotel card does.
   */
  roomStatus?: StepStatus;
  /**
   * Called when the user clicks a *completed* (done) flight step to jump back
   * to it. Receives that step's leg index. Steps that aren't done (the current
   * one and any not yet reached) are not clickable.
   */
  onStepSelect?: (legIndex: number) => void;
  /**
   * Called when the user clicks the *completed* (done) "Stopover hotel" step to
   * jump back to it. Has no leg index of its own (it's the hotel step, not a
   * flight), so it gets its own callback. Only clickable once it reads as done
   * — i.e. on the room step, after a hotel has been picked.
   */
  onStopoverStepSelect?: () => void;
  /**
   * Called when the user clicks the *completed* (done) "Room selection" step to
   * jump back to it — e.g. from the booking-summary page, where every step reads
   * as done. Like the hotel step, it has no leg index so it gets its own
   * callback, and is only clickable once roomStatus === "done".
   */
  onRoomStepSelect?: () => void;
};

type StepStatus = "done" | "current" | "future";

type Step = {
  key: string;
  // Single short uppercase-rendered label, e.g. "LAX – SYD" or "HOTEL IN NADI".
  label: string;
  status: StepStatus;
  // Which flight leg this card maps to (undefined for the stopover-hotel card).
  // Used to navigate back when a done step is clicked.
  legIndex?: number;
};

// ── A single step pill ───────────────────────────────────────────────────────
// One compact line: a numbered circle (or a check once done) + one short label.
// `onClick` is only passed for clickable (done) steps; when present the pill
// becomes a button with a hover affordance.
function StepCard({ step, index, onClick }: { step: Step; index: number; onClick?: () => void }) {
  const { label, status } = step;
  const clickable = !!onClick;

  return (
    <div
      // aria-current tells screen readers which step is active.
      aria-current={status === "current" ? "step" : undefined}
      // Clickable done-steps get button semantics + keyboard support.
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        // Small inline pill: circle + label on a single line, light padding.
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors",
        // current: white pill with a blue outline (the focus of the flow)
        status === "current" && "border-primary bg-card",
        // done: white pill, calm border — it's been completed
        status === "done" && "border-border bg-card",
        // future: muted grey pill with a grey border — not reached yet
        status === "future" && "border-grey-light bg-grey-lightest",
        // Affordance for clicking back to a completed step.
        clickable && "cursor-pointer hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      {/* Done steps show a plain green check (no circle); current/future show a
          numbered circle. */}
      {status === "done" ? (
        <Check size={16} className="text-success shrink-0" aria-hidden="true" />
      ) : (
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
            status === "current" && "bg-primary",
            status === "future" && "bg-grey",
          )}
        >
          {index + 1}
        </span>
      )}

      {/* The single label line — route codes / step detail */}
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-wide whitespace-nowrap",
          status === "current" && "text-foreground",
          status === "done" && "text-foreground",
          status === "future" && "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function FlightStepper({
  legs,
  currentLegIndex,
  tripType = "roundtrip",
  stopover,
  stopoverCity,
  stopoverStatus = "future",
  roomStatus = "future",
  onStepSelect,
  onStopoverStepSelect,
  onRoomStepSelect,
}: FlightStepperProps) {
  const isRoundtrip = tripType === "roundtrip";

  // 1. One pill per real flight leg. The label is just the airport codes, e.g.
  //    "LAX – SYD" — short enough to live on one line. `legIndex` lets a done
  //    step navigate back.
  const steps: Step[] = legs.map((leg, i) => ({
    key: `leg-${leg.id}`,
    label: `${leg.from || "?"} – ${leg.to || "?"}`,
    status:
      i < currentLegIndex ? "done" : i === currentLegIndex ? "current" : "future",
    legIndex: i,
  }));

  // 2. Append the stopover-hotel step AFTER all flights, so the row always
  //    lists the flights first and the hotel last: outbound flight → return
  //    flight → stopover hotel. (push, not splice, so it lands at the end
  //    regardless of which leg the offer was attached to.)
  //
  //    Only show it when the opted-in leg actually HAS a sensible stopover hub
  //    — the offer is dynamic/opt-in, so on a route with no good hub there are
  //    no offers to pick and the hotel step would dangle. We always show it on
  //    the stopover-hotel page itself (stopoverStatus === "current"), since
  //    being there means an offer was already chosen.
  const stopLeg = stopover?.leg === "return" ? legs[1] : legs[0];
  const hasStopoverOffers =
    stopoverStatus === "current" ||
    roomStatus === "current" ||
    (!!stopLeg && routeHasStopover(stopLeg.from, stopLeg.to));
  if (isRoundtrip && stopover?.enabled && hasStopoverOffers) {
    steps.push({
      key: "stopover",
      // "Hotel in Nadi" — the city is appended when known (always, in practice,
      // since the stopover hub is fixed by the flight).
      label: `Hotel${stopoverCity ? ` in ${stopoverCity}` : ""}`,
      // "future" while choosing flights; "current" on the stopover-hotel page;
      // "done" once a hotel is picked and we're on the room step.
      status: stopoverStatus,
    });
    // 3. The room step always follows the hotel: pick the hotel, then pick a
    //    room inside it. "future" until the hotel is chosen, "current" on the
    //    room-selection page itself.
    steps.push({
      key: "stopover-room",
      label: "Room selection",
      status: roomStatus,
    });
  }

  return (
    // flex-wrap so on narrow screens the cards drop onto the next line instead
    // of squashing or scrolling sideways.
    <div className="flex flex-wrap items-stretch gap-3">
      {steps.map((step, i) => {
        // Work out the "jump back" handler for this step. Only completed (done)
        // steps are clickable. Flight legs go back via onStepSelect(legIndex);
        // the stopover-hotel step has no leg of its own, so it uses its own
        // onStopoverStepSelect callback.
        let onClick: (() => void) | undefined;
        if (step.status === "done") {
          if (step.legIndex !== undefined && onStepSelect) {
            onClick = () => onStepSelect(step.legIndex!);
          } else if (step.key === "stopover" && onStopoverStepSelect) {
            onClick = onStopoverStepSelect;
          } else if (step.key === "stopover-room" && onRoomStepSelect) {
            onClick = onRoomStepSelect;
          }
        }
        return (
          <Fragment key={step.key}>
            {i > 0 && (
              <ChevronRight
                size={20}
                className="text-muted-foreground shrink-0 self-center"
                aria-hidden="true"
              />
            )}
            <StepCard step={step} index={i} onClick={onClick} />
          </Fragment>
        );
      })}
    </div>
  );
}
