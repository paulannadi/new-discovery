import React, { useState, useMemo, useEffect, useRef } from "react";
import { BackButton } from "../../../shared/components/BackButton";
import {
  Search,
  SlidersHorizontal,
  Plane,
  ChevronDown,
  X,
  ArrowUpDown,
  Map as MapIcon,
  Check,
  List,
} from "lucide-react";
import { format } from "date-fns";
import type { HolidaySearchCriteria } from "../../../App";
import type { UnifiedPackage } from "../../../types";
import PackageSearchForm from "../components/PackageSearchForm";
import { PackageCard } from "../components/PackageCard";
import { TourCard } from "../components/TourCard";
import { LiveSearchProgressBanner } from "../components/LiveSearchProgressBanner";
import { SWISS_WINTER_TOUR } from "../../../mocks/tours";
import type { Tour } from "../../../types";
import { useUnifiedSearch } from "../hooks/useUnifiedSearch";
import LeafletMap, { type MapMarkerData } from "../../../shared/components/LeafletMap";
import { DESTINATIONS } from "../../../mocks/destinations";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type HolidayListPageProps = {
  searchCriteria: HolidaySearchCriteria;
  onViewDetail: (pkg: UnifiedPackage) => void;
  // Called when the user clicks a TourCard — routes to TourDetailPage
  onViewTour?: (tour: Tour) => void;
  onBack: () => void;
  onRefineSearch?: (criteria: HolidaySearchCriteria) => void;
};

// Which filter pill dropdown is currently open
type FilterDropdown = "sort" | "duration" | "stars" | "board" | "stops" | "price" | "triptype" | "style" | "country" | null;

// Travel style options — matches the discovery page section
const TRAVEL_STYLE_OPTIONS = [
  "Culture & history",
  "Sun & beach",
  "Safari",
  "Sustainable travel",
  "Spa & wellness",
  "Adventure",
  "Luxury",
] as const;

// Country options derived from the mock destinations
const COUNTRY_OPTIONS = [
  "Mexico",
  "Thailand",
  "Indonesia",
  "Peru",
  "Japan",
  "Morocco",
] as const;

// The trip type values — kept in sync with UnifiedPackage["tripType"] in types/index.ts
const TRIP_TYPE_OPTIONS = [
  { id: "hotel-flight",    label: "Hotel + Flight" },
  { id: "group-tour",      label: "Group Tour" },
  { id: "individual-tour", label: "Individual Tour" },
  { id: "round-trip",      label: "Round Trip" },
  { id: "last-minute",     label: "Last Minute" },
] as const;

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc",   label: "Price: low to high" },
  { id: "price-desc",  label: "Price: high to low" },
  { id: "rating",      label: "Top rated" },
] as const;

type SortId = typeof SORT_OPTIONS[number]["id"];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// FilterButton — pill buttons in the horizontal filter bar.
const FilterButton = ({
  label, active, hasSelection, onClick, icon,
}: {
  label: string;
  active: boolean;
  hasSelection?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
}) => (
  <button
    className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
      active || hasSelection
        ? "bg-[#2681FF] border-[#2681FF] text-white"
        : "bg-white border-[#e0e2e8] text-[#333743] hover:border-[#2681FF]"
    }`}
    onClick={onClick}
  >
    {icon}
    {label}
    <ChevronDown size={14} className={active ? "rotate-180 transition-transform" : "transition-transform"} />
  </button>
);

// CheckboxRow — a single selectable option with a custom checkbox.
const CheckboxRow = ({
  label, checked, onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}) => (
  <div className="flex items-center gap-3 cursor-pointer group py-2" onClick={onChange}>
    <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
      checked ? "bg-[#2681FF] border-[#2681FF]" : "bg-white border-[#e0e2e8] group-hover:border-[#2681FF]"
    }`}>
      {checked && <Check size={14} className="text-white" />}
    </div>
    <span className="text-[#333743] text-[14px] font-medium">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PackageCardSkeleton
