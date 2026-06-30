// ─────────────────────────────────────────────────────────────────────────────
// SeatChartDrawer
//
// Right-side sheet that opens when the user clicks "Change seat" on a
// TransferCard. Shows an INTERACTIVE bus seat chart plus a legend of seat
// states. The traveller picks ONE seat per passenger; Confirm fires
// `onConfirm(seatIds)` once all seats are picked and closes the drawer.
//
// Selection model:
//   • The drawer opens pre-selecting the traveller's `currentSeatIds`.
//   • Clicking a selected seat deselects it (frees a slot).
//   • Clicking a free seat adds it to the selection — unless the cap is
//     already reached, in which case nothing happens.
//   • The Confirm button is disabled until exactly `passengerCount` seats
//     are selected.
//
// Responsive: the sheet covers the full screen on mobile (the chart needs
// every horizontal pixel) and is bounded to ~2xl/3xl on tablet+/desktop.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Mic, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../../shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../../shared/components/ui/sheet";
import { cn } from "../../../../shared/components/ui/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

type SeatStatus = "free" | "booked";

export interface Seat {
  id: string;
  status: SeatStatus;
}

// A bus layout is a list of 2+2 pair rows + a single back row. Real data
// from the booking API would conform to this shape; the default below is
// used when no `layout` prop is passed (prototype convenience).
export interface BusLayout {
  pairRows: { row: number; seats: [Seat, Seat, Seat, Seat] }[];
  backRow: Seat[];
}

interface SeatChartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: string;
  to: string;
  date: Date;
  // How many seats the user must pick (one per passenger on this transfer).
  // Confirm stays disabled until exactly this many seats are selected.
  passengerCount: number;
  // The seats currently assigned to this booking — pre-selected when the
  // drawer opens. Length doesn't have to match `passengerCount`; the user
  // can adjust before confirming.
  currentSeatIds?: string[];
  // Optional layout override. Falls back to the prototype's hard-coded coach
  // layout so existing callers keep working.
  layout?: BusLayout;
  // Fires with the final list of chosen seat ids (length === passengerCount)
  // once the user confirms. Drawer auto-closes after this is called.
  onConfirm?: (seatIds: string[]) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default seat data
//
// Hard-coded coach layout used when no `layout` prop is passed. 11 normal
// 2+2 rows, a 5-seat back row, and a handful of pre-booked seats so the
// chart looks realistic at a glance.
// ─────────────────────────────────────────────────────────────────────────────

// Build a 4-seat row given a row number and the letters that should be
// pre-marked as booked. Saves us from writing each seat object by hand.
function makePairRow(row: number, booked: string[] = []): [Seat, Seat, Seat, Seat] {
  return (["A", "B", "C", "D"] as const).map((letter) => ({
    id: `${row}${letter}`,
    status: booked.includes(letter) ? ("booked" as const) : ("free" as const),
  })) as [Seat, Seat, Seat, Seat];
}

export const DEFAULT_BUS_LAYOUT: BusLayout = {
  pairRows: [
    { row: 1,  seats: makePairRow(1)  },
    { row: 2,  seats: makePairRow(2,  ["A"]) },
    { row: 3,  seats: makePairRow(3)  },
    { row: 4,  seats: makePairRow(4,  ["C", "D"]) },
    { row: 5,  seats: makePairRow(5)  },
    { row: 6,  seats: makePairRow(6,  ["B"]) },
    { row: 7,  seats: makePairRow(7)  },
    { row: 8,  seats: makePairRow(8)  },
    { row: 9,  seats: makePairRow(9,  ["A", "D"]) },
    { row: 10, seats: makePairRow(10) },
    { row: 11, seats: makePairRow(11, ["C"]) },
  ],
  backRow: (["A", "B", "C", "D", "E"] as const).map((letter) => ({
    id: `12${letter}`,
    status: letter === "C" ? "booked" : "free",
  })),
};

// ─────────────────────────────────────────────────────────────────────────────
// Seat visual primitives
// ─────────────────────────────────────────────────────────────────────────────

