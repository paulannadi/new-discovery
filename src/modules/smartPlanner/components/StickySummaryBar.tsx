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

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Binoculars,
  Building2,
  CalendarDays,
  Car,
  ChevronUp,
  ListCheck,
  Plane,
  User,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../shared/components/ui/utils";
import type { TimelineItem } from "../utils/seedTimeline";

// One row in the right-hand "Price breakdown" column. Callers can pass a custom
// list (e.g. the stopover flow itemises Flights + Stopover hotel + Trip total);
// when omitted, the bar shows a single "Paid before departure" line.
export type PriceBreakdownLine = {
  label: string;
  // Optional rich label (e.g. the "Stopover package" caption with an info
  // bubble). When set it's rendered instead of the plain `label` text.
  labelNode?: ReactNode;
  sub?: string;        // small grey sub-line under the label (e.g. "2 guests · 2 nights")
  value: string;       // formatted money, e.g. "€1,340" or "+€500"
  total?: boolean;     // the grand-total row — rendered bold with a top divider
};

interface StickySummaryBarProps {
  startDate: Date;
  endDate: Date;
  adults: number;
  nights: number;
  totalPriceLabel: string;             // e.g. "from €2,499"
  items: TimelineItem[];               // Used to build the expanded breakdown
  // Controls visibility — typically driven by an IntersectionObserver on the
  // page that hides the bar while the hero's dates+price capsule is still in
  // view, and shows it once the user has scrolled past. The bar slides in/out
  // from the bottom rather than appearing/disappearing instantly.
  show?: boolean;
  // Override for the bar's positioning. Default is "fixed bottom-0 left-0
  // w-full" which spans the full viewport (canonical full-page Smart Planner).
  // Callers that render this inside a split-screen layout (e.g. the AI
  // conversation canvas that only owns the right 60% of the page) can pass
  // their own positioning to constrain the bar to their column — e.g.
  // "fixed bottom-0 left-0 w-full md:left-[40%] md:w-[60%]".
  positionClassName?: string;
  // The primary button. Defaults to the Smart Planner's "Book · {total}" with no
  // handler. The stopover room step reuses this bar with "Continue" + a handler.
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  // Optional SECONDARY button, shown to the left of the primary one (rendered in
  // the lower-emphasis "secondary" style — blue border + blue text). The stopover
  // room step uses this for "Personalize this trip" alongside "Proceed to checkout".
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionDisabled?: boolean;
  // Optional icon rendered before the secondary button's label (e.g. a pencil).
  secondaryActionIcon?: ReactNode;
  // Custom right-column rows. When omitted, a single "Paid before departure"
  // line is shown (the Smart Planner default).
  priceBreakdown?: PriceBreakdownLine[];
  // When this flips to true, the expandable panel pops open automatically so the
  // user can review their trip before confirming (e.g. once every room in the
  // stopover flow has been selected). It only triggers on the rising edge, so the
  // user is free to close the panel again afterwards.
  autoExpand?: boolean;
}

// Map each item kind to a small line-style icon used in the expanded panel.
// Mid-grey color so they read as supporting glyphs, not primary actions.
function ItemIcon({ kind }: { kind: TimelineItem["kind"] }) {
  const className = "size-5 text-grey shrink-0";
  if (kind === "flight") return <Plane className={className} aria-hidden="true" />;
  if (kind === "accommodation") return <Building2 className={className} aria-hidden="true" />;
  if (kind === "activity") return <Binoculars className={className} aria-hidden="true" />;
  if (kind === "transfer") return <Car className={className} aria-hidden="true" />;
  return <CalendarDays className={className} aria-hidden="true" />;
}

// Section label shown above each category group in the expanded panel.
// Returns null for unknown kinds so the section gets skipped.
function sectionLabel(kind: TimelineItem["kind"]): string {
  switch (kind) {
    case "flight":         return "Flights";
    case "accommodation":  return "Stay";
    case "activity":       return "Activities";
    case "transfer":       return "Transfers";
  }
}

// Order categories appear in the panel — matches a natural trip-flow:
// transport first, then where you're staying, then what you're doing there.
const CATEGORY_ORDER: TimelineItem["kind"][] = [
  "flight",
  "accommodation",
  "activity",
  "transfer",
];

