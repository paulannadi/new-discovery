// ─────────────────────────────────────────────────────────────────────────────
// ItineraryTimeline
//
// Renders a flat array of TimelineItems as a vertical timeline.
// Each item gets:
//   • a short vertical dashed connector above it
//   • an icon + heading row (e.g. "Plane icon — Outbound flight")
//   • the actual product card, indented behind a dashed left "rail"
//
// Between cards we insert an "Add Stop" button so the user can drop a new
// product into the trip.
//
// This component replaces the five inline `*Itinerary` layouts (TourItinerary,
// HotelItinerary, FlightItinerary, HolidayItinerary, AIItinerary) from the
// previous SmartPlannerPage.
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment } from "react";
import {
  Building2,
  Bus,
  MapPin,
  Plane,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { AccommodationCard } from "./products/AccommodationCard";
import { ActivityCard } from "./products/ActivityCard";
import { FlightCard } from "./products/FlightCard";
import { TransferCard } from "./products/TransferCard";
import type { TimelineItem } from "../utils/seedTimeline";

interface ItineraryTimelineProps {
  items: TimelineItem[];
  // Optional AI banner — shown at the top when the trip was seeded from a
  // natural-language prompt. Kept here (not in the page) so the banner sits
  // *above* the timeline rail rather than separately.
  aiPrompt?: string;
  // Number of travellers on this trip. Forwarded to product cards that
  // need a per-passenger count (e.g. TransferCard's seat-chart drawer).
  // Defaults to 1 if unset so single-passenger flows still work.
  passengerCount?: number;
}

// Map each item kind to its icon + section heading. Centralising this keeps
// the timeline rendering loop tidy and means new product types only need a
// single new entry.
function getHeader(item: TimelineItem): { icon: React.ReactNode; title: string } {
  switch (item.kind) {
    case "flight":
      return {
        icon: <Plane className="size-6 md:size-8 shrink-0" aria-hidden="true" />,
        title:
          item.direction === "outbound"
            ? "Outbound Flight"
            : item.direction === "inbound"
              ? "Return Flight"
              : "Flight",
      };
    case "accommodation":
      return {
        icon: <Building2 className="size-6 md:size-8 shrink-0" aria-hidden="true" />,
        title: `Stay in ${item.hotel.location}`,
      };
    case "activity":
      return {
        icon: <MapPin className="size-6 md:size-8 shrink-0" aria-hidden="true" />,
        title: item.title,
      };
    case "transfer":
      return {
        icon: <Bus className="size-6 md:size-8 shrink-0" aria-hidden="true" />,
        // Sentence-style title — e.g. "Bus from Freiburg to Hotel Bella Lazise".
        // `vehicle` is a short mode noun (Bus / Bullet train / Private car…)
        // populated upstream in seedTimeline.
        title: `${item.vehicle} from ${item.from} to ${item.to}`,
      };
  }
}

// Renders a single timeline row: connector → header → card behind dashed rail.
function TimelineRow({ item, passengerCount }: { item: TimelineItem; passengerCount: number }) {
  const { icon, title } = getHeader(item);

  return (
    <div>
      {/* Short vertical dashed connector above the header — links sections */}
      <div className="w-px ml-3 md:ml-4 mb-1 h-6 border-l border-dashed border-foreground" />

      {/* Icon + heading row */}
      <div className="flex mb-1 items-center gap-1.5 md:gap-3">
        {icon}
        <h2 className="font-extrabold text-lg md:text-2xl leading-tight text-foreground mr-3">
          {title}
        </h2>
      </div>

      {/* Dashed left "rail" — the card hangs off it */}
      <div className="pl-4 ml-3 md:pl-7 md:ml-4 border-l border-dashed border-foreground pb-6">
        {item.kind === "flight" && <FlightCard item={item} />}
        {item.kind === "accommodation" && <AccommodationCard item={item} />}
        {item.kind === "activity" && <ActivityCard item={item} />}
        {/* TransferCard needs the passenger count so the seat-chart drawer
            knows how many seats the traveller must pick. */}
        {item.kind === "transfer" && <TransferCard item={item} passengerCount={passengerCount} />}
      </div>
    </div>
  );
}

// "Add Stop" insert between cards — matches the live AddStopButton pattern
// (dashed lines on either side of a centered outlined button).
function AddStopRow() {
  return (
    <div className="pl-4 md:pl-7 ml-3 md:ml-4 pt-8 border-l border-dashed border-foreground flex flex-row items-center justify-center">
      <span className="md:hidden w-full h-px m-auto mr-4 border-t border-dashed border-foreground" />
      <Button variant="outline">
        <Plus size={16} aria-hidden="true" />
        Add Stop
      </Button>
      <span className="w-full h-px m-auto ml-4 md:ml-7 border-t border-dashed border-foreground" />
    </div>
  );
}

export function ItineraryTimeline({ items, aiPrompt, passengerCount = 1 }: ItineraryTimelineProps) {
  return (
    <div>
      {/* Optional AI attribution banner — shown when the trip came from a prompt */}
      {aiPrompt && (
        <div className="mb-6 flex items-center gap-3 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-lg p-4">
          <Sparkles size={20} className="text-primary shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <div className="font-bold text-foreground">AI-generated itinerary</div>
            <div className="text-sm text-muted-foreground line-clamp-1">
              Based on: "{aiPrompt}"
            </div>
          </div>
        </div>
      )}

      {/* Timeline rows — interleave each item with an Add Stop button */}
      {items.map((item, idx) => (
        <Fragment key={item.id}>
          <TimelineRow item={item} passengerCount={passengerCount} />
          {idx < items.length - 1 && <AddStopRow />}
        </Fragment>
      ))}

      {/* Trailing Add Stop at the very end of the timeline */}
      {items.length > 0 && <AddStopRow />}
    </div>
  );
}
