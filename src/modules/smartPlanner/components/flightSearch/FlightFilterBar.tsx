// FlightFilterBar — the row of 5 filter controls under the leg sub-heading.
//
// All 5 are FULLY WORKING — each change emits a new FlightFilters object
// via `onChange`, and the parent (FlightListPage) re-runs applyFilters()
// to update the visible result list.
//
// Visual design — matches the SECONDARY pill pattern from the Flights tab
// on DiscoveryPage (Round trip / Economy / 2 Adults). These filters are
// secondary inputs sitting under the primary search criteria, so they get a
// lower-profile pill treatment:
//   • Compact h-8 pill on desktop (52px on mobile so they remain tappable),
//     rounded-lg / rounded-xl, white bg
//   • Border switches to primary on hover and when the popover/select is open
//   • Leading 14px lucide icon, inline value text, trailing rotating chevron
//   • No stacked uppercase label — the icon + value are self-explanatory
//
// Filter types under the hood:
//   1. Sort by        — shadcn Select  (Cheapest / Best / Fastest)
//   2. Stops          — shadcn Select  (All / Direct / 1 stop / 2+ stops)
//   3. Airlines       — Popover + Checkbox list (multi-select)
//   4. Departure time — Popover + Checkbox list (4 time-of-day buckets)
//   5. Max duration   — Popover + Slider (0h 30m → 24h)

