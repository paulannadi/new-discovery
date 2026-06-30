// ─────────────────────────────────────────────────────────────────────────────
// TransferCard
//
// A ground-transport entry (coach, train, scenic transfer). Styled to mirror
// the live TripBuilder bus-card pattern: operator brand on the left, schedule
// row in the middle (departure → non-stop bar → arrival), amenities + "More
// details" below, and a vertical-divided action column on the right.
//
// The sentence-style title ("Bus from Freiburg to Hotel Bella Lazise") and
// the dashed timeline rail are owned by ItineraryTimeline — this component
// renders only the date subtitle + the white card body + the kebab menu.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Bike, ChevronDown, MoreHorizontal, Plug, Wifi } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../../shared/components/ui/button";
import type { TransferItem } from "../../utils/seedTimeline";
import { SeatChartDrawer } from "./SeatChartDrawer";
import { ZipCodeDrawer } from "./ZipCodeDrawer";

// Mock schedule data — TransferItem doesn't carry real timetable info yet.
// These match a typical M-TOURS daytime coach run; if we add real data later
// the card can read it off `item` and fall back to these.
const MOCK_DEP_TIME = "10:00";
const MOCK_ARR_TIME = "16:00";
const MOCK_DURATION = "6h";

// Seed seats used to pre-populate the prototype. Front-row pairs so the
// green preselection lands inside the visible top of the chart when the
// drawer first opens — no scrolling needed to verify the picks.
const SEED_SEATS = ["1A", "1B", "2A", "2B", "3A", "3B"];

interface TransferCardProps {
  item: TransferItem;
  // How many travellers are on this trip — drives how many seats the
  // seat-chart drawer asks the user to pick. Defaults to 1 so the card
  // still renders sensibly without timeline context.
  passengerCount?: number;
}