// The visual states a seat can be in. "selected" doubles as the legend's
// "Your seat" swatch (same colour — keeps the legend and chart in sync).
type SeatVariant = "free" | "booked" | "selected" | "guide";

// Token-based Tailwind classes — no hardcoded hex values. `success`,
// `grey-light`, `card`, etc. are defined in the project's theme.
const SEAT_STYLES: Record<SeatVariant, string> = {
  free:     "bg-grey-light",
  booked:   "bg-grey-light text-muted-foreground",
  selected: "bg-success text-white",
  guide:    "bg-card border border-border text-foreground",
};

// SeatShape — purely visual; used by the legend AND wrapped by SeatButton.
// The shape itself is a simplified top-down chair silhouette (tall-rounded
// top, slightly rounded bottom).
function SeatShape({ variant, size = "md" }: { variant: SeatVariant; size?: "sm" | "md" }) {
  // The legend uses the smaller shape; the chart uses the larger one so
  // the seats stay easy to tap and read.
  const dim   = size === "sm" ? "size-7"   : "size-9";
  const icon  = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      className={cn(
        dim,
        "rounded-t-lg rounded-b-sm flex items-center justify-center shrink-0",
        SEAT_STYLES[variant],
      )}
    >
      {variant === "booked" && <X   className={icon} aria-hidden="true" />}
      {variant === "guide"  && <Mic className={icon} aria-hidden="true" />}
    </div>
  );
}

// SeatButton — interactive seat on the chart. Free / selected seats are
// clickable; booked + guide seats are disabled. Hover scales the seat up
// slightly so the user gets clear feedback that they're targeting it.
function SeatButton({
  seat,
  variant,
  onToggle,
}: {
  seat: Seat;
  variant: SeatVariant;
  onToggle: (id: string) => void;
}) {
  const isDisabled = variant === "booked" || variant === "guide";
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onToggle(seat.id)}
      aria-label={
        variant === "selected" ? `Seat ${seat.id} — selected, tap to deselect` :
        variant === "booked"   ? `Seat ${seat.id} — booked` :
                                 `Seat ${seat.id} — free, tap to select`
      }
      // aria-pressed conveys the "is this in my selection?" toggle state to
      // screen readers — same pattern as a multi-select pill group.
      aria-pressed={variant === "selected"}
      className={cn(
        "rounded-t-lg rounded-b-sm transition-transform",
        !isDisabled && "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        isDisabled && "cursor-not-allowed",
      )}
    >
      <SeatShape variant={variant} />
    </button>
  );
}

