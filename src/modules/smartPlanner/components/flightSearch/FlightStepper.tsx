// FlightStepper — card-based progress stepper for the flight selection flow.
//
// Each step is a CARD with a numbered circle, an uppercase category label
// ("OUTBOUND FLIGHT", "INBOUND FLIGHT", "STOPOVER HOTEL", …) and a bold route
// title below it. Cards are separated by a chevron.
//
// Example for a round trip with a stopover, sitting on leg 0:
//
//   ┌──────────────────────┐   ┌────────────────────┐   ┌──────────────────┐
//   │ (1) OUTBOUND FLIGHT   │ › │ (2) INBOUND FLIGHT  │ › │ (3) STOPOVER HOTEL│
//   │ New York → Los Angeles│   │ Los Angeles → NY    │   │ 2 nights stay     │
//   └──────────────────────┘   └────────────────────┘   └──────────────────┘
//        ^current (blue)             ^future (grey)            ^future (grey)
//
// The stopover step is only shown for round trips that opted into a stopover
// AND where the chosen leg's route has a geographically sensible hub (so it
// stays in sync with the stopover offers in the results list). It always comes
// LAST — flights first, then the hotel: fly out → fly back → stopover stay.

import { Fragment } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "../../../../shared/components/ui/utils";
import { findAirportByCode } from "./airports";
import { routeHasStopover } from "./mockFlights";
import type { FlightLeg } from "../../../../App";

// Format a leg endpoint as "City (CODE)" — e.g. "London (LHR)" — falling back
// to just the code (or "?" when empty) if it's not in our airport catalogue.
function formatEndpoint(code: string): string {
  const airport = findAirportByCode(code);
  if (airport) return `${airport.city} (${airport.code})`;
  return code || "?";
}

type FlightStepperProps = {
  legs: FlightLeg[];
  currentLegIndex: number;
  /** Round trip → "Outbound/Inbound flight" labels; multi-city → "Flight N". */
  tripType?: "roundtrip" | "multicity";
  /** When enabled (round trip only) a "Stopover hotel" step is inserted. */
  stopover?: { enabled: boolean; leg: "outbound" | "return"; nights: number };
  /** Stopover hub city — appended to the hotel step's title ("… stay in {city}"). */
  stopoverCity?: string;
  /**
   * Chosen stopover hotel name — appended to the room step's title
   * ("Room selection in {name}"). Only known once a hotel has been picked, so
   * it's absent on the stopover-hotel page (the room card just reads
   * "Room selection" there).
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
};

type StepStatus = "done" | "current" | "future";

type Step = {
  key: string;
  category: string; // small uppercase label, e.g. "OUTBOUND FLIGHT"
  title: string; // bold line, e.g. "New York (JFK) to Los Angeles (LAX)"
  status: StepStatus;
  // Which flight leg this card maps to (undefined for the stopover-hotel card).
  // Used to navigate back when a done step is clicked.
  legIndex?: number;
};

// ── A single step card ───────────────────────────────────────────────────────
// `onClick` is only passed for clickable (done) steps; when present the card
// becomes a button with a hover affordance.
function StepCard({ step, index, onClick }: { step: Step; index: number; onClick?: () => void }) {
  const { category, title, status } = step;
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
        "flex flex-1 min-w-[200px] flex-col gap-3 rounded-xl border px-5 py-4 transition-colors",
        // current: white card with a blue outline + soft shadow (the focus of the flow)
        status === "current" && "border-2 border-primary bg-card shadow-sm",
        // done: white card, calm border — it's been completed
        status === "done" && "border border-border bg-card",
        // future: muted grey card with a grey border — not reached yet
        status === "future" && "border border-grey-light bg-grey-lightest",
        // Affordance for clicking back to a completed step.
        clickable && "cursor-pointer hover:border-primary hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      {/* Top row: numbered circle + category label */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            status === "current" && "bg-primary text-white",
            status === "done" && "bg-success text-white",
            status === "future" && "bg-grey text-white",
          )}
        >
          {/* Done steps show a check instead of the number. */}
          {status === "done" ? <Check size={14} aria-hidden="true" /> : index + 1}
        </span>
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wide",
            status === "future" ? "text-grey" : "text-muted-foreground",
          )}
        >
          {category}
        </span>
      </div>

      {/* Bold title line — the actual route / step detail */}
      <span
        className={cn(
          "text-sm font-extrabold leading-snug",
          status === "current" && "text-foreground",
          status === "done" && "text-foreground",
          status === "future" && "text-muted-foreground",
        )}
      >
        {title}
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
  stopoverHotelName,
  stopoverStatus = "future",
  roomStatus = "future",
  onStepSelect,
  onStopoverStepSelect,
}: FlightStepperProps) {
  const isRoundtrip = tripType === "roundtrip";

  // 1. One card per real flight leg. `legIndex` lets a done step navigate back.
  const steps: Step[] = legs.map((leg, i) => ({
    key: `leg-${leg.id}`,
    category: isRoundtrip
      ? i === 0
        ? "Outbound flight"
        : "Inbound flight"
      : `Flight ${i + 1}`,
    title: `${formatEndpoint(leg.from)} to ${formatEndpoint(leg.to)}`,
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
      category: "Stopover hotel",
      // "2 nights stay in Singapore" — the city is appended when known (always,
      // in practice, since the stopover hub is fixed by the flight).
      title: `${stopover.nights} night${stopover.nights > 1 ? "s" : ""} stay${
        stopoverCity ? ` in ${stopoverCity}` : ""
      }`,
      // "future" while choosing flights; "current" on the stopover-hotel page;
      // "done" once a hotel is picked and we're on the room step.
      status: stopoverStatus,
    });
    // 3. The room step always follows the hotel: pick the hotel, then pick a
    //    room inside it. "future" until the hotel is chosen, "current" on the
    //    room-selection page itself.
    steps.push({
      key: "stopover-room",
      category: "Your room",
      // "Room selection in Marina Bay Sands" — the hotel name is appended once
      // a hotel has been chosen; before that it just reads "Room selection".
      title: `Room selection${stopoverHotelName ? ` in ${stopoverHotelName}` : ""}`,
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
          }
        }
        return (
          <Fragment key={step.key}>
            {i > 0 && (
              <ChevronRight
                size={20}
                className="text-grey shrink-0 self-center"
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
