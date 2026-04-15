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
import { cn } from "../../../shared/components/ui/utils";

function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    GBP: "£", USD: "$", EUR: "€", CHF: "CHF ",
  };
  return map[currency] ?? currency + " ";
}

function getHighlightIcon(highlight: string) {
  const h = highlight.toLowerCase();
  if (h.includes("train") || h.includes("express") || h.includes("rail")) return <Train size={12} aria-hidden="true" />;
  if (h.includes("mountain") || h.includes("alpine") || h.includes("glacier")) return <Mountain size={12} aria-hidden="true" />;
  if (h.includes("heritage") || h.includes("unesco") || h.includes("historic")) return <Camera size={12} aria-hidden="true" />;
  if (h.includes("village") || h.includes("town") || h.includes("city")) return <MapPin size={12} aria-hidden="true" />;
  return <Star size={12} aria-hidden="true" />;
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
      ? { icon: <Users size={11} aria-hidden="true" />, label: "Group Tour" }
      : { icon: <User size={11} aria-hidden="true" />, label: "Individual Tour" };

  return (
    <div className="@container">
    <div
      className={cn(
        // Base card styles — uses design system tokens
        "bg-card rounded-xl border overflow-hidden shadow-sm",
        "transition-all duration-300 ease-out cursor-pointer flex flex-col @[680px]:flex-row",
        // Fade-in animation on mount
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        // Hover/highlight state — primary border when hovered from map
        isHovered
          ? "border-primary shadow-lg -translate-y-0.5"
          : "border-border hover:shadow-lg hover:-translate-y-0.5"
      )}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(tour)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(tour); } }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* ── Image ───────────────────────────────────────────────────────── */}
      {/* Below 680px: full width on top. At 680px+: fixed 260px on the left. */}
      {/* self-start stops the image column from stretching to the card height */}
      <div className="relative shrink-0 @[680px]:w-[260px] @[680px]:self-start">
        <img
          src={tour.mainImage}
          alt={tour.title}
          className="w-full h-[200px] object-cover"
        />

        <span className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-normal bg-white text-foreground">
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
          <h3 className="text-lg font-bold text-foreground leading-snug">
            {tour.title}
          </h3>

          <div className="flex items-center flex-wrap gap-1 text-xs text-foreground">
            <MapPin size={13} className="shrink-0" aria-hidden="true" />
            {tour.stops.map((stop, i) => (
              <span key={stop.destinationName} className="flex items-center gap-1">
                <span className="font-medium">{stop.destinationName}</span>
                {i < tour.stops.length - 1 && <ChevronRight size={12} aria-hidden="true" />}
              </span>
            ))}
          </div>

          <p className="flex items-center gap-1 text-xs text-foreground">
            <Calendar size={12} className="shrink-0" aria-hidden="true" />
            {tour.startDate} – {tour.endDate}
          </p>

          <div className="flex flex-wrap gap-2">
            {tour.highlights.slice(0, 4).map((highlight) => (
              <span
                key={highlight}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
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
            <span className="text-xs text-foreground">Per person from</span>
            <span className="text-2xl font-extrabold text-foreground leading-none">
              {sym}{tour.price.perPerson.toLocaleString()}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(tour); }}
            className="w-full justify-center bg-primary hover:brightness-85 text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
          >
            View tour
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}