// LegendRow — small key explaining the seat colours. Wraps to 2 columns on
// narrow viewports so it never overflows the drawer width.
function LegendRow() {
  const items: { variant: SeatVariant; label: string }[] = [
    { variant: "selected", label: "Your seat" },
    { variant: "booked",   label: "Fully booked seat" },
    { variant: "free",     label: "Free seat" },
    { variant: "guide",    label: "Tour guide" },
  ];

  return (
    <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-x-6 gap-y-3">
      {items.map((item) => (
        <div key={item.variant} className="flex items-center gap-2">
          <SeatShape variant={item.variant} size="sm" />
          <span className="text-xs text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// BusFloorPlan — the interactive chart itself. Rows are rendered top-to-
// bottom (front → back). The "bus shell" outer rounded rectangle gives the
// chart visual context so it reads as the interior of a coach.
function BusFloorPlan({
  layout,
  selectedSeatIds,
  onToggle,
}: {
  layout: BusLayout;
  selectedSeatIds: string[];
  onToggle: (id: string) => void;
}) {
  // Decide the visual variant for a given seat. If it's in the user's
  // current selection, render it as "selected" — otherwise fall back to
  // its base status (free / booked).
  const variantFor = (seat: Seat): SeatVariant =>
    selectedSeatIds.includes(seat.id) ? "selected" : seat.status;

  return (
    <div className="mx-auto w-fit">
      {/* "Front" marker above the bus shell */}
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-2">
        Front of bus
      </p>

      {/* Bus shell — a rounded rectangle that visually frames the chart
          as the interior of a coach. Stronger curve at the top (the
          windshield end) helps it read as front-facing. */}
      <div className="border-2 border-border bg-grey-lightest rounded-t-[60px] rounded-b-3xl p-4 sm:p-6 flex flex-col items-center gap-4">

        {/* Tour-guide seat — front-right position, mirrors the legend's
            "Tour guide" swatch. Not selectable. We use spacers to push it
            into the right-hand pair position so it aligns with seats below. */}
        <div className="flex items-center gap-1.5">
          <span className="w-5"     aria-hidden="true" />
          <span className="size-9"  aria-hidden="true" />
          <span className="size-9"  aria-hidden="true" />
          <span className="w-5"     aria-hidden="true" />
          <span className="size-9"  aria-hidden="true" />
          <SeatShape variant="guide" />
        </div>

        {/* Thin divider between the front area and the passenger rows */}
        <div className="w-full h-px bg-border" aria-hidden="true" />

        {/* 2+2 pair rows */}
        <div className="flex flex-col gap-1.5">
          {layout.pairRows.map(({ row, seats }) => (
            <div key={row} className="flex items-center gap-1.5">
              {/* Row label — kept narrow + muted so it doesn't draw the eye */}
              <span className="w-5 text-[11px] font-medium text-muted-foreground text-center">
                {row}
              </span>
              <SeatButton seat={seats[0]} variant={variantFor(seats[0])} onToggle={onToggle} />
              <SeatButton seat={seats[1]} variant={variantFor(seats[1])} onToggle={onToggle} />
              {/* Aisle — fixed gap between the two seat pairs */}
              <span className="w-5" aria-hidden="true" />
              <SeatButton seat={seats[2]} variant={variantFor(seats[2])} onToggle={onToggle} />
              <SeatButton seat={seats[3]} variant={variantFor(seats[3])} onToggle={onToggle} />
            </div>
          ))}

          {/* Back row — 5 seats across, no aisle. Slight top margin so it
              visually separates from the pair rows above it. */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-5 text-[11px] font-medium text-muted-foreground text-center">
              12
            </span>
            {layout.backRow.map((seat) => (
              <SeatButton
                key={seat.id}
                seat={seat}
                variant={variantFor(seat)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mt-2">
        Back of bus
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function SeatChartDrawer({
  open,
  onOpenChange,
  from,
  to,
  date,
  passengerCount,
  currentSeatIds = [],
  layout = DEFAULT_BUS_LAYOUT,
  onConfirm,
}: SeatChartDrawerProps) {
  // The user's pending picks. Defaults to their current seats so the chart
  // highlights where they're sitting when the drawer first opens.
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(currentSeatIds);

  // Reset to currentSeatIds every time the drawer opens. Without this, a
  // user who cancelled mid-edit and reopened the drawer would see a stale
  // selection instead of their actual current seats.
  useEffect(() => {
    if (open) setSelectedSeatIds(currentSeatIds);
    // currentSeatIds is intentionally re-read on every open; we don't want
    // to react to mid-drawer prop changes from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Toggle a single seat. Three branches:
  //   • Seat is already in the selection → remove it (frees a slot).
  //   • Seat is free + we're at the cap   → FIFO swap: the oldest selection
  //     drops out so the click never feels dead. This is much more forgiving
  //     than a silent no-op for users casually changing seats.
  //   • Seat is free + slot available     → add it.
  const toggleSeat = (id: string) => {
    setSelectedSeatIds((current) => {
      if (current.includes(id)) {
        return current.filter((sid) => sid !== id);
      }
      if (current.length >= passengerCount) {
        return [...current.slice(1), id];
      }
      return [...current, id];
    });
  };

  const remaining = passengerCount - selectedSeatIds.length;
  const isComplete = remaining === 0;

  const handleConfirm = () => {
    if (!isComplete) return;
    onConfirm?.(selectedSeatIds);
    onOpenChange(false);
  };

  // Sort the seat-list summary so "1A, 2B, 12C" reads naturally regardless
  // of click order. Compares row numbers numerically + letter alphabetically.
  const sortedSelection = [...selectedSeatIds].sort((a, b) => {
    const rowA = parseInt(a, 10);
    const rowB = parseInt(b, 10);
    if (rowA !== rowB) return rowA - rowB;
    return a.slice(-1).localeCompare(b.slice(-1));
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Width strategy — matches the production TripBuilder `DrawerLayout`
          pattern (`w-full md:w-[70%] max-w-[1200px]`):
            • Mobile (<md): w-full — full-screen takeover. The seat chart
              needs every horizontal pixel on a phone, and full-screen feels
              like a natural mobile drawer.
            • Tablet/Desktop (md+): w-[70%] of the viewport — substantial
              presence without dominating the screen.
            • Capped at max-w-[1200px] so it doesn't stretch absurdly wide
              on ultra-wide monitors.
          The `sm:max-w-[1200px]` override is needed to defeat the default
          `sm:max-w-sm` (384px) in the shared Sheet component. */}
      <SheetContent
        side="right"
        className="w-full md:w-[70%] sm:max-w-[1200px] flex flex-col gap-0 p-0 bg-grey-lightest"
      >
        {/* Header + body + footer all wrap their inner content in a
            `max-w-3xl mx-auto` band. The drawer itself can be ~1200px wide
            (matching production), but pulling the content to a comfortable
            reading column keeps everything cohesive — the seat chart isn't
            stranded in the middle of a huge expanse. */}
        <SheetHeader className="px-5 sm:px-8 md:px-12 lg:px-16 pt-6 sm:pt-8 pb-2">
          <div className="max-w-3xl mx-auto w-full">
            <SheetTitle className="text-2xl md:text-3xl font-extrabold text-foreground">
              Select seats
            </SheetTitle>
            {/* sr-only description keeps Radix happy (a11y) without showing
                extra copy in the drawer header. */}
            <SheetDescription className="sr-only">
              Pick {passengerCount} seat{passengerCount !== 1 ? "s" : ""} for your coach journey.
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Scrollable body — trip context + the seat chart card.
            flex-1 lets the footer stay pinned to the bottom. */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 md:px-12 lg:px-16 pb-6">
          <div className="max-w-3xl mx-auto space-y-4">

          {/* Trip context — matches the SmartPlanner card header style.
              We also show progress towards the seat-count cap so users
              always know how many more picks they need. */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                Bus: {from} to {to}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(date, "EEE, dd MMM yyyy")}
              </p>
            </div>
            {/* Progress pill — red-ish when incomplete, green when done */}
            <div
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap",
                isComplete
                  ? "bg-success/10 text-success"
                  : "bg-primary/10 text-primary",
              )}
              role="status"
              aria-live="polite"
            >
              {selectedSeatIds.length} of {passengerCount} selected
            </div>
          </div>

          {/* The big white card holding legend + interactive chart */}
          <div className="bg-card rounded-3xl shadow-md p-5 sm:p-6 space-y-5">
            <LegendRow />
            <BusFloorPlan
              layout={layout}
              selectedSeatIds={selectedSeatIds}
              onToggle={toggleSeat}
            />

            {/* Live readout of the picks + instructional hint */}
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                {sortedSelection.length > 0 ? (
                  <>
                    Your seats:{" "}
                    <span className="font-bold text-foreground">
                      {sortedSelection.join(", ")}
                    </span>
                  </>
                ) : (
                  "No seats selected yet — tap a free seat to choose."
                )}
              </p>
              {!isComplete && selectedSeatIds.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Pick {remaining} more seat{remaining !== 1 ? "s" : ""} to continue.
                </p>
              )}
            </div>
          </div>
          </div>{/* /max-w-3xl content band */}
        </div>

        {/* Footer — primary action right-aligned, like the Figma reference.
            Disabled until the user has picked the right number of seats.
            We re-apply the same max-w-3xl band so the Confirm button lines
            up with the content above it inside the wide drawer. */}
        <SheetFooter className="px-5 sm:px-8 md:px-12 lg:px-16 pb-6 sm:pb-8 pt-4 bg-grey-lightest border-t border-border">
          <div className="max-w-3xl mx-auto w-full flex justify-end">
            <Button
              onClick={handleConfirm}
              size="lg"
              className="min-w-40"
              disabled={!isComplete}
            >
              Confirm selection
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
