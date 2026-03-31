// ─────────────────────────────────────────────────────────────────────────────
// TourCard
//
// Shows a single Tour as a horizontal card in the holiday list.
// Tours are different from hotel+flight packages — instead of showing
// a hotel room and board type, we show the destination route and duration.
//
// Design mirrors PackageCard: same rounded corners, border, hover shadow,
// price block, and CTA button. The interior content is tour-specific.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  MapPin,
  ArrowRight,
  Clock,
  Train,
  Users,
  User,
  ChevronRight,
  Mountain,
  Camera,
  Star,
  Calendar,
} from "lucide-react";
import type { Tour } from "../../../types";

// ── Currency symbol helper ──────────────────────────────────────────────────
// Same helper as in PackageCard — converts ISO code to symbol.
function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    GBP: "£", USD: "$", EUR: "€", CHF: "CHF ",
  };
  return map[currency] ?? currency + " ";
}

// ── Highlight icon helper ────────────────────────────────────────────────────
// Maps highlight chip text to a relevant icon.
// Keywords are checked loosely so "Scenic panoramic trains" matches "train".
function getHighlightIcon(highlight: string) {
  const h = highlight.toLowerCase();
  if (h.includes("train") || h.includes("express") || h.includes("rail")) return <Train size={12} />;
  if (h.includes("mountain") || h.includes("alpine") || h.includes("glacier")) return <Mountain size={12} />;
  if (h.includes("heritage") || h.includes("unesco") || h.includes("historic")) return <Camera size={12} />;
  if (h.includes("village") || h.includes("town") || h.includes("city")) return <MapPin size={12} />;
  return <Star size={12} />;
}

// ── Props ──────────────────────────────────────────────────────────────────

interface TourCardProps {
  tour: Tour;
  onSelect?: (tour: Tour) => void;
  // Optional map hover sync (same pattern as PackageCard)
  onHover?: (isHovering: boolean) => void;
  isHovered?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export function TourCard({ tour, onSelect, onHover, isHovered }: TourCardProps) {
  // Fade-in on mount — same animation as PackageCard for visual consistency.
  // A 16ms timeout lets the element render first, then the transition plays.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(id);
  }, []);

  const sym = currencySymbol(tour.price.currency);

  // Build the route string from stop names: "Lucerne → Interlaken → Brig → Chur"
  const route = tour.stops.map((s) => s.destinationName).join(" → ");

  // Trip type badge config — icon and text are both black to match the card tag style
  const tripTypeBadge =
    tour.tripType === "group-tour"
      ? { icon: <Users size={11} />, label: "Group Tour" }
      : { icon: <User size={11} />, label: "Individual Tour" };

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
      onClick={() => onSelect?.(tour)}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* ── Left: tour hero photo ──────────────────────────────────────────── */}
      {/* Fixed width on desktop (same as PackageCard), full width on mobile */}
      <div className="relative lg:w-[260px] shrink-0">
        <img
          src={tour.mainImage}
          alt={tour.title}
          className="w-full h-[180px] lg:h-full object-cover"
        />

        {/* Trip type badge — top-left overlay (same white chip pattern as PackageCard) */}
        <span className="absolute top-2 left-2 flex items-center gap-1 px-[10px] py-[4px] rounded-full text-[12px] font-normal bg-white text-[#333743]">
          {tripTypeBadge.icon}
          {tripTypeBadge.label}
        </span>

        {/* Duration badge — bottom-right of image.
            Shows "8 days" prominently so agents can scan quickly. */}
        <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#333743]/60 text-white backdrop-blur-sm">
          <Clock size={11} />
          {tour.duration} days
        </span>
      </div>

      {/* ── Right: tour details ────────────────────────────────────────────── */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-3">

        {/* Tour title — shown at the top, bold, large */}
        <h3 className="text-[18px] font-bold text-[#333743] leading-snug">
          {tour.title}
        </h3>

        {/* Route breadcrumb — shows all destination names in sequence.
            Uses a ChevronRight icon between each stop for clarity. */}
        <div className="flex items-center flex-wrap gap-1 text-[12px] text-[#333743]">
          <MapPin size={13} className="text-[#333743] shrink-0" />
          {tour.stops.map((stop, i) => (
            <span key={stop.destinationName} className="flex items-center gap-1">
              <span className="font-medium">{stop.destinationName}</span>
              {/* Show a chevron between stops, but not after the last one */}
              {i < tour.stops.length - 1 && (
                <ChevronRight size={12} className="text-[#333743]" />
              )}
            </span>
          ))}
        </div>

        {/* Travel period — start and end dates */}
        <p className="flex items-center gap-1 text-[12px] text-[#333743]">
          <Calendar size={12} className="shrink-0 text-[#333743]" />
          {tour.startDate} – {tour.endDate}
        </p>

        {/* Highlight chips — same pill style as amenity chips in PackageCard.
            Light blue background, blue text, small icon on the left.
            Slice to 4 max so the row doesn't overflow. */}
        <div className="flex flex-wrap gap-[8px]">
          {tour.highlights.slice(0, 4).map((highlight) => (
            <span
              key={highlight}
              className="flex items-center gap-1 bg-[#EFF6FF] text-[#2681FF] text-[12px] font-medium px-2.5 py-1 rounded-full"
            >
              {getHighlightIcon(highlight)}
              {highlight}
            </span>
          ))}
        </div>

        {/* Price + CTA — same layout as PackageCard's bottom row.
            flex-col on mobile (price above full-width button),
            flex-row on sm+ (price left, button right). */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto pt-1">
          <div className="flex items-baseline gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] text-[#333743]">Per person from</span>
            <span className="text-[22px] font-black text-[#333743] leading-none">
              {sym}{tour.price.perPerson.toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(tour); }}
            className="w-full sm:w-auto justify-center bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[14px] px-5 py-2.5 rounded-[10px] transition-colors flex items-center gap-2"
          >
            View tour
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
