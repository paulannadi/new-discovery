// Pure filter + sort function — keeps the math out of the component
// so we can reason about it independently and unit-test it later.
//
// Filtering order matters for performance only; the result is the same
// regardless of order. We do cheaper checks first (single equality) before
// the slightly more expensive multi-value checks.

import type { FlightOption } from "../../../../App";
import { parseDurationToMinutes } from "./mockFlights";
import type {
  FlightFilters,
  DepartureBucket,
} from "./types";

// Map an "HH:MM" string to one of our 4 buckets.
// Exported so the FilterBar can compute counts/labels if it needs to.
export function getDepartureBucket(time: string): DepartureBucket {
  const hour = parseInt(time.slice(0, 2), 10);
  if (hour < 6) return "early";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function applyFilters(
  flights: FlightOption[],
  filters: FlightFilters,
): FlightOption[] {
  const filtered = flights.filter((f) => {
    // 1. Stops filter
    if (filters.stops !== "all") {
      if (filters.stops === "direct" && f.stops !== "Direct") return false;
      if (filters.stops === "1-stop" && f.stops !== "1 stop") return false;
      if (filters.stops === "2-plus-stops" && f.stops !== "2 stops") return false;
    }

    // 2. Airline filter (empty list = pass all)
    if (filters.airlines.length > 0 && !filters.airlines.includes(f.airlineCode)) {
      return false;
    }

    // 3. Departure time bucket (empty list = pass all)
    if (filters.departureTimes.length > 0) {
      const bucket = getDepartureBucket(f.departure);
      if (!filters.departureTimes.includes(bucket)) return false;
    }

    // 4. Max duration cap
    const durationMin = parseDurationToMinutes(f.duration);
    if (durationMin > filters.maxDurationMinutes) return false;

    return true;
  });

  // Sort — done after filtering so we only sort what's left.
  // Spread first so we don't mutate the input array.
  const sorted = [...filtered];
  if (filters.sortBy === "cheapest") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === "fastest") {
    sorted.sort(
      (a, b) => parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration),
    );
  } else {
    // "best" = badged "Best" first, then by price
    sorted.sort((a, b) => {
      const aBest = a.badge === "Best" ? 0 : 1;
      const bBest = b.badge === "Best" ? 0 : 1;
      if (aBest !== bBest) return aBest - bBest;
      return a.price - b.price;
    });
  }

  return sorted;
}
