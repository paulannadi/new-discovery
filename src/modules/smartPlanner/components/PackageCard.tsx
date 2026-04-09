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
//   - onSelect triggers page navigation to PackageDetailPage.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { MapPin, BedDouble, Utensils, Calendar as CalendarIcon, ArrowRight, Wifi, Waves, Dumbbell, Wine, Wind, Dog, Accessibility, Droplets, Umbrella, Sparkles, Flag, Fish, Anchor, Eye, Music2, Plane, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { UnifiedPackage } from "../../../types";
import { cn } from "../../../shared/components/ui/utils";

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
  if (a.includes("pool"))                          return <Droplets size={12} aria-hidden="true" />;
  if (a.includes("beach") || a.includes("marina")) return <Umbrella size={12} aria-hidden="true" />;
  if (a.includes("spa") || a.includes("wellness")) return <Sparkles size={12} aria-hidden="true" />;
  if (a.includes("dining") || a.includes("restaurant")) return <Utensils size={12} aria-hidden="true" />;
  if (a.includes("golf"))                          return <Flag size={12} aria-hidden="true" />;
  if (a.includes("scuba") || a.includes("snorkel") || a.includes("diving")) return <Fish size={12} aria-hidden="true" />;
  if (a.includes("water sport") || a.includes("watersport") || a.includes("water park")) return <Waves size={12} aria-hidden="true" />;
  if (a.includes("fitness") || a.includes("gym")) return <Dumbbell size={12} aria-hidden="true" />;
  if (a.includes("yacht"))                         return <Anchor size={12} aria-hidden="true" />;
  if (a.includes("bar") || a.includes("swim-up")) return <Wine size={12} aria-hidden="true" />;
  if (a.includes("view"))                          return <Eye size={12} aria-hidden="true" />;
  if (a.includes("entertainment"))                 return <Music2 size={12} aria-hidden="true" />;
  if (a.includes("wifi") || a.includes("wi-fi"))  return <Wifi size={12} aria-hidden="true" />;
  if (a.includes("pet"))                           return <Dog size={12} aria-hidden="true" />;
  if (a.includes("air cond"))                      return <Wind size={12} aria-hidden="true" />;
  if (a.includes("wheelchair") || a.includes("accessible")) return <Accessibility size={12} aria-hidden="true" />;
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
      onClick={() => onSelect?.(pkg)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(pkg); } }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* ── Image ───────────────────────────────────────────────────────── */}
      {/* Below 680px: full-width strip, fixed 200px tall.
          At 680px+: fixed 260px wide, stretches to the card height.
          The image uses absolute inset-0 on desktop so its natural dimensions
          (e.g. portrait photos) never push the card taller than the content. */}
      <div className="relative shrink-0 h-[200px] @[680px]:h-auto @[680px]:w-[260px] @[680px]:self-stretch overflow-hidden">
        <img
          src={pkg.hotel.mainImage}
          alt={pkg.hotel.name}
          className="w-full h-full @[680px]:absolute @[680px]:inset-0 object-cover"
        />
        <span className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-normal bg-white text-foreground">
          <Plane size={11} aria-hidden="true" />
          Hotel + Flight
        </span>
      </div>

      {/* ── Right side ──────────────────────────────────────────────────── */}
      {/* Below 680px: single column (flex-col), price+CTA at bottom.
          At 680px+: two columns (flex-row) — details on left, price+CTA on right. */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col @[680px]:flex-row gap-4">

        {/* Col 1: all details */}
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-lg font-bold text-foreground leading-snug">
            {pkg.hotel.name}{" "}
            <span className="text-xs text-warning whitespace-nowrap align-top">
              {"★".repeat(pkg.hotel.category)}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <div className="bg-success text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
              {(pkg.hotel.trustYou.rating / 10).toFixed(1)}
            </div>
            <span className="text-foreground text-xs font-bold">
              {pkg.hotel.trustYou.rating >= 90 ? "Exceptional"
                : pkg.hotel.trustYou.rating >= 85 ? "Outstanding"
                : pkg.hotel.trustYou.rating >= 80 ? "Excellent"
                : "Very good"}
            </span>
            <span className="text-foreground text-xs">
              ({pkg.hotel.trustYou.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <span className="flex items-center gap-1 text-xs text-foreground">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            {pkg.hotel.location}
          </span>

          <span className="flex items-center gap-1 text-xs text-foreground">
            <CalendarIcon size={12} className="shrink-0" aria-hidden="true" />
            {dateLabel}
          </span>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 text-xs text-foreground">
              <BedDouble size={14} className="text-primary shrink-0" aria-hidden="true" />
              <span>{pkg.room.roomType}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Utensils size={14} className="text-primary shrink-0" aria-hidden="true" />
              <span>{pkg.room.boardType}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {pkg.hotel.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {getAmenityIcon(amenity)}
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Col 2: price + CTA — pinned to the bottom with justify-end */}
        <div className="shrink-0 flex flex-col items-end justify-end gap-2">
          {isPricePending ? (
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="size-4 animate-spin shrink-0" />
              <span className="text-sm font-semibold">Finding best deal</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-foreground">Per person from</span>
              <span className="text-2xl font-extrabold text-foreground leading-none">
                {sym}{pkg.price.perPerson.toLocaleString()}
              </span>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(pkg); }}
            className="w-full justify-center bg-primary hover:brightness-85 text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
          >
            View details
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}