export function TransferCard({ item, passengerCount = 1 }: TransferCardProps) {
  // Local open/close state for the seat-chart drawer. Kept inside the card
  // (rather than lifted to the timeline) because each transfer has its own
  // independent seat selection.
  const [seatDrawerOpen, setSeatDrawerOpen] = useState(false);
  // The seats currently assigned to this booking — one per passenger.
  // Updated when the user confirms a new selection in the drawer. In a real
  // flow this would come from the booking API.
  const [currentSeats, setCurrentSeats] = useState<string[]>(() =>
    SEED_SEATS.slice(0, passengerCount),
  );

  // Door-to-door transfers (the "Individual" travel option) have no coach
  // seat — the traveller is collected from their own area. For those legs we
  // show an "Update ZIP code" action + ZIP-code drawer instead of the
  // seat-selection UI, and drop the seat-number label entirely.
  const isDoorToDoor = !!item.doorToDoor;
  const [zipDrawerOpen, setZipDrawerOpen] = useState(false);
  const [pickupZip, setPickupZip] = useState(item.pickupZip ?? "");

  return (
    <div>
      {/* Date subtitle + kebab menu — sits above the white card, aligned with
          the section title rendered upstream in ItineraryTimeline.
          Left: date · Right: "more actions" icon button. */}
      <div className="flex items-center justify-between mb-3 md:mb-4 gap-3">
        <p className="font-semibold text-foreground">
          {format(item.date, "EEE, dd MMM yyyy")}
        </p>
        <Button
          variant="outline"
          size="icon"
          aria-label="More actions"
          className="text-primary"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </div>

      {/* White card */}
      <div className="border border-border shadow-sm rounded-xl">
        <div className="bg-card p-4 md:p-6 rounded-xl md:flex md:gap-6">
          {/* MAIN COLUMN — operator, schedule, amenities */}
          <div className="space-y-5 md:grow">
            {/* Schedule row: operator | dep | non-stop bar | arr */}
            <div className="flex items-center justify-between gap-4 md:gap-6">
              {/* Operator "logo" — stylised text in lieu of a real asset.
                  Hidden on small screens to give the schedule room to breathe. */}
              <div className="hidden sm:flex flex-col w-28 lg:w-36 shrink-0 leading-tight">
                <span className="text-base font-bold text-primary">
                  {item.operator?.name ?? "M-TOURS"}
                </span>
                <span
                  className={
                    "text-[10px] text-muted-foreground " +
                    // The default brand uses wide letter-spacing on its all-caps
                    // descriptor; a custom operator tagline keeps normal spacing
                    // so longer text stays readable.
                    (item.operator ? "" : "tracking-[0.2em]")
                  }
                >
                  {item.operator?.tagline ?? "ERLEBNISREISEN"}
                </span>
              </div>

              {/* Departure time + city */}
              <div className="flex flex-col items-center text-center shrink-0">
                <span className="font-bold text-foreground">{MOCK_DEP_TIME}</span>
                <span className="text-xs text-muted-foreground mt-0.5 max-w-28 leading-tight">
                  {item.from}
                </span>
              </div>

              {/* Connector — "Non-stop" above, line in the middle, duration below */}
              <div className="flex-grow flex flex-col gap-1 text-center text-xs">
                <p className="font-semibold text-foreground">Non-stop</p>
                <div className="w-full h-0.5 bg-border" />
                <p className="text-muted-foreground">{MOCK_DURATION}</p>
              </div>

              {/* Arrival time + city */}
              <div className="flex flex-col items-center text-center shrink-0">
                <span className="font-bold text-foreground">{MOCK_ARR_TIME}</span>
                <span className="text-xs text-muted-foreground mt-0.5 max-w-28 leading-tight">
                  {item.to}
                </span>
              </div>
            </div>

            <hr className="border-border" />

            {/* Amenities (left) + "More details" link (right) */}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <Wifi className="size-4" aria-hidden="true" />
                <Plug className="size-4" aria-hidden="true" />
                <Bike className="size-4" aria-hidden="true" />
              </div>
              <Button variant="link" size="sm" className="px-0 h-auto text-xs">
                More details
                <ChevronDown className="size-3" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* ACTION COLUMN — vertical divider on desktop, top border on mobile.
              Mirrors the layout used by FlightCard and AccommodationCard.
              Mobile: row-reverse → button on the right, seat label on the left.
              Desktop: stacked + right-aligned → seat label above the button. */}
          <div className="mt-6 md:mt-0 max-md:pt-6 md:w-[160px] lg:w-[220px] md:min-w-[160px] max-md:border-t border-border md:border-l flex flex-row-reverse md:flex-col justify-between items-center md:items-end gap-3">
            {isDoorToDoor ? (
              /* Door-to-door (Individual option): edit the pickup ZIP code.
                 No seat-number label below — there's no coach seat. */
              <Button
                variant="outline"
                className="max-sm:w-full"
                onClick={() => setZipDrawerOpen(true)}
              >
                Update ZIP code
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="max-sm:w-full"
                  onClick={() => setSeatDrawerOpen(true)}
                >
                  Change seat
                </Button>
                {/* Current seat(s) — small label so it doesn't compete with the
                    CTA but is still visible next to the "Change seat" action.
                    "Seat 12A" for a solo trip, "Seats 12A, 12B" for couples. */}
                <p className="text-xs text-muted-foreground">
                  {currentSeats.length === 1 ? "Seat" : "Seats"}{" "}
                  <span className="font-bold text-foreground">
                    {currentSeats.join(", ")}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action drawer — door-to-door legs edit the pickup ZIP code; all other
          legs open the coach seat chart. Both slide in from the right. */}
      {isDoorToDoor ? (
        <ZipCodeDrawer
          open={zipDrawerOpen}
          onOpenChange={setZipDrawerOpen}
          from={item.from}
          to={item.to}
          date={item.date}
          currentZip={pickupZip}
          onConfirm={setPickupZip}
        />
      ) : (
        <SeatChartDrawer
          open={seatDrawerOpen}
          onOpenChange={setSeatDrawerOpen}
          from={item.from}
          to={item.to}
          date={item.date}
          passengerCount={passengerCount}
          currentSeatIds={currentSeats}
          onConfirm={setCurrentSeats}
        />
      )}
    </div>
  );
}
