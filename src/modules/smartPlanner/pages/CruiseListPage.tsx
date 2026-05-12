// ─────────────────────────────────────────────────────────────────────────────
// CruiseListPage
//
// Search-results page for cruises. Mirrors the layout of ActivityListPage:
// split layout with cards on the left and a Leaflet map on the right, with a
// horizontal filter pill row above. Starts from the static ALL_CRUISES dataset
// and applies client-side filters and sorts.
//
// Filter pills:
//   • Sort        — Recommended / Price ↑ / Price ↓ / Top rated / Shortest / Longest
//   • Cruise line — multi-select checkboxes
//   • Region      — multi-select
//   • Duration    — 2–5 / 6–9 / 10+ nights
//   • Price       — dual-handle slider over the per-person fromPerPerson range
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown,
  Check,
  ArrowUpDown,
  Ship,
  Globe,
  Clock,
  Tag,
} from "lucide-react";
import { BackButton } from "../../../shared/components/BackButton";
import { cn } from "../../../shared/components/ui/utils";
import LeafletMap, {
  type MapMarkerData,
} from "../../../shared/components/LeafletMap";
import type {
  Cruise,
  CruiseLine,
  CruiseRegion,
  CruiseSearchCriteria,
} from "../../../types";
import { ALL_CRUISES } from "../../../mocks/cruises";
import CruiseSearchForm, {
  CRUISE_REGION_OPTIONS,
} from "../components/CruiseSearchForm";
import { CruiseCard } from "../components/CruiseCard";
import { SkeletonCard, StaggeredList } from "../../../shared/components/loading";

// ── Filter option constants ──────────────────────────────────────────────────

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended"       },
  { id: "price-asc",   label: "Price: low to high" },
  { id: "price-desc",  label: "Price: high to low" },
  { id: "rating",      label: "Top rated"          },
  { id: "shortest",    label: "Shortest"            },
  { id: "longest",     label: "Longest"             },
] as const;

type SortId = typeof SORT_OPTIONS[number]["id"];

// Duration buckets — inclusive ranges in nights.
// "short"/"week"/"long" line up with the CruiseSearchForm's durationRange ids
// so passing through searchCriteria seeds the filter correctly.
const DURATION_OPTIONS = [
  { id: "short", label: "2–5 nights",  min: 2,  max: 5   },
  { id: "week",  label: "6–9 nights",  min: 6,  max: 9   },
  { id: "long",  label: "10+ nights",  min: 10, max: 999 },
] as const;

const ALL_CRUISE_LINES: CruiseLine[] = [
  "MSC Cruises",
  "Royal Caribbean",
  "Disney Cruise Line",
  "Norwegian Cruise Line",
  "Celebrity Cruises",
  "Costa Cruises",
  "TUI Cruises",
];

type FilterDropdown =
  | "sort"
  | "line"
  | "region"
  | "duration"
  | "price"
  | null;

// ── Sub-components ───────────────────────────────────────────────────────────

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

