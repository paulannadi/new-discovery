// FlightSearchForm — the single, shared flight search form.
//
// This is the EXACT same form used on the Discovery "Flights" tab and inside
// the FlightListPage "Edit search" panel. Lifting it into one component means
// there's only one place to change the flight search UI — both screens stay
// in sync automatically.
//
// It owns all of its own state (trip type, legs, dates, passengers, cabin) and
// reports the chosen search back to its parent via two callbacks:
//
//   • onSearch(criteria)  — fired when the user clicks "Search Flights".
//   • onChange(criteria)  — (optional) fired whenever any field changes, so a
//                           parent can mirror the current values (DiscoveryPage
//                           uses this to feed its "Popular routes" quick-search
//                           cards). Edit-search callers can ignore it.
//
// Pass `onCancel` to show a Cancel button (used by the edit-search panel); the
// Discovery tab omits it.

import { useState, useEffect } from "react";
import { format } from "date-fns";
// DateRange is just the { from, to } TYPE — the calendar UI itself now comes
// from our shared design-system <Calendar> component (token-based, no hardcoded
// colors), instead of a raw <DayPicker> with an inline <style> hex override.
import { type DateRange } from "react-day-picker";
import {
  RotateCcw,
  Armchair,
  Users,
  ChevronDown,
  Minus,
  Plus,
  Calendar as CalendarIcon,
  ArrowRight,
  X,
  Search,
} from "lucide-react";
import { cn } from "../../../../shared/components/ui/utils";
import { Button } from "../../../../shared/components/ui/button";
import { Calendar } from "../../../../shared/components/ui/calendar";
// Shared range-picker logic: 1st click = from, 2nd = to, re-open restarts.
import { stepRange, isRangeComplete } from "../../../../shared/utils/dateRange";
import { AirportCombobox } from "./AirportCombobox";
import type { FlightSearchCriteria, FlightLeg } from "../../../../App";

// ── Props ──────────────────────────────────────────────────────────────────
type CabinClass = FlightSearchCriteria["cabinClass"];

type FlightSearchFormProps = {
  /** Pre-fill the form from an existing search (edit mode). Omitted on Discovery. */
  initialCriteria?: FlightSearchCriteria;
  /** Fired when the user submits the form. */
  onSearch: (criteria: FlightSearchCriteria) => void;
  /** Optional — fires on every change so a parent can mirror the live values. */
  onChange?: (criteria: FlightSearchCriteria) => void;
  /** Optional — when provided, a Cancel button is shown (edit mode). */
  onCancel?: () => void;
  /** Label for the submit button. Defaults to "Search Flights". */
  submitLabel?: string;
};

const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  "premium-economy": "Premium Economy",
  business: "Business",
  first: "First Class",
};

