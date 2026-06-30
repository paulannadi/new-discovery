// FlightFilterBar — the filter controls under the leg sub-heading.
//
// All filters are FULLY WORKING — each change emits a new FlightFilters object
// via `onChange`, and the parent (FlightListPage) re-runs applyFilters()
// to update the visible result list.
//
// Two responsive layouts, mirroring the hotel results page so the whole
// flight flow (including the stopover hotel step) behaves the same on a phone:
//
//   • DESKTOP (md+): a wrapping row of compact "secondary pills" — Sort, Stops,
//     Airlines, Departure time, Max duration. Each opens a Select/Popover.
//
//   • MOBILE (<md): a single rounded-full segmented bar with two buttons,
//     "Sort" and "Filters" (the same principle as HotelListPage — minus the
//     Map toggle, since flights have no map). Tapping them opens full-screen /
//     bottom-sheet takeovers instead of cramped inline popovers:
//       – Sort    → bottom sheet with radio rows
//       – Filters → full-screen sheet with every filter + a
//                   "Clear all / Show N flights" footer
//
// Filter types under the hood:
//   1. Sort by        — Cheapest / Best / Fastest      (single-select)
//   2. Stops          — All / Direct / 1 stop / 2+ stops (single-select)
//   3. Airlines       — multi-select checkbox list
//   4. Departure time — 4 time-of-day buckets (multi-select)
//   5. Max duration   — slider (0h 30m → 24h)

