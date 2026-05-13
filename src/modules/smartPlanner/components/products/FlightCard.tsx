// ─────────────────────────────────────────────────────────────────────────────
// FlightCard
//
// One flight leg, styled to match the live TripBuilder's FlightManagementCard.
// Layout: airline pill | departure time → connector → arrival time | actions.
//
// Mobile: stacks vertically and the "Change Flight" button drops below.
// Desktop: side-by-side with a vertical divider before the action column.
// ─────────────────────────────────────────────────────────────────────────────

import { Briefcase, Plane } from "lucide-react";
import { Button } from "../../../../shared/components/ui/button";
import type { FlightItem } from "../../utils/seedTimeline";
import { formatItemDate } from "../../utils/seedTimeline";

// Hard-coded departure / arrival times for the prototype.
// In the real app these come from the flight search supply.
const MOCK_DEP_TIME = "08:35";
const MOCK_ARR_TIME = "14:10";

export function FlightCard({ item }: { item: FlightItem }) {
  const { flight, direction, legLabel, date } = item;

  // Header label above the card — different for outbound / inbound / leg.
  // For multi-city legs we use the supplied "Flight 1 · 15 Jul" string.
  const headerLabel =
    legLabel ??
    (direction === "outbound"
      ? `Outbound · ${formatItemDate(date)}`
      : direction === "inbound"
        ? `Return · ${formatItemDate(date)}`
        : formatItemDate(date));

  return (
    <div>
      {/* Date label sits OUTSIDE the card — matches live SmartPlanner pattern */}
      <p className="font-semibold mb-3 md:mb-4 text-foreground">{headerLabel}</p>

      <div className="border border-border shadow-sm rounded-lg md:rounded-3xl">
        <div className="bg-card p-4 md:p-6 rounded-lg md:flex md:gap-6 md:rounded-3xl">
          {/* MAIN COLUMN — airline → flight bar → baggage */}
          <div className="space-y-5 md:grow">
            {/* Flight row: airline pill | departure | bar | arrival */}
            <div className="flex items-center justify-between gap-4 md:gap-6">
              {/* Airline pill — grey background, bold text. Hidden on small screens. */}
              <div className="hidden sm:flex w-28 lg:w-36 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-grey-light text-xs font-bold text-foreground">
                  <Plane size={12} aria-hidden="true" />
                  {flight.airline}
                </span>
              </div>

              {/* Departure time + city */}
              <div className="flex flex-col items-center text-center shrink-0">
                <span className="font-bold text-foreground">{MOCK_DEP_TIME}</span>
                <span className="hidden sm:block text-xs text-muted-foreground max-w-28 leading-tight mt-0.5">
                  {flight.from}
                </span>
                <span className="sm:hidden text-xs text-muted-foreground">
                  {flight.from.split(" ")[0]}
                </span>
              </div>

              {/* Connector bar — stops above, line in the middle, duration below */}
              <div className="flex-grow flex flex-col gap-1 text-center text-xs">
                <p className="font-semibold text-foreground">
                  {flight.stops === "Direct" || !flight.stops ? "Non-stop" : flight.stops}
                </p>
                <div className="w-full h-0.5 bg-border" />
                <p className="text-muted-foreground">{flight.duration} · Economy</p>
              </div>

              {/* Arrival time + city */}
              <div className="flex flex-col items-center text-center shrink-0">
                <span className="font-bold text-foreground">{MOCK_ARR_TIME}</span>
                <span className="hidden sm:block text-xs text-muted-foreground max-w-28 leading-tight mt-0.5">
                  {flight.to}
                </span>
                <span className="sm:hidden text-xs text-muted-foreground">
                  {flight.to.split(" ")[0]}
                </span>
              </div>
            </div>

            <hr className="border-border" />

            {/* Baggage info + "More details" link */}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Briefcase size={12} aria-hidden="true" />
                <span>1 checked bag included</span>
              </div>
              <Button variant="link" size="sm" className="px-0 h-auto text-xs">
                More details
              </Button>
            </div>
          </div>

          {/* ACTION COLUMN — vertical divider on desktop, top border on mobile */}
          <div className="mt-6 md:mt-0 max-md:pt-6 md:w-[160px] lg:w-[220px] md:min-w-[160px] max-md:border-t border-border md:border-l flex flex-row-reverse md:flex-col justify-between md:items-end">
            <Button variant="outline" className="max-sm:w-full">
              Change Flight
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
