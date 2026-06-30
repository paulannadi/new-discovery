// FlightResultCard — the card for one flight option.
//
// Two layouts share this component:
//
//  • NORMAL flight  → a single times bar (departure ── line ── arrival) with
//    the airline logo top-right and the price/Select column on the right.
//
//  • STOPOVER offer → a richer "journey" layout that shows BOTH physical
//    flights stacked, with the multi-night stay called out as a highlighted
//    row between them, plus a footer with the final arrival date:
//
//    The hub shown depends on the route (see getStopoverOffersForLeg in
//    mockFlights.ts) — e.g. a New York → Grenada trip breaks at Port of Spain:
//
//    ┌─────────────────────────────────────────────┬──────────┐
//    │ ✦ Stopover offer   (2 nights in Port of Spain)│          │
//    ├─────────────────────────────────────────────┤  FROM    │
//    │ [BW] Fri 12 Jun   09:30 JFK ─✈─ 14:15 POS    │  $720    │
//    │ [📍] ┌ 2-night stopover in Port of Spain ────┐│ per person│
//    │ [BW] Mon 15 Jun   16:10 POS ─✈─ 17:00 GND    │ [Select] │
//    │ 📍 Arrive Grenada Mon 15 Jun       4 days     │          │
//    └─────────────────────────────────────────────┴──────────┘

import { useState, useEffect, type ReactNode } from "react";
import { format, addDays } from "date-fns";
import { Plane, Route, MapPin } from "lucide-react";
import { Button } from "../../../../shared/components/ui/button";
import { Badge } from "../../../../shared/components/ui/badge";
import { cn } from "../../../../shared/components/ui/utils";
import { getAirlineLogo } from "./airlineLogos";
import { StopoverPackageLabel } from "../StopoverPackageLabel";
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
  // Stopover/package flow: show "Stopover package" wording + the bundled price.
  packageMode?: boolean;
  // The anchored package price to show instead of the raw fare (stopover flow).
  displayPrice?: number;
  onSelect: () => void;
  onMoreDetails?: () => void;
};

// Small coloured pill that highlights "Cheapest" / "Best" / "Fastest".
// Sits above the price in the right column.
//
// Built on the shared <Badge> so it matches the app's other badges (shape,
// padding, weight). "Best"/"Cheapest" share the green "good deal" tint via a
// className override on the outline variant; "Fastest" uses the neutral
// `secondary` token so it reads as distinct — no more hardcoded purple.
function ResultBadge({ label }: { label: "Best" | "Cheapest" | "Fastest" }) {
  if (label === "Fastest") {
    return <Badge variant="secondary">{label}</Badge>;
  }
  return (
    <Badge
      variant="outline"
      className="bg-success/10 text-success border-success/20"
    >
      {label}
    </Badge>
  );
}

// Pick the right leg label — "Outbound" / "Return" for round trips,
// "Flight N" otherwise.
function getLegLabel(legIndex?: number, totalLegs?: number): string {
  if (legIndex === undefined) return "Outbound";
  if (totalLegs === 2) return legIndex === 0 ? "Outbound" : "Return";
  return `Flight ${legIndex + 1}`;
}

// ── AirlineMark — the airline logo for a flight inside the stopover journey.
// Styled to match the normal flight card's logo exactly: a wide h-6 image, with
// a small 2-letter pill fallback when the SVG is missing or fails to load.
// Local fallback state resets if the src changes so a different airline gets a
// fresh attempt.
function AirlineMark({ logoSrc, code, name }: { logoSrc: string | undefined; code: string; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [logoSrc]);
  const show = logoSrc && !failed;
  return show ? (
    <img
      src={logoSrc}
      alt={name}
      className="h-6 w-auto max-w-[120px] object-contain shrink-0"
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className="h-6 px-2 rounded-md bg-primary/10 flex items-center justify-center shrink-0"
      aria-label={name}
    >
      <span className="text-[11px] font-extrabold text-primary tracking-wider">{code}</span>
    </div>
  );
}

