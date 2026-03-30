/**
 * PackageSearchForm
 *
 * Shared search form used in two places:
 *   - variant="hero"    → DiscoveryPage Holidays tab (full 52px fields, big button)
 *   - variant="compact" → HolidayListPage top bar (48px fields, icon-only button)
 *
 * Key UX rules:
 *   - Destinations marked isCached show a "Popular" badge in the dropdown.
 *   - Selecting a Popular (cached) destination unlocks the Flexible Dates tab.
 *   - Flexible Dates shows a month grid; only months with price data are selectable.
 *   - Non-cached destinations get a standard DayPicker only.
 */

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Plane,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Search,
  ChevronDown,
  Plus,
  Minus,
  Check,
  X,
  Moon,
} from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addMonths, startOfMonth, addDays } from "date-fns";
import "react-day-picker/dist/style.css";
import type { HolidaySearchCriteria } from "../../../App";

// ── Destination + pricing data (imported from central mock files) ─────────────
// These were previously inline arrays — they now live in src/mocks/ so that
// HolidayListPage and the useUnifiedSearch hook can share the same data.
import { DESTINATIONS } from "../../../mocks/destinations";
import type { DestinationOption } from "../../../mocks/destinations";
import { MONTHLY_PRICES } from "../../../mocks/monthlyPrices";
import { CACHED_PACKAGES } from "../../../mocks/packages/cachedPackages";

// ── Component ─────────────────────────────────────────────────────────────────

type OpenPanel = "from" | "to" | "duration" | "dates" | "guests" | null;

type Props = {
  variant: "hero" | "compact";
  initialValues?: Partial<HolidaySearchCriteria>;
  onSearch: (criteria: HolidaySearchCriteria) => void;
};