import { useState } from "react";
import {
  ArrowDownWideNarrow,
  Plane,
  Building2,
  Sunrise,
  Clock,
  SlidersHorizontal,
  X,
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
import { Button } from "../../../../shared/components/ui/button";
import { cn } from "../../../../shared/components/ui/utils";
// Shared secondary-pill styling so this bar matches DiscoveryPage's
// Flights tab and the FlightSearchForm.
import { PILL_CLASS, SELECT_PILL_CLASS, PillContent } from "./secondaryPill";
import type {
  FlightFilters,
  SortMode,
  StopsFilter,
  DepartureBucket,
} from "./types";
import { DEFAULT_FILTERS } from "./types";

type AirlineEntry = { code: string; name: string };

type FlightFilterBarProps = {
  filters: FlightFilters;
  onChange: (next: FlightFilters) => void;
  // List of {code, name} pairs available in the current result set
  // — drives the Airlines popover checkboxes.
  availableAirlines: AirlineEntry[];
  // Current number of matching flights — shown on the mobile "Show N flights"
  // button, exactly like the hotel page's "Show N hotels".
  resultCount?: number;
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
const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "cheapest", label: "Cheapest" },
  { value: "best", label: "Best" },
  { value: "fastest", label: "Fastest" },
];
const SORT_LABELS: Record<SortMode, string> = Object.fromEntries(
  SORT_OPTIONS.map((o) => [o.value, o.label]),
) as Record<SortMode, string>;

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
// Mobile takeover row helpers — same look as HotelListPage's CheckboxRow /
// RadioRow so the flight and hotel mobile sheets feel identical.
// ─────────────────────────────────────────────────────────────────────────────
function MobileRadioRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3 py-2 text-left w-full"
    >
      <span
        className={cn(
          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
          checked ? "border-primary" : "border-border",
        )}
      >
        {checked && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

function MobileCheckRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

// Thin divider between mobile filter sections — matches the hotel sheet.
const MobileDivider = () => <div className="h-[1px] bg-border w-full" />;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function FlightFilterBar({ filters, onChange, availableAirlines, resultCount }: FlightFilterBarProps) {
  // Mobile takeover open state — one for the Sort bottom sheet, one for the
  // full-screen Filters sheet. Desktop never touches these.
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
    <>
      {/* ── DESKTOP: wrapping pill row (md+) ─────────────────────────────────
          Hidden on mobile, where the segmented bar below takes over. */}
      <div className="hidden md:flex md:items-center gap-2 md:flex-wrap">

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
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
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
              <Button
                variant="link"
                size="sm"
                onClick={() => onChange(update(filters, "airlines", []))}
                className="mt-2 w-full justify-start px-2"
              >
                Clear airlines
              </Button>
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
              <Button
                variant="link"
                size="sm"
                onClick={() => onChange(update(filters, "departureTimes", []))}
                className="mt-2 w-full justify-start px-2"
              >
                Clear times
              </Button>
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

      {/* ── MOBILE: segmented "Sort | Filters" bar (<md) ─────────────────────
          Segmented control without the Map toggle (flights have no map).
          Radius (rounded-xl), the lighter font-semibold label, and the
          primary-blue icons all match a single flight-search filter pill, so
          this bar and the search-form's secondary bar read as one family. */}
      <div className="md:hidden">
        <div className="bg-card border border-border rounded-xl flex items-center h-[48px] w-full">
          <button
            type="button"
            className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-semibold text-foreground active:bg-grey-light transition-colors rounded-l-xl"
            onClick={() => setMobileSortOpen(true)}
          >
            <ArrowDownWideNarrow size={14} aria-hidden="true" />
            Sort
          </button>

          <div className="w-[1px] h-6 bg-border" />

          <button
            type="button"
            className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-semibold text-foreground active:bg-grey-light transition-colors rounded-r-xl"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>

      {/* ── MOBILE: Sort bottom sheet ────────────────────────────────────── */}
      {mobileSortOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-foreground/50 flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setMobileSortOpen(false)} />

          <div className="bg-card rounded-t-3xl p-6 pb-12 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-extrabold text-foreground">Sort by</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Close"
                onClick={() => setMobileSortOpen(false)}
              >
                <X size={20} className="text-foreground" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((opt) => (
                <MobileRadioRow
                  key={opt.value}
                  label={opt.label}
                  checked={filters.sortBy === opt.value}
                  onChange={() => {
                    onChange(update(filters, "sortBy", opt.value));
                    setMobileSortOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE: Filters full-screen takeover ─────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-card flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-extrabold text-foreground">Filters</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Close"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <X size={24} className="text-foreground" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 pb-24">

            {/* Stops */}
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-foreground mb-1">Stops</h3>
              {STOPS_OPTIONS.map((opt) => (
                <MobileRadioRow
                  key={opt.value}
                  label={opt.label}
                  checked={filters.stops === opt.value}
                  onChange={() => onChange(update(filters, "stops", opt.value))}
                />
              ))}
            </div>

            <MobileDivider />

            {/* Airlines */}
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-foreground mb-1">Airlines</h3>
              {availableAirlines.map((a) => (
                <MobileCheckRow
                  key={a.code}
                  label={a.name}
                  checked={filters.airlines.includes(a.code)}
                  onChange={() => toggleAirline(a.code)}
                />
              ))}
            </div>

            <MobileDivider />

            {/* Departure time */}
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-foreground mb-1">Departure time</h3>
              {DEPARTURE_BUCKETS.map((b) => (
                <MobileCheckRow
                  key={b.value}
                  label={b.label}
                  hint={b.hint}
                  checked={filters.departureTimes.includes(b.value)}
                  onChange={() => toggleBucket(b.value)}
                />
              ))}
            </div>

            <MobileDivider />

            {/* Max duration */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-foreground">Max duration</h3>
                <span className="text-sm font-extrabold text-foreground">
                  {formatDuration(filters.maxDurationMinutes)}
                </span>
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
          </div>

          {/* Footer — Clear all + Show N flights, same as the hotel sheet. */}
          <div className="p-4 border-t border-border bg-card pb-8">
            <div className="flex gap-4">
              <Button
                variant="tertiary"
                size="lg"
                className="flex-1"
                onClick={() => onChange(DEFAULT_FILTERS)}
              >
                Clear all
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setMobileFiltersOpen(false)}
              >
                {resultCount !== undefined ? `Show ${resultCount} flights` : "Show flights"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