// ── JourneySegment — one physical flight inside the stopover layout: a date
// line, then [airline mark] + departure ──✈── arrival times bar.
function JourneySegment({
  mark,
  dateLabel,
  depTime,
  depCode,
  arrTime,
  arrCode,
  duration,
  note,
  arrivesNextDay,
}: {
  mark: ReactNode;
  dateLabel?: string;
  depTime: string;
  depCode: string;
  arrTime: string;
  arrCode: string;
  duration: string;
  note?: string;
  arrivesNextDay?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Top row — date on the left, airline logo on the right. This mirrors the
          normal flight card so the logo sits in the same place: in the date row,
          right above the times. */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{dateLabel}</span>
        {mark}
      </div>

      {/* Times bar — full width, no left icon column anymore. */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Departure */}
        <div className="shrink-0 min-w-[60px]">
          <div className="text-2xl font-extrabold text-foreground leading-none">{depTime}</div>
          <div className="text-sm text-foreground mt-1">{depCode}</div>
        </div>

        {/* Connector: duration · line with a plane · note */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-sm text-foreground">{duration}</span>
          <div className="w-full flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-foreground/40 shrink-0" />
            <div className="flex-1 h-px bg-border" />
            <Plane size={12} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <div className="flex-1 h-px bg-border" />
            <span className="size-1.5 rounded-full bg-foreground/40 shrink-0" />
          </div>
          {note && <span className="text-sm text-foreground">{note}</span>}
        </div>

        {/* Arrival — "+1" superscript when it lands the next day */}
        <div className="shrink-0 min-w-[60px] text-right">
          <div className="text-2xl font-extrabold text-foreground leading-none">
            {arrTime}
            {arrivesNextDay && (
              <sup className="ml-0.5 align-super text-sm font-bold text-primary">+1</sup>
            )}
          </div>
          <div className="text-sm text-foreground mt-1">{arrCode}</div>
        </div>
      </div>
    </div>
  );
}

export function FlightResultCard({
  option,
  legDate,
  fromCode,
  toCode,
  legIndex,
  totalLegs,
  cabinLabel,
  packageMode = false,
  displayPrice,
  onSelect,
  onMoreDetails,
}: FlightResultCardProps) {
  // The figure to show: the anchored package price when supplied, else the fare.
  const shownPrice = displayPrice ?? option.price;
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

  // ── STOPOVER LAYOUT ────────────────────────────────────────────────────
  // Only when the offer carries the two-segment breakdown. We derive every
  // date from the leg's departure date + the number of stopover nights:
  //   depart → (lands, maybe +1) → stay N nights → onward departs → final arrival.
  const stop = option.stopover;
  if (stop?.out && stop.onward) {
    const { out, onward, nights, city, hubCode } = stop;

    // Date math (only when we know the departure date). Each flight shows its
    // own date: depart → (lands, maybe +1) → stay N nights → onward departs.
    const depDate = legDate;
    const outArrDate = depDate ? addDays(depDate, out.arrivesNextDay ? 1 : 0) : undefined;
    const stayStart = outArrDate;                                   // hotel check-in
    const stayEnd = stayStart ? addDays(stayStart, nights) : undefined; // check-out = onward departs
    const onwardDepDate = stayEnd;
    const hubLabel = hubCode ?? city;

    const stayRange =
      stayStart && stayEnd
        ? `${format(stayStart, "d")}–${format(stayEnd, "d MMM")}`
        : undefined;

    return (
      <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden">
        {/* Header banner */}
        <div className="flex flex-wrap items-center gap-2 bg-primary px-4 md:px-5 py-2 text-primary-foreground">
          <Route size={15} aria-hidden="true" />
          <span className="text-sm font-bold">Stopover offer</span>
          {/* Curated tag (Cheapest / Fastest / Best) — pushed to the far right so
              several offers through the same hub read as distinct picks. */}
          {option.badge && (
            <span className="ml-auto rounded-full border border-white/50 px-2.5 py-0.5 text-sm font-bold">
              {option.badge}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row">
          {/* LEFT: the two flights + the highlighted stay between them */}
          <div className="flex-1 p-4 md:p-5 flex flex-col gap-3 md:gap-4">
            {/* Flight 1 — origin → hub */}
            <JourneySegment
              mark={<AirlineMark logoSrc={logoSrc} code={option.airlineCode} name={option.airline} />}
              dateLabel={depDate ? format(depDate, "EEE d MMM") : undefined}
              depTime={out.depTime}
              depCode={fromCode}
              arrTime={out.arrTime}
              arrCode={hubLabel}
              duration={out.duration}
              note={out.note}
              arrivesNextDay={out.arrivesNextDay}
            />

            {/* The stopover — a full-width, softly tinted highlight box with the
                pin inline, so its left edge lines up with the times above/below. */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <MapPin size={16} className="text-primary shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold text-primary">
                Spend {nights} night{nights > 1 ? "s" : ""} in {city}
              </span>
              {stayRange && (
                <span className="text-sm text-foreground">{stayRange}</span>
              )}
            </div>

            {/* Flight 2 — hub → destination */}
            <JourneySegment
              mark={<AirlineMark logoSrc={logoSrc} code={option.airlineCode} name={option.airline} />}
              dateLabel={onwardDepDate ? format(onwardDepDate, "EEE d MMM") : undefined}
              depTime={onward.depTime}
              depCode={hubLabel}
              arrTime={onward.arrTime}
              arrCode={toCode}
              duration={onward.duration}
              note={onward.note}
              arrivesNextDay={onward.arrivesNextDay}
            />

            {/* Footer — cabin pill, same as the normal flight card */}
            <div className="flex items-center justify-between mt-1">
              <Badge variant="outline" className="rounded-full px-3 py-0.5 text-foreground">
                {cabinLabel}
              </Badge>
            </div>
          </div>

          {/* RIGHT: price + Select.
              We never show separate flight / hotel prices — it's one bundled
              package. So this is a "From" starting price for the whole package;
              it grows as the traveller picks their stopover room, and the final
              total is shown from here on through the flow. */}
          <div className="border-t md:border-t-0 border-border md:min-w-[210px] flex flex-col items-center justify-center gap-1 p-4 md:p-5 md:relative md:before:content-[''] md:before:absolute md:before:left-0 md:before:top-6 md:before:bottom-6 md:before:w-px md:before:bg-border">
            <div className="flex items-baseline gap-1.5 text-foreground leading-tight">
              <span className="text-sm font-extrabold">from</span>
              <span className="text-2xl font-extrabold">€{shownPrice.toLocaleString()}</span>
            </div>
            <StopoverPackageLabel />
            <Button onClick={onSelect} size="lg" className="w-full mt-3 font-bold">
              Select
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── NORMAL FLIGHT LAYOUT ───────────────────────────────────────────────
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden",
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* ── LEFT SIDE: trip details + times bar ───────────────────────── */}
        <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">

          {/* Top row — "Outbound – date" on the left, airline logo on the right */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-foreground">
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
              <div className="text-2xl font-extrabold text-foreground leading-none">
                {option.departure}
              </div>
              <div className="text-sm text-foreground mt-1 truncate max-w-[80px]" title={fromCode}>
                {fromCode}
              </div>
            </div>

            {/* Connector — line + stops label + duration */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-foreground">
                {`${option.stops === "Direct" ? "Non-Stop" : option.stops}${option.stopInfo ? ` · ${option.stopInfo}` : ""}`}
              </span>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane size={12} className="text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <span className="text-sm text-foreground">
                {option.duration.replace(/m\b/, "min")}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right shrink-0 min-w-[60px]">
              <div className="text-2xl font-extrabold text-foreground leading-none">
                {option.arrival}
              </div>
              <div className="text-sm text-foreground mt-1 truncate max-w-[80px] ml-auto" title={toCode}>
                {toCode}
              </div>
            </div>
          </div>

          {/* Bottom row — cabin pill on the left, "More details" link on the right */}
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-foreground">
              {cabinLabel}
            </Badge>
            {onMoreDetails && (
              <button
                type="button"
                onClick={onMoreDetails}
                className="text-sm font-bold text-primary hover:underline"
              >
                More details
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDE: badge + price + Select ───────────────────────── */}
        <div className="border-t md:border-t-0 border-border md:min-w-[210px] flex flex-col items-center justify-center gap-2 p-4 md:p-5 md:relative md:before:content-[''] md:before:absolute md:before:left-0 md:before:top-6 md:before:bottom-6 md:before:w-px md:before:bg-border">
          {option.badge && <ResultBadge label={option.badge} />}
          <div className="flex items-baseline gap-1.5 text-foreground leading-tight">
            <span className="text-sm font-extrabold">from</span>
            <span className="text-2xl font-extrabold">€{shownPrice.toLocaleString()}</span>
          </div>
          {packageMode ? (
            <StopoverPackageLabel />
          ) : (
            <div className="text-sm text-foreground text-center">
              total for all passengers
            </div>
          )}
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