export default function PackageSearchForm({
  variant,
  initialValues,
  onSearch,
}: Props) {
  const [from,           setFrom          ] = useState(initialValues?.from ?? "");
  const [to,             setTo            ] = useState(initialValues?.to   ?? "");
  const [toQuery,        setToQuery       ] = useState(initialValues?.to   ?? "");
  const [isCached,       setIsCached      ] = useState(initialValues?.isCachedDestination ?? false);
  // toCode tracks the selected destination's code (e.g. "CANCUN") so we can
  // look up per-destination monthly prices from MONTHLY_PRICES.
  // We derive it from the initial label if one is provided.
  const [toCode,         setToCode        ] = useState(() => {
    if (initialValues?.to) {
      return DESTINATIONS.find(d => d.label === initialValues.to)?.code ?? "";
    }
    return "";
  });
  const [dateMode,       setDateMode      ] = useState<"specific" | "flexible">(
    initialValues?.dateMode ?? "specific"
  );
  const [dateRange,      setDateRange     ] = useState<DateRange | undefined>(
    initialValues?.dateRange
  );
  const [selectedMonths, setSelectedMonths] = useState<string[]>(
    initialValues?.selectedMonths ?? []
  );
  const [nights,   setNights  ] = useState(initialValues?.nights   ?? 7);
  const [adults,   setAdults  ] = useState(initialValues?.adults   ?? 2);
  const [children, setChildren] = useState(initialValues?.children ?? 0);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate 18 rolling months starting from today.
  // Prices come from MONTHLY_PRICES keyed by the selected destination code.
  // If no destination is selected (toCode is empty), all months show no price
  // and the flexible tab remains visible but all months appear greyed out.
  const today = new Date();
  const months = Array.from({ length: 18 }, (_, i) => {
    const d   = addMonths(startOfMonth(today), i);
    const key = format(d, "yyyy-MM");
    const destPrices = toCode ? MONTHLY_PRICES[toCode] : null;
    return { date: d, key, label: format(d, "MMM yyyy"), price: destPrices?.[key] ?? null };
  });

  // ── Departure price map (specific date mode, cached destinations only) ──────
  // For each calendar day, find the cheapest available package price across all
  // cached packages. This lets us show "from £849" on each day cell in the
  // DayPicker so agents can instantly see which dates have the best rates.
  //
  // We only compute this when a cached destination is selected — for non-cached
  // destinations there is no per-day price data to show.
  const departurePriceMap = useMemo(() => {
    if (!isCached) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const pkg of CACHED_PACKAGES) {
      for (const entry of pkg.rateCalendar ?? []) {
        if (!entry.available) continue; // skip sold-out dates
        const existing = map.get(entry.departureDate);
        // Keep the cheapest price across all packages for this date
        if (existing === undefined || entry.pricePerPerson < existing) {
          map.set(entry.departureDate, entry.pricePerPerson);
        }
      }
    }
    return map;
  }, [isCached]);

  // ── Best price per calendar month ────────────────────────────────────────────
  // Groups the price map by "yyyy-MM" and records the minimum price in each month.
  // Used to identify the "best deal" date(s) so we can colour them amber in the
  // calendar — this makes it instantly obvious which day is the cheapest to depart.
  const bestPricePerMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const [dateStr, price] of departurePriceMap.entries()) {
      const monthKey = dateStr.substring(0, 7); // "yyyy-MM"
      const existing = map.get(monthKey);
      if (existing === undefined || price < existing) {
        map.set(monthKey, price);
      }
    }
    return map;
  }, [departurePriceMap]);

  // Collect the actual Date objects for every best-deal day so we can pass them
  // to DayPicker's `modifiers` prop and apply the amber cell background.
  const bestDealDates = useMemo(() => {
    if (!isCached) return [] as Date[];
    // todayStr lets us exclude past dates — past best-deal days would otherwise
    // get the #EFF6FF background even though they're greyed out and unselectable.
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return Array.from(departurePriceMap.entries())
      .filter(([dateStr, price]) =>
        dateStr >= todayStr &&
        price === bestPricePerMonth.get(dateStr.substring(0, 7))
      )
      // Using noon prevents off-by-one issues when the browser's local timezone
      // shifts a midnight UTC date into the previous day.
      .map(([dateStr]) => new Date(dateStr + "T12:00:00"));
  }, [departurePriceMap, bestPricePerMonth, isCached]);

  // ── Duration range (stay days + return) ─────────────────────────────────────
  // Once the user selects a departure date, we highlight the full trip duration:
  //   stayDates  → every night between departure and return (light grey tint)
  //   returnDate → the day they fly home (soft blue ring)
  // These are passed to DayPicker's `modifiers` / `modifiersStyles` props.
  const stayDates = useMemo(() => {
    if (!dateRange?.from) return [] as Date[];
    // nights-1 so we don't include the return day itself (that gets its own style)
    return Array.from({ length: nights - 1 }, (_, i) =>
      addDays(dateRange.from!, i + 1)
    );
  }, [dateRange?.from, nights]);

  const returnDate = dateRange?.from ? addDays(dateRange.from, nights) : undefined;

  // Filter destination list as the user types
  const filteredDests = toQuery.trim()
    ? DESTINATIONS.filter((d) =>
        d.label.toLowerCase().includes(toQuery.toLowerCase())
      )
    : DESTINATIONS;

  const cachedDests     = filteredDests.filter((d) => d.isCached);
  const nonCachedDests  = filteredDests.filter((d) => !d.isCached);

  // Close all panels when clicking outside the form
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Human-readable summary labels ────────────────────────────────────────

  const dateSummary = (() => {
    if (dateMode === "flexible") {
      if (selectedMonths.length === 0) return "Select months";
      if (selectedMonths.length === 1) {
        const d = new Date(selectedMonths[0] + "-01");
        return format(d, "MMM yyyy");
      }
      return `${selectedMonths.length} months`;
    }
    // Specific mode: just the departure date. Duration is now its own field.
    if (!dateRange?.from) return "Select departure";
    return format(dateRange.from, "MMM d");
  })();

  const guestSummary = [
    `${adults} Adult${adults !== 1 ? "s" : ""}`,
    children > 0 ? `${children} Child${children !== 1 ? "ren" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelectDestination = (dest: DestinationOption) => {
    setTo(dest.label);
    setToQuery(dest.label);
    setIsCached(dest.isCached);
    // Also store the destination code so we can look up monthly prices
    setToCode(dest.code);
    // Reset flexible mode if destination has no cache
    if (!dest.isCached) {
      setDateMode("specific");
      setSelectedMonths([]);
    }
    setOpenPanel(null);
    // Small delay so the panel fully closes before dates opens
    setTimeout(() => setOpenPanel("dates"), 60);
  };

  const toggleMonth = (key: string) => {
    setSelectedMonths((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const handleSearch = () => {
    setOpenPanel(null);
    onSearch({
      from:                 from  || "London (LHR)",
      to:                   to    || "Anywhere",
      isCachedDestination:  isCached,
      dateMode,
      dateRange,
      selectedMonths,
      nights,
      adults,
      children,
    });
  };

  // ── Sizing tokens by variant ──────────────────────────────────────────────

  const h         = variant === "hero" ? "h-[52px]" : "h-[48px]";
  const r         = variant === "hero" ? "rounded-[12px]" : "rounded-[8px]";
  const labelCls  = "text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5";
  const valueCls  = variant === "hero" ? "text-[14px] font-semibold" : "text-[13px] font-semibold";
  const iconSize  = variant === "hero" ? 18 : 16;
  const fieldGap  = variant === "hero" ? "gap-3" : "gap-2";

  // Shared field wrapper classes
  const fieldBase = (active: boolean) =>
    `${h} ${r} border px-4 flex items-center gap-3 transition-colors ${
      active
        ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
        : "border-[#e0e2e8] bg-white hover:border-[#2681FF]"
    }`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row ${fieldGap} w-full`}
    >
      {/* ── FLYING FROM ───────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <div
          className={`${fieldBase(openPanel === "from")} cursor-pointer`}
          onClick={() => setOpenPanel(openPanel === "from" ? null : "from")}
        >
          <Plane size={iconSize} className="text-[#2681FF] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Flying from</span>
            <span className={`${valueCls} ${from ? "text-[#333743]" : "text-[#9598a4] font-normal"} truncate`}>
              {from || "Departure city"}
            </span>
          </div>
          <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
        </div>

        {openPanel === "from" && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] py-2 min-w-[260px] animate-in fade-in zoom-in-95 duration-150">
            {["London (LHR)", "London (LGW)", "Manchester (MAN)", "Edinburgh (EDI)", "Birmingham (BHX)", "Bristol (BRS)"].map(
              (city) => (
                <button
                  key={city}
                  className="w-full text-left px-4 py-2.5 text-[14px] text-[#333743] hover:bg-[#f9fafb] flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFrom(city);
                    setOpenPanel(null);
                  }}
                >
                  <Plane size={14} className="text-[#9598a4]" />
                  {city}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* ── GOING TO ──────────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <div
          className={`${h} ${r} border px-4 flex items-center gap-3 transition-colors ${
            openPanel === "to"
              ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
              : "border-[#e0e2e8] bg-white focus-within:border-[#2681FF]"
          }`}
        >
          <MapPin size={iconSize} className="text-[#2681FF] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Going to</span>
            <input
              type="text"
              value={toQuery}
              placeholder="Destination"
              className={`bg-transparent ${valueCls} text-[#333743] outline-none placeholder:text-[#9598a4] placeholder:font-normal w-full`}
              onChange={(e) => {
                setToQuery(e.target.value);
                setTo(e.target.value);
                setIsCached(false);
                setToCode(""); // clear code until a destination is selected from dropdown
                setOpenPanel("to");
              }}
              onFocus={() => setOpenPanel("to")}
            />
          </div>
          {toQuery && (
            <button
              className="text-[#9598a4] hover:text-[#333743] shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setToQuery("");
                setTo("");
                setIsCached(false);
                setToCode("");
                setDateMode("specific");
                setSelectedMonths([]);
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {openPanel === "to" && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] py-2 min-w-[300px] max-h-[340px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {filteredDests.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#9598a4]">
                No destinations found
              </div>
            ) : (
              <>
                {/* Popular (cached) destinations */}
                {cachedDests.length > 0 && (
                  <>
                    <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#9598a4]">
                      Popular
                    </div>
                    {cachedDests.map((dest) => (
                      <button
                        key={dest.label}
                        className="w-full text-left px-4 py-2.5 text-[14px] text-[#333743] hover:bg-[#f9fafb] flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDestination(dest);
                        }}
                      >
                        <MapPin size={14} className="text-[#9598a4] shrink-0" />
                        <span className="flex-1">{dest.label}</span>
                        <span className="text-[11px] font-bold text-[#2681FF] bg-[#EFF6FF] px-2 py-0.5 rounded-full shrink-0">
                          Popular
                        </span>
                      </button>
                    ))}
                  </>
                )}

                {/* All other destinations */}
                {nonCachedDests.length > 0 && (
                  <>
                    {cachedDests.length > 0 && (
                      <div className="mx-4 my-1.5 border-t border-[#f0f0f0]" />
                    )}
                    <div className="px-4 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#9598a4]">
                      All destinations
                    </div>
                    {nonCachedDests.map((dest) => (
                      <button
                        key={dest.label}
                        className="w-full text-left px-4 py-2.5 text-[14px] text-[#333743] hover:bg-[#f9fafb] flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDestination(dest);
                        }}
                      >
                        <MapPin size={14} className="text-[#9598a4] shrink-0" />
                        <span className="flex-1">{dest.label}</span>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── DURATION ──────────────────────────────────────────────────────── */}
      {/* Duration comes before Dates because the monthly prices in the flexible
          dates grid are duration-dependent — pick nights first, then the right
          prices show up when you open the calendar. */}
      <div className="relative">
        <div
          className={`${fieldBase(openPanel === "duration")} cursor-pointer min-w-[140px]`}
          onClick={() => setOpenPanel(openPanel === "duration" ? null : "duration")}
        >
          <Moon size={iconSize} className="text-[#2681FF] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Duration</span>
            <span className={`${valueCls} text-[#333743] truncate`}>
              {nights} nights
            </span>
          </div>
          <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
        </div>

        {openPanel === "duration" && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] py-2 min-w-[160px] max-h-[320px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Simple list of night options — values are operator-configured.
                We show 3–14 as the full range; in production this comes from config. */}
            {Array.from({ length: 12 }, (_, i) => i + 3).map((n) => (
              <button
                key={n}
                onClick={(e) => {
                  e.stopPropagation();
                  setNights(n);
                  // Recompute return date if a departure is already selected
                  if (dateRange?.from) {
                    setDateRange({ from: dateRange.from, to: addDays(dateRange.from, n) });
                  }
                  setOpenPanel(null);
                }}
                className={`w-full text-left px-4 py-2.5 text-[14px] font-medium transition-colors flex items-center justify-between ${
                  nights === n
                    ? "bg-[#EFF6FF] text-[#2681FF] font-bold"
                    : "text-[#333743] hover:bg-[#f9fafb]"
                }`}
              >
                {n} nights
                {nights === n && <Check size={14} className="text-[#2681FF]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── DATES ─────────────────────────────────────────────────────────── */}
      <div className="relative flex-[1.2]">
        <div
          className={`${fieldBase(openPanel === "dates")} cursor-pointer`}
          onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}
        >
          <CalendarIcon size={iconSize} className="text-[#2681FF] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>
              {dateMode === "flexible" ? "Flexible dates" : "Departure date"}
            </span>
            <span
              className={`${valueCls} truncate ${
                (dateMode === "specific" && dateRange?.from) ||
                (dateMode === "flexible" && selectedMonths.length > 0)
                  ? "text-[#333743]"
                  : "text-[#9598a4] font-normal"
              }`}
            >
              {dateSummary}
            </span>
          </div>
          <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
        </div>

        {openPanel === "dates" && (
          // max-h + overflow-y-auto: if the calendar is near the bottom of the
          // viewport it won't clip — the panel becomes scrollable instead.
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] animate-in fade-in zoom-in-95 duration-150 max-h-[calc(100vh-180px)] overflow-y-auto">

            {/* Mode toggle — only visible for cached destinations */}
            {isCached && (
              <div className="flex border-b border-[#e0e2e8] px-2">
                {(["specific", "flexible"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateMode(mode);
                    }}
                    className={`relative py-3 px-5 text-[13px] font-bold transition-colors ${
                      dateMode === mode
                        ? "text-[#2681FF]"
                        : "text-[#9598a4] hover:text-[#333743]"
                    }`}
                  >
                    {mode === "specific" ? "📅  Specific Date" : "✦  Flexible Dates"}
                    {dateMode === mode && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2681FF] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── SPECIFIC DATE: DayPicker ── */}
            {/* User picks a departure date only. The return date is auto-calculated
                as departure + the selected number of nights from the Duration strip below.
                For cached destinations (Cancún), each day cell also shows:
                  - the best available price for that departure date
                  - an amber tint on the cheapest day of each month ("best deal")
                  - a grey tint across the stay nights to visualise trip duration
                  - a blue ring on the return day */}
            {dateMode === "specific" && (
              <div className="p-4">
                <style>{`
                  /* v9: root class is .rdp-root, not .rdp */
                  .rdp-root {
                    --rdp-accent-color: #2681FF;
                    --rdp-accent-background-color: rgba(38,129,255,0.10);
                    --rdp-day_button-border-radius: 8px;
                    margin: 0;
                  }
                  ${isCached ? `
                    /* Wider cells for the price-per-day view */
                    .rdp-root {
                      --rdp-day-width: 60px;
                      --rdp-day-height: 60px;
                      --rdp-day_button-width: 58px;
                      --rdp-day_button-height: 58px;
                    }
                  ` : ""}
                `}</style>
                <DayPicker
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(date) => {
                    if (!date) return;
                    // Auto-set the return date based on currently selected nights
                    setDateRange({ from: date, to: addDays(date, nights) });
                  }}
                  // Single month keeps the panel narrow so it never overflows the
                  // viewport. For the price-per-day view the taller cells (60px) make
                  // one month tall enough; users navigate with the ← → arrows.
                  // Non-cached destinations use the standard two-month layout.
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                  // ── Modifiers add CSS backgrounds to specific day groups ──────
                  // Using modifiersStyles (inline styles) instead of Tailwind classes
                  // because DayPicker's own styles have higher specificity in some builds.
                  modifiers={isCached ? {
                    // Nights between departure and return
                    stay: stayDates,
                    // The return day itself
                    ...(returnDate ? { tripReturn: [returnDate] } : {}),
                    // The cheapest departure day(s) in each visible month.
                    // We exclude the currently selected date so DayPicker's own blue
                    // "selected" background is never overridden by our inline style.
                    bestDeal: dateRange?.from
                      ? bestDealDates.filter(
                          d => format(d, "yyyy-MM-dd") !== format(dateRange.from!, "yyyy-MM-dd")
                        )
                      : bestDealDates,
                  } : {}}
                  modifiersStyles={isCached ? {
                    // borderRadius must match --rdp-day_button-border-radius (8px).
                    // modifiersStyles targets the .rdp-day wrapper (the td), not the
                    // button inside — so we must set borderRadius here explicitly,
                    // otherwise the background is a square behind the rounded button.
                    stay:       { backgroundColor: "#f0f4f8", borderRadius: "8px" },
                    tripReturn: { backgroundColor: "#dbeafe", outline: "1px solid #93c5fd", outlineOffset: "-1px", borderRadius: "8px" },
                    bestDeal:   { backgroundColor: "#EFF6FF", borderRadius: "8px" },
                  } : {}}
                  // ── DayButton: inject day-number + price inside each cell ───
                  // react-day-picker v9 replaced DayContent with DayButton.
                  // DayButton replaces the whole button — we spread {...buttonProps}
                  // to preserve click, disabled, aria, and DayPicker's own class names,
                  // then add our custom content (day number + price) inside.
                  //
                  // day.isoDate is already "yyyy-MM-dd" (built into v9 CalendarDay).
                  // modifiers.selected / modifiers.disabled come from DayPicker.
                  components={isCached ? {
                    DayButton: ({ day, modifiers, ...buttonProps }) => {
                      const dateStr = day.isoDate;  // "yyyy-MM-dd", no format() needed
                      const price = departurePriceMap.get(dateStr);
                      const monthKey = dateStr.substring(0, 7);
                      // Is this the cheapest departure in its month?
                      const isBestDeal = price !== undefined && price === bestPricePerMonth.get(monthKey);
                      // modifiers.disabled → past date or otherwise unavailable
                      const isDisabled = modifiers.disabled ?? false;
                      return (
                        <button {...buttonProps}>
                          <span className="flex flex-col items-center justify-center gap-0 leading-none">
                            {/* ★ badge — always blue, always visible on cheapest day */}
                            {isBestDeal && !isDisabled && (
                              <span className="text-[9px] font-black leading-none mb-0.5 text-[#2681FF]">
                                ★
                              </span>
                            )}
                            <span className="text-[13px]">{day.date.getDate()}</span>
                            {price !== undefined && !isDisabled && (
                              // 11px is readable inside a 60px cell
                              <span className="text-[11px] font-bold leading-tight mt-0.5 text-[#2681FF]">
                                {price >= 1000
                                  ? `£${(price / 1000).toFixed(1)}k`
                                  : `£${price}`}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    }
                  } : undefined}
                />
              </div>
            )}

            {/* ── FLEXIBLE DATES: month grid ── */}
            {dateMode === "flexible" && (
              <div className="p-4 w-[480px]">
                <p className="text-[12px] text-[#9598a4] mb-3">
                  Select one or more months to see the best deals
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {months.map(({ key, label, price }) => {
                    const isSelected  = selectedMonths.includes(key);
                    const isAvailable = price !== null;
                    return (
                      <button
                        key={key}
                        disabled={!isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAvailable) toggleMonth(key);
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-left transition-all ${
                          isSelected
                            ? "border-[#2681FF] bg-[#EFF6FF]"
                            : isAvailable
                            ? "border-[#e0e2e8] hover:border-[#2681FF] bg-white"
                            : "border-[#f0f0f0] bg-[#fafafa] opacity-40 cursor-not-allowed"
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#2681FF] border-[#2681FF]"
                              : "border-[#d0d5e0]"
                          }`}
                        >
                          {isSelected && <Check size={9} className="text-white" />}
                        </div>

                        {/* Label + price */}
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-[13px] font-bold leading-tight ${
                              isSelected
                                ? "text-[#2681FF]"
                                : isAvailable
                                ? "text-[#333743]"
                                : "text-[#9598a4]"
                            }`}
                          >
                            {label}
                          </span>
                          {isAvailable && (
                            <span className="text-[11px] text-[#667080] leading-tight">
                              from £{price!.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedMonths.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPanel(null);
                    }}
                    className="mt-4 w-full bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[14px] py-2.5 rounded-[10px] transition-colors"
                  >
                    Apply →
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── TRAVELLERS ────────────────────────────────────────────────────── */}
      <div className="relative">
        <div
          className={`${fieldBase(openPanel === "guests")} cursor-pointer min-w-[196px]`}
          onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
        >
          <Users size={iconSize} className="text-[#2681FF] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Travellers</span>
            <span className={`${valueCls} text-[#333743] truncate`}>
              {guestSummary}
            </span>
          </div>
          <ChevronDown size={14} className="text-[#9598a4] shrink-0" />
        </div>

        {openPanel === "guests" && (
          <div className="absolute top-[calc(100%+8px)] right-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-5 w-[280px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            {[
              { label: "Adults",   sub: "Age 12+",  value: adults,   min: 1, set: setAdults   },
              { label: "Children", sub: "Age 2–11", value: children, min: 0, set: setChildren },
            ].map(({ label, sub, value, min, set }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold text-[#333743]">{label}</div>
                  <div className="text-[12px] text-[#9598a4]">{sub}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => set(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="w-8 h-8 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] transition-colors disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[15px] font-bold text-[#333743] w-4 text-center">
                    {value}
                  </span>
                  <button
                    onClick={() => set(Math.min(9, value + 1))}
                    className="w-8 h-8 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setOpenPanel(null)}
              className="w-full bg-[#2681FF] text-white font-bold text-[14px] py-2.5 rounded-[10px] hover:bg-[#1a6fd9] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* ── SEARCH BUTTON ─────────────────────────────────────────────────── */}
      <button
        onClick={handleSearch}
        className={`shrink-0 bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-black ${
          variant === "hero"
            ? "text-[16px] h-[52px] px-6 rounded-[12px]"
            : "text-[14px] h-[48px] px-5 rounded-[8px]"
        } transition-colors flex items-center justify-center gap-2 whitespace-nowrap`}
      >
        <Search size={variant === "hero" ? 20 : 16} />
        {variant === "hero" ? "Search Holidays" : "Search"}
      </button>
    </div>
  );
}
