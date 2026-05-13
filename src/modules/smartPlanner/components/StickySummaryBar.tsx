// ─────────────────────────────────────────────────────────────────────────────
// StickySummaryBar
//
// Bottom-docked summary bar with an expandable trip-summary panel.
// Mirrors the live TripBuilder's StickySummary.
//
// Closed state: a single row with [Trip summary toggle] · "X nights · Y adults"
//               · [Book button].
// Open state:   the same row, plus a panel that slides up showing a tiny
//               day-by-day breakdown of the timeline items.
//
// Clicking outside the panel (or pressing Escape) closes it.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronUp,
  ListCheck,
  MapPin,
  Plane,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../shared/components/ui/utils";
import type { TimelineItem } from "../utils/seedTimeline";

interface StickySummaryBarProps {
  startDate: Date;
  endDate: Date;
  adults: number;
  nights: number;
  totalPriceLabel: string;             // e.g. "from €2,499"
  items: TimelineItem[];               // Used to build the expanded breakdown
}

// Map each item kind to a small icon for the day-by-day breakdown
function ItemIcon({ kind }: { kind: TimelineItem["kind"] }) {
  const className = "size-3.5 text-primary shrink-0";
  if (kind === "flight") return <Plane className={className} aria-hidden="true" />;
  if (kind === "accommodation") return <Building2 className={className} aria-hidden="true" />;
  if (kind === "activity") return <MapPin className={className} aria-hidden="true" />;
  return <CalendarDays className={className} aria-hidden="true" />;
}

// Short one-line label for an item in the breakdown panel
function describeItem(item: TimelineItem): string {
  switch (item.kind) {
    case "flight":
      return `${item.flight.from} → ${item.flight.to}`;
    case "accommodation":
      return `${item.hotel.name} · ${item.nights} night${item.nights !== 1 ? "s" : ""}`;
    case "activity":
      return item.title;
    case "transfer":
      return `${item.from} → ${item.to}`;
  }
}

// The pill-shaped "Trip summary" toggle on the left of the bar
function TripSummaryToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="trip-summary-panel"
      aria-label={isOpen ? "Close trip summary" : "Open trip summary"}
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-bold transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isOpen
          ? "bg-primary/10 border-primary text-primary"
          : "bg-white border-grey-light text-foreground hover:bg-grey-lightest hover:border-grey",
      )}
    >
      <ListCheck className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Trip summary</span>
      <ChevronUp
        className={cn("size-3 transition-transform duration-200", isOpen && "rotate-180")}
        aria-hidden="true"
      />
    </button>
  );
}

export function StickySummaryBar({
  startDate,
  endDate,
  adults,
  nights,
  totalPriceLabel,
  items,
}: StickySummaryBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const summaryLine = `${nights} night${nights !== 1 ? "s" : ""} · ${adults} adult${adults !== 1 ? "s" : ""}`;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 w-full bg-card shadow-2xl rounded-t-3xl z-30"
    >
      <div className="max-w-5xl mx-auto">
        {/* COLLAPSED ROW — toggle + summary text (mobile compact) + Book */}
        <div className="flex items-center gap-3 lg:gap-5 py-3 px-4 lg:py-4 lg:px-5">
          <TripSummaryToggle isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} />

          {/* Desktop: detailed summary line */}
          <div className="hidden lg:block flex-1 text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {summaryLine}
          </div>

          {/* Mobile: compact pax + dates icons */}
          <div className="flex lg:hidden flex-1 flex-col gap-0.5 text-xs text-foreground min-w-0">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-grey shrink-0" aria-hidden="true" />
              <span className="truncate">
                {adults} adult{adults !== 1 ? "s" : ""}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-grey shrink-0" aria-hidden="true" />
              <span className="truncate">
                {format(startDate, "dd MMM")} – {format(endDate, "dd MMM yyyy")}
              </span>
            </span>
          </div>

          <Button size="lg" className="shrink-0">
            Book · {totalPriceLabel}
          </Button>
        </div>

        {/* EXPANDABLE PANEL — slides up from the bar.
            max-height transition gives a smooth open/close.
            aria-hidden + pointer-events keep it inert when closed. */}
        <section
          id="trip-summary-panel"
          aria-label="Trip summary"
          aria-hidden={!isOpen}
          className={cn(
            "overflow-hidden transition-[max-height] duration-300 ease-out",
            isOpen
              ? "max-h-[420px] border-t border-grey-light"
              : "max-h-0 border-t border-transparent",
          )}
        >
          <div className="px-4 lg:px-5 py-4 lg:py-5">
            {/* Section title */}
            <h3 className="text-sm font-bold text-foreground mb-3">Your trip at a glance</h3>

            {/* Item list */}
            <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-grey-lightest rounded-lg px-3 py-2"
                >
                  <ItemIcon kind={item.kind} />
                  <span className="text-sm text-foreground flex-1 min-w-0 truncate">
                    {describeItem(item)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Footer summary line */}
            <p className="mt-4 text-xs text-muted-foreground">
              {format(startDate, "dd MMM")} – {format(endDate, "dd MMM yyyy")} · {summaryLine}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