//
// A pulsing placeholder that matches the shape of a real PackageCard.
// Shown while non-cached destination packages are still being fetched.
// Each block represents a piece of real content (image, hotel name, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const PackageCardSkeleton = () => (
  <div className="bg-white rounded-[16px] border border-[#e0e2e8] overflow-hidden shadow-sm flex flex-col md:flex-row animate-pulse">
    {/* Left: image placeholder */}
    <div className="md:w-[260px] shrink-0 h-[200px] md:h-auto bg-[#e8eaed]" />

    {/* Right: content placeholder */}
    <div className="flex-1 p-5 flex flex-col gap-3">
      {/* Location line */}
      <div className="h-3 w-32 bg-[#e8eaed] rounded-full" />
      {/* Hotel name */}
      <div className="h-3 w-48 bg-[#e8eaed] rounded-full" />
      {/* Room type */}
      <div className="h-3 w-48 bg-[#e8eaed] rounded-full" />
      {/* Board type */}
      <div className="h-3 w-48 bg-[#e8eaed] rounded-full" />
      {/* Amenity chips */}
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-[#e8eaed] rounded-full" />
        <div className="h-5 w-20 bg-[#e8eaed] rounded-full" />
        <div className="h-5 w-14 bg-[#e8eaed] rounded-full" />
      </div>
      {/* Dates */}
      <div className="h-3 w-52 bg-[#e8eaed] rounded-full" />
      {/* Price + CTA row */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f3f5f6]">
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-20 bg-[#e8eaed] rounded-full" />
          <div className="h-6 w-24 bg-[#e8eaed] rounded-full" />
        </div>
        <div className="h-10 w-28 bg-[#e8eaed] rounded-[10px]" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function HolidayListPage({
  searchCriteria,
  onBack,
  onRefineSearch,
  onViewDetail,
  onViewTour,
}: HolidayListPageProps) {

  // ── Live search state ──────────────────────────────────────────────────────
  // useUnifiedSearch simulates the SSE stream: cached packages arrive first,
  // then live suppliers respond progressively and merge into the list.
  const { packages, isLiveLoading, liveProgress, isNonCachedLoading, pricesReady } = useUnifiedSearch(searchCriteria);

  // ── Non-cached destination progress bar ───────────────────────────────────
  // We need to detect the RISING EDGE of isNonCachedLoading (false → true) and
  // start the bar exactly once per search. We cannot use isNonCachedLoading
  // directly as the dep, because when it flips back to false at t=5s, React
  // would run the cleanup and kill the interval before it reaches 100%.
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoadingBar, setShowLoadingBar] = useState(false);

  // prevIsNonCachedLoadingRef lets us detect the false→true transition.
  const prevIsNonCachedLoadingRef = useRef(false);
  // nonCachedSearchCount increments each time a new non-cached search starts.
  // Using a counter (instead of isNonCachedLoading directly) means the bar
  // effect only re-runs when a NEW search starts, never when loading ends.
  const [nonCachedSearchCount, setNonCachedSearchCount] = useState(0);

  useEffect(() => {
    if (isNonCachedLoading && !prevIsNonCachedLoadingRef.current) {
      // Rising edge detected — a new non-cached search just started
      setNonCachedSearchCount(c => c + 1);
    }
    prevIsNonCachedLoadingRef.current = isNonCachedLoading;
  }, [isNonCachedLoading]);

  // Progress bar effect — only re-runs when nonCachedSearchCount changes
  // (i.e. when a new search starts). Cleanup from the previous search correctly
  // cancels any leftover interval, but does NOT fire mid-fill for the current one.
  useEffect(() => {
    if (nonCachedSearchCount === 0) return;

    setLoadingProgress(0);
    setShowLoadingBar(true);

    const duration = 5000;
    const intervalTime = 20;
    const increment = 100 / (duration / intervalTime);
    let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          // Short pause at full width before fading the bar out
          fadeTimeout = setTimeout(() => setShowLoadingBar(false), 500);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => {
      clearInterval(timer);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [nonCachedSearchCount]);

  // ── Mobile state ──────────────────────────────────────────────────────────
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  // When navigating from a Discovery "View all X" button, searchCriteria carries
  // initialFilters so the list opens with the matching filter already active.
  const { initialFilters } = searchCriteria;

  const [priceMin, setPriceMin] = useState(500);
  const [priceMax, setPriceMax] = useState(5000);
  const [filterStars, setFilterStars] = useState<Set<number>>(new Set());
  const [filterBoard, setFilterBoard] = useState<Set<string>>(new Set());
  // Trip type filter — seed from initialFilters if provided, otherwise empty (show all)
  const [filterTripTypes, setFilterTripTypes] = useState<Set<string>>(
    initialFilters?.tripType ? new Set([initialFilters.tripType]) : new Set()
  );
  // Travel style filter — seed from initialFilters if provided
  const [filterStyles, setFilterStyles] = useState<Set<string>>(
    initialFilters?.style ? new Set([initialFilters.style]) : new Set()
  );
  // Country filter — seed from initialFilters if provided
  const [filterCountries, setFilterCountries] = useState<Set<string>>(
    initialFilters?.country ? new Set([initialFilters.country]) : new Set()
  );
  const [sortBy, setSortBy] = useState<SortId>("recommended");

  // ── Filter pill dropdown state ─────────────────────────────────────────────
  const [openFilter, setOpenFilter] = useState<FilterDropdown>(null);
  const [filterDropdownPos, setFilterDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const toggleSet = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const handleFilterToggle = (type: FilterDropdown, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openFilter === type) {
      setOpenFilter(null);
      setFilterDropdownPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setFilterDropdownPos({ top: rect.bottom + 8, left: rect.left });
      setOpenFilter(type);
    }
  };

  const resetFilters = () => {
    setPriceMin(500); setPriceMax(5000);
    setFilterStars(new Set());
    setFilterBoard(new Set());
    setFilterTripTypes(new Set());
    setFilterStyles(new Set());
    setFilterCountries(new Set());
    setSortBy("recommended");
  };

  // ── Filtered + sorted results ─────────────────────────────────────────────
  // Filters now use UnifiedPackage fields (hotel.category, room.boardType, price.perPerson).
  // Note: there's no "stops" field in UnifiedPackage — that filter is removed.
  const filteredAndSorted = useMemo(() => {
    let results = packages.filter((pkg) => {
      if (pkg.price.perPerson < priceMin || pkg.price.perPerson > priceMax) return false;
      if (filterStars.size > 0 && !filterStars.has(pkg.hotel.category)) return false;
      if (filterBoard.size > 0 && !filterBoard.has(pkg.room.boardType)) return false;
      // Only apply trip type filter when at least one type is selected.
      // Packages without a tripType are included when no filter is active.
      if (filterTripTypes.size > 0 && !filterTripTypes.has(pkg.tripType ?? "")) return false;
      // Country: match against the destination in the search criteria or hotel location
      if (filterCountries.size > 0) {
        const loc = pkg.hotel.location.toLowerCase();
        const matchesCountry = [...filterCountries].some((c) => loc.includes(c.toLowerCase()));
        if (!matchesCountry) return false;
      }
      // Travel style: no style field on packages yet — filter is UI-only for now
      return true;
    });
    switch (sortBy) {
      case "price-asc":  results = [...results].sort((a, b) => a.price.perPerson - b.price.perPerson); break;
      case "price-desc": results = [...results].sort((a, b) => b.price.perPerson - a.price.perPerson); break;
      case "rating":     results = [...results].sort((a, b) => b.hotel.trustYou.rating - a.hotel.trustYou.rating); break;
      default: break;
    }
    return results;
  }, [packages, priceMin, priceMax, filterStars, filterBoard, filterTripTypes, filterCountries, sortBy]);

  // ── Human-readable search summary labels ──────────────────────────────────

  const searchDateLabel = searchCriteria.dateMode === "flexible"
    ? searchCriteria.selectedMonths.length > 0
      ? `${searchCriteria.selectedMonths.length} month${searchCriteria.selectedMonths.length !== 1 ? "s" : ""} selected`
      : "Flexible dates"
    : searchCriteria.dateRange?.from
      ? searchCriteria.dateRange.to
        ? `${format(searchCriteria.dateRange.from, "MMM d")} – ${format(searchCriteria.dateRange.to, "MMM d")}`
        : format(searchCriteria.dateRange.from, "MMM d")
      : "Select dates";

  const getSortLabel = () => SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? "Recommended";

  const activeFilterCount = [
    priceMin > 500 || priceMax < 5000,
    filterStars.size > 0,
    filterBoard.size > 0,
    filterTripTypes.size > 0,
    filterStyles.size > 0,
    filterCountries.size > 0,
  ].filter(Boolean).length;

  // ── Desktop filter dropdown renderer ──────────────────────────────────────
  const renderFilterDropdown = () => {
    if (!openFilter || !filterDropdownPos) return null;

    const style: React.CSSProperties = {
      position: "fixed",
      top: filterDropdownPos.top,
      left: filterDropdownPos.left,
      zIndex: 50,
    };

    if (openFilter === "sort") {
      return (
        <div style={style} className="w-[220px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-2 animate-in fade-in zoom-in-95 duration-200">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setSortBy(opt.id); setOpenFilter(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                sortBy === opt.id ? "bg-[#EFF6FF] text-[#2681FF] font-bold" : "text-[#333743] hover:bg-[#f9fafb]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (openFilter === "stars") {
      return (
        <div style={style} className="w-[200px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-sm mb-3 text-[#333743]">Hotel stars</h4>
          <div className="flex flex-col gap-1">
            {[5, 4, 3, 2].map((s) => (
              <CheckboxRow
                key={s}
                label={<span className="text-[#FFB700] font-bold">{"★".repeat(s)}</span>}
                checked={filterStars.has(s)}
                onChange={() => setFilterStars(toggleSet(filterStars, s))}
              />
            ))}
          </div>
        </div>
      );
    }

    if (openFilter === "board") {
      return (
        <div style={style} className="w-[240px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-sm mb-3 text-[#333743]">Board type</h4>
          <div className="flex flex-col gap-1">
            {["All Inclusive", "Half Board", "Breakfast Included", "Room Only"].map((b) => (
              <CheckboxRow key={b} label={b} checked={filterBoard.has(b)} onChange={() => setFilterBoard(toggleSet(filterBoard, b))} />
            ))}
          </div>
        </div>
      );
    }

    if (openFilter === "triptype") {
      return (
        <div style={style} className="w-[220px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-sm mb-3 text-[#333743]">Trip type</h4>
          <div className="flex flex-col gap-1">
            {TRIP_TYPE_OPTIONS.map((opt) => (
              <CheckboxRow
                key={opt.id}
                label={opt.label}
                checked={filterTripTypes.has(opt.id)}
                onChange={() => setFilterTripTypes(toggleSet(filterTripTypes, opt.id))}
              />
            ))}
          </div>
        </div>
      );
    }

    if (openFilter === "style") {
      return (
        <div style={style} className="w-[220px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-sm mb-3 text-[#333743]">Travel style</h4>
          <div className="flex flex-col gap-1">
            {TRAVEL_STYLE_OPTIONS.map((s) => (
              <CheckboxRow key={s} label={s} checked={filterStyles.has(s)} onChange={() => setFilterStyles(toggleSet(filterStyles, s))} />
            ))}
          </div>
        </div>
      );
    }

    if (openFilter === "country") {
      return (
        <div style={style} className="w-[200px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-sm mb-3 text-[#333743]">Country</h4>
          <div className="flex flex-col gap-1">
            {COUNTRY_OPTIONS.map((c) => (
              <CheckboxRow key={c} label={c} checked={filterCountries.has(c)} onChange={() => setFilterCountries(toggleSet(filterCountries, c))} />
            ))}
          </div>
        </div>
      );
    }

    if (openFilter === "price") {
      return (
        <div style={style} className="w-[260px] bg-white rounded-[12px] shadow-xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-sm mb-3 text-[#333743]">Price per person</h4>
          <div className="flex justify-between text-[13px] text-[#667080] mb-3">
            <span>£{priceMin.toLocaleString()}</span>
            <span>£{priceMax.toLocaleString()}</span>
          </div>
          <div className="relative h-5 flex items-center">
            <div className="absolute w-full h-[4px] bg-[#e0e2e8] rounded-full" />
            <div
              className="absolute h-[4px] bg-[#2681FF] rounded-full"
              style={{
                left: `${((priceMin - 500) / 4500) * 100}%`,
                right: `${100 - ((priceMax - 500) / 4500) * 100}%`,
              }}
            />
            <input
              type="range" min={500} max={5000} step={50} value={priceMin}
              onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax - 50))}
              className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2681FF] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
              style={{ zIndex: priceMin > 4500 ? 5 : 3 }}
            />
            <input
              type="range" min={500} max={5000} step={50} value={priceMax}
              onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin + 50))}
              className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2681FF] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
              style={{ zIndex: 4 }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F3F5F6] flex flex-col">

      {/* Click-away backdrop — closes filter dropdowns when clicking outside */}
      {openFilter && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => { setOpenFilter(null); setFilterDropdownPos(null); }}
        />
      )}

      {/* ── HEADER: editable search criteria ─────────────────────────────── */}
      <div className="bg-white border-b border-[#e0e2e8] relative z-40">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4">

          {/* Back to Discovery — always visible, including on mobile */}
          <BackButton label="Back to discovery" onClick={onBack} className="mb-3" />

          {/* Mobile: collapsed summary row */}
          {!isMobileSearchExpanded && (
            <div className="md:hidden flex items-center justify-between gap-3">
              <div
                className="flex-1 flex flex-col cursor-pointer"
                onClick={() => setIsMobileSearchExpanded(true)}
              >
                <div className="font-bold text-[#333743] text-[15px] flex items-center gap-2">
                  <Plane size={16} className="text-[#2681FF]" />
                  <span className="truncate">
                    {searchCriteria.from || "London"} → {searchCriteria.to || "Anywhere"}
                  </span>
                </div>
                <div className="text-[#9598a4] text-xs mt-0.5 ml-6">
                  {searchDateLabel} · {(searchCriteria.adults || 2) + (searchCriteria.children || 0)} Guests · {searchCriteria.nights || 7} nights
                </div>
              </div>
              <button
                className="text-[#2681FF] font-bold text-sm px-4 py-2 bg-[#f3f5f6] rounded-lg shrink-0"
                onClick={() => setIsMobileSearchExpanded(true)}
              >
                Edit
              </button>
            </div>
          )}

          {/* Search fields — always visible on desktop, toggled on mobile */}
          <div className={`${isMobileSearchExpanded ? "block" : "hidden"} md:block`}>
            <PackageSearchForm
              variant="compact"
              initialValues={searchCriteria}
              onSearch={(criteria) => {
                // onRefineSearch updates searchCriteria in App.tsx, which
                // re-triggers useUnifiedSearch and restarts the SSE sequence.
                onRefineSearch?.(criteria);
                setIsMobileSearchExpanded(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* ── FILTER BAR: desktop ───────────────────────────────────────────── */}
      <div className="hidden md:block bg-[#F3F5F6] sticky top-0 z-30 border-b border-[#e0e2e8]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-3 flex gap-3 overflow-x-auto items-center">

          <FilterButton
            label={`Sort: ${getSortLabel()}`}
            active={openFilter === "sort"}
            hasSelection={sortBy !== "recommended"}
            onClick={(e) => handleFilterToggle("sort", e)}
            icon={<ArrowUpDown size={14} />}
          />

          <FilterButton
            label={filterTripTypes.size > 0
              ? `Trip type (${filterTripTypes.size})`
              : "Trip type"}
            active={openFilter === "triptype"}
            hasSelection={filterTripTypes.size > 0}
            onClick={(e) => handleFilterToggle("triptype", e)}
          />

          <FilterButton
            label={filterStyles.size > 0 ? `Travel style (${filterStyles.size})` : "Travel style"}
            active={openFilter === "style"}
            hasSelection={filterStyles.size > 0}
            onClick={(e) => handleFilterToggle("style", e)}
          />

          <FilterButton
            label={filterCountries.size > 0 ? `Country (${filterCountries.size})` : "Country"}
            active={openFilter === "country"}
            hasSelection={filterCountries.size > 0}
            onClick={(e) => handleFilterToggle("country", e)}
          />

          <FilterButton
            label="Hotel stars"
            active={openFilter === "stars"}
            hasSelection={filterStars.size > 0}
            onClick={(e) => handleFilterToggle("stars", e)}
          />

          <FilterButton
            label="Board type"
            active={openFilter === "board"}
            hasSelection={filterBoard.size > 0}
            onClick={(e) => handleFilterToggle("board", e)}
          />

          <FilterButton
            label={`Price: £${priceMin.toLocaleString()} – £${priceMax.toLocaleString()}`}
            active={openFilter === "price"}
            hasSelection={priceMin > 500 || priceMax < 5000}
            onClick={(e) => handleFilterToggle("price", e)}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-[#2681FF] text-sm font-bold hover:underline ml-3 shrink-0"
            >
              Reset all
            </button>
          )}

        </div>
      </div>

      {/* ── FILTER BAR: mobile ────────────────────────────────────────────── */}
      <div className="md:hidden bg-[#F3F5F6] sticky top-0 z-30 px-4 py-3">
        <div className="bg-white border border-[#e0e2e8] rounded-full flex items-center h-[48px] w-full">
          <button className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-[#333743] first:rounded-l-full">
            <ArrowUpDown size={14} />
            Sort
          </button>
          <div className="w-[1px] h-6 bg-[#e0e2e8]" />
          <button
            className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-[#333743]"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#2681FF] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="w-[1px] h-6 bg-[#e0e2e8]" />
          <button
            className="flex-1 h-full flex items-center justify-center gap-2 text-sm font-bold text-[#333743] last:rounded-r-full"
            onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          >
            {mobileView === "list" ? <MapIcon size={14} /> : <List size={14} />}
            {mobileView === "list" ? "Map" : "List"}
          </button>
        </div>
      </div>

      {/* ── MAIN SPLIT LAYOUT ─────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-[1920px] mx-auto w-full overflow-hidden relative">

        {/* LEFT: package results list */}
        <div className={`w-full md:w-[65%] min-w-0 h-[calc(100vh-160px)] overflow-y-auto p-4 md:p-6 flex flex-col gap-4 ${mobileView === "map" ? "hidden md:flex" : "flex"}`}>

          {/* Results count header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[#333743] font-bold text-[20px]">
              {/* While non-cached search is running, show a searching state */}
              {isNonCachedLoading
                ? "Searching for holidays…"
                : packages.length === 0 && !isLiveLoading
                  ? "No holidays found"
                  : `${filteredAndSorted.length} holiday${filteredAndSorted.length !== 1 ? "s" : ""} found`}
            </h2>

            {/* Progress bar — fills over 5s for non-cached destinations, then fades out.
                Same visual pattern as HotelListPage but with a longer duration. */}
            {showLoadingBar && (
              <div className={`h-1 w-full bg-gray-200/50 rounded-full overflow-hidden transition-opacity duration-500 ${loadingProgress >= 100 ? "opacity-0" : "opacity-100"}`}>
                <div
                  className="h-full bg-[#2681ff] transition-all duration-75 ease-linear"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Skeleton cards — shown while non-cached packages are still being fetched.
              These match the shape of real PackageCards so the transition feels smooth. */}
          {isNonCachedLoading && packages.length === 0 && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => (
                <PackageCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Loading skeleton — shown while the first cached results are loading */}
          {packages.length === 0 && !isLiveLoading && !isNonCachedLoading && (
            // Brief loading state before the 200ms cached results arrive
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[16px] border border-[#e0e2e8] h-[200px] animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state — no results after filtering */}
          {filteredAndSorted.length === 0 && packages.length > 0 && (
            <div className="bg-white rounded-[16px] border border-[#e0e2e8] p-12 text-center flex flex-col items-center">
              <Search size={40} className="text-[#9598a4] mb-4" />
              <div className="text-[18px] font-bold text-[#333743] mb-2">No holidays match your filters</div>
              <div className="text-[14px] text-[#667080] mb-6">Try adjusting the price range, stars, or board type.</div>
              <button
                onClick={resetFilters}
                className="bg-[#2681FF] text-white font-bold px-5 py-2.5 rounded-[10px] hover:bg-[#1a6fd9] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Package card list */}
          {filteredAndSorted.length > 0 && (
            <div className="flex flex-col gap-4 pb-4">
              {/* ── Tour card — always shown at the top of the list.
                  In the real product, tours would come from the same search results.
                  For this prototype we inject the Swiss tour as a featured result. */}
              <TourCard
                tour={SWISS_WINTER_TOUR}
                onSelect={(t) => onViewTour?.(t)}
              />

              {filteredAndSorted.map((pkg) => (
                <PackageCard
                  key={pkg.packageId}
                  pkg={pkg}
                  // During non-cached loading, phase 2 shows cards with details
                  // but no confirmed price yet — PackageCard shows a spinner instead.
                  isPricePending={isNonCachedLoading && !pricesReady}
                  onSelect={(p) => onViewDetail(p)}
                />
              ))}

              {/* Live search progress banner — shows at the bottom of the list
                  while live supplier results are still being fetched.
                  Disappears automatically when all suppliers have responded. */}
              {isLiveLoading && (
                <LiveSearchProgressBanner progress={liveProgress} />
              )}
            </div>
          )}

          {/* Banner shown when we have packages but live is still loading */}
          {isLiveLoading && filteredAndSorted.length === 0 && packages.length === 0 && (
            <LiveSearchProgressBanner progress={liveProgress} />
          )}

        </div>

        {/* RIGHT: real Leaflet world map with destination pins */}
        <div className={`w-full md:w-[35%] min-w-0 h-[calc(100vh-160px)] sticky top-0 ${mobileView === "list" ? "hidden md:block" : "block"}`}>
          {(() => {
            // Look up the selected destination's coordinates so we can centre the map on it.
            // If no destination is selected yet (searchCriteria.to is empty), default to
            // a world overview centred on Europe/Atlantic.
            const selectedDest = DESTINATIONS.find((d) => d.code === searchCriteria.to);
            const mapCenter: [number, number] = selectedDest?.lat && selectedDest?.lng
              ? [selectedDest.lat, selectedDest.lng]
              : [20, 10]; // world overview fallback
            // Zoom in closer for a specific destination, pull back for the overview
            const mapZoom = selectedDest ? 9 : 2;

            // Build marker pins — one per destination in our list.
            // The selected destination marker is highlighted in blue.
            // We also show the lowest package price at that destination if available.
            const lowestPriceByDest = filteredAndSorted.reduce<Record<string, number>>((acc, pkg) => {
              const code = searchCriteria.to; // all packages in a HolidayList search share the same destination
              if (!acc[code] || pkg.price.perPerson < acc[code]) {
                acc[code] = pkg.price.perPerson;
              }
              return acc;
            }, {});

            const markers: MapMarkerData[] = DESTINATIONS
              .filter((d) => d.lat && d.lng)
              .map((d) => ({
                id: d.code,
                lat: d.lat!,
                lng: d.lng!,
                label: d.label,
                // Show a price badge only on the destination being searched
                price: d.code === searchCriteria.to && lowestPriceByDest[d.code]
                  ? `£${lowestPriceByDest[d.code].toLocaleString()}`
                  : undefined,
                isHighlighted: d.code === searchCriteria.to,
              }));

            return (
              <LeafletMap
                center={mapCenter}
                zoom={mapZoom}
                markers={markers}
              />
            );
          })()}
        </div>

      </div>

      {/* ── DESKTOP FILTER DROPDOWNS ──────────────────────────────────────── */}
      {renderFilterDropdown()}

      {/* ── MOBILE FILTERS PANEL ─────────────────────────────────────────── */}
      {isMobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-[#e0e2e8]">
            <h2 className="text-lg font-bold text-[#333743]">Filters</h2>
            <button
              className="p-2 hover:bg-[#f3f5f6] rounded-full"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              <X size={24} className="text-[#333743]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-24">

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-[#333743]">Price per person</h3>
              <div className="flex justify-between text-sm font-bold text-[#333743]">
                <div className="px-4 py-2 rounded-[8px] border border-[#e0e2e8]">£{priceMin.toLocaleString()}</div>
                <div className="px-4 py-2 rounded-[8px] border border-[#e0e2e8]">£{priceMax.toLocaleString()}</div>
              </div>
            </div>
            <div className="h-[1px] bg-[#e0e2e8]" />

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Hotel stars</h3>
              {[5, 4, 3, 2].map((s) => (
                <CheckboxRow
                  key={s}
                  label={<span className="text-[#FFB700] font-bold">{"★".repeat(s)}</span>}
                  checked={filterStars.has(s)}
                  onChange={() => setFilterStars(toggleSet(filterStars, s))}
                />
              ))}
            </div>
            <div className="h-[1px] bg-[#e0e2e8]" />

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Board type</h3>
              {["All Inclusive", "Half Board", "Breakfast Included", "Room Only"].map((b) => (
                <CheckboxRow key={b} label={b} checked={filterBoard.has(b)} onChange={() => setFilterBoard(toggleSet(filterBoard, b))} />
              ))}
            </div>
            <div className="h-[1px] bg-[#e0e2e8]" />

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Trip type</h3>
              {TRIP_TYPE_OPTIONS.map((opt) => (
                <CheckboxRow
                  key={opt.id}
                  label={opt.label}
                  checked={filterTripTypes.has(opt.id)}
                  onChange={() => setFilterTripTypes(toggleSet(filterTripTypes, opt.id))}
                />
              ))}
            </div>
            <div className="h-[1px] bg-[#e0e2e8]" />

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Travel style</h3>
              {TRAVEL_STYLE_OPTIONS.map((s) => (
                <CheckboxRow key={s} label={s} checked={filterStyles.has(s)} onChange={() => setFilterStyles(toggleSet(filterStyles, s))} />
              ))}
            </div>
            <div className="h-[1px] bg-[#e0e2e8]" />

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#333743]">Country</h3>
              {COUNTRY_OPTIONS.map((c) => (
                <CheckboxRow key={c} label={c} checked={filterCountries.has(c)} onChange={() => setFilterCountries(toggleSet(filterCountries, c))} />
              ))}
            </div>

          </div>

          <div className="sticky bottom-0 bg-white px-4 py-4 border-t border-[#e0e2e8]">
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full bg-[#2681FF] text-white font-bold text-[15px] py-3 rounded-[12px] hover:bg-[#1a6fd9] transition-colors"
            >
              Show {filteredAndSorted.length} holiday{filteredAndSorted.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
