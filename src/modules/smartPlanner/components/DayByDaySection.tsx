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
import { MapPinned, Hotel, Bus } from "lucide-react";
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
// Header shows a "Day N" pill, the day title, and the location (right-aligned).
// Active day shows a primary border AND its expanded body (photo + items).
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
        "bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow",
        isActive ? "border border-primary" : ""
      )}
    >
      {/* Header — click anywhere to expand this day */}
      <button
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
        onClick={onSelect}
      >
        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap capitalize">
          Day {day.dayNumber}
        </span>
        <span
          className={cn(
            "flex-1 text-sm text-foreground",
            isActive ? "font-bold" : "font-medium"
          )}
        >
          {day.title}
        </span>
        {day.location && (
          <span className="text-xs text-muted-foreground shrink-0">{day.location}</span>
        )}
      </button>

      {/* Expanded body — photo + items list, only for the active day */}
      {isActive && (
        <div className="flex flex-col md:flex-row">
          <div className="md:w-[200px] shrink-0 p-4 md:pr-0">
            <div className="rounded-xl overflow-hidden h-[140px] md:h-full">
              <img
                src={dayImage}
                alt={`Day ${day.dayNumber}: ${day.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 px-5 py-4 flex flex-col gap-3">
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
      )}
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