// Each item row needs: title, subtitle, date-or-range string.
// These small helpers keep the JSX clean and the per-kind logic in one place.
function itemTitle(item: TimelineItem): string {
  switch (item.kind) {
    case "flight":         return `${item.flight.from} → ${item.flight.to}`;
    case "accommodation":  return item.hotel.location;
    case "activity":       return item.title;
    case "transfer":       return `${item.from} → ${item.to}`;
  }
}

function itemSubtitle(item: TimelineItem): string {
  switch (item.kind) {
    case "flight":
      return `${item.flight.airline} · ${item.flight.duration}`;
    case "accommodation":
      return `${item.hotel.name} · ${item.nights} night${item.nights !== 1 ? "s" : ""}`;
    case "activity":
      return item.location;
    case "transfer":
      return item.vehicle;
  }
}

function itemDateText(item: TimelineItem): string {
  if (item.kind === "accommodation") {
    // Stay shows the date range — "7 Jul – 8 Jul" — matching the screenshot.
    const checkOut = addDays(item.checkIn, item.nights);
    return `${format(item.checkIn, "d MMM")} – ${format(checkOut, "d MMM")}`;
  }
  // Everything else is a single-day item — just the day it happens on.
  return format(item.date, "d MMM");
}

// The "Trip summary" toggle on the left of the bar.
// Uses the shared Button "link" variant — that's the project's text-only
// button style (primary-blue text, underlines on hover, no background).
function TripSummaryToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="trip-summary-panel"
      aria-label={isOpen ? "Close trip summary" : "Open trip summary"}
      // `px-0` strips the default horizontal padding so the text sits flush
      // with the left edge of the bar — like a text link rather than a pill.
      className="px-0"
    >
      <ListCheck className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Trip summary</span>
      <ChevronUp
        className={cn("size-3 transition-transform duration-200", isOpen && "rotate-180")}
        aria-hidden="true"
      />
    </Button>
  );
}

