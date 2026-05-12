// ─────────────────────────────────────────────────────────────────────────────
// CruiseSearchForm
//
// Cruise-specific search form, used in two places:
//   • variant="hero"    → DiscoveryPage Cruises tab (large 52px fields)
//   • variant="compact" → CruiseListPage top bar (48px fields, icon-only btn)
//
// Mirrors the visual language of ActivitySearchForm but with cruise fields:
//   1. Region        — single-select from CRUISE_REGIONS (or Any)
//   2. When          — month picker (grid of "Jul 2026" tiles, not a calendar)
//   3. Duration      — single-select: Any / 2–5 / 6–9 / 10+ nights
//   4. Passengers    — counter (+/-) same as ActivitySearchForm
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import {
  Globe,
  Calendar as CalendarIcon,
  Users,
  Search,
  ChevronDown,
  Plus,
  Minus,
  Check,
  Clock,
  Ship,
} from "lucide-react";
import { cn } from "../../../shared/components/ui/utils";
import type { CruiseRegion, CruiseSearchCriteria } from "../../../types";

// ── Constants — exported so other components can reuse the option lists ────

export const CRUISE_REGION_OPTIONS: CruiseRegion[] = [
  "Caribbean",
  "Mediterranean",
  "Northern Europe",
  "Alaska",
  "Asia",
  "South Pacific",
  "Transatlantic",
];

export const CRUISE_DURATION_OPTIONS: {
  id: CruiseSearchCriteria["durationRange"];
  label: string;
}[] = [
  { id: "any",   label: "Any length"   },
  { id: "short", label: "2–5 nights"   },
  { id: "week",  label: "6–9 nights"   },
  { id: "long",  label: "10+ nights"   },
];

// Generate a list of upcoming months for the When picker.
// We return 12 months starting from the current month so the form always
// shows useful options regardless of when the user opens the prototype.
function getUpcomingMonths(count: number = 12): { id: string; label: string }[] {
  const months: { id: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    months.push({ id: `${year}-${month}`, label });
  }
  return months;
}

type OpenPanel = "region" | "month" | "duration" | "guests" | null;

type Props = {
  variant: "hero" | "compact";
  initialValues?: Partial<CruiseSearchCriteria>;
  onSearch: (criteria: CruiseSearchCriteria) => void;
};

