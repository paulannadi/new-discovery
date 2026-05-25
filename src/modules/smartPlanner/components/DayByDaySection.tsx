// ─────────────────────────────────────────────────────────────────────────────
// DayByDaySection — the day-by-day accordion shown on TourDetailPage and
// ActivityDetailPage (for multi-day tours, safaris, expeditions).
//
// Two exports:
//   • DayByDaySection — the section heading + list of DayCards. Manages which
//                       day is currently expanded (only one at a time).
//   • DayCard         — a single day row. Click anywhere to expand; the
//                       active day's photo + items list slides in below.
//
// Both work directly with the existing TourDay / TourDayItem types — no new
// shape needed for activities, they reuse the same data model.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { MapPinned, MapPin, Hotel, Bus, ChevronDown } from "lucide-react";
import type { TourDay, TourDayItem } from "../../../types";
import { cn } from "../../../shared/components/ui/utils";

// ─────────────────────────────────────────────────────────────────────────────
// DayItemIcon — picks the right lucide icon for a day item type.
// "highlight" → place pin, "hotel" → hotel icon, "transport" → bus.
// ─────────────────────────────────────────────────────────────────────────────
function DayItemIcon({ type }: { type: TourDayItem["type"] }) {
  if (type === "highlight")
    return <MapPinned size={15} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />;
  if (type === "hotel")
    return <Hotel size={15} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />;
  if (type === "transport")
    return <Bus size={15} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DayCard — single day row with click-to-expand behaviour.
//
// The header mirrors the Ports-of-call cards: a bold stacked "Day N" badge on
// the left, the day title as the hero, then a location chip + a chevron on the
// right. The chevron rotates 180° to signal open/closed, and the body expands
// with a smooth height animation.
//
// `slug` is used to build a deterministic placeholder image when the day has
// no `image` set — keeps the layout stable for partial mock data.
// ─────────────────────────────────────────────────────────────────────────────
export function DayCard({
  day,
  slug,
  isActive,
  onSelect,
}: {
  day: TourDay;
  slug: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const dayImage =
    day.image ?? `https://picsum.photos/seed/${slug}-day${day.dayNumber}/400/280`;

  return (
    <div
      className={cn(
        // Card shell — matches the Ports cards (rounded, bordered, soft shadow).
        // The border turns primary while open; otherwise it's the neutral border.
        "bg-card rounded-xl border shadow-sm transition-shadow hover:shadow-md",
        isActive ? "border-primary" : "border-border"
      )}
    >
      {/* Header — click anywhere to expand this day. aria-expanded tells
          screen readers whether the body is open. */}
      <button
        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
        onClick={onSelect}
        aria-expanded={isActive}
      >
        {/* Day badge — the emphasised anchor, identical to the Ports cards:
            a stacked "DAY" label over a large bold number. */}
        <div className="flex min-w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 px-2 pt-1.5 pb-0.5 text-center leading-none text-primary">
          <span className="text-[10px] font-bold uppercase tracking-wider">Day</span>
          <span className="text-2xl font-bold">{day.dayNumber}</span>
        </div>

        <div className="flex-1">
          {/* Title — the hero of the card. */}
          <h4 className="min-w-0 flex-1 text-base font-bold text-foreground">
            {day.title}
          </h4>
          {day.location && (
            <p className="mt-1 text-sm">{day.location}</p>
          )}
        </div>

        {/* Right cluster: a location chip (same shape as the Ports time chip)
            plus the chevron, vertically centred against the title. */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* Chevron — rotates 180° when open; the transition makes it spin.
              Turns primary while open to reinforce the active state. The
              colour transition is animated too for a smooth swap. */}
          <ChevronDown
            size={20}
            className={cn(
              "transition-[transform,color] duration-300",
              isActive ? "rotate-180 text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Collapsible body — photo + items list.
          Smooth height animation via the CSS grid-rows trick: the outer grid
          animates its single row between 0fr (collapsed) and 1fr (full content
          height), and the inner div clips the overflow while it's shrinking.
          This animates to the content's natural height without us having to
          measure it in JS. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-[200px] shrink-0">
              <div className="rounded-bl-lg overflow-hidden h-[140px] md:h-full">
                <img
                  src={dayImage}
                  alt={`Day ${day.dayNumber}: ${day.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 px-4 py-4 flex flex-col gap-3 border-t">
              {day.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <DayItemIcon type={item.type} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-foreground mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DayByDaySection — wraps the heading and the list of DayCards.
//
// Manages which day is expanded via local state (only one at a time, defaults
// to day 1). The heading is configurable so detail pages can adjust the
// wording (e.g. "Day by day adventures" for tours, "Cruise itinerary" if we
// later want a different label for cruises — for now we expose `title`).
// ─────────────────────────────────────────────────────────────────────────────
interface DayByDaySectionProps {
  days: TourDay[];
  slug: string;
  title?: string;
}

export function DayByDaySection({
  days,
  slug,
  title = "Day by day adventures",
}: DayByDaySectionProps) {
  // Only one day expanded at a time — start with day 1
  const [activeDayNumber, setActiveDayNumber] = useState(1);

  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
      <div className="flex flex-col gap-3">
        {days.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            slug={slug}
            isActive={day.dayNumber === activeDayNumber}
            onSelect={() => setActiveDayNumber(day.dayNumber)}
          />
        ))}
      </div>
    </div>
  );
}