export function StickySummaryBar({
  startDate,
  endDate,
  adults,
  nights,
  totalPriceLabel,
  items,
  show = true,
  positionClassName = "fixed bottom-0 left-0 w-full",
  actionLabel,
  onAction,
  actionDisabled = false,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionDisabled = false,
  secondaryActionIcon,
  priceBreakdown,
  autoExpand = false,
}: StickySummaryBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pop the panel open when the caller signals the trip is ready to confirm.
  // This fires only when `autoExpand` changes to true (the rising edge), so once
  // it's open the user can freely close it again without it springing back.
  useEffect(() => {
    if (autoExpand) setIsOpen(true);
  }, [autoExpand]);

  // When the bar gets hidden (e.g. user scrolls back up to the hero), also
  // collapse the expanded panel so it doesn't pop open again when the bar
  // slides back in.
  useEffect(() => {
    if (!show) setIsOpen(false);
  }, [show]);

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
      aria-hidden={!show}
      className={cn(
        // Positioning is caller-controlled so the same bar can either span
        // the full viewport (canonical full-page Smart Planner) or be
        // constrained to a canvas column (compact AI mode).
        positionClassName,
        // Slide-up animation: pushed below the viewport when hidden,
        // settles at the bottom when shown.
        "bg-card shadow-2xl rounded-t-3xl z-30",
        "transition-transform duration-300 ease-out",
        show ? "translate-y-0" : "translate-y-full pointer-events-none",
      )}
    >
      <div className="max-w-5xl mx-auto">
        {/* COLLAPSED ROW — toggle + summary text (mobile compact) + actions.
            On mobile this stacks: the toggle+summary sit on top and the action
            buttons drop to their own full-width row below. On desktop (lg) it's
            a single inline row. */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5 py-3 px-4 lg:py-4 lg:px-5">

          {/* Toggle + summary. `lg:contents` makes this wrapper dissolve on
              desktop so the toggle and summary become direct flex children of
              the row again (keeping the original inline layout). */}
          <div className="flex items-center gap-3 lg:contents">
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
          </div>

          {/* Action buttons. Mobile: full-width, stacked with the PRIMARY on top
              (flex-col-reverse lifts the last DOM child up). Desktop: inline row
              with the secondary on the left and the primary on the right. */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 lg:gap-3 w-full lg:w-auto shrink-0">
            {secondaryActionLabel && (
              <Button
                size="lg"
                variant="secondary"
                onClick={onSecondaryAction}
                disabled={secondaryActionDisabled}
                className="w-full sm:w-auto"
              >
                {secondaryActionIcon}
                {secondaryActionLabel}
              </Button>
            )}
            <Button
              size="lg"
              onClick={onAction}
              disabled={actionDisabled}
              className="w-full sm:w-auto"
            >
              {actionLabel ?? `Book · ${totalPriceLabel}`}
            </Button>
          </div>
        </div>

        {/* EXPANDABLE PANEL — slides up from the bar.
            max-height transition gives a smooth open/close.
            aria-hidden + pointer-events keep it inert when closed.
            max-h is bumped to fit the two-column layout comfortably; if the
            content is taller, the inner list scrolls. */}
        <section
          id="trip-summary-panel"
          aria-label="Trip summary"
          aria-hidden={!isOpen}
          className={cn(
            "overflow-hidden transition-[max-height] duration-300 ease-out",
            isOpen
              ? "max-h-[520px] border-t border-grey-light"
              : "max-h-0 border-t border-transparent",
          )}
        >
          {/* Two-column layout on desktop (items | price breakdown).
              On mobile they stack and the divider becomes a horizontal line. */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_minmax(220px,280px)] gap-y-6 lg:gap-x-10 px-4 lg:px-6 py-5 lg:py-6 max-h-[460px] overflow-y-auto">

            {/* ── LEFT COLUMN: items grouped by category ────────────────── */}
            <div className="flex flex-col gap-6">
              {CATEGORY_ORDER.map((kind) => {
                // Filter items down to this category — skip the section
                // entirely if there are none of this kind in the trip.
                const groupItems = items.filter((it) => it.kind === kind);
                if (groupItems.length === 0) return null;

                return (
                  <div key={kind} className="flex flex-col gap-3">
                    {/* Section header — uppercase, light grey, tracked-out.
                        Matches the "DEPART / RETURN" labels in the hero. */}
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-grey">
                      {sectionLabel(kind)}
                    </h3>

                    {/* Items in this category */}
                    <ul className="flex flex-col gap-3">
                      {groupItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start gap-3"
                        >
                          <ItemIcon kind={item.kind} />

                          {/* Title + subtitle stack on the left, flex-1 so it
                              takes available room; min-w-0 lets the text
                              truncate inside this flex child. */}
                          <div className="flex-1 min-w-0 flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {itemTitle(item)}
                            </span>
                            <span className="text-xs text-muted-foreground truncate mt-0.5">
                              {itemSubtitle(item)}
                            </span>
                          </div>

                          {/* Date — right-aligned, doesn't shrink */}
                          <span className="text-sm text-foreground shrink-0 mt-0.5">
                            {itemDateText(item)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* ── DIVIDER ───────────────────────────────────────────────
                Desktop: vertical line between columns.
                Mobile: horizontal line between stacked sections. */}
            <div
              aria-hidden
              className="hidden lg:block w-px bg-grey-light"
            />
            <div
              aria-hidden
              className="lg:hidden h-px bg-grey-light"
            />

            {/* ── RIGHT COLUMN: price breakdown ─────────────────────────
                Callers can itemise this (the stopover flow passes Flights +
                Stopover hotel + Trip total). With no custom list we fall back to
                a single "Paid before departure" line using the trip total. */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-grey">
                Price breakdown
              </h3>
              {(priceBreakdown ?? [{ label: "Paid before departure", value: totalPriceLabel }]).map(
                (line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-baseline justify-between gap-4",
                      line.total && "pt-3 mt-1 border-t border-grey-light",
                    )}
                  >
                    <span className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm text-foreground",
                          line.total && "font-bold",
                        )}
                      >
                        {line.labelNode ?? line.label}
                      </span>
                      {line.sub && (
                        <span className="text-xs text-grey mt-0.5">{line.sub}</span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold text-foreground shrink-0",
                        line.total && "text-base font-bold",
                      )}
                    >
                      {line.value}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
