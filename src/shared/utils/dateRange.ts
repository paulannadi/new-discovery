// Shared range-picker selection logic.
//
// react-day-picker's built-in `mode="range"` behaviour is confusing once a
// full range exists: clicking a new day *keeps* one end and moves the other,
// instead of starting over. Our search calendars want a simpler, predictable
// flow that's the same everywhere:
//
//   1st click  → set the "from" date (departure / check-in), clear any old range
//   2nd click  → set the "to"   date (return    / check-out), range complete
//   (the caller then closes the calendar)
//   re-open    → the range is already complete, so the next click starts fresh
//
// `stepRange` is a pure function that computes the next range from the current
// range + the day the user just clicked. Each calendar calls it from onSelect
// (react-day-picker passes the clicked day as the 2nd `triggerDate` argument),
// so all our range pickers behave identically.

import type { DateRange } from "react-day-picker";

export function stepRange(
  current: DateRange | undefined,
  day: Date,
): DateRange {
  // Empty OR already-complete range → start a brand-new range from this day.
  // (The "already-complete" case is what makes a re-opened calendar restart
  // on the first click instead of nudging one of the old endpoints.)
  if (!current?.from || (current.from && current.to)) {
    return { from: day, to: undefined };
  }

  // We have a "from" but no "to" yet → this click sets the second date.
  // If the user clicked an earlier day than "from", swap them so the range
  // always reads from earlier → later.
  return day < current.from
    ? { from: day, to: current.from }
    : { from: current.from, to: day };
}

// Convenience: a range is "complete" once both ends are chosen — that's the
// moment a caller should commit the dates and close the calendar.
export function isRangeComplete(range: DateRange | undefined): boolean {
  return Boolean(range?.from && range?.to);
}