export function FlightSearchForm({
  initialCriteria,
  onSearch,
  onChange,
  onCancel,
  submitLabel = "Search Flights",
}: FlightSearchFormProps) {
  // ── State (initialised from `initialCriteria` when editing) ──────────────
  const [flightTripType, setFlightTripType] = useState<"roundtrip" | "multicity">(
    initialCriteria?.tripType ?? "roundtrip",
  );
  const [flightTripTypeOpen, setFlightTripTypeOpen] = useState(false);

  // Unified legs array — round trip always has exactly 2 legs, multi-city 2–6.
  // leg[0].date = outbound, leg[1].date = return (for round trip).
  const [flightLegs, setFlightLegs] = useState<FlightLeg[]>(
    initialCriteria?.legs && initialCriteria.legs.length > 0
      ? initialCriteria.legs
      : [
          { id: 1, from: "", to: "", date: undefined },
          { id: 2, from: "", to: "", date: undefined },
        ],
  );

  // Round-trip date range picker — seeded from the first/last legs' dates.
  const [flightDateRange, setFlightDateRange] = useState<DateRange | undefined>(
    initialCriteria?.legs?.[0]?.date
      ? {
          from: initialCriteria.legs[0].date,
          to: initialCriteria.legs[1]?.date,
        }
      : undefined,
  );
  const [flightDatesOpen, setFlightDatesOpen] = useState(false);

  // Multi-city: which leg's date picker is open (by leg id, or null)
  const [openLegDateId, setOpenLegDateId] = useState<number | null>(null);

  // Travellers + cabin (shared between round trip and multi-city)
  const [flightPassengers, setFlightPassengers] = useState({
    adults: initialCriteria?.adults ?? 2,
    children: initialCriteria?.children ?? 0,
  });
  const [flightCabinClass, setFlightCabinClass] = useState<CabinClass>(
    initialCriteria?.cabinClass ?? "economy",
  );
  const [flightPassengersOpen, setFlightPassengersOpen] = useState(false);
  const [flightCabinClassOpen, setFlightCabinClassOpen] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updateLeg = (id: number, field: keyof FlightLeg, value: string | Date | undefined) => {
    setFlightLegs((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addLeg = () => {
    if (flightLegs.length < 6) {
      setFlightLegs((prev) => [...prev, { id: Date.now(), from: "", to: "", date: undefined }]);
    }
  };

  const removeLeg = (id: number) => {
    setFlightLegs((prev) => prev.filter((l) => l.id !== id));
  };

  // ── Derived labels ─────────────────────────────────────────────────────
  const flightDateLabel = flightDateRange?.from
    ? flightDateRange.to
      ? `${format(flightDateRange.from, "MMM d")} – ${format(flightDateRange.to, "MMM d, yyyy")}`
      : format(flightDateRange.from, "MMM d, yyyy")
    : "Select dates";

  const flightPassengersLabel = `${flightPassengers.adults} Adult${flightPassengers.adults !== 1 ? "s" : ""}${flightPassengers.children > 0 ? `, ${flightPassengers.children} Child${flightPassengers.children !== 1 ? "ren" : ""}` : ""}`;

  // The current search as a criteria object — built once and reused for both
  // the live `onChange` mirror and the `onSearch` submit.
  const buildCriteria = (): FlightSearchCriteria => ({
    tripType: flightTripType,
    legs: flightLegs,
    adults: flightPassengers.adults,
    children: flightPassengers.children,
    cabinClass: flightCabinClass,
  });

  // Mirror live values up to the parent whenever anything changes.
  useEffect(() => {
    onChange?.(buildCriteria());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightTripType, flightLegs, flightPassengers, flightCabinClass]);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Secondary criteria row — pills on md+ ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:flex-wrap">

        {/* 1. Trip type dropdown */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => { setFlightTripTypeOpen((o) => !o); setFlightCabinClassOpen(false); setFlightPassengersOpen(false); }}
            className={`w-full md:w-auto flex items-center gap-1.5 h-[52px] md:h-8 px-4 md:px-3 rounded-xl md:rounded-lg border text-sm md:text-xs font-semibold transition-all ${flightTripTypeOpen ? "border-primary bg-white text-primary" : "border-border bg-white text-foreground hover:border-primary"}`}
          >
            <RotateCcw size={14} className="shrink-0" />
            {flightTripType === "roundtrip" ? "Round trip" : "Multi-city"}
            <ChevronDown size={13} className={`shrink-0 transition-transform ${flightTripTypeOpen ? "rotate-180" : ""}`} />
          </button>
          {flightTripTypeOpen && (
            <div className="absolute top-full right-0 md:left-0 md:right-auto mt-1.5 z-50 bg-card rounded-xl shadow-xl border border-border p-1.5 w-[140px] flex flex-col gap-0.5">
              {(["roundtrip", "multicity"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFlightTripType(type);
                    if (type === "roundtrip") setFlightLegs((prev) => prev.slice(0, 2));
                    setFlightTripTypeOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${flightTripType === type ? "bg-primary text-white" : "text-foreground hover:bg-grey-light"}`}
                >
                  {type === "roundtrip" ? "Round trip" : "Multi-city"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Cabin class dropdown */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => { setFlightCabinClassOpen((o) => !o); setFlightTripTypeOpen(false); setFlightPassengersOpen(false); }}
            className={`w-full md:w-auto flex items-center gap-1.5 h-[52px] md:h-8 px-4 md:px-3 rounded-xl md:rounded-lg border text-sm md:text-xs font-semibold transition-all ${flightCabinClassOpen ? "border-primary bg-white text-primary" : "border-border bg-white text-foreground hover:border-primary"}`}
          >
            <Armchair size={14} className="shrink-0" />
            {CABIN_CLASS_LABELS[flightCabinClass]}
            <ChevronDown size={13} className={`shrink-0 transition-transform ${flightCabinClassOpen ? "rotate-180" : ""}`} />
          </button>
          {flightCabinClassOpen && (
            <div className="absolute top-full right-0 md:left-0 md:right-auto mt-1.5 z-50 bg-card rounded-xl shadow-xl border border-border p-1.5 w-[180px] flex flex-col gap-0.5">
              {(["economy", "premium-economy", "business", "first"] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => { setFlightCabinClass(cls); setFlightCabinClassOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${flightCabinClass === cls ? "bg-primary text-white" : "text-foreground hover:bg-grey-light"}`}
                >
                  {CABIN_CLASS_LABELS[cls]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Travellers dropdown — counters for adults/children */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => { setFlightPassengersOpen((o) => !o); setFlightTripTypeOpen(false); setFlightCabinClassOpen(false); }}
            className={`w-full md:w-auto flex items-center gap-1.5 h-[52px] md:h-8 px-4 md:px-3 rounded-xl md:rounded-lg border text-sm md:text-xs font-semibold transition-all ${flightPassengersOpen ? "border-primary bg-white text-primary" : "border-border bg-white text-foreground hover:border-primary"}`}
          >
            <Users size={14} className="shrink-0" />
            {flightPassengersLabel}
            <ChevronDown size={13} className={`shrink-0 transition-transform ${flightPassengersOpen ? "rotate-180" : ""}`} />
          </button>
          {flightPassengersOpen && (
            <div className="absolute top-full right-0 md:left-0 md:right-auto mt-1.5 z-50 bg-card rounded-2xl shadow-xl border border-border p-5 w-[260px] flex flex-col gap-4">
              {[
                { label: "Adults", sub: "Age 12+", key: "adults" as const, min: 1 },
                { label: "Children", sub: "Age 2–11", key: "children" as const, min: 0 },
              ].map(({ label, sub, key, min }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{label}</div>
                    <div className="text-xs text-grey">{sub}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}
                      disabled={flightPassengers[key] <= min}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-foreground w-4 text-center">{flightPassengers[key]}</span>
                    <button
                      onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.min(9, p[key] + 1) }))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setFlightPassengersOpen(false)}
                className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ROUND TRIP FORM ──────────────────────────────────────────────── */}
      {flightTripType === "roundtrip" && (
        <div className="flex flex-col lg:flex-row gap-3">

          {/* From — picking a city mirrors into the return leg's destination. */}
          <div className="flex-1">
            <AirportCombobox
              label="From"
              placeholder="Departure city"
              value={flightLegs[0]?.from ?? ""}
              onChange={(code) => {
                updateLeg(flightLegs[0].id, "from", code);
                updateLeg(flightLegs[1].id, "to", code);
              }}
            />
          </div>

          {/* To — mirrors into the return leg's origin. */}
          <div className="flex-1">
            <AirportCombobox
              label="To"
              placeholder="Destination city"
              iconRotated
              value={flightLegs[0]?.to ?? ""}
              onChange={(code) => {
                updateLeg(flightLegs[0].id, "to", code);
                updateLeg(flightLegs[1].id, "from", code);
              }}
            />
          </div>

          {/* Dates — range picker for outbound + return */}
          <div className="flex-1">
            <div className="relative w-full">
              <button
                className={`w-full flex items-center gap-3 h-[52px] px-4 rounded-xl border text-left transition-all ${flightDatesOpen ? "border-primary ring-2 ring-primary/20 bg-white" : "border-border bg-white hover:border-primary"}`}
                onClick={() => setFlightDatesOpen(!flightDatesOpen)}
              >
                <CalendarIcon size={18} className="text-primary shrink-0" />
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Depart – Return</span>
                  <span className={cn("text-sm font-semibold truncate w-full", flightDateRange?.from ? "text-foreground" : "text-grey")}>
                    {flightDateLabel}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-grey shrink-0 transition-transform ${flightDatesOpen ? "rotate-180" : ""}`} />
              </button>
              {flightDatesOpen && (
                <div className="absolute top-full left-0 mt-2 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                  {/* Shared design-system Calendar — colors come from theme tokens
                      (--primary etc.), so there's no inline hex to maintain. */}
                  <Calendar
                    mode="range"
                    selected={flightDateRange}
                    // We drive the range ourselves from the clicked day (onSelect's
                    // 2nd arg) so every click is predictable: 1st sets departure,
                    // 2nd sets return, and a re-opened calendar restarts on click 1.
                    onSelect={(_range, day) => {
                      const next = stepRange(flightDateRange, day);
                      setFlightDateRange(next);
                      // Keep the underlying legs in sync — return clears on restart.
                      updateLeg(flightLegs[0].id, "date", next.from);
                      updateLeg(flightLegs[1].id, "date", next.to);
                      // Both dates chosen → close shortly so the full range is seen.
                      if (isRangeComplete(next)) {
                        setTimeout(() => setFlightDatesOpen(false), 200);
                      }
                    }}
                    numberOfMonths={1}
                    disabled={{ before: new Date() }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit + (optional) Cancel — design-system <Button>. We keep the
              52px height / rounded-xl / bold text so they line up with the tall
              input fields, but the variants, hover, focus ring and disabled
              states all come from the shared component now. */}
          <div className="flex gap-2 lg:items-stretch">
            {onCancel && (
              <Button
                variant="secondary"
                onClick={onCancel}
                className="w-full lg:w-auto h-[52px] rounded-xl px-5 text-base font-bold"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => {
                setFlightDatesOpen(false);
                setFlightPassengersOpen(false);
                onSearch(buildCriteria());
              }}
              className="w-full lg:w-auto h-[52px] rounded-xl px-6 text-base font-extrabold shadow-md"
            >
              <Search />
              {submitLabel}
            </Button>
          </div>
        </div>
      )}

      {/* ── MULTI-CITY FORM ──────────────────────────────────────────────── */}
      {flightTripType === "multicity" && (
        <div className="flex flex-col gap-3">

          {/* One row per leg */}
          {flightLegs.map((leg, index) => (
            <div key={leg.id} className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

              {/* Leg label */}
              <span className="text-[10px] font-extrabold text-grey uppercase tracking-wide shrink-0 md:w-12 pt-3.5 md:pt-0 text-left md:text-right">
                {`Leg ${index + 1}`}
              </span>

              {/* From */}
              <div className="flex-1">
                <AirportCombobox
                  label="From"
                  placeholder="From city"
                  value={leg.from}
                  onChange={(code) => updateLeg(leg.id, "from", code)}
                />
              </div>

              {/* Arrow between From and To */}
              <ArrowRight size={14} className="text-grey shrink-0 hidden md:block" />

              {/* To */}
              <div className="flex-1">
                <AirportCombobox
                  label="To"
                  placeholder="To city"
                  iconRotated
                  value={leg.to}
                  onChange={(code) => updateLeg(leg.id, "to", code)}
                />
              </div>

              {/* Date picker for this leg (single date) */}
              <div className="relative md:w-[160px]">
                <button
                  className={`w-full flex items-center gap-2 h-[52px] px-3 rounded-xl border bg-white transition-all ${openLegDateId === leg.id ? "border-primary" : "border-border hover:border-primary"}`}
                  onClick={() => setOpenLegDateId(openLegDateId === leg.id ? null : leg.id)}
                >
                  <CalendarIcon size={15} className="text-primary shrink-0" />
                  <span className={cn("text-xs font-semibold truncate", leg.date ? "text-foreground" : "text-grey")}>
                    {leg.date ? format(leg.date, "d MMM yyyy") : "Select date"}
                  </span>
                </button>
                {openLegDateId === leg.id && (
                  <div className="absolute top-[60px] left-0 z-50 bg-card rounded-xl shadow-xl border border-border overflow-hidden">
                    {/* Shared design-system Calendar (single date for this leg). */}
                    <Calendar
                      mode="single"
                      selected={leg.date}
                      onSelect={(date) => {
                        updateLeg(leg.id, "date", date ?? undefined);
                        setOpenLegDateId(null);
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                )}
              </div>

              {/* Remove button — only for legs beyond the first 2 */}
              {index >= 2 ? (
                <button
                  onClick={() => removeLeg(leg.id)}
                  className="shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center text-grey hover:border-red-300 hover:text-red-400 transition-colors self-center"
                  title="Remove this leg"
                >
                  <X size={14} />
                </button>
              ) : (
                <div className="shrink-0 w-9 hidden md:block" />
              )}
            </div>
          ))}

          {/* Add another flight button — up to 6 legs */}
          {flightLegs.length < 6 && (
            <button
              onClick={addLeg}
              className="mt-1 h-[44px] w-full border border-dashed border-primary rounded-lg text-primary text-xs font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              Add another flight
            </button>
          )}

          {/* Bottom row: submit + (optional) Cancel — design-system <Button>. */}
          <div className="flex gap-2 pt-1">
            {onCancel && (
              <Button
                variant="secondary"
                onClick={onCancel}
                className="flex-1 md:flex-none h-[52px] rounded-xl px-5 text-base font-bold"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => {
                setFlightPassengersOpen(false);
                setOpenLegDateId(null);
                onSearch(buildCriteria());
              }}
              className="flex-1 md:flex-none h-[52px] rounded-xl px-6 text-base font-extrabold shadow-md"
            >
              <Search />
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
