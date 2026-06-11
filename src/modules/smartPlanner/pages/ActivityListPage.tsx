// ─────────────────────────────────────────────────────────────────────────────
// ActivityListPage
//
// Search-results page for activities. Mirrors the layout of HolidayListPage
// (split layout: cards on the left, map on the right, filter pills above) but
// is much simpler — there's no live search, no live/cache merge, and no rate
// calendar. We start from the static ALL_ACTIVITIES dataset and apply
// client-side filters and sorts.
//
// Filter pills:
//   • Sort           — Recommended / Price ↑ / Price ↓ / Top rated
//   • Duration       — 1–3 / 4–7 / 8–14 / 15+ days
//   • Price          — dual-handle slider over the per-person price range
//
// Note: Activity type is not exposed as a filter here — it's already a search
// criterion (picked in ActivitySearchForm above and on the Discovery hero),
// so duplicating it as a pill would be redundant. The search criterion still
// narrows results via `searchCriteria.activityTypes`.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown,
  Check,
  ArrowUpDown,
  Clock,
  Tag,
} from "lucide-react";
import { BackButton } from "../../../shared/components/BackButton";
import { PageContainer } from "../../../shared/components/PageContainer";
import { cn } from "../../../shared/components/ui/utils";
import LeafletMap, {
  type MapMarkerData,
} from "../../../shared/components/LeafletMap";
import type { Activity, ActivitySearchCriteria } from "../../../types";
import { ALL_ACTIVITIES } from "../../../mocks/activities";
import ActivitySearchForm, { CRUISE_DESTINATION_GROUPS } from "../components/ActivitySearchForm";
import { SearchSummary } from "../components/SearchSummary";
import { format, parseISO } from "date-fns";
import { ActivityCard } from "../components/ActivityCard";
// Loading kit — vertical SkeletonCards while activities "load" briefly
// (matches the doc's 1s–3s tier), then a 60ms staggered reveal.
import { SkeletonCard, StaggeredList } from "../../../shared/components/loading";

// ── Filter option constants ──────────────────────────────────────────────────

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc",   label: "Price: low to high" },
  { id: "price-desc",  label: "Price: high to low" },
  { id: "rating",      label: "Top rated" },
] as const;

type SortId = typeof SORT_OPTIONS[number]["id"];

// Duration buckets — values are inclusive ranges in days
const DURATION_OPTIONS = [
  { id: "short",   label: "1–3 days",   min: 1,  max: 3   },
  { id: "week",    label: "4–7 days",   min: 4,  max: 7   },
  { id: "long",    label: "8–14 days",  min: 8,  max: 14  },
  { id: "epic",    label: "15+ days",   min: 15, max: 999 },
] as const;

// Which dropdown is open. Only one open at a time, like in HolidayListPage.
type FilterDropdown =
  | "sort"
  | "duration"
  | "price"
  | null;

// ── Sub-components ───────────────────────────────────────────────────────────

// FilterButton — single pill in the horizontal filter bar.
const FilterButton = ({
  label,
  active,
  hasSelection,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  hasSelection?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all shrink-0",
      active || hasSelection
        ? "bg-primary border-primary text-white"
        : "bg-card border-border text-foreground hover:border-primary"
    )}
  >
    {icon}
    {label}
    <ChevronDown
      size={14}
      className={cn("transition-transform", active && "rotate-180")}
      aria-hidden="true"
    />
  </button>
);

