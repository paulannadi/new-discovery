// ─────────────────────────────────────────────────────────────────────────────
// PackageCard
//
// Renders a single UnifiedPackage as a horizontal card in the holiday list.
// Visual style matches the existing HolidayListPage card pattern.
//
// Key design decisions:
//   - NO "Cached" / "Live" badge — source mode is invisible to the user.
//     The underlying data source doesn't matter to a travel agent.
//   - Fade-in on mount — cards animate in as live results arrive.
//   - onSelect triggers the HotelDetailModal, not page navigation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { MapPin, BedDouble, Utensils, Calendar as CalendarIcon, ArrowRight, Wifi, Waves, Dumbbell, Wine, Wind, Dog, Accessibility, Droplets, Umbrella, Sparkles, Flag, Fish, Anchor, Eye, Music2, Plane, Users, User, RotateCcw, Zap } from "lucide-react";
import { format } from "date-fns";
import { UnifiedPackage } from "../../../types";

// ── Currency symbol helper ──────────────────────────────────────────────────
// Converts ISO currency code to a symbol. Add more as needed.
function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    GBP: "£", USD: "$", EUR: "€", CHF: "CHF ",
  };
  return map[currency] ?? currency + " ";
}

// ── Amenity icon helper ─────────────────────────────────────────────────────
// Uses keyword matching so it works for varied strings like "Outdoor pool",
// "Luxury spa", "Michelin-star dining", etc. — not just exact names.
function getAmenityIcon(amenity: string) {
  const a = amenity.toLowerCase();
  if (a.includes("pool"))                          return <Droplets size={12} />;
  if (a.includes("beach") || a.includes("marina")) return <Umbrella size={12} />;
  if (a.includes("spa") || a.includes("wellness")) return <Sparkles size={12} />;
  if (a.includes("dining") || a.includes("restaurant")) return <Utensils size={12} />;
  if (a.includes("golf"))                          return <Flag size={12} />;
  if (a.includes("scuba") || a.includes("snorkel") || a.includes("diving")) return <Fish size={12} />;
  if (a.includes("water sport") || a.includes("watersport") || a.includes("water park")) return <Waves size={12} />;
  if (a.includes("fitness") || a.includes("gym")) return <Dumbbell size={12} />;
  if (a.includes("yacht"))                         return <Anchor size={12} />;
  if (a.includes("bar") || a.includes("swim-up")) return <Wine size={12} />;
  if (a.includes("view"))                          return <Eye size={12} />;
  if (a.includes("entertainment"))                 return <Music2 size={12} />;
  if (a.includes("wifi") || a.includes("wi-fi"))  return <Wifi size={12} />;
  if (a.includes("pet"))                           return <Dog size={12} />;
  if (a.includes("air cond"))                      return <Wind size={12} />;
  if (a.includes("wheelchair") || a.includes("accessible")) return <Accessibility size={12} />;
  return null;
}

// ── Date formatter ─────────────────────────────────────────────────────────
// Formats "Tue, Apr 28 – Tue, May 5, 2026" from two ISO strings.
function formatDateRange(outboundISO: string, returnISO: string): string {
  try {
    const dep = new Date(outboundISO);
    const ret = new Date(returnISO);
    return `${format(dep, "EEE, MMM d")} – ${format(ret, "EEE, MMM d, yyyy")}`;
  } catch {
    return outboundISO;
  }
}

// ── Trip type badge helper ──────────────────────────────────────────────────
// Maps a tripType string to an icon, label, and Tailwind colour classes.
// Shown as a pill overlay on the card image so agents can instantly see
// what kind of holiday they're looking at.

type TripType = NonNullable<UnifiedPackage["tripType"]>;

const TRIP_TYPE_CONFIG: Record<TripType, { icon: React.ReactNode; label: string; bg: string; text: string }> = {
  "hotel-flight":    { icon: <Plane size={11} />,     label: "Hotel + Flight",    bg: "bg-blue-100",   text: "text-blue-700" },
  "group-tour":      { icon: <Users size={11} />,     label: "Group Tour",        bg: "bg-purple-100", text: "text-purple-700" },
  "individual-tour": { icon: <User size={11} />,      label: "Individual Tour",   bg: "bg-green-100",  text: "text-green-700" },
  "round-trip":      { icon: <RotateCcw size={11} />, label: "Round Trip",        bg: "bg-amber-100",  text: "text-amber-700" },
  "last-minute":     { icon: <Zap size={11} />,       label: "Last Minute",       bg: "bg-red-100",    text: "text-red-700" },
};

// ── Props ──────────────────────────────────────────────────────────────────

