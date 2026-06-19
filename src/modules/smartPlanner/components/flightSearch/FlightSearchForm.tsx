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

import { useState, useEffect, useRef, type ReactNode } from "react";
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
  Sparkles,
} from "lucide-react";
import { cn } from "../../../../shared/components/ui/utils";
import { Button } from "../../../../shared/components/ui/button";
// Compact opt-in now uses a checkbox (instead of the old Switch) plus a Badge
// chip — both come straight from the shared design system.
import { Checkbox } from "../../../../shared/components/ui/checkbox";
import { Badge } from "../../../../shared/components/ui/badge";
import { Calendar } from "../../../../shared/components/ui/calendar";
// Shared range-picker logic: 1st click = from, 2nd = to, re-open restarts.
import { stepRange, isRangeComplete } from "../../../../shared/utils/dateRange";
import { AirportCombobox } from "./AirportCombobox";
// The currently-selected stopover airline (from Settings) decides which airports
// the pickers allow and which hub city we name in the labels.
import { useSettings } from "../../../../shared/contexts/SettingsContext";
import { STOPOVER_AIRLINES } from "./stopoverAirlines";
// Shared pill styling — the same PILL_CLASS / PillContent the post-search filter
// bar uses, so the search form's pills and the filter bar's pills are now one
// consistent control instead of two hand-tuned copies.
import { PILL_CLASS, PillContent } from "./secondaryPill";
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
  /**
   * Dedicated Stopover-tab mode. When true the form:
   *   • locks to round trip (hides the trip-type selector),
   *   • always treats a stopover as ON (no "Open to a stopover" checkbox — just
   *     the "which leg" + "how many nights" controls),
   *   • restricts the airport pickers to Fiji Airways' network, and
   *   • tags the submitted criteria with `stopoverOnly: true`.
   * Omitted on the normal Flights tab, which keeps the opt-in checkbox.
   */
  stopoverMode?: boolean;
};

const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  "premium-economy": "Premium Economy",
  business: "Business",
  first: "First Class",
};

// ── Mobile bottom-sheet primitives ───────────────────────────────────────────
// On small screens the three secondary criteria (trip type, travellers, cabin)
// open as bottom sheets — the SAME interaction the results-page "Sort / Filters"
// bar uses — instead of the desktop inline dropdowns. These two helpers keep
// that sheet markup from being repeated three times in the render below.

// The dimmed full-screen overlay + slide-up panel. `md:hidden` so it can never
// show on desktop even when its open-state flag is shared with the inline
// dropdown (which is what drives the same control on md+).
function MobileSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-foreground/50 flex flex-col justify-end animate-in fade-in duration-200">
      {/* Tap the dimmed backdrop to dismiss. */}
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-card rounded-t-3xl p-6 pb-12 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 z-10">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-grey-light"
            aria-label="Close"
          >
            <X size={20} className="text-foreground" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// A single selectable option row — same radio dot the filter-bar sheets use.
function SheetRadioRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-2 text-left"
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked ? "border-primary" : "border-border",
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}

