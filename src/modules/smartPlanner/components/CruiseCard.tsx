// ─────────────────────────────────────────────────────────────────────────────
// CruiseCard — single Cruise result on the CruiseListPage.
//
// Layout mirrors ActivityCard exactly:
//   • Below 680px card width: image full-width on top, details below.
//   • At 680px+ card width:    fixed 260px image on the left, details right.
//
// Cruise-specific bits:
//   • Top-left badge on the image shows the cruise line (e.g. "MSC Cruises")
//     with a Ship icon — instantly tells you "this is a cruise".
//   • Duration uses "nights" with a Moon icon, per the cruise-industry convention.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Moon,
  Star,
  Ship,
} from "lucide-react";
import type { Cruise } from "../../../types";
import { cn } from "../../../shared/components/ui/utils";
import { ImageWithPlaceholder } from "../../../shared/components/loading";

// Map currency codes to symbols
function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    CHF: "CHF ",
  };
  return map[currency] ?? currency + " ";
}

interface CruiseCardProps {
  cruise: Cruise;
  onSelect?: (cruise: Cruise) => void;
  onHover?: (isHovering: boolean) => void;
  isHovered?: boolean;
}

export function CruiseCard({
  cruise,
  onSelect,
  onHover,
  isHovered,
}: CruiseCardProps) {
  // Mount fade-in — matches ActivityCard / TourCard so the cards animate
  // together when revealed by StaggeredList.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(id);
  }, []);

  const sym = currencySymbol(cruise.price.currency);

  return (
    <div className="@container">
      <div
        className={cn(
          // Base card — design system tokens, same as ActivityCard
          "bg-card rounded-xl border overflow-hidden shadow-sm",
          "transition-all duration-300 ease-out cursor-pointer flex flex-col @[680px]:flex-row",
          // Mount fade
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          // Hover / map-highlight state
          isHovered
            ? "border-primary shadow-lg -translate-y-0.5"
            : "border-border hover:shadow-lg hover:-translate-y-0.5"
        )}
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(cruise)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.(cruise);
          }
        }}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
        {/* ── Image ───────────────────────────────────────────────────── */}
        <div className="relative shrink-0 h-[200px] @[680px]:h-auto @[680px]:w-[260px]">
          <ImageWithPlaceholder
            src={cruise.mainImage}
            alt={cruise.title}
            containerClassName="absolute inset-0 w-full h-full"
          />

          {/* Cruise-line badge — Ship icon + line name */}
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-card text-foreground shadow-sm">
            <Ship size={13} aria-hidden="true" />
            {cruise.cruiseLine}
          </span>
        </div>

        {/* ── Right side ──────────────────────────────────────────────── */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col @[680px]:flex-row gap-4">
          {/* Col 1 — title, ship, route, meta, amenities */}
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground leading-snug">
                {cruise.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cruise.shipName}
              </p>
            </div>

            {/* Route line with MapPin icon */}
            <div className="flex items-start gap-1.5 text-xs text-foreground">
              <MapPin size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium leading-relaxed">{cruise.route}</span>
            </div>

            {/* Meta row — nights · departure · rating */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground">
              <span className="flex items-center gap-1.5">
                <Moon size={12} className="shrink-0" aria-hidden="true" />
                {cruise.durationNights} nights
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="shrink-0" aria-hidden="true" />
                {cruise.nextDeparture}
              </span>
              <span className="flex items-center gap-1.5">
                <Star
                  size={12}
                  className="text-warning shrink-0"
                  fill="currentColor"
                  aria-hidden="true"
                />
                <span className="font-semibold">{cruise.rating.score.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({cruise.rating.reviewCount.toLocaleString()})
                </span>
              </span>
            </div>

            {/* First 3 ship amenities as pills */}
            <div className="flex flex-wrap gap-2">
              {cruise.shipAmenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2 — price + CTA, pinned to bottom-right */}
          <div className="shrink-0 flex flex-col items-end justify-end gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-foreground">Per person from</span>
              <span className="text-2xl font-extrabold text-foreground leading-none">
                {sym}
                {cruise.price.fromPerPerson.toLocaleString()}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(cruise);
              }}
              className="w-full justify-center bg-primary hover:brightness-85 text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-md transition-all flex items-center gap-2"
            >
              View cruise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