import {
  ArrowDownWideNarrow,
  Plane,
  Building2,
  Sunrise,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../../../shared/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../shared/components/ui/popover";
import { Checkbox } from "../../../../shared/components/ui/checkbox";
import { Slider } from "../../../../shared/components/ui/slider";
// Shared secondary-pill styling so this bar matches DiscoveryPage's
// Flights tab and the FlightSearchForm.
import { PILL_CLASS, SELECT_PILL_CLASS, PillContent } from "./secondaryPill";
import type {
  FlightFilters,
  SortMode,
  StopsFilter,
  DepartureBucket,
} from "./types";

type AirlineEntry = { code: string; name: string };

type FlightFilterBarProps = {
  filters: FlightFilters;
  onChange: (next: FlightFilters) => void;
  // List of {code, name} pairs available in the current result set
  // — drives the Airlines popover checkboxes.
  availableAirlines: AirlineEntry[];
};

// Immutable update helper so each handler stays tiny.
function update<K extends keyof FlightFilters>(
  filters: FlightFilters,
  key: K,
  value: FlightFilters[K],
): FlightFilters {
  return { ...filters, [key]: value };
}

// Convert minutes → "0h 30m" / "9h" / "12h 30m" for display.
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static option lists kept outside the component so they don't re-allocate
// on every render.
// ─────────────────────────────────────────────────────────────────────────────
const SORT_LABELS: Record<SortMode, string> = {
  cheapest: "Cheapest",
  best: "Best",
  fastest: "Fastest",
};

// Note: the "all" label reads "Any stops" rather than just "All" — the
// pill no longer carries an "Stops" caption above the value, so the
// default state needs to stand alone.
const STOPS_OPTIONS: { value: StopsFilter; label: string }[] = [
  { value: "all", label: "Any stops" },
  { value: "direct", label: "Non-stop" },
  { value: "1-stop", label: "1 stop" },
  { value: "2-plus-stops", label: "2+ stops" },
];
const STOPS_LABELS: Record<StopsFilter, string> = Object.fromEntries(
  STOPS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<StopsFilter, string>;

const DEPARTURE_BUCKETS: { value: DepartureBucket; label: string; hint: string }[] = [
  { value: "early",     label: "Early morning", hint: "00:00 – 05:59" },
  { value: "morning",   label: "Morning",       hint: "06:00 – 11:59" },
  { value: "afternoon", label: "Afternoon",     hint: "12:00 – 17:59" },
  { value: "evening",   label: "Evening",       hint: "18:00 – 23:59" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function FlightFilterBar({ filters, onChange, availableAirlines }: FlightFilterBarProps) {
  const toggleAirline = (code: string) => {
    const next = filters.airlines.includes(code)
      ? filters.airlines.filter((c) => c !== code)
      : [...filters.airlines, code];
    onChange(update(filters, "airlines", next));
  };

  const toggleBucket = (bucket: DepartureBucket) => {
    const next = filters.departureTimes.includes(bucket)
      ? filters.departureTimes.filter((b) => b !== bucket)
      : [...filters.departureTimes, bucket];
    onChange(update(filters, "departureTimes", next));
  };

  // Display strings for each filter's value slot — kept here so the JSX
  // below stays declarative. "Any" reads better than "(0)" for the
  // multi-select filters when nothing is picked.
  const airlinesValue =
    filters.airlines.length === 0
      ? "Any airline"
      : filters.airlines.length === 1
      ? availableAirlines.find((a) => a.code === filters.airlines[0])?.name ?? "1 selected"
      : `${filters.airlines.length} airlines`;

  const departureValue =
    filters.departureTimes.length === 0
      ? "Any time"
      : filters.departureTimes.length === 1
      ? DEPARTURE_BUCKETS.find((b) => b.value === filters.departureTimes[0])?.label ?? "1 selected"
      : `${filters.departureTimes.length} times`;

  return (
    // flex-wrap row: stacks full-width pills on mobile, then wraps as
    // compact inline pills on md+. Matches the secondary criteria row in
    // DiscoveryPage's Flights tab.
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:flex-wrap">

      {/* ── 1. SORT BY ─────────────────────────────────────────────────── */}
      <Select
        value={filters.sortBy}
        onValueChange={(v) => onChange(update(filters, "sortBy", v as SortMode))}
      >
        <SelectTrigger className={SELECT_PILL_CLASS}>
          <PillContent
            icon={ArrowDownWideNarrow}
            value={SORT_LABELS[filters.sortBy]}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cheapest">Cheapest</SelectItem>
          <SelectItem value="best">Best</SelectItem>
          <SelectItem value="fastest">Fastest</SelectItem>
        </SelectContent>
      </Select>

      {/* ── 2. STOPS ───────────────────────────────────────────────────── */}
      <Select
        value={filters.stops}
        onValueChange={(v) => onChange(update(filters, "stops", v as StopsFilter))}
      >
        <SelectTrigger className={SELECT_PILL_CLASS}>
          <PillContent
            icon={Plane}
            value={STOPS_LABELS[filters.stops]}
          />
        </SelectTrigger>
        <SelectContent>
          {STOPS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── 3. AIRLINES ────────────────────────────────────────────────── */}
      <Popover>
        <PopoverTrigger className={PILL_CLASS}>
          <PillContent icon={Building2} value={airlinesValue} />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
            {availableAirlines.map((a) => {
              const checked = filters.airlines.includes(a.code);
              const id = `flt-airline-${a.code}`;
              return (
                <label
                  key={a.code}
                  htmlFor={id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-grey-light cursor-pointer text-sm"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggleAirline(a.code)}
                  />
                  <span>{a.name}</span>
                </label>
              );
            })}
          </div>
          {filters.airlines.length > 0 && (
            <button
              type="button"
              onClick={() => onChange(update(filters, "airlines", []))}
              className="mt-2 w-full text-xs font-bold text-primary hover:underline text-left px-2"
            >
              Clear airlines
            </button>
          )}
        </PopoverContent>
      </Popover>

      {/* ── 4. DEPARTURE TIME ──────────────────────────────────────────── */}
      <Popover>
        <PopoverTrigger className={PILL_CLASS}>
          <PillContent icon={Sunrise} value={departureValue} />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <div className="flex flex-col gap-1">
            {DEPARTURE_BUCKETS.map((b) => {
              const checked = filters.departureTimes.includes(b.value);
              const id = `flt-dep-${b.value}`;
              return (
                <label
                  key={b.value}
                  htmlFor={id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-grey-light cursor-pointer text-sm"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggleBucket(b.value)}
                  />
                  <span className="flex-1">{b.label}</span>
                  <span className="text-xs text-muted-foreground">{b.hint}</span>
                </label>
              );
            })}
          </div>
          {filters.departureTimes.length > 0 && (
            <button
              type="button"
              onClick={() => onChange(update(filters, "departureTimes", []))}
              className="mt-2 w-full text-xs font-bold text-primary hover:underline text-left px-2"
            >
              Clear times
            </button>
          )}
        </PopoverContent>
      </Popover>

      {/* ── 5. MAX DURATION ────────────────────────────────────────────── */}
      <Popover>
        <PopoverTrigger className={PILL_CLASS}>
          <PillContent
            icon={Clock}
            value={`Up to ${formatDuration(filters.maxDurationMinutes)}`}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Max duration</span>
              <span className="font-bold">{formatDuration(filters.maxDurationMinutes)}</span>
            </div>
            <Slider
              min={30}
              max={24 * 60}
              step={30}
              value={[filters.maxDurationMinutes]}
              onValueChange={([v]) => onChange(update(filters, "maxDurationMinutes", v))}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>0h 30m</span>
              <span>24h</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

