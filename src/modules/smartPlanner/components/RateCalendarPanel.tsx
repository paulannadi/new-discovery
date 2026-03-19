// ─────────────────────────────────────────────────────────────────────────────
// RateCalendarPanel — Shared Component
//
// A mini monthly calendar that shows per-person prices for every departure date.
// Used in three places:
//   1. HotelDetailModal (right panel, full-size)
//   2. PackageCard (expandable inline section for cached packages)
//   3. DiscoveryPage holidays tab (featured deal section)
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
    <div className="bg-[#f8fafc] border border-[#e0e2e8] rounded-[14px] p-4">
      <div className="text-[13px] font-bold text-[#333743] mb-3">Explore travel dates</div>

      {/* Month navigation row */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#e0e2e8] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[13px] font-bold text-[#333743]">{monthLabel}</span>
        <button
          onClick={goToNext}
          disabled={!canGoNext}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#e0e2e8] disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-[10px] font-bold text-[#9598a4] text-center py-1">{d}</div>
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
            ? "bg-[#2681FF] cursor-pointer"
            : isReturn
            ? "bg-[#DBEAFE] ring-1 ring-[#3B82F6] cursor-pointer hover:bg-[#bfdbfe]"
            : isStayDay
            ? "bg-[#EFF6FF] cursor-default"
            : isAvailable
            ? "hover:bg-[#EFF6FF] cursor-pointer"
            : "cursor-not-allowed";

          // Day number text colour
          const dayNumClass = isDeparture
            ? "text-white"
            : isReturn || isStayDay
            ? "text-[#1D4ED8]"
            : isAvailable
            ? "text-[#333743]"
            : "text-[#9598a4]";

          // Price text colour follows the same hierarchy
          const priceClass = isDeparture
            ? "text-white/90"
            : isReturn || isStayDay
            ? "text-[#3B82F6]"
            : isAvailable
            ? "text-[#2681FF]"
            : "text-[#C4C7D0]"; // muted grey for sold-out dates

          return (
            <button
              key={dateStr}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              className={`
                flex flex-col items-center justify-center rounded-[8px] py-1.5 px-0.5
                transition-all text-center min-h-[44px]
                ${isAvailable || isDeparture || isReturn || isStayDay ? "" : "opacity-50"}
                ${cellClass}
              `}
            >
              <span className={`text-[12px] font-semibold leading-tight ${dayNumClass}`}>
                {day}
              </span>
              {/* Only show price for present/future dates — past dates show day number only */}
              {entry && !isPast && (
                <span className={`text-[10px] font-bold leading-tight ${priceClass}`}>
                  {currSym}{entry.pricePerPerson.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date summary — departure + return dates below the grid */}
      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-[#e0e2e8] flex flex-col gap-0.5">
          {/* Departure row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#9598a4] uppercase tracking-wide">Departure</div>
              <div className="text-[12px] font-bold text-[#2681FF]">
                {format(new Date(selectedDate), "EEE, d MMM yyyy")}
              </div>
            </div>
            {entryMap.get(selectedDate) && (
              <div className="text-[13px] font-black text-[#333743]">
                {currSym}{entryMap.get(selectedDate)!.pricePerPerson.toLocaleString()}
                <span className="text-[10px] font-semibold text-[#9598a4]">/pp</span>
              </div>
            )}
          </div>
          {/* Return row — less prominent */}
          {returnDateStr && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#9598a4] uppercase tracking-wide">Return</div>
                <div className="text-[12px] font-semibold text-[#667080]">
                  {format(new Date(returnDateStr), "EEE, d MMM yyyy")} · {nights} nights
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