type CruiseListPageProps = {
  searchCriteria: CruiseSearchCriteria;
  onViewDetail: (cruise: Cruise) => void;
  onBack: () => void;
  onRefineSearch: (criteria: CruiseSearchCriteria) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CruiseListPage({
  searchCriteria,
  onBack,
  onRefineSearch,
  onViewDetail,
}: CruiseListPageProps) {
  // ── Brief "searching" state ────────────────────────────────────────────
  // 1.5s lands in the 1s–3s tier from the loading patterns doc — skeleton only.
  const [isSearching, setIsSearching] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setIsSearching(false), 1500);
    return () => clearTimeout(id);
  }, [searchCriteria]);

  // ── Filter state ────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortId>("recommended");

  // Cruise line filter — multi-select. Pre-seed if the search form passed one.
  const [selectedLines, setSelectedLines] = useState<CruiseLine[]>(
    searchCriteria.cruiseLine ? [searchCriteria.cruiseLine] : [],
  );

  // Region filter — multi-select. Pre-seed if the search form passed one.
  const [selectedRegions, setSelectedRegions] = useState<CruiseRegion[]>(
    searchCriteria.region ? [searchCriteria.region] : [],
  );

  // Duration filter — single-select bucket id (or empty for any). Seeded from
  // the search form's durationRange.
  const [selectedDurations, setSelectedDurations] = useState<string[]>(
    searchCriteria.durationRange !== "any" ? [searchCriteria.durationRange] : [],
  );

  // Price slider — defaults span the whole dataset.
  const priceBounds = useMemo(() => {
    const prices = ALL_CRUISES.map((c) => c.price.fromPerPerson);
    return {
      min: Math.floor(Math.min(...prices) / 100) * 100,
      max: Math.ceil(Math.max(...prices) / 100) * 100,
    };
  }, []);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    priceBounds.min,
    priceBounds.max,
  ]);

  // ── Open dropdown state ────────────────────────────────────────────────
  const [openDropdown, setOpenDropdown] = useState<FilterDropdown>(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const filtersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  const [highlightedCruiseId, setHighlightedCruiseId] = useState<string | null>(null);

  // ── Filtering pipeline ─────────────────────────────────────────────────
  const filteredCruises = useMemo(() => {
    let list = ALL_CRUISES.filter((c) => {
      if (selectedLines.length > 0 && !selectedLines.includes(c.cruiseLine)) {
        return false;
      }
      if (selectedRegions.length > 0 && !selectedRegions.includes(c.region)) {
        return false;
      }
      if (selectedDurations.length > 0) {
        const matchesAnyBucket = selectedDurations.some((id) => {
          const bucket = DURATION_OPTIONS.find((o) => o.id === id);
          if (!bucket) return false;
          return c.durationNights >= bucket.min && c.durationNights <= bucket.max;
        });
        if (!matchesAnyBucket) return false;
      }
      if (
        c.price.fromPerPerson < priceRange[0] ||
        c.price.fromPerPerson > priceRange[1]
      ) {
        return false;
      }
      // Departure month filter — match if any departure falls in the selected
      // month. We compare on the ISO "YYYY-MM" prefix.
      if (searchCriteria.departureMonth) {
        const monthMatches = c.departures.some((d) =>
          d.date.startsWith(searchCriteria.departureMonth),
        );
        if (!monthMatches) return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price.fromPerPerson - b.price.fromPerPerson);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price.fromPerPerson - a.price.fromPerPerson);
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => b.rating.score - a.rating.score);
    } else if (sortBy === "shortest") {
      list = [...list].sort((a, b) => a.durationNights - b.durationNights);
    } else if (sortBy === "longest") {
      list = [...list].sort((a, b) => b.durationNights - a.durationNights);
    }

    return list;
  }, [
    selectedLines,
    selectedRegions,
    selectedDurations,
    priceRange,
    searchCriteria.departureMonth,
    sortBy,
  ]);

  // ── Map markers ────────────────────────────────────────────────────────
  // Use the cruise's lat/lng (or the first port's coords as a fallback).
  const mapMarkers: MapMarkerData[] = useMemo(() => {
    return filteredCruises
      .map<MapMarkerData | null>((c) => {
        const lat = c.lat ?? c.ports[0]?.lat;
        const lng = c.lng ?? c.ports[0]?.lng;
        if (lat == null || lng == null) return null;
        return {
          id: c.cruiseId,
          lat,
          lng,
          label: c.title,
          price: `${c.price.currency === "GBP" ? "£" : "$"}${c.price.fromPerPerson.toLocaleString()}`,
          isHighlighted: highlightedCruiseId === c.cruiseId,
          image: c.mainImage,
        };
      })
      .filter((m): m is MapMarkerData => m !== null);
  }, [filteredCruises, highlightedCruiseId]);

  // ── Filter toggle helpers ───────────────────────────────────────────────
  const toggleLine = (line: CruiseLine) => {
    setSelectedLines((prev) =>
      prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]
    );
  };

  const toggleRegion = (region: CruiseRegion) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleDuration = (id: string) => {
    setSelectedDurations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // ── Dropdown panels ─────────────────────────────────────────────────────
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

    if (openDropdown === "line") {
      return (
        <div
          style={{ left: `${dropdownLeft}px` }}
          className="absolute top-full mt-2 z-30 bg-card rounded-xl shadow-xl border border-border p-3 min-w-[260px] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {ALL_CRUISE_LINES.map((line) => (
            <CheckboxRow
              key={line}
              label={line}
              checked={selectedLines.includes(line)}
              onChange={() => toggleLine(line)}
            />
          ))}
        </div>
      );
    }

    if (openDropdown === "region") {
      return (
        <div
          style={{ left: `${dropdownLeft}px` }}
          className="absolute top-full mt-2 z-30 bg-card rounded-xl shadow-xl border border-border p-3 min-w-[240px] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {CRUISE_REGION_OPTIONS.map((region) => (
            <CheckboxRow
              key={region}
              label={region}
              checked={selectedRegions.includes(region)}
              onChange={() => toggleRegion(region)}
            />
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
      const currencyPrefix = ALL_CRUISES[0]?.price.currency === "GBP" ? "£" : "$";
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
              <span>{currencyPrefix}{priceRange[0].toLocaleString()}</span>
              <span>{currencyPrefix}{priceRange[1].toLocaleString()}+</span>
            </div>
          </div>
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
  const lineCount      = selectedLines.length;
  const regionCount    = selectedRegions.length;
  const durationCount  = selectedDurations.length;
  const priceActive =
    priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max;

  const fallbackCenter: [number, number] = [40, 0];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-grey-lightest"
      style={{ fontFamily: "'Mulish', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;900&display=swap');`}</style>

      {/* ══════════════════════════════════════════════════════════════════
          TOP CARD — back button + compact search form (same shape as
          ActivityListPage's header card)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 pt-5 pb-5 flex flex-col gap-4">
          <BackButton label="Back to discovery" onClick={onBack} />
          <CruiseSearchForm
            variant="compact"
            initialValues={searchCriteria}
            onSearch={onRefineSearch}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BODY — filter pills + split layout
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-8">

        {/* ── Filter pills row ── */}
        <div ref={filtersRef} className="relative mb-5 md:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterButton
              label={`Sort: ${SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? ""}`}
              icon={<ArrowUpDown size={14} aria-hidden="true" />}
              active={openDropdown === "sort"}
              onClick={(e) => handleFilterClick("sort", e)}
            />
            <FilterButton
              label={lineCount > 0 ? `Cruise line (${lineCount})` : "Cruise line"}
              icon={<Ship size={14} aria-hidden="true" />}
              active={openDropdown === "line"}
              hasSelection={lineCount > 0}
              onClick={(e) => handleFilterClick("line", e)}
            />
            <FilterButton
              label={regionCount > 0 ? `Region (${regionCount})` : "Region"}
              icon={<Globe size={14} aria-hidden="true" />}
              active={openDropdown === "region"}
              hasSelection={regionCount > 0}
              onClick={(e) => handleFilterClick("region", e)}
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

          {renderDropdown()}
        </div>

        {/* ── Result count ── */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-foreground">
            <span className="font-bold">{filteredCruises.length}</span>{" "}
            {filteredCruises.length === 1 ? "cruise" : "cruises"} found
          </p>
        </div>

        {/* ── Split layout: cards left, map right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

          {/* LEFT — list of result cards */}
          <div className="flex flex-col gap-4 min-w-0">
            {isSearching ? (
              <>
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} variant="vertical" />
                ))}
              </>
            ) : filteredCruises.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <p className="text-base font-bold text-foreground mb-1">
                  No cruises match your filters
                </p>
                <p className="text-sm text-muted-foreground">
                  Try widening the price range or clearing some filters.
                </p>
              </div>
            ) : (
              <StaggeredList className="flex flex-col gap-4">
                {filteredCruises.map((cruise) => (
                  <CruiseCard
                    key={cruise.cruiseId}
                    cruise={cruise}
                    onSelect={onViewDetail}
                    isHovered={highlightedCruiseId === cruise.cruiseId}
                    onHover={(isHovering) =>
                      setHighlightedCruiseId(isHovering ? cruise.cruiseId : null)
                    }
                  />
                ))}
              </StaggeredList>
            )}
          </div>

          {/* RIGHT — sticky map */}
          <div className="hidden lg:block sticky top-[32px]">
            <div className="rounded-xl overflow-hidden border border-border h-[calc(100vh-120px)] min-h-[500px]">
              <LeafletMap
                markers={mapMarkers}
                center={fallbackCenter}
                zoom={2}
                centerKey={`cruises-${selectedRegions.join("|")}-${selectedLines.join("|")}`}
                onMarkerHover={setHighlightedCruiseId}
                onMarkerClick={(id) => {
                  const cruise = filteredCruises.find(
                    (c) => c.cruiseId === id,
                  );
                  if (cruise) onViewDetail(cruise);
                }}
                onMarkerDeselect={() => setHighlightedCruiseId(null)}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
