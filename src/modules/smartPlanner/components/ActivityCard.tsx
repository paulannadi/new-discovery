// ─────────────────────────────────────────────────────────────────────────────
// ActivityCard — single Activity result on the ActivityListPage.
//
// Layout matches TourCard exactly so cruises, walks, and bike tours visually
// belong with the existing tour cards:
//   • Below 680px card width: image full-width on top, details below.
//   • At 680px+ card width:    fixed 260px image on the left, details right.
//
// The badge in the top-left corner shows the activity type with its lucide
// icon (Ship, Bike, Footprints, etc.) so a quick glance tells you what kind of
// experience this is.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";
import type { Activity } from "../../../types";
import { cn } from "../../../shared/components/ui/utils";
import { ACTIVITY_TYPE_OPTIONS } from "./ActivitySearchForm";
// ImageWithPlaceholder reserves space + lazy-loads + fades the image in,
// per our loading patterns doc. Replaces the bare <img> tag below.
import { ImageWithPlaceholder } from "../../../shared/components/loading";

// Symbol map mirrors the helper used elsewhere in the prototype
function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    CHF: "CHF ",
  };
  return map[currency] ?? currency + " ";
}

interface ActivityCardProps {
  activity: Activity;
  onSelect?: (activity: Activity) => void;
  onHover?: (isHovering: boolean) => void;
  isHovered?: boolean;
}

export function ActivityCard({
  activity,
  onSelect,
  onHover,
  isHovered,
}: ActivityCardProps) {
  // Light fade-in on mount — same effect as TourCard so they animate together
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(id);
  }, []);

  const sym = currencySymbol(activity.price.currency);

  // Lookup type-icon + label once
  const typeMeta = ACTIVITY_TYPE_OPTIONS.find((o) => o.id === activity.type);

  return (
    <div className="@container">
      <div
        className={cn(
          // Base card — design system tokens, same as TourCard
          "bg-card rounded-xl border overflow-hidden shadow-sm",
          "transition-all duration-300 ease-out cursor-pointer flex flex-col @[680px]:flex-row",
          // Mount fade
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          // Hover/highlight state — primary border when hovered (incl. from map)
          isHovered
            ? "border-primary shadow-lg -translate-y-0.5"
            : "border-border hover:shadow-lg hover:-translate-y-0.5"
        )}
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(activity)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.(activity);
          }
        }}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
        {/* ── Image ───────────────────────────────────────────────────────── */}
        {/* Mobile (column layout): container has a fixed 200px height so the
            image acts as a banner across the top. Above 680px (row layout),
            we drop the fixed height so the flex row's stretch alignment
            lets this column grow to match the details column on the right.
            The <img> is absolutely positioned so it always fills whatever
            height the container ends up with. */}
        <div className="relative shrink-0 h-[200px] @[680px]:h-auto @[680px]:w-[260px]">
          <ImageWithPlaceholder
            src={activity.mainImage}
            alt={activity.title}
            containerClassName="absolute inset-0 w-full h-full"
          />
          {/* Activity-type badge — pinned to the top-left of the image so the
              type reads at a glance without competing with the card body. */}
          {typeMeta && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              {typeMeta.icon}
              {typeMeta.label}
            </span>
          )}
        </div>

        {/* ── Right side ──────────────────────────────────────────────────── */}
        {/* Single column now: text content on top, price + CTA footer pinned
            at the bottom — mirrors HotelCard's content layout. */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col gap-3">
          {/* Top — title, location, dates, type chip */}
          <div className="flex-1 flex flex-col gap-3">

            {/* Title + location + dates grouped into one tight block.
                gap-1.5 keeps these three lines close together so they read as
                a single unit, separate from the type chip below. */}
            <div className="flex flex-col gap-1.5">

              {/* Title row — title on the left, rating block top-right.
                  items-start keeps the rating aligned to the first line of the
                  title; min-w-0 lets a long title shrink instead of shoving the
                  rating off the card. */}
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-lg font-extrabold text-foreground leading-snug min-w-0">
                  {activity.title}
                </h3>

                {/* Rating — star + score on one line, review count beneath,
                    the whole block right-aligned. shrink-0 protects it from
                    being squeezed by a long title. */}
                <div className="shrink-0 flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <Star
                      size={13}
                      className="text-warning shrink-0"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    <span className="font-bold">
                      {activity.rating.score.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.rating.reviewCount.toLocaleString()} reviews
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-foreground">
                <MapPin size={13} className="shrink-0" aria-hidden="true" />
                <span className="font-medium">{activity.location}</span>
              </div>

              {/* Duration + dates row */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="shrink-0" aria-hidden="true" />
                  {activity.durationDays === 1
                    ? "1 day"
                    : `${activity.durationDays} days`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="shrink-0" aria-hidden="true" />
                  {activity.startDate} – {activity.endDate}
                </span>
              </div>
            </div>
          </div>

          {/* Footer — price on the left, "View details" on the right.
              Stacks (price above, full-width button below) when the card is
              narrow; sits side-by-side once the card is ≥680px wide. Matches
              HotelCard's footer. */}
          <div className="flex flex-col @[680px]:flex-row @[680px]:justify-between @[680px]:items-end gap-3">
            {/* Price — mobile: label + amount inline on one baseline (gap-1.5),
                right-aligned when stacked. Desktop (≥680px): stacks into a
                column with no gap so the label sits tight above the amount. */}
            <div className="flex items-baseline gap-1.5 self-end @[680px]:self-auto @[680px]:flex-col @[680px]:gap-0">
              <span className="text-xs text-foreground">Per person from</span>
              <span className="text-2xl font-extrabold text-foreground leading-none">
                {sym}
                {activity.price.perPerson.toLocaleString()}
              </span>
            </div>
            {/* CTA — full-width on narrow cards for an easy tap target, auto-width at ≥680px */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(activity);
              }}
              className="w-full @[680px]:w-auto justify-center bg-primary hover:brightness-85 text-primary-foreground font-extrabold text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
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
