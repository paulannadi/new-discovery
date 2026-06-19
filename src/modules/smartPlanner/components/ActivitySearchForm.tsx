// ─────────────────────────────────────────────────────────────────────────────
// ActivitySearchForm
//
// Shared search form used in two places:
//   • variant="hero"    → DiscoveryPage Activities tab (large 52px fields)
//   • variant="compact" → ActivityListPage top bar (48px fields, icon-only btn)
//
// Mirrors the layout of PackageSearchForm but is much simpler — activities
// don't have origin airports, board types, or popular-vs-non-popular
// destination caching, so the form has just four inputs:
//   1. Activity type      (multi-select pill chips inside a dropdown)
//   2. Destination        (free-text)
//   3. When               (single-date Calendar — optional)
//   4. Travellers         (counter)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Search,
  ChevronDown,
  Plus,
  Minus,
  Check,
  Compass,
  Ship,
  Anchor,
  Bike,
  Footprints,
  Map as MapIcon,
  Tent,
  Mountain,
  Ticket,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import "react-day-picker/dist/style.css";
import { cn } from "../../../shared/components/ui/utils";
// Shared design-system date picker (token-based, no hardcoded colors).
import { Calendar } from "../../../shared/components/ui/calendar";
// Shared responsive date picker: dropdown on desktop, bottom drawer on mobile.
import { ResponsiveDatePicker } from "../../../shared/components/ui/responsive-date-picker";
import type { ActivitySearchCriteria, ActivityType } from "../../../types";
// Pull real mock data so the Destination dropdown only shows places we
// actually have activities for. Keeps the prototype honest: clicking a
// suggestion always lands the user on a populated results list.
import { ALL_ACTIVITIES } from "../../../mocks/activities";

// ── Activity type metadata ───────────────────────────────────────────────────
// Single source of truth for the activity-type icon + label mapping.
// Used by both this form and the cards/detail pages so labels stay in sync.
export const ACTIVITY_TYPE_OPTIONS: {
  id: ActivityType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "cruise-ship",    label: "Ocean Cruise",    icon: <Ship       size={14} aria-hidden="true" /> },
  { id: "river-cruise",   label: "River cruise",    icon: <Anchor     size={14} aria-hidden="true" /> },
  { id: "multi-day-tour", label: "Multi-day tour",  icon: <MapIcon    size={14} aria-hidden="true" /> },
  { id: "walking-tour",   label: "Walking tour",    icon: <Footprints size={14} aria-hidden="true" /> },
  { id: "bicycle-tour",   label: "Bicycle tour",    icon: <Bike       size={14} aria-hidden="true" /> },
  { id: "safari",         label: "Safari",          icon: <Tent       size={14} aria-hidden="true" /> },
  { id: "expedition",     label: "Expedition",      icon: <Mountain   size={14} aria-hidden="true" /> },
  // Ticketed events — Wimbledon, Oktoberfest, Rio Carnival, etc.
  // Grouped together so travellers can browse "trips built around an event"
  // as a single category.
  { id: "event",          label: "Events",          icon: <Ticket     size={14} aria-hidden="true" /> },
];

// ── Cruise destination groupings ─────────────────────────────────────────────
// When the form is locked to cruise types (the Cruises tab on Discovery), the
// Destination dropdown shows these regions as the selectable options. Picking
// a region populates the destination input with the region label and submits
// it as the search criteria — ActivityListPage recognises the label and filters
// to activities whose activityId is in the region's list.
// Exported so the list page can share the same mapping (single source of truth).
export const CRUISE_DESTINATION_GROUPS: { label: string; activityIds: string[] }[] = [
  {
    label: "Mediterranean & Greek Isles",
    activityIds: ["western-mediterranean-explorer", "greek-islands-turkey"],
  },
  {
    label: "The Caribbean & Bahamas",
    activityIds: ["caribbean-island-hopping", "disney-magic-at-sea"],
  },
  {
    label: "Fjords & Alaska",
    activityIds: ["norwegian-fjords-cruise", "alaska-inside-passage"],
  },
  {
    label: "European rivers & lakes",
    activityIds: ["rhine-river-cruise", "lake-geneva-sunset-cruise"],
  },
];