export default function CruiseSearchForm({
  variant,
  initialValues,
  onSearch,
}: Props) {
  // ── Form state — seeded from any criteria passed in ───────────────────
  const [region, setRegion] = useState<CruiseRegion | "">(initialValues?.region ?? "");
  const [departureMonth, setDepartureMonth] = useState<string>(initialValues?.departureMonth ?? "");
  const [durationRange, setDurationRange] = useState<CruiseSearchCriteria["durationRange"]>(
    initialValues?.durationRange ?? "any",
  );
  const [passengers, setPassengers] = useState(initialValues?.passengers ?? 2);

  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate the upcoming-months grid once per mount
  const monthOptions = useRef(getUpcomingMonths(12)).current;

  // ── Close all dropdowns on outside click ─────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!containerRef.current?.contains(target)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Submit — convert internal state into a CruiseSearchCriteria object ──
  const handleSearch = () => {
    setOpenPanel(null);
    onSearch({
      region,
      cruiseLine: initialValues?.cruiseLine ?? "",
      departureMonth,
      durationRange,
      passengers,
    });
  };

  // ── Human-readable summaries shown inside each field ────────────────────
  const regionSummary = region || "Any region";
  const monthSummary =
    departureMonth
      ? (monthOptions.find((m) => m.id === departureMonth)?.label ?? departureMonth)
      : "Any month";
  const durationSummary =
    CRUISE_DURATION_OPTIONS.find((d) => d.id === durationRange)?.label ?? "Any length";
  const guestSummary = `${passengers} ${passengers === 1 ? "Passenger" : "Passengers"}`;

  // ── Sizing tokens (match ActivitySearchForm so siblings feel consistent)
  const h = variant === "hero" ? "h-[52px]" : "h-[48px]";
  const r = variant === "hero" ? "rounded-xl" : "rounded-lg";
  const labelCls =
    "text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5";
  // 16px on mobile to prevent iOS Safari zooming on focus
  const valueCls =
    variant === "hero"
      ? "text-base md:text-sm font-semibold"
      : "text-base md:text-xs font-semibold";
  const iconSize = variant === "hero" ? 18 : 16;
  const fieldGap = variant === "hero" ? "gap-3" : "gap-2";

  const fieldBase = (active: boolean) =>
    cn(
      h,
      r,
      "border px-4 flex items-center gap-3 transition-colors w-full text-left",
      active
        ? "border-primary ring-2 ring-primary/20 bg-card"
        : "border-border bg-card hover:border-primary"
    );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row ${fieldGap} w-full`}
    >
      {/* ── REGION ─────────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <button
          className={cn(fieldBase(openPanel === "region"), "cursor-pointer")}
          onClick={() => setOpenPanel(openPanel === "region" ? null : "region")}
        >
          <Globe size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Region</span>
            <span className={cn(valueCls, "text-foreground truncate")}>
              {regionSummary}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-grey shrink-0 transition-transform",
              openPanel === "region" && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {openPanel === "region" && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-xl border border-border p-2 min-w-[260px] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
            {/* "Any region" — clears the selection */}
            <button
              onClick={() => {
                setRegion("");
                setOpenPanel(null);
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm font-medium",
                region === ""
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-grey-light"
              )}
            >
              Any region
            </button>

            {CRUISE_REGION_OPTIONS.map((opt) => {
              const isSelected = region === opt;
              return (
                <button
                  key={opt}
                  onClick={() => {
                    setRegion(opt);
                    setOpenPanel(null);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm font-medium",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-grey-light"
                  )}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <Check size={14} className="text-primary" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DEPARTURE MONTH ─────────────────────────────────────────────── */}
      <div className="relative flex-[1.2]">
        <button
          className={cn(fieldBase(openPanel === "month"), "cursor-pointer")}
          onClick={() => setOpenPanel(openPanel === "month" ? null : "month")}
        >
          <CalendarIcon size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>When</span>
            <span
              className={cn(
                valueCls,
                "truncate",
                departureMonth ? "text-foreground" : "text-grey font-normal"
              )}
            >
              {monthSummary}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-grey shrink-0 transition-transform",
              openPanel === "month" && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {openPanel === "month" && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-xl border border-border p-4 w-[340px] animate-in fade-in zoom-in-95 duration-150">
            <p className="text-xs font-bold text-grey uppercase tracking-wide mb-3">
              Pick a departure month
            </p>
            <div className="grid grid-cols-3 gap-2">
              {monthOptions.map((m) => {
                const isSelected = departureMonth === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setDepartureMonth(m.id);
                      setOpenPanel(null);
                    }}
                    className={cn(
                      "h-12 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center",
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-border bg-card text-foreground hover:border-primary"
                    )}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {departureMonth && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDepartureMonth("");
                }}
                className="mt-3 text-xs text-grey hover:text-foreground"
              >
                Clear month
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── DURATION ────────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <button
          className={cn(fieldBase(openPanel === "duration"), "cursor-pointer")}
          onClick={() => setOpenPanel(openPanel === "duration" ? null : "duration")}
        >
          <Clock size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Duration</span>
            <span className={cn(valueCls, "text-foreground truncate")}>
              {durationSummary}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-grey shrink-0 transition-transform",
              openPanel === "duration" && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {openPanel === "duration" && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-xl border border-border p-2 min-w-[220px] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
            {CRUISE_DURATION_OPTIONS.map((opt) => {
              const isSelected = durationRange === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setDurationRange(opt.id);
                    setOpenPanel(null);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm font-medium",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-grey-light"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={14} className="text-primary" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PASSENGERS ──────────────────────────────────────────────────── */}
      <div className="relative">
        <button
          className={cn(fieldBase(openPanel === "guests"), "cursor-pointer min-w-[160px]")}
          onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
        >
          <Users size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Passengers</span>
            <span className={cn(valueCls, "text-foreground truncate")}>
              {guestSummary}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-grey shrink-0 transition-transform",
              openPanel === "guests" && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {openPanel === "guests" && (
          <div className="absolute top-[calc(100%+8px)] right-0 z-50 bg-card rounded-xl shadow-xl border border-border p-5 w-[260px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Passengers</div>
                <div className="text-xs text-grey">Sharing a cabin</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  disabled={passengers <= 1}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                  aria-label="Decrease passengers"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span className="text-sm font-bold text-foreground w-4 text-center">
                  {passengers}
                </span>
                <button
                  onClick={() => setPassengers(Math.min(12, passengers + 1))}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  aria-label="Increase passengers"
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setOpenPanel(null)}
              className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* ── SEARCH BUTTON ───────────────────────────────────────────────── */}
      <button
        onClick={handleSearch}
        className={cn(
          "shrink-0 bg-primary hover:brightness-85 text-white font-extrabold",
          variant === "hero"
            ? "text-base h-[52px] px-6 rounded-xl"
            : "text-sm h-[48px] px-5 rounded-lg",
          "transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        )}
        aria-label={variant === "hero" ? "Search cruises" : "Search"}
      >
        {variant === "hero" ? (
          <>
            <Ship size={20} aria-hidden="true" />
            Search cruises
          </>
        ) : (
          <Search size={16} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