export function FlightSearchForm({
  initialCriteria,
  onSearch,
  onChange,
  onCancel,
  submitLabel = "Search Flights",
  stopoverMode = false,
}: FlightSearchFormProps) {
  // The selected stopover airline drives the picker whitelist and hub label when
  // this form is in stopover mode. On the normal Flights tab it's simply unused.
  const { settings } = useSettings();
  const stopoverAirline = STOPOVER_AIRLINES[settings.stopoverAirline];

  // ── State (initialised from `initialCriteria` when editing) ──────────────
  // Stopover mode is round-trip only, so we never start it on multi-city.
  const [flightTripType, setFlightTripType] = useState<"roundtrip" | "multicity">(
    stopoverMode ? "roundtrip" : initialCriteria?.tripType ?? "roundtrip",
  );
  const [flightTripTypeOpen, setFlightTripTypeOpen] = useState(false);

  // Unified legs array — round trip always has exactly 2 legs, multi-city 2–6.
  // leg[0].date = outbound, leg[1].date = return (for round trip).
  const [flightLegs, setFlightLegs] = useState<FlightLeg[]>(
    initialCriteria?.legs && initialCriteria.legs.length > 0
      ? initialCriteria.legs
      : stopoverMode
        ? // Stopover mode opens demo-ready on the selected airline's first route
          // (e.g. Fiji LAX → Sydney, Caribbean JFK → Grenada), return leg mirrored,
          // so offers show on the first search.
          [
            { id: 1, from: stopoverAirline.originCodes[0], to: stopoverAirline.destinationCodes[0], date: undefined },
            { id: 2, from: stopoverAirline.destinationCodes[0], to: stopoverAirline.originCodes[0], date: undefined },
          ]
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

  // ── Stopover opt-in (round trip only) ────────────────────────────────────
  // The only NEW thing on this form. Flipping it on reveals two questions —
  // which leg gets the stop, and up to how many nights — and tells the results
  // page to surface stopover offers on that leg.
  // In stopover mode a stopover is always on; otherwise it follows the checkbox.
  const [stopoverEnabled, setStopoverEnabled] = useState(stopoverMode ? true : initialCriteria?.stopover?.enabled ?? false);
  const [stopoverLeg, setStopoverLeg] = useState<"outbound" | "return">(initialCriteria?.stopover?.leg ?? "outbound");
  const [stopoverNights, setStopoverNights] = useState(initialCriteria?.stopover?.nights ?? 2);

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

  // Total head-count shown on the resting Travellers pill (e.g. "2 travellers").
  // The dropdown still splits this into adults vs children — this is just the
  // compact summary the pill displays when it's closed (inactive).
  const flightTravellersCount = flightPassengers.adults + flightPassengers.children;

  // The current search as a criteria object — built once and reused for both
  // the live `onChange` mirror and the `onSearch` submit.
  const buildCriteria = (): FlightSearchCriteria => ({
    tripType: flightTripType,
    legs: flightLegs,
    adults: flightPassengers.adults,
    children: flightPassengers.children,
    cabinClass: flightCabinClass,
    // Stopover only applies to round trips — gate it so a multi-city search
    // never accidentally carries an opt-in.
    stopover:
      flightTripType === "roundtrip"
        ? { enabled: stopoverEnabled, leg: stopoverLeg, nights: stopoverNights }
        : undefined,
    // Mark stopover-tab searches so the results page shows offers-only on the
    // chosen leg, flat-only on the other, and Fiji Airways throughout.
    stopoverOnly: stopoverMode || undefined,
  });

  // Mirror live values up to the parent whenever anything changes.
  useEffect(() => {
    onChange?.(buildCriteria());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightTripType, flightLegs, flightPassengers, flightCabinClass, stopoverEnabled, stopoverLeg, stopoverNights]);

  // ── Reset the route when the stopover airline changes ────────────────────
  // In stopover mode, switching airline in Settings (e.g. Fiji → Caribbean) makes
  // the old airports invalid (they're not in the new airline's network), so we
  // snap the From/To back to the new airline's first route. We track the previous
  // airline in a ref and only reset on an actual CHANGE — never on first mount, so
  // an edit-search form opened with a real chosen route is left untouched.
  const prevAirlineId = useRef(stopoverAirline.id);
  useEffect(() => {
    if (!stopoverMode) return;
    if (prevAirlineId.current === stopoverAirline.id) return;
    prevAirlineId.current = stopoverAirline.id;
    const origin = stopoverAirline.originCodes[0];
    const dest = stopoverAirline.destinationCodes[0];
    setFlightLegs([
      { id: 1, from: origin, to: dest, date: undefined },
      { id: 2, from: dest, to: origin, date: undefined },
    ]);
  }, [stopoverAirline, stopoverMode]);

  // The submit (+ optional cancel) buttons, defined ONCE here so we can drop
  // them into EITHER the main input row (when stopover is off) or down in the
  // stopover detail row (when it's on) — without duplicating the click logic.
  //
  // `heightClass` lets each caller pass the right height: the top row uses the
  // tall h-[52px] to line up with the From/To/Dates fields, while the stopover
  // row uses h-11 (44px) to match the shorter stopover inputs.
  const renderActionButtons = (heightClass: string) => (
    <>
      {onCancel && (
        <Button
          variant="secondary"
          onClick={onCancel}
          className={cn("w-full lg:w-auto rounded-xl px-5 text-base font-bold", heightClass)}
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
        className={cn("w-full lg:w-auto rounded-xl px-6 text-base font-extrabold shadow-md", heightClass)}
      >
        <Search />
        {submitLabel}
      </Button>
    </>
  );

  // The Travellers control — a compact pill that lives in the secondary criteria
  // row, sitting BETWEEN the trip-type ("Round trip") and cabin-class ("Economy")
  // pills. In its resting / inactive state it shows the total traveller count
  // (e.g. "2 travellers"); clicking it opens the adults/children stepper dropdown,
  // exactly as before. Styled to match its two neighbours (same h-8 pill on md+,
  // same border / hover / open colours) so the row reads as one consistent set.
  const renderTravellers = () => (
    <div className="relative w-full md:w-auto">
      <button
        onClick={() => { setFlightPassengersOpen((o) => !o); setFlightTripTypeOpen(false); setFlightCabinClassOpen(false); }}
        data-state={flightPassengersOpen ? "open" : "closed"}
        className={PILL_CLASS}
      >
        <PillContent
          icon={Users}
          value={`${flightTravellersCount} traveller${flightTravellersCount !== 1 ? "s" : ""}`}
        />
      </button>
      {flightPassengersOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-card rounded-2xl shadow-xl border border-border p-5 w-[260px] flex flex-col gap-4">
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
                  aria-label={`Fewer ${label.toLowerCase()}`}
                  onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}
                  disabled={flightPassengers[key] <= min}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold text-foreground w-4 text-center">{flightPassengers[key]}</span>
                <button
                  aria-label={`More ${label.toLowerCase()}`}
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
  );

  return (
    <div className="flex flex-col gap-4">

      {/* ── Secondary criteria row — pills on md+ ───────────────────────────
          Desktop only now (`hidden md:flex`). On mobile these three controls
          render instead as the segmented bar + bottom sheets just below, which
          mirror the results-page "Sort / Filters / Map" control. */}
      <div className="hidden md:flex md:items-center gap-2 md:flex-wrap">

        {/* 1. Trip type dropdown — hidden in stopover mode, which is always a
            round trip (it needs a departure + return leg to choose between). */}
        {!stopoverMode && (
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => { setFlightTripTypeOpen((o) => !o); setFlightCabinClassOpen(false); setFlightPassengersOpen(false); }}
            // PILL_CLASS styles its open state off `data-state="open"` (the hook
            // Radix sets). These are plain buttons, so we set it ourselves.
            data-state={flightTripTypeOpen ? "open" : "closed"}
            className={PILL_CLASS}
          >
            <PillContent
              icon={RotateCcw}
              value={flightTripType === "roundtrip" ? "Round trip" : "Multi-city"}
            />
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
        )}

        {/* 2. Travellers pill — sits between trip type and cabin class. */}
        {renderTravellers()}

        {/* 3. Cabin class dropdown */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => { setFlightCabinClassOpen((o) => !o); setFlightTripTypeOpen(false); setFlightPassengersOpen(false); }}
            data-state={flightCabinClassOpen ? "open" : "closed"}
            className={PILL_CLASS}
          >
            <PillContent icon={Armchair} value={CABIN_CLASS_LABELS[flightCabinClass]} />
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
      </div>

      {/* ── Secondary criteria — MOBILE segmented bar (<md) ──────────────────
          Mirrors the results-page "Sort | Filters | Map" control: one segmented
          pill split into equal segments by hairline dividers. Tapping a segment
          opens its bottom sheet below — the same behaviour as Sort / Filters.

          Radius matches a SINGLE search filter (rounded-xl, same as the desktop
          pills' PILL_CLASS), the labels use the lighter font-semibold those pills
          use, and the icons are primary-blue to match the From/To/Dates fields. */}
      <div className="md:hidden">
        <div className="flex h-[48px] w-full items-center rounded-xl border border-border bg-card">
          {/* Trip type — hidden in stopover mode (always round trip). */}
          {!stopoverMode && (
          <>
          <button
            type="button"
            onClick={() => { setFlightTripTypeOpen(true); setFlightPassengersOpen(false); setFlightCabinClassOpen(false); }}
            className="flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 rounded-l-xl text-sm font-semibold text-foreground transition-colors active:bg-grey-light"
          >
            <RotateCcw size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{flightTripType === "roundtrip" ? "Round trip" : "Multi-city"}</span>
          </button>

          <div className="h-6 w-px shrink-0 bg-border" />
          </>
          )}

          {/* Travellers */}
          <button
            type="button"
            onClick={() => { setFlightPassengersOpen(true); setFlightTripTypeOpen(false); setFlightCabinClassOpen(false); }}
            className={cn(
              "flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 text-sm font-semibold text-foreground transition-colors active:bg-grey-light",
              // When trip type is hidden (stopover mode) Travellers is the first
              // segment, so it takes the rounded-left edge.
              stopoverMode && "rounded-l-xl",
            )}
          >
            <Users size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{flightTravellersCount} traveller{flightTravellersCount !== 1 ? "s" : ""}</span>
          </button>

          <div className="h-6 w-px shrink-0 bg-border" />

          {/* Cabin class */}
          <button
            type="button"
            onClick={() => { setFlightCabinClassOpen(true); setFlightTripTypeOpen(false); setFlightPassengersOpen(false); }}
            className="flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 rounded-r-xl text-sm font-semibold text-foreground transition-colors active:bg-grey-light"
          >
            <Armchair size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{CABIN_CLASS_LABELS[flightCabinClass]}</span>
          </button>
        </div>
      </div>

      {/* ── Secondary criteria — MOBILE bottom sheets ────────────────────────
          One per segment above. Each is `md:hidden`, so even though they share
          their open-state flag with the desktop inline dropdown, they only ever
          appear on small screens. */}
      {flightTripTypeOpen && (
        <MobileSheet title="Trip type" onClose={() => setFlightTripTypeOpen(false)}>
          <div className="flex flex-col gap-1">
            {(["roundtrip", "multicity"] as const).map((type) => (
              <SheetRadioRow
                key={type}
                label={type === "roundtrip" ? "Round trip" : "Multi-city"}
                checked={flightTripType === type}
                onClick={() => {
                  setFlightTripType(type);
                  // Round trip only ever has the outbound + return legs.
                  if (type === "roundtrip") setFlightLegs((prev) => prev.slice(0, 2));
                  setFlightTripTypeOpen(false);
                }}
              />
            ))}
          </div>
        </MobileSheet>
      )}

      {flightCabinClassOpen && (
        <MobileSheet title="Cabin class" onClose={() => setFlightCabinClassOpen(false)}>
          <div className="flex flex-col gap-1">
            {(["economy", "premium-economy", "business", "first"] as const).map((cls) => (
              <SheetRadioRow
                key={cls}
                label={CABIN_CLASS_LABELS[cls]}
                checked={flightCabinClass === cls}
                onClick={() => { setFlightCabinClass(cls); setFlightCabinClassOpen(false); }}
              />
            ))}
          </div>
        </MobileSheet>
      )}

      {flightPassengersOpen && (
        <MobileSheet title="Travellers" onClose={() => setFlightPassengersOpen(false)}>
          <div className="flex flex-col gap-5">
            {[
              { label: "Adults", sub: "Age 12+", key: "adults" as const, min: 1 },
              { label: "Children", sub: "Age 2–11", key: "children" as const, min: 0 },
            ].map(({ label, sub, key, min }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">{label}</div>
                  <div className="text-xs text-grey">{sub}</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label={`Fewer ${label.toLowerCase()}`}
                    onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.max(min, p[key] - 1) }))}
                    disabled={flightPassengers[key] <= min}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-4 text-center text-base font-bold text-foreground">{flightPassengers[key]}</span>
                  <button
                    type="button"
                    aria-label={`More ${label.toLowerCase()}`}
                    onClick={() => setFlightPassengers((p) => ({ ...p, [key]: Math.min(9, p[key] + 1) }))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFlightPassengersOpen(false)}
              className="mt-1 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all hover:brightness-85"
            >
              Done
            </button>
          </div>
        </MobileSheet>
      )}

      {/* ── ROUND TRIP FORM ──────────────────────────────────────────────── */}
      {flightTripType === "roundtrip" && (
        <>
        {/* Main input row — same responsive pattern as the Holidays form:
            1 column on phone → 2-up pairs on tablet (md) → a single row on wide
            screens (xl). At xl the display flips to flex so the fields' flex-1
            rules drive the row; the col-spans only act on the tablet grid
            (From + To, then full-width Dates, then full-width button). Travellers
            moved up to the secondary pill row, so the main row is just the three
            location/date fields plus the action button. */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:flex xl:flex-row gap-3">

          {/* From — picking a city mirrors into the return leg's destination. */}
          <div className="flex-1">
            <AirportCombobox
              label="From"
              placeholder="Departure city"
              // Stopover mode only offers the selected airline's origin cities.
              allowedCodes={stopoverMode ? stopoverAirline.originCodes : undefined}
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
              // Stopover mode only offers the selected airline's destination cities.
              allowedCodes={stopoverMode ? stopoverAirline.destinationCodes : undefined}
              value={flightLegs[0]?.to ?? ""}
              onChange={(code) => {
                updateLeg(flightLegs[0].id, "to", code);
                updateLeg(flightLegs[1].id, "from", code);
              }}
            />
          </div>

          {/* Dates — range picker for outbound + return. md:col-span-2 lets it
              fill the whole second tablet row now that Travellers no longer sits
              beside it; at xl the parent is flex so the col-span is ignored and
              flex-1 shares the row evenly with From / To. */}
          <div className="flex-1 md:col-span-2 xl:col-span-1">
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
              states all come from the shared component now.

              Only shown HERE while the stopover toggle is off. When it's on, the
              same buttons render down in the stopover row instead (see below).

              `hidden xl:flex` → at xl the search bar is a single flex row and the
              button sits INLINE at the end of the fields, which is the layout we
              want on wide screens. Below xl we hide this copy and render the
              button AFTER the stopover checkbox instead (see the xl:hidden block
              below) so the "Open to a stopover" option comes before "Search
              flights" on smaller screens. */}
          {!stopoverEnabled && (
            <div className="hidden xl:flex gap-2 md:col-span-2 lg:items-stretch">
              {renderActionButtons("h-[52px]")}
            </div>
          )}
        </div>

        {/* ── STOPOVER OPT-IN — compact checkbox row, sitting below the form ──
            Was a tall icon-card with a Switch; now it's one borderless slim row
            so it takes far less vertical space. */}
        <div className="py-1">
          {/* flex-wrap so on a narrow screen the chip/description drop to the
              next line instead of squashing the control. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {stopoverMode ? (
              // Stopover mode: no checkbox — a stopover is always on here, so we
              // show a plain section heading instead of the opt-in toggle.
              <span className="text-sm font-bold text-foreground">Explore {stopoverAirline.hubCity}</span>
            ) : (
              // Normal Flights tab: the opt-in checkbox. <label> wraps the box +
              // words so clicking the text toggles it too — better a11y.
              <label className="flex cursor-pointer select-none items-center gap-2.5">
                <Checkbox
                  checked={stopoverEnabled}
                  // Radix checkboxes can report "indeterminate"; we only ever want
                  // a real true/false here, so coerce anything else to false.
                  onCheckedChange={(checked) => setStopoverEnabled(checked === true)}
                  aria-label="Open to a stopover"
                />
                <span className="text-sm font-bold text-foreground">Open to a stopover</span>
              </label>
            )}

            {/* "Exclusive offers" chip — sits between the heading and the
                description. Primary-tinted Badge with a little sparkle to signal
                this unlocks special fares. */}
            <Badge className="gap-1 border-transparent bg-primary/10 text-primary">
              <Sparkles size={12} aria-hidden="true" />
              Exclusive offers
            </Badge>

            {/* Short supporting line — kept inline; wraps below on small screens. */}
            <span className="text-xs text-grey">
              Break the long haul — spend a few nights in a city along the way.
            </span>
          </div>

          {/* The two follow-up questions appear only once the box is checked. */}
          {stopoverEnabled && (
            <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-end md:gap-8">
              {/* Which leg gets the stopover */}
              <div>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-grey">
                  When on your trip
                </div>
                <div className="inline-flex h-11 items-stretch gap-0.5 rounded-lg border border-border p-0.5">
                  {(
                    [
                      ["outbound", "Departure"],
                      ["return", "Return"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setStopoverLeg(id)}
                      className={cn(
                        "flex items-center rounded-md px-3 text-xs font-bold transition-colors",
                        // Keyboard focus indicator (a11y §10.2) — same ring the stepper cards use.
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        stopoverLeg === id ? "bg-primary text-white" : "text-foreground hover:bg-grey-light",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Up to how many nights — a small −/+ stepper, clamped 1–4 */}
              <div>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-grey">
                  Up to how many nights
                </div>
                <div className="inline-flex h-11 items-center gap-3 rounded-lg border border-border px-2">
                  <button
                    type="button"
                    aria-label="Fewer nights"
                    disabled={stopoverNights <= 1}
                    onClick={() => setStopoverNights((n) => Math.max(1, n - 1))}
                    className="flex size-7 items-center justify-center rounded-md text-primary transition-colors hover:bg-grey-light disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-16 text-center text-sm font-bold text-foreground">
                    {stopoverNights} night{stopoverNights > 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    aria-label="More nights"
                    disabled={stopoverNights >= 4}
                    onClick={() => setStopoverNights((n) => Math.min(4, n + 1))}
                    className="flex size-7 items-center justify-center rounded-md text-primary transition-colors hover:bg-grey-light disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Search button — relocated here while stopover is on. `md:ml-auto`
                  pushes it to the far right, next to the stopover inputs. The
                  `animate-in` classes (from tw-animate-css) fade + slide it up on
                  appear so the move from the top row feels intentional, not a jump.
                  h-11 matches the stopover inputs' height. */}
              <div className="flex gap-2 md:ml-auto lg:items-stretch animate-in fade-in slide-in-from-bottom-2 duration-300">
                {renderActionButtons("h-11")}
              </div>
            </div>
          )}

          {/* Search button for SMALLER screens (below xl). Rendered here — AFTER
              the "Open to a stopover" checkbox — so the stopover option appears
              before the search action on phone/tablet. `xl:hidden` because at xl
              the button lives inline in the field row above instead. Only shown
              while the stopover toggle is off; when it's on, the button moves
              into the stopover detail row above. */}
          {!stopoverEnabled && (
            <div className="xl:hidden flex gap-2 mt-4 lg:items-stretch lg:justify-end">
              {renderActionButtons("h-[52px]")}
            </div>
          )}
        </div>
        </>
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

          {/* Bottom row: submit + (optional) Cancel, pushed to the far right.
              Travellers now lives in the secondary pill row at the top, so this
              row only carries the action buttons. */}
          <div className="flex flex-col md:flex-row gap-2 pt-1 md:items-center md:justify-end">
            <div className="flex gap-2">
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
        </div>
      )}
    </div>
  );
}