type OpenPanel = "type" | "destination" | "dates" | "guests" | null;

type Props = {
  variant: "hero" | "compact";
  initialValues?: Partial<ActivitySearchCriteria>;
  onSearch: (criteria: ActivitySearchCriteria) => void;
  // When set, the Activity-type field is hidden and the form always submits
  // these types in the criteria. Used by the Cruises / Events tabs on
  // Discovery, where the tab itself is the activity type.
  lockedActivityTypes?: ActivityType[];
};

export default function ActivitySearchForm({
  variant,
  initialValues,
  onSearch,
  lockedActivityTypes,
}: Props) {
  // ── Form state — initialised from any criteria passed in ───────────────────
  const [destination, setDestination] = useState(initialValues?.destination ?? "");
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(
    initialValues?.activityTypes ?? []
  );
  const [travellers, setTravellers] = useState(initialValues?.travellers ?? 2);

  // Activities happen on a single day, so we track one date (not a range). We
  // accept it as an ISO string on the way in/out (so the type stays
  // serialisable) but store it as a Date object internally for the Calendar.
  const [date, setDate] = useState<Date | undefined>(() =>
    initialValues?.dateFrom ? parseISO(initialValues.dateFrom) : undefined
  );

  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Close all dropdowns when clicking outside the form ─────────────────────
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleActivityType = (id: ActivityType) => {
    setActivityTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // ── Destination dropdown options ──────────────────────────────────────────
  // The "in-scope" activity types decide which destinations show up:
  //   • Cruises / Events tabs   → use the locked types passed in by Discovery
  //   • Experiences tab w/ user selection → use the user's selected types
  //   • Experiences tab, no selection → all destinations from every activity
  // Deduped so two cruises in "Bergen → Geiranger → Ålesund → Bergen" only
  // show once, and sorted for predictable scanning.
  const availableDestinations = useMemo(() => {
    const types =
      lockedActivityTypes ?? (activityTypes.length > 0 ? activityTypes : null);
    const pool = types
      ? ALL_ACTIVITIES.filter((a) => types.includes(a.type))
      : ALL_ACTIVITIES;
    return Array.from(new Set(pool.map((a) => a.location))).sort();
  }, [lockedActivityTypes, activityTypes]);

  // Type-ahead filter on the dropdown. Substring match keeps it forgiving —
  // typing "Bergen" still surfaces the Norwegian Fjords cruise even though
  // the location starts with "Bergen → …".
  const filteredDestinations = useMemo(() => {
    const q = destination.trim().toLowerCase();
    if (!q) return availableDestinations;
    return availableDestinations.filter((d) => d.toLowerCase().includes(q));
  }, [availableDestinations, destination]);

  // When the form is locked to cruise types, the dropdown shows the region
  // groups themselves as the selectable options (Mediterranean & Greek Isles,
  // The Caribbean & Bahamas, Fjords & Alaska, European rivers & lakes) — no
  // drill-down into individual routes. Returns null otherwise so the dropdown
  // falls back to the flat alphabetical list. Falls back to the typed-query
  // filter as soon as the user starts typing.
  const cruiseRegions = useMemo(() => {
    const isCruiseMode = lockedActivityTypes?.some(
      (t) => t === "cruise-ship" || t === "river-cruise"
    );
    if (!isCruiseMode) return null;
    return CRUISE_DESTINATION_GROUPS.map((g) => g.label);
  }, [lockedActivityTypes]);

  const handleSearch = () => {
    setOpenPanel(null);
    onSearch({
      destination: destination.trim(),
      // When the Activity-type field is hidden (Cruises/Events tabs), the tab
      // itself dictates the type — submit those locked types instead of the
      // (empty) local state.
      activityTypes: lockedActivityTypes ?? activityTypes,
      // Single day → dateFrom carries the chosen date; dateTo stays undefined.
      dateFrom: date ? format(date, "yyyy-MM-dd") : undefined,
      dateTo: undefined,
      travellers,
    });
  };

  // ── Human-readable summary labels for each field ───────────────────────────
  const typeSummary =
    activityTypes.length === 0
      ? "Any activity"
      : activityTypes.length === 1
      ? ACTIVITY_TYPE_OPTIONS.find((o) => o.id === activityTypes[0])?.label ?? ""
      : `${activityTypes.length} activity types`;

  const dateSummary = date ? format(date, "MMM d, yyyy") : "Any time";

  const guestSummary = `${travellers} ${travellers === 1 ? "Traveller" : "Travellers"}`;

  // ── Sizing tokens by variant — match PackageSearchForm exactly so the two
  //    forms feel like siblings on the discovery page hero. ─────────────────
  const h = variant === "hero" ? "h-[52px]" : "h-[48px]";
  const r = variant === "hero" ? "rounded-xl" : "rounded-lg";
  const labelCls =
    "text-[10px] font-bold text-grey uppercase tracking-wide leading-none mb-0.5";
  // 16px text on mobile keeps iOS Safari from auto-zooming on focus
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`flex flex-col lg:flex-row ${fieldGap} w-full`}
    >
      {/* ── ACTIVITY TYPE ─────────────────────────────────────────────────── */}
      {/* Hidden when the parent locks the activity types (Cruises/Events tabs) */}
      {!lockedActivityTypes && (
      <div className="relative flex-1">
        <button
          className={cn(fieldBase(openPanel === "type"), "cursor-pointer")}
          onClick={() => setOpenPanel(openPanel === "type" ? null : "type")}
        >
          <Compass size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Activity type</span>
            <span className={cn(valueCls, "text-foreground truncate")}>
              {typeSummary}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-grey shrink-0 transition-transform",
              openPanel === "type" && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/* Multi-select pill panel — checked types stay selected until cleared */}
        {openPanel === "type" && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-xl border border-border p-3 min-w-[260px] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
            {ACTIVITY_TYPE_OPTIONS.map((opt) => {
              const isSelected = activityTypes.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActivityType(opt.id);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-grey-light"
                  )}
                >
                  {/* Checkbox — same visual style as the holiday list filter pills */}
                  <div
                    className={cn(
                      "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border"
                    )}
                  >
                    {isSelected && (
                      <Check size={11} className="text-white" aria-hidden="true" />
                    )}
                  </div>
                  <span className="shrink-0">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              );
            })}

            {activityTypes.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivityTypes([]);
                }}
                className="mt-1 text-xs text-grey hover:text-foreground self-start px-3 py-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
      )}

      {/* ── DESTINATION ──────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <div
          className={cn(
            h,
            r,
            "border px-4 flex items-center gap-3 transition-colors",
            openPanel === "destination"
              ? "border-primary ring-2 ring-primary/20 bg-card"
              : "border-border bg-card focus-within:border-primary"
          )}
        >
          <MapPin size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Destination</span>
            <input
              type="text"
              value={destination}
              placeholder="Anywhere"
              className={cn(
                "bg-transparent",
                valueCls,
                "text-foreground outline-none placeholder:text-grey placeholder:font-normal w-full"
              )}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setOpenPanel("destination")}
            />
          </div>
        </div>

        {/* Suggestion dropdown — populated from real activity mock data so the
            list reflects the actual content available for the current tab.
            In cruise mode (no typed query) the dropdown shows the four region
            groups as the selectable options. Typing switches to the flat
            substring-filtered list so free-text search still works. */}
        {openPanel === "destination" && (cruiseRegions || availableDestinations.length > 0) && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 lg:right-auto z-50 bg-card rounded-xl shadow-xl border border-border p-2 min-w-[280px] max-h-[320px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {cruiseRegions && !destination.trim() ? (
              // Region-only view for cruises — one row per region, no routes.
              cruiseRegions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDestination(region);
                    setOpenPanel(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium text-foreground hover:bg-grey-light transition-colors"
                >
                  <MapPin size={14} className="text-grey shrink-0" aria-hidden="true" />
                  <span className="truncate">{region}</span>
                </button>
              ))
            ) : filteredDestinations.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No matching destinations
              </p>
            ) : (
              filteredDestinations.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDestination(dest);
                    setOpenPanel(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-foreground hover:bg-grey-light transition-colors"
                >
                  <MapPin size={14} className="text-grey shrink-0" aria-hidden="true" />
                  <span className="truncate">{dest}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── DATES (optional) ──────────────────────────────────────────────── */}
      {/* Responsive picker: dropdown on desktop, bottom drawer on mobile. We pass
          the calendar + "Clear date" button as custom children so this picker
          keeps its clear action while still using the shared responsive shell. */}
      <ResponsiveDatePicker
        className="flex-[1.2]"
        open={openPanel === "dates"}
        onOpenChange={(open) => setOpenPanel(open ? "dates" : null)}
        title="When"
        trigger={
          <button
            className={cn(fieldBase(openPanel === "dates"), "cursor-pointer")}
            onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}
          >
            <CalendarIcon size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className={labelCls}>When</span>
              <span
                className={cn(
                  valueCls,
                  "truncate",
                  date ? "text-foreground" : "text-grey font-normal"
                )}
              >
                {dateSummary}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "text-grey shrink-0 transition-transform",
                openPanel === "dates" && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        }
      >
        {/* p-4 wraps both desktop dropdown and mobile drawer content evenly. */}
        <div className="p-4">
          {/* Shared design-system Calendar in single-date mode (token-based, no
              hardcoded hex). Picking a day sets it and closes the panel — the
              same flow as the other pickers, just completed in one click. */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={(picked) => {
              setDate(picked);
              if (picked) setOpenPanel(null);
            }}
            numberOfMonths={1}
            disabled={{ before: new Date() }}
            className="p-0"
          />
          {date && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDate(undefined);
              }}
              className="mt-2 text-xs text-grey hover:text-foreground"
            >
              Clear date
            </button>
          )}
        </div>
      </ResponsiveDatePicker>

      {/* ── TRAVELLERS ────────────────────────────────────────────────────── */}
      <div className="relative">
        <button
          className={cn(fieldBase(openPanel === "guests"), "cursor-pointer min-w-[160px]")}
          onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
        >
          <Users size={iconSize} className="text-primary shrink-0" aria-hidden="true" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className={labelCls}>Travellers</span>
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
                <div className="text-sm font-semibold text-foreground">Travellers</div>
                <div className="text-xs text-grey">All ages</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTravellers(Math.max(1, travellers - 1))}
                  disabled={travellers <= 1}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                  aria-label="Decrease travellers"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span className="text-sm font-bold text-foreground w-4 text-center">
                  {travellers}
                </span>
                <button
                  onClick={() => setTravellers(Math.min(12, travellers + 1))}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                  aria-label="Increase travellers"
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

      {/* ── SEARCH BUTTON ─────────────────────────────────────────────────── */}
      <button
        onClick={handleSearch}
        className={cn(
          "shrink-0 bg-primary hover:brightness-85 text-white font-extrabold",
          variant === "hero"
            ? "text-base h-[52px] px-6 rounded-xl"
            : "text-sm h-[48px] px-5 rounded-lg",
          "transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        )}
        aria-label={variant === "hero" ? "Search activities" : "Search"}
      >
        <Search size={variant === "hero" ? 20 : 16} aria-hidden="true" />
        {variant === "hero" ? "Search activities" : "Search"}
      </button>
    </div>
  );
}
