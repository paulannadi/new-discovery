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
  Users,
} from "lucide-react";
import type { Activity } from "../../../types";
import { cn } from "../../../shared/components/ui/utils";
import { ACTIVITY_TYPE_OPTIONS } from "./ActivitySearchForm";

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
          <img
            src={activity.mainImage}
            alt={activity.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Activity-type badge — lucide icon + label, matches TourCard chip style */}
          {typeMeta && (
            <span className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-normal bg-card text-foreground shadow-sm">
              {typeMeta.icon}
              {typeMeta.label}
            </span>
          )}
        </div>

        {/* ── Right side ──────────────────────────────────────────────────── */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col @[680px]:flex-row gap-4">
          {/* Col 1 — title, location, dates, highlight chips */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-foreground leading-snug">
              {activity.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <MapPin size={13} className="shrink-0" aria-hidden="true" />
              <span className="font-medium">{activity.location}</span>
            </div>

            {/* Duration + dates row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="shrink-0" aria-hidden="true" />
                {activity.durationDays} days
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="shrink-0" aria-hidden="true" />
                {activity.startDate} – {activity.endDate}
              </span>
              {/* Difficulty pill — only present for walking/bicycle */}
              {activity.difficulty && (
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="shrink-0" aria-hidden="true" />
                  {activity.difficulty}
                </span>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <Star
                size={13}
                className="text-warning shrink-0"
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="font-semibold">{activity.rating.score.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({activity.rating.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            {/* Up to 3 highlight chips */}
            <div className="flex flex-wrap gap-2">
              {activity.highlights.slice(0, 3).map((highlight) => (
                <span
                  key={highlight}
                  className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {highlight}
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
                {activity.price.perPerson.toLocaleString()}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(activity);
              }}
              className="w-full justify-center bg-primary hover:brightness-85 text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-md transition-all flex items-center gap-2"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