interface PackageCardProps {
  pkg: UnifiedPackage;
  onSelect?: (pkg: UnifiedPackage) => void;
  // For map hover sync — these are optional since not all views use the map
  onHover?: (isHovering: boolean) => void;
  isHovered?: boolean;
  // When true, hides the real price and shows a "Finding best deal" spinner instead.
  // Used for non-cached destinations while the backend is confirming prices.
  isPricePending?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function PackageCard({ pkg, onSelect, onHover, isHovered, isPricePending }: PackageCardProps) {
  // Fade-in animation on mount — gives a smooth feel when live results arrive
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Short timeout so the transition plays on mount (not just on re-render)
    const id = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(id);
  }, []);

  const sym = currencySymbol(pkg.price.currency);
  const dateLabel = formatDateRange(
    pkg.flights.outbound.departureTime,
    pkg.flights.return.departureTime
  );

  return (
    <div
      className={`
        bg-white rounded-[16px] border overflow-hidden shadow-sm
        transition-all duration-300 ease-out cursor-pointer flex flex-col lg:flex-row
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        ${isHovered
          ? "border-[#2681FF] shadow-lg -translate-y-0.5"
          : "border-[#e0e2e8] hover:shadow-lg hover:-translate-y-0.5"
        }
      `}
      onClick={() => onSelect?.(pkg)}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* ── Left: hotel photo ───────────────────────────────────────────── */}
      <div className="relative lg:w-[260px] shrink-0">
        <img
          src={pkg.hotel.mainImage}
          alt={pkg.hotel.name}
          className="w-full h-[160px] lg:h-full object-cover"
        />
        {/* Trip type badge — shown top-left on the image when tripType is set.
            Tells agents at a glance what kind of holiday this is. */}
        {pkg.tripType && (() => {
          const cfg = TRIP_TYPE_CONFIG[pkg.tripType];
          return (
            <span className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
              {cfg.icon}
              {cfg.label}
            </span>
          );
        })()}
      </div>

      {/* ── Right: hotel + package details ──────────────────────────────── */}
      {/* p-4 on mobile, p-6 on md+ — saves precious horizontal space on small screens */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4">

        {/* CSS Grid top section — 2 columns: [1fr auto]
            Col 1 (1fr): name row, then location/dates row — same width for both.
            Col 2 (auto): TrustYou spans BOTH rows via row-span-2, so it sits
            beside the name AND the location/dates without pushing either down.
            gap-x-3 between columns, gap-y-1 between the two left-column rows. */}
        <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-start">

          {/* Name + stars — col 1, row 1 */}
          <p className="text-[18px] font-bold text-[#333743] leading-snug">
            {pkg.hotel.name}{" "}
            <span className="text-[13px] text-[#FFB700] whitespace-nowrap align-top">
              {"★".repeat(pkg.hotel.category)}
            </span>
          </p>

          {/* TrustYou — col 2, spans rows 1 AND 2, so it sits beside name + location */}
          <div className="row-span-2 flex flex-col items-end">
            <div className="flex items-center gap-2">
              <div className="bg-[#19a974] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-[4px]">
                {(pkg.hotel.trustYou.rating / 10).toFixed(1)}
              </div>
              <span className="text-[#333743] text-[12px] font-bold">
                {pkg.hotel.trustYou.rating >= 90 ? "Exceptional"
                  : pkg.hotel.trustYou.rating >= 85 ? "Outstanding"
                  : pkg.hotel.trustYou.rating >= 80 ? "Excellent"
                  : "Very good"}
              </span>
            </div>
            <span className="text-[#333743] text-[10px]">
              {pkg.hotel.trustYou.reviewCount.toLocaleString()} reviews
            </span>
          </div>

          {/* Location + dates — col-span-2 = full card width.
              flex-col: location on its own full-width row, date on the next. */}
          <div className="col-span-2 flex flex-col gap-y-0.5 text-[12px] text-[#333743]">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="shrink-0 text-black" />
              {pkg.hotel.location}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon size={12} className="shrink-0 text-black" />
              {dateLabel}
            </span>
          </div>

        </div>

        {/* Room + board — stacked on mobile, side-by-side on sm+.
            flex-col below 640px so each gets its own row.
            sm:flex-row from 640px so they sit next to each other. */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 leading-snug">
          <div className="flex items-center gap-2 text-[12px] text-[#333743]">
            <BedDouble size={14} className="text-[#2681FF] shrink-0" />
            <span>{pkg.room.roomType}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#333743]">
            <Utensils size={14} className="text-[#2681FF] shrink-0" />
            <span>{pkg.room.boardType}</span>
          </div>
        </div>

        {/* Row 4: amenity chips — pill style matching DiscoveryPage hotel tab */}
        <div className="flex flex-wrap gap-[10px]">
          {pkg.hotel.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-1 bg-[#EFF6FF] text-[#2681FF] text-[12px] font-medium px-2.5 py-1 rounded-full"
            >
              {getAmenityIcon(amenity)}
              {amenity}
            </span>
          ))}
        </div>

        {/* Row 5: price + CTA ─────────────────────────────────────────────── */}
        {/* On mobile: price sits above a full-width button (easier to tap).
            On sm+: price and button are side-by-side as in the Figma design. */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
          {/* Price block — shows a spinner + label while prices are still loading,
              then reveals the real price once the backend confirms it */}
          {isPricePending ? (
            <div className="flex items-center gap-2 text-[#333743]">
              {/* Spinner: a circle with a coloured top arc that rotates */}
              <div className="w-4 h-4 rounded-full border-2 border-[#e0e2e8] border-t-[#2681FF] animate-spin shrink-0" />
              <span className="text-[14px] font-semibold">Finding best deal</span>
            </div>
          ) : (
            // Price inline: label + amount share one baseline.
            // self-end pushes it right on mobile (flex-col context).
            // sm:self-auto resets that once the row becomes flex-row.
            <div className="flex items-baseline gap-1.5 self-end sm:self-auto">
              <span className="text-[11px] text-[#333743]">Per person from</span>
              <span className="text-[22px] font-black text-[#333743] leading-none">
                {sym}{pkg.price.perPerson.toLocaleString()}
              </span>
            </div>
          )}
          {/* w-full on mobile gives a big easy tap target; sm:w-auto reverts to natural size */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(pkg); }}
            className="w-full sm:w-auto justify-center bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[14px] px-5 py-2.5 rounded-[10px] transition-colors flex items-center gap-2"
          >
            View details
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
