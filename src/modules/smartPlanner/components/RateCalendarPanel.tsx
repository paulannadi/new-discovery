// ─────────────────────────────────────────────────────────────────────────────
// RateCalendarPanel — Shared Component
//
// A mini monthly calendar that shows per-person prices for every departure date.
// Used in two places:
//   1. PackageCard (expandable inline section for cached packages)
//   2. DiscoveryPage holidays tab (featured deal section)
//
// Props:
//   rateCalendar  — array of { departureDate, pricePerPerson, available }
//   selectedDate  — the currently active departure date ("YYYY-MM-DD")
//   onSelectDate  — called when the user clicks an available date
//   currency      — ISO code: "GBP", "USD", "EUR"
//   nights        — length of stay — used to draw the duration range highlight
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { format, addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RateCalendarEntry } from "../../../types";
import { cn } from "../../../shared/components/ui/utils";

// Converts a currency code to its symbol for display
function sym(currency: string): string {
  return currency === "GBP" ? "£"
    : currency === "USD" ? "$"
    : currency === "EUR" ? "€"
    : currency + " ";
}

interface RateCalendarPanelProps {
  rateCalendar: RateCalendarEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currency: string;
  // How many nights the stay lasts — used to highlight the duration range
  nights: number;
}

export function RateCalendarPanel({
  rateCalendar,
  selectedDate,
  onSelectDate,
  currency,
  nights,
}: RateCalendarPanelProps) {
  // Build a fast lookup: "YYYY-MM-DD" → entry
  const entryMap = new Map(rateCalendar.map(e => [e.departureDate, e]));

  // Determine the month range covered by this calendar
  const allDates = rateCalendar.map(e => new Date(e.departureDate));
  const minDate = allDates.reduce((a, b) => a < b ? a : b, allDates[0] ?? new Date());
  const maxDate = allDates.reduce((a, b) => a > b ? a : b, allDates[0] ?? new Date());

  // Month navigator — open on the month of the selected departure date
  const initialDate = selectedDate ? new Date(selectedDate) : minDate;
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Which months are valid to navigate to
  const minMonth = minDate.getFullYear() * 12 + minDate.getMonth();
  const maxMonth = maxDate.getFullYear() * 12 + maxDate.getMonth();
  const currentMonth = displayYear * 12 + displayMonth;

  const canGoPrev = currentMonth > minMonth;
  const canGoNext = currentMonth < maxMonth;

  const goToPrev = () => {
    if (!canGoPrev) return;
    if (displayMonth === 0) { setDisplayMonth(11); setDisplayYear(y => y - 1); }
    else setDisplayMonth(m => m - 1);
  };

  const goToNext = () => {
    if (!canGoNext) return;
    if (displayMonth === 11) { setDisplayMonth(0); setDisplayYear(y => y + 1); }
    else setDisplayMonth(m => m + 1);
  };

  // ── Duration range: departure → return ────────────────────────────────────
  // Three visual tiers:
  //   departure day  → strong blue fill (selected)
  //   days in-between → very light blue tint (the stay itself)
  //   return day     → medium blue ring (marks the end)
  const returnDateStr = selectedDate
    ? format(addDays(new Date(selectedDate), nights), "yyyy-MM-dd")
    : null;

  // The "in-between" days: departure+1 through return-1
  const stayDaySet = new Set<string>();
  if (selectedDate) {
    for (let i = 1; i < nights; i++) {
      stayDaySet.add(format(addDays(new Date(selectedDate), i), "yyyy-MM-dd"));
    }
  }

  // ── Grid construction ────────────────────────────────────────────────────
  const firstDay = new Date(displayYear, displayMonth, 1);
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const startDayOfWeek = firstDay.getDay(); // 0=Sun...6=Sat
  // Convert to Mon-first grid (0=Mon, 6=Sun)
  const offset = (startDayOfWeek + 6) % 7;

  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = format(new Date(displayYear, displayMonth, 1), "MMMM yyyy");
  const currSym = sym(currency);

  return (
    <div className="bg-grey-light border border-border rounded-xl p-4">
      <div className="text-xs font-bold text-foreground mb-3">Explore travel dates</div>

      {/* Month navigation row */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-grey-light disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="text-xs font-bold text-foreground">{monthLabel}</span>
        <button
          onClick={goToNext}
          disabled={!canGoNext}
          aria-label="Next month"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-grey-light disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-xs font-bold text-grey text-center py-1">{d}</div>
        ))}
      </div>

      {/* Calendar day cells — one per day of the month */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} />;

          const dateStr = format(new Date(displayYear, displayMonth, day), "yyyy-MM-dd");
          const entry = entryMap.get(dateStr);
          const isAvailable = entry?.available ?? false;
          // Past dates — before today — are shown greyed out with no price
          const isPast = new Date(displayYear, displayMonth, day) < new Date(new Date().toDateString());

          // Duration range states
          const isDeparture = dateStr === selectedDate;
          const isReturn = dateStr === returnDateStr;
          const isStayDay = stayDaySet.has(dateStr);

          // Cell background — priority order: departure > return > stay > available > unavailable
          const cellClass = isDeparture
            ? "bg-primary cursor-pointer"
            : isReturn
            ? "bg-primary/20 ring-1 ring-primary cursor-pointer hover:bg-primary/30"
            : isStayDay
            ? "bg-primary/10 cursor-default"
            : isAvailable
            ? "hover:bg-primary/10 cursor-pointer"
            : "cursor-not-allowed";

          // Day number text colour
          const dayNumClass = isDeparture
            ? "text-primary-foreground"
            : isReturn || isStayDay
            ? "text-primary"
            : isAvailable
            ? "text-foreground"
            : "text-grey";

          // Price text colour follows the same hierarchy
          const priceClass = isDeparture
            ? "text-primary-foreground/90"
            : isReturn || isStayDay
            ? "text-primary"
            : isAvailable
            ? "text-primary"
            : "text-muted-foreground"; // muted grey for sold-out dates

          return (
            <button
              key={dateStr}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg py-1.5 px-0.5",
                "transition-all text-center min-h-[44px]",
                !(isAvailable || isDeparture || isReturn || isStayDay) && "opacity-50",
                cellClass,
              )}
            >
              <span className={cn("text-xs font-semibold leading-tight", dayNumClass)}>
                {day}
              </span>
              {/* Only show price for present/future dates — past dates show day number only */}
              {entry && !isPast && (
                <span className={cn("text-xs font-bold leading-tight", priceClass)}>
                  {currSym}{entry.pricePerPerson.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