const CheckboxRow = ({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    className="flex items-center gap-3 cursor-pointer group py-2 w-full text-left"
    onClick={onChange}
  >
    <div
      className={cn(
        "w-5 h-5 rounded-sm border flex items-center justify-center transition-colors shrink-0",
        checked
          ? "bg-primary border-primary"
          : "bg-card border-border group-hover:border-primary"
      )}
    >
      {checked && <Check size={14} className="text-white" aria-hidden="true" />}
    </div>
    <span className="text-foreground text-sm font-medium">{label}</span>
  </button>
);

// ── Props ────────────────────────────────────────────────────────────────────

type ActivityListPageProps = {
  searchCriteria: ActivitySearchCriteria;
  // Called when the user clicks an ActivityCard → routes to ActivityDetailPage
  onViewDetail: (activity: Activity) => void;
  onBack: () => void;
  onRefineSearch?: (criteria: ActivitySearchCriteria) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ActivityListPage({
  searchCriteria,
  onBack,
  onRefineSearch,
  onViewDetail,
}: ActivityListPageProps) {
  // ── Brief "searching" state ────────────────────────────────────────────
  // We don't have a real backend in this prototype, but a short skeleton
  // phase makes the page feel like the production app (which queries an
  // activity inventory API). 1.2s lands in the 1s–3s tier — skeleton only,
  // no globe needed.
  const [isSearching, setIsSearching] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setIsSearching(false), 1200);
    return () => clearTimeout(id);
  }, [searchCriteria]);

  // ── Mobile search collapse ───────────────────────────────────────────────
  // On small screens the search form collapses to a compact <SearchSummary>
  // (matching the flight + hotel headers); tapping "Edit search" expands the
  // full form. On desktop the form is always shown, so this flag is ignored
  // there (the form's wrapper is `md:block`).
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  // ── Filter state ────────────────────────────────────────────────────────
  // Sort defaults to "recommended" (the order from ALL_ACTIVITIES).
  const [sortBy, setSortBy] = useState<SortId>("recommended");

  // Activity type narrowing comes straight from the search criteria — there's
  // no list-page filter pill for it (the search form is the single source of
  // truth). When the user clicks e.g. the "Cruises" tab on Discovery, this
  // list arrives pre-filtered to cruise-ships.
  const selectedTypes = searchCriteria.activityTypes;

  // Duration buckets are stored by id ("short" | "week" | …)
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);

  // Price slider — defaults span the full dataset, recomputed below
  const priceBounds = useMemo(() => {
    const prices = ALL_ACTIVITIES.map((a) => a.price.perPerson);
    return { min: Math.floor(Math.min(...prices) / 100) * 100, max: Math.ceil(Math.max(...prices) / 100) * 100 };
  }, []);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    priceBounds.min,
    priceBounds.max,
  ]);

  // ── Open dropdown state — one at a time ────────────────────────────────
  const [openDropdown, setOpenDropdown] = useState<FilterDropdown>(null);

  // Tracks the horizontal offset (in px) of the clicked filter button,
  // measured relative to the filters row container. We use this to position
  // each dropdown panel directly under the button that opened it — otherwise
  // every dropdown would appear pinned to the very left of the filter bar.
  const [dropdownLeft, setDropdownLeft] = useState(0);

  // Click outside to close — same pattern as HolidayListPage / TourDetailPage
  const filtersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Helper: toggle a filter dropdown AND remember where the clicked button
  // sits horizontally so the panel can be anchored under it.
  // We compare bounding rects (rather than offsetLeft) so the math stays
  // correct even when the filter row has been horizontally scrolled on mobile.
  const handleFilterClick = (
    id: Exclude<FilterDropdown, null>,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }
    if (filtersRef.current) {
      const rowLeft = filtersRef.current.getBoundingClientRect().left;
      const btnLeft = e.currentTarget.getBoundingClientRect().left;
      setDropdownLeft(btnLeft - rowLeft);
    }
    setOpenDropdown(id);
  };

  // ── Map hover state ────────────────────────────────────────────────────
  const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);

  // ── Filtering pipeline ─────────────────────────────────────────────────
  // Order: destination match → type → duration → price → sort.
  const filteredActivities = useMemo(() => {
    const destQuery = searchCriteria.destination.trim().toLowerCase();
    // If the user picked a cruise region from the Destination dropdown, the
    // destination field carries the region label. Translate that to the set of
    // allowed activityIds — substring-matching against the label wouldn't hit
    // any individual activity's location (e.g. "Mediterranean & Greek Isles"
    // is not a substring of "Barcelona → Marseille → …").
    const regionMatch = CRUISE_DESTINATION_GROUPS.find(
      (g) => g.label.toLowerCase() === destQuery
    );
    const regionAllowedIds = regionMatch ? new Set(regionMatch.activityIds) : null;

    let list = ALL_ACTIVITIES.filter((a) => {
      // Destination match — region filter (when a cruise region was picked)
      // takes precedence; otherwise substring search against location/title.
      // If the user left it blank the filter is a no-op.
      if (regionAllowedIds) {
        if (!regionAllowedIds.has(a.activityId)) return false;
      } else if (destQuery) {
        const haystack = `${a.location} ${a.title}`.toLowerCase();
        if (!haystack.includes(destQuery)) return false;
      }

      // Type filter — match if no types selected (i.e. all)
      if (selectedTypes.length > 0 && !selectedTypes.includes(a.type)) {
        return false;
      }

      // Duration buckets
      if (selectedDurations.length > 0) {
        const matchesAnyBucket = selectedDurations.some((id) => {
          const bucket = DURATION_OPTIONS.find((o) => o.id === id);
          if (!bucket) return false;
          return a.durationDays >= bucket.min && a.durationDays <= bucket.max;
        });
        if (!matchesAnyBucket) return false;
      }

      // Price range
      if (
        a.price.perPerson < priceRange[0] ||
        a.price.perPerson > priceRange[1]
      ) {
        return false;
      }

      return true;
    });

    // Sort
    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price.perPerson - b.price.perPerson);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price.perPerson - a.price.perPerson);
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => b.rating.score - a.rating.score);
    }

    return list;
  }, [
    searchCriteria.destination,
    selectedTypes,
    selectedDurations,
    priceRange,
    sortBy,
  ]);

  // ── Map markers ────────────────────────────────────────────────────────
  // For multi-stop activities (cruises with routeStops, walking/bicycle routes)
  // we anchor the pin to the first stop. For single-point activities (events,
  // day trips) and cruises that only carry a `location` string, we fall back
  // to the top-level `coordinates` field. Activities with neither are silently
  // dropped from the map — but the data should now provide one or the other
  // for every activity, so this is a defensive guard rather than the rule.
  const mapMarkers: MapMarkerData[] = useMemo(() => {
    return filteredActivities
      .map<MapMarkerData | null>((a) => {
        const stop = a.routeStops?.[0];
        const lat = stop?.lat ?? a.coordinates?.lat;
        const lng = stop?.lng ?? a.coordinates?.lng;
        if (lat == null || lng == null) return null;
        return {
          id: a.activityId,
          lat,
          lng,
          label: a.title,
          price: `${a.price.currency === "GBP" ? "£" : "$"}${a.price.perPerson.toLocaleString()}`,
          isHighlighted: highlightedActivityId === a.activityId,
          image: a.mainImage,
        };
      })
      .filter((m): m is MapMarkerData => m !== null);
  }, [filteredActivities, highlightedActivityId]);

  // ── Filter toggle helpers ───────────────────────────────────────────────
  const toggleDuration = (id: string) => {
    setSelectedDurations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // ── Dropdown panels ─────────────────────────────────────────────────────
  // Each panel is a fixed-width card hanging beneath its pill button.
  const renderDropdown = () => {
    if (!openDropdown) return null;

    if (openDropdown === "sort") {
      return (
        <div
          style={{ left: `${dropdownLeft}px` }}
          className="absolute top-full mt-2 z-30 bg-card rounded-xl shadow-xl border border-border p-2 min-w-[220px] animate-in fade-in zoom-in-95 duration-150"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSortBy(opt.id);
                setOpenDropdown(null);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                sortBy === opt.id
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-grey-light"
              )}
            >
              {opt.label}
              {sortBy === opt.id && <Check size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      );
    }

    if (openDropdown === "duration") {
      return (
        <div
          style={{ left: `${dropdownLeft}px` }}
          className="absolute top-full mt-2 z-30 bg-card rounded-xl shadow-xl border border-border p-3 min-w-[220px] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {DURATION_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.id}
              label={opt.label}
              checked={selectedDurations.includes(opt.id)}
              onChange={() => toggleDuration(opt.id)}
            />
          ))}
        </div>
      );
    }

    if (openDropdown === "price") {
      return (
        <div
          style={{ left: `${dropdownLeft}px` }}
          className="absolute top-full mt-2 z-30 bg-card rounded-xl shadow-xl border border-border p-5 min-w-[280px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div>
            <p className="text-xs font-bold text-grey uppercase tracking-wide mb-2">
              Price per person
            </p>
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>£{priceRange[0].toLocaleString()}</span>
              <span>£{priceRange[1].toLocaleString()}+</span>
            </div>
          </div>
          {/* Two simple range inputs — keep things lightweight and accessible */}
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs text-grey">
              Minimum
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={100}
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([
                    Math.min(Number(e.target.value), priceRange[1]),
                    priceRange[1],
                  ])
                }
                className="accent-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-grey">
              Maximum
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={100}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([
                    priceRange[0],
                    Math.max(Number(e.target.value), priceRange[0]),
                  ])
                }
                className="accent-primary"
              />
            </label>
          </div>
          <button
            onClick={() => setPriceRange([priceBounds.min, priceBounds.max])}
            className="text-xs text-grey hover:text-foreground self-start"
          >
            Reset
          </button>
        </div>
      );
    }

    return null;
  };

  // ── Selection-count helpers — drive the "active" pill state ──────────────
  const durationCount   = selectedDurations.length;
  const priceActive =
    priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max;

  // Center used as a fallback for the map when there are zero markers
  const fallbackCenter: [number, number] = [50, 10];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-grey-lightest min-h-screen flex flex-col relative"
      style={{ fontFamily: "'Mulish', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;900&display=swap');`}</style>

      {/* ══════════════════════════════════════════════════════════════════
          TOP CARD — back button + compact search form
          (same shape as HolidayListPage's header card)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-card border-b border-border">
        <PageContainer tier="wide" className="px-4 md:px-6 pt-5 pb-5 flex flex-col gap-4">
          <BackButton label="Back to discovery" onClick={onBack} />

          {/* Mobile collapsed summary — flight-styled row, small screens only.
              Shows destination → date (if set) → travellers, with an "Edit
              search" button that expands the full form. `md:hidden` keeps this
              scoped to small screens, exactly like the hotel header. */}
          {!isMobileSearchExpanded && (
            <SearchSummary
              className="md:hidden"
              onEdit={() => setIsMobileSearchExpanded(true)}
              items={[
                searchCriteria.destination.trim() || "Anywhere",
                // Optional date — skipped by SearchSummary when "Any time".
                searchCriteria.dateFrom
                  ? format(parseISO(searchCriteria.dateFrom), "d MMM yyyy")
                  : null,
                `${searchCriteria.travellers} traveller${searchCriteria.travellers !== 1 ? "s" : ""}`,
              ]}
            />
          )}

          {/* Full form — always on desktop (md:block); on mobile only once the
              summary's "Edit search" has expanded it. Submitting collapses it
              back to the summary on mobile. */}
          <div className={cn(isMobileSearchExpanded ? "block" : "hidden", "md:block")}>
            <ActivitySearchForm
              variant="compact"
              initialValues={searchCriteria}
              onSearch={(c) => {
                onRefineSearch?.(c);
                setIsMobileSearchExpanded(false);
              }}
            />
          </div>
        </PageContainer>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STICKY FILTER BAR — full-width grey bar that pins under the header
          as the list scrolls. Mirrors HotelListPage's desktop filter bar.
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-grey-lightest sticky top-0 z-30">
        {/* filtersRef stays `relative` so the dropdown panel can anchor under
            its button. It sits OUTSIDE the scrollable pill row, so the
            overflow-x on the pills never clips the open dropdown. */}
        <PageContainer
          as="div"
          tier="wide"
          ref={filtersRef}
          className="relative px-4 md:px-6 py-3"
        >
          {/* Filter pills — horizontal, scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterButton
              label={`Sort: ${SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? ""}`}
              icon={<ArrowUpDown size={14} aria-hidden="true" />}
              active={openDropdown === "sort"}
              onClick={(e) => handleFilterClick("sort", e)}
            />
            <FilterButton
              label={durationCount > 0 ? `Duration (${durationCount})` : "Duration"}
              icon={<Clock size={14} aria-hidden="true" />}
              active={openDropdown === "duration"}
              hasSelection={durationCount > 0}
              onClick={(e) => handleFilterClick("duration", e)}
            />
            <FilterButton
              label="Price"
              icon={<Tag size={14} aria-hidden="true" />}
              active={openDropdown === "price"}
              hasSelection={priceActive}
              onClick={(e) => handleFilterClick("price", e)}
            />
          </div>

          {/* The actual dropdown panel — positioned absolute to the filters row */}
          {renderDropdown()}
        </PageContainer>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN SPLIT — scrollable card list (left) + sticky map (right).
          Mirrors HotelListPage: the outer row is `overflow-hidden` and fills
          the leftover viewport height, so the PAGE doesn't scroll — only the
          left column does (overflow-y-auto). The map fills its column.
      ══════════════════════════════════════════════════════════════════ */}
      <PageContainer tier="wide" className="flex flex-1 overflow-hidden relative">

        {/* LEFT — scrollable list column (65% on md+, full width below) */}
        <div className="w-full md:w-[65%] min-w-0 h-[calc(100vh-130px)] overflow-y-auto p-4 md:p-6 flex flex-col gap-6">

          {/* Result count headline */}
          <h2 className="text-foreground font-extrabold text-xl">
            {filteredActivities.length}{" "}
            {filteredActivities.length === 1 ? "activity" : "activities"} found
          </h2>

          <div className="flex flex-col gap-4 pb-24 md:pb-10">
            {/* Loading skeletons — vertical variant matches the ActivityCard
                layout (image on top, content below). 4 placeholders is enough
                to fill the visible area without noisy excess. */}
            {isSearching ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <SkeletonCard key={i} variant="vertical" />
                ))}
              </>
            ) : filteredActivities.length === 0 ? (
              // Empty state — same vibe as HolidayListPage's empty card
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <p className="text-base font-bold text-foreground mb-1">
                  No activities match your filters
                </p>
                <p className="text-sm text-muted-foreground">
                  Try widening the price range or clearing some filters.
                </p>
              </div>
            ) : (
              <StaggeredList className="flex flex-col gap-4">
                {filteredActivities.map((activity) => (
                  <ActivityCard
                    key={activity.activityId}
                    activity={activity}
                    onSelect={onViewDetail}
                    isHovered={highlightedActivityId === activity.activityId}
                    onHover={(isHovering) =>
                      setHighlightedActivityId(isHovering ? activity.activityId : null)
                    }
                  />
                ))}
              </StaggeredList>
            )}
          </div>
        </div>

        {/* RIGHT — sticky full-height map column (35% on md+), hidden on mobile.
            Full-bleed like HotelListPage — LeafletMap fills the column. */}
        <div className="hidden md:block w-full md:w-[35%] min-w-0 h-[calc(100vh-130px)] sticky top-0">
          <LeafletMap
            markers={mapMarkers}
            center={fallbackCenter}
            zoom={3}
            centerKey={`activities-${selectedTypes.join("|")}-${searchCriteria.destination}`}
            onMarkerHover={setHighlightedActivityId}
            onMarkerClick={(id) => {
              const activity = filteredActivities.find(
                (a) => a.activityId === id
              );
              if (activity) onViewDetail(activity);
            }}
            onMarkerDeselect={() => setHighlightedActivityId(null)}
          />
        </div>

      </PageContainer>
    </div>
  );
}
