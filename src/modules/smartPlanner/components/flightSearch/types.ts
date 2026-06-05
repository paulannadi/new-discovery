// Shared types used by FlightFilterBar, FlightListPage, and the pure
// `applyFilters()` helper in filterFlights.ts.
//
// Why a separate file: keeping these out of the components means React
// re-renders don't have to redeclare type literals, and the filter logic
// can be unit-tested in isolation if we ever add tests.

// Which sort mode the user picked in the "Sort by" dropdown.
// - "cheapest": price ascending
// - "fastest":  shortest total duration first
// - "best":     curated order — flights with the "Best" badge first, then by price
export type SortMode = "cheapest" | "fastest" | "best";

// Stops filter — maps 1:1 to FlightOption.stops values plus an "all" passthrough.
export type StopsFilter = "all" | "direct" | "1-stop" | "2-plus-stops";

// We bucket departure times into 4 windows so the filter UI stays simple
// (a checkbox list) rather than a 24-hour range slider.
//   early:     00:00 – 05:59
//   morning:   06:00 – 11:59
//   afternoon: 12:00 – 17:59
//   evening:   18:00 – 23:59
export type DepartureBucket = "early" | "morning" | "afternoon" | "evening";

// All filter state held in a single object — easier to reset and pass around
// than 5 separate useState hooks. FlightListPage owns the state; FlightFilterBar
// is fully controlled and emits a new object via onChange.
export type FlightFilters = {
  sortBy: SortMode;
  stops: StopsFilter;
  airlines: string[];           // airline codes (e.g. ["BA", "LH"]); empty = all
  departureTimes: DepartureBucket[]; // empty = all buckets pass
  maxDurationMinutes: number;   // upper bound, in minutes (e.g. 9 * 60 = 540)
};

// Sensible defaults when the page first loads or the leg changes.
// Cheapest matches the screenshot's default sort. The duration cap starts
// at the slider's maximum (24h) so the user sees every flight before they
// start filtering — long-haul mock flights in this prototype run up to 16h.
export const DEFAULT_FILTERS: FlightFilters = {
  sortBy: "cheapest",
  stops: "all",
  airlines: [],
  departureTimes: [],
  maxDurationMinutes: 24 * 60,
};
