// FlightResultCard — the redesigned card for one flight option.
//
// Layout (matches the screenshot):
//
//   ┌──────────────────────────────────────────────────────┬──────────────┐
//   │ Outbound – 07 Jul 2026               [American Airlines logo]       │
//   │                                                      │  [Cheapest]  │
//   │  08:00       ──── Non-Stop ────       11:00          │              │
//   │   ZRH               9h 0min            JFK           │   $316       │
//   │                                                      │  total for   │
//   │  [Economy]                          More details →   │  all pax     │
//   │                                                      │  [ Select ]  │
//   └──────────────────────────────────────────────────────┴──────────────┘
//
// Right-side column is divided from the left by a vertical border on md+
// and stacks below on mobile.

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plane } from "lucide-react";
import { Button } from "../../../../shared/components/ui/button";
import { Badge } from "../../../../shared/components/ui/badge";
import { cn } from "../../../../shared/components/ui/utils";
import { getAirlineLogo } from "./airlineLogos";
import type { FlightOption } from "../../../../App";

type FlightResultCardProps = {
  option: FlightOption;
  // Date of this leg — shown as "Outbound – 07 Jul 2026" in the top-left.
  legDate: Date | undefined;
  // Airport / city labels shown under the times (e.g. "ZRH" and "JFK").
  // The parent derives these from the current leg's `from` / `to`.
  fromCode: string;
  toCode: string;
  // Which leg number this card is for — flips "Outbound" → "Return" on leg 2,
  // or "Flight N" for multi-city. Optional; defaults to "Outbound".
  legIndex?: number;
  totalLegs?: number;
  cabinLabel: string;
  onSelect: () => void;
  onMoreDetails?: () => void;
};

// Small coloured pill that highlights "Cheapest" / "Best" / "Fastest".
// Sits above the price in the right column.
function ResultBadge({ label }: { label: "Best" | "Cheapest" | "Fastest" }) {
  const styles = {
    Best: "bg-success/10 text-success border-success/20",
    Cheapest: "bg-success/10 text-success border-success/20",
    Fastest: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border",
        styles[label],
      )}
    >
      {label}
    </span>
  );
}

// Pick the right leg label — "Outbound" / "Return" for round trips,
// "Flight N" otherwise.
function getLegLabel(legIndex?: number, totalLegs?: number): string {
  if (legIndex === undefined) return "Outbound";
  if (totalLegs === 2) return legIndex === 0 ? "Outbound" : "Return";
  return `Flight ${legIndex + 1}`;
}

export function FlightResultCard({
  option,
  legDate,
  fromCode,
  toCode,
  legIndex,
  totalLegs,
  cabinLabel,
  onSelect,
  onMoreDetails,
}: FlightResultCardProps) {
  const logoSrc = getAirlineLogo(option.airlineCode);
  const dateLabel = legDate ? format(legDate, "dd MMM yyyy") : "";
  const legLabel = getLegLabel(legIndex, totalLegs);

  // Track whether the logo file is missing on disk so we can render the
  // initials fallback instead of a broken-image gap. Reset whenever the
  // src changes so a different airline gets a fresh attempt.
  const [logoFailed, setLogoFailed] = useState(false);
  useEffect(() => {
    setLogoFailed(false);
  }, [logoSrc]);
  const showLogoImage = logoSrc && !logoFailed;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* ── LEFT SIDE: trip details + times bar ───────────────────────── */}
        <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">

          {/* Top row — "Outbound – date" on the left, airline logo on the right */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs md:text-sm text-muted-foreground">
              {legLabel}{dateLabel ? ` – ${dateLabel}` : ""}
            </span>

            {/* Airline logo — falls back to a small pill with the 2-letter
                code if the SVG file is missing or fails to load. The pill is
                styled to read as a deliberate brand mark, not an error. */}
            {showLogoImage ? (
              <img
                src={logoSrc}
                alt={option.airline}
                className="h-6 w-auto max-w-[120px] object-contain shrink-0"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div
                className="h-6 px-2 rounded-md bg-primary/10 flex items-center justify-center shrink-0"
                aria-label={option.airline}
              >
                <span className="text-[11px] font-extrabold text-primary tracking-wider">
                  {option.airlineCode}
                </span>
              </div>
            )}
          </div>

          {/* Times bar — departure / connector / arrival */}
          <div className="flex items-center gap-3 md:gap-6 mt-2">
            {/* Departure */}
            <div className="text-left shrink-0 min-w-[60px]">
              <div className="text-xl md:text-2xl font-extrabold text-foreground leading-none">
                {option.departure}
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate max-w-[80px]" title={fromCode}>
                {fromCode}
              </div>
            </div>

            {/* Connector — line + stops label + duration */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-foreground">
                {option.stops === "Direct" ? "Non-Stop" : option.stops}
                {option.stopInfo ? ` · ${option.stopInfo}` : ""}
              </span>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane size={12} className="text-grey shrink-0" aria-hidden="true" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <span className="text-xs text-muted-foreground">
                {option.duration.replace(/m\b/, "min")}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right shrink-0 min-w-[60px]">
              <div className="text-xl md:text-2xl font-extrabold text-foreground leading-none">
                {option.arrival}
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate max-w-[80px] ml-auto" title={toCode}>
                {toCode}
              </div>
            </div>
          </div>

          {/* Bottom row — cabin pill on the left, "More details" link on the right */}
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-muted-foreground">
              {cabinLabel}
            </Badge>
            {onMoreDetails && (
              <button
                type="button"
                onClick={onMoreDetails}
                className="text-xs font-bold text-primary hover:underline"
              >
                More details
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDE: badge + price + Select ───────────────────────── */}
        <div className="md:border-l border-t md:border-t-0 border-border bg-grey-lightest/40 md:min-w-[180px] flex flex-col items-center justify-center gap-2 p-4 md:p-5">
          {option.badge && <ResultBadge label={option.badge} />}
          <div className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            ${option.price}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            total for all passengers
          </div>
          <Button
            onClick={onSelect}
            size="lg"
            className="w-full mt-2 font-bold"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}
