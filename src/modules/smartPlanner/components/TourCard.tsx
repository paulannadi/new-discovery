// ─────────────────────────────────────────────────────────────────────────────
// TourCard
//
// Shows a single Tour as a card in the holiday list.
// Below 680px card width: image full width on top, details below.
// At 680px+ card width: image fixed 260px on the left, details on the right.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  MapPin,
  ArrowRight,

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

function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    GBP: "£", USD: "$", EUR: "€", CHF: "CHF ",
  };
  return map[currency] ?? currency + " ";
}

function getHighlightIcon(highlight: string) {
  const h = highlight.toLowerCase();
  if (h.includes("train") || h.includes("express") || h.includes("rail")) return <Train size={12} />;
  if (h.includes("mountain") || h.includes("alpine") || h.includes("glacier")) return <Mountain size={12} />;
  if (h.includes("heritage") || h.includes("unesco") || h.includes("historic")) return <Camera size={12} />;
  if (h.includes("village") || h.includes("town") || h.includes("city")) return <MapPin size={12} />;
  return <Star size={12} />;
}

interface TourCardProps {
  tour: Tour;
  onSelect?: (tour: Tour) => void;
  onHover?: (isHovering: boolean) => void;
  isHovered?: boolean;
}

export function TourCard({ tour, onSelect, onHover, isHovered }: TourCardProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(id);
  }, []);

  const sym = currencySymbol(tour.price.currency);

  const tripTypeBadge =
    tour.tripType === "group-tour"
      ? { icon: <Users size={11} />, label: "Group Tour" }
      : { icon: <User size={11} />, label: "Individual Tour" };

  return (
    <div className="@container">
    <div
      className={`
        bg-white rounded-[16px] border overflow-hidden shadow-sm
        transition-all duration-300 ease-out cursor-pointer flex flex-col @[680px]:flex-row
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
      {/* ── Image ───────────────────────────────────────────────────────── */}
      {/* Below 680px: full width on top. At 680px+: fixed 260px on the left. */}
      <div className="relative shrink-0 @[680px]:w-[260px]">
        <img
          src={tour.mainImage}
          alt={tour.title}
          className="w-full h-[200px] @[680px]:h-full object-cover"
        />

        <span className="absolute top-2 left-2 flex items-center gap-1 px-[10px] py-[4px] rounded-full text-[12px] font-normal bg-white text-[#333743]">
          {tripTypeBadge.icon}
          {tripTypeBadge.label}
        </span>


      </div>

      {/* ── Right side ──────────────────────────────────────────────────── */}
      {/* Below 680px: single column (flex-col), price+CTA at bottom.
          At 680px+: two columns (flex-row) — details on left, price+CTA on right. */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col @[680px]:flex-row gap-4">

        {/* Col 1: all details */}
        <div className="flex-1 flex flex-col gap-3">
          <h3 className="text-[18px] font-bold text-[#333743] leading-snug">
            {tour.title}
          </h3>

          <div className="flex items-center flex-wrap gap-1 text-[12px] text-[#333743]">
            <MapPin size={13} className="shrink-0" />
            {tour.stops.map((stop, i) => (
              <span key={stop.destinationName} className="flex items-center gap-1">
                <span className="font-medium">{stop.destinationName}</span>
                {i < tour.stops.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
          </div>

          <p className="flex items-center gap-1 text-[12px] text-[#333743]">
            <Calendar size={12} className="shrink-0" />
            {tour.startDate} – {tour.endDate}
          </p>

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
        </div>

        {/* Col 2: price + CTA — pinned to the bottom with justify-end */}
        <div className="shrink-0 flex flex-col items-end justify-end gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-[#333743]">Per person from</span>
            <span className="text-[22px] font-black text-[#333743] leading-none">
              {sym}{tour.price.perPerson.toLocaleString()}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(tour); }}
            className="w-full justify-center bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[14px] px-5 py-2.5 rounded-[10px] transition-colors flex items-center gap-2"
          >
            View tour
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}
