// StopoverBookingSummaryPage — the review/confirm step of the stopover flow.
//
//   flights → stopover hotel → room selection → THIS PAGE → (checkout / Smart Planner)
//
// This is the moment the traveller confirms every choice they've made along the
// funnel before committing. Everything here is READ-ONLY: a hero image of the
// stopover hub, the chosen flights, and the hotel + room they picked, all laid
// out succinctly. Two CTAs close it out: "Proceed to checkout" (primary) and
// "Personalize this package" (secondary → Smart Planner, to add activities etc).

import { useState, useRef, useEffect } from "react";
import { BackButton } from "../../../shared/components/BackButton";
import AccommodationStar from "../../../shared/components/AccommodationStar";
import RatingBlock from "../../../shared/components/RatingBlock";
import { MapPin, MapPinned, Plane, Bed, Users, Pencil, Calendar, ChevronRight } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { Button } from "../../../shared/components/ui/button";
import { PageContainer } from "../../../shared/components/PageContainer";
import { ImageWithPlaceholder } from "../../../shared/components/loading";
// The shared bottom bar — it already does a trip summary + a primary/secondary
// CTA pair. Here it only slides up once the user scrolls past the hero capsule.
import { StickySummaryBar, type PriceBreakdownLine } from "../components/StickySummaryBar";
import { StopoverPackageLabel } from "../components/StopoverPackageLabel";
import type { TimelineItem } from "../utils/seedTimeline";
import { cityImage } from "../../../shared/utils/hotelUtils";
// Maps a flight's airport code (e.g. "GND") to its city ("Grenada") so we can
// headline the trip's FINAL destination, not the stopover hub.
import { findAirportByCode } from "../components/flightSearch/airports";
import type { RoomConfig, RoomSelection } from "../components/rooms/roomData";
// The full chosen-flight objects (leg + option) carry the stopover segment
// detail we need to show the two-flight legs. Type-only import — no runtime cycle.
import type { SelectedFlightLeg } from "../../../App";

// The slice of a hotel this page needs (same fields StopoverRoomPage uses).
type StopoverHotel = {
  id: string;
  name: string;
  image: string;
  stars: number;
  rating: number;
  reviewCount: number;
};

// ── A single flight leg, read-only ───────────────────────────────────────────
// For the leg that carries the stopover, we show its two segments (origin → hub,
// then hub → destination) with the stay in between. Plain legs show one row.
function FlightLegSummary({ leg }: { leg: SelectedFlightLeg }) {
  const { option } = leg;
  const stop = option.stopover;
  const dateLabel = leg.leg.date ? format(leg.leg.date, "EEE d MMM yyyy") : null;
  // The hub's short code (e.g. "NAN") reads best as the segment endpoint; fall
  // back to the city name if a code wasn't provided.
  const hub = stop?.hubCode ?? stop?.city ?? "";

  // Full "City (CODE)" labels for the header route line. The segment rows below
  // keep just the bare airport codes. Fall back to the code if it's not in the
  // airport lookup table.
  const fromCity = findAirportByCode(leg.leg.from)?.city ?? leg.leg.from;
  const toCity = findAirportByCode(leg.leg.to)?.city ?? leg.leg.to;

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
      {/* Header: route (city + code) + date. The codes alone live in the
          segment rows below. */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-2 font-bold text-foreground">
          <Plane size={16} className="text-primary shrink-0" aria-hidden="true" />
          {fromCity} ({leg.leg.from}) → {toCity} ({leg.leg.to})
        </span>
        {dateLabel && <span className="text-sm text-foreground">{dateLabel}</span>}
      </div>

      {stop?.out && stop?.onward ? (
        // Two-segment stopover leg
        <div className="flex flex-col gap-2">
          <SegmentRow from={leg.leg.from} to={hub} seg={stop.out} />
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 text-primary px-3 py-2 text-sm">
            <MapPinned size={14} className="shrink-0" aria-hidden="true" />
            <span className="font-semibold">
              Stopover · {stop.nights} night{stop.nights !== 1 ? "s" : ""} in {stop.city}
            </span>
          </div>
          <SegmentRow from={hub} to={leg.leg.to} seg={stop.onward} />
        </div>
      ) : (
        // Plain leg — one row of times + duration
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">{option.departure}</span>
            <span className="text-foreground">{leg.leg.from}</span>
          </div>
          <div className="flex flex-col items-center text-xs text-foreground">
            <span>{option.duration}</span>
            <span>{option.stops}{option.stopInfo ? ` · ${option.stopInfo}` : ""}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-foreground">{option.arrival}</span>
            <span className="text-foreground">{leg.leg.to}</span>
          </div>
        </div>
      )}

      <div className="text-xs text-foreground">{option.airline}</div>
    </div>
  );
}

// One segment of a leg (origin → hub, or hub → destination).
function SegmentRow({
  from,
  to,
  seg,
}: {
  from: string;
  to: string;
  seg: { depTime: string; arrTime: string; duration: string; arrivesNextDay?: boolean; note?: string };
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-foreground">{seg.depTime}</span>
        <span className="text-foreground">{from}</span>
      </div>
      <div className="flex flex-col items-center text-xs text-foreground flex-1">
        <span>{seg.duration}</span>
        {seg.note && <span>{seg.note}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-foreground">
          {seg.arrTime}
          {seg.arrivesNextDay && <sup className="text-[10px] ml-0.5">+1</sup>}
        </span>
        <span className="text-foreground">{to}</span>
      </div>
    </div>
  );
}

// One chosen room, read-only.
function RoomSummaryRow({
  index,
  sel,
  guests,
  showLabel,
}: {
  index: number;
  sel: RoomSelection;
  guests: number;
  showLabel: boolean;
}) {
  const board = sel.room.extras.find((e) => e.id === sel.extraOption)?.label;
  const cancel = sel.room.cancellationPolicies.find((c) => c.id === sel.cancelOption)?.label;
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <Bed size={15} className="text-primary shrink-0" aria-hidden="true" />
          {showLabel ? `Room ${index + 1}: ` : ""}{sel.room.name}
        </span>
        <span className="flex items-center gap-1 text-sm text-foreground shrink-0">
          <Users size={13} aria-hidden="true" /> {guests}
        </span>
      </div>
      {/* Bed / occupancy / board / cancellation — the details that reassure. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-foreground pl-[23px]">
        <span>{sel.room.details.bedType}</span>
        <span aria-hidden="true">·</span>
        <span>Sleeps {sel.room.details.sleeps}</span>
        {board && (<><span aria-hidden="true">·</span><span>{board}</span></>)}
        {cancel && (<><span aria-hidden="true">·</span><span>{cancel}</span></>)}
      </div>
    </div>
  );
}

export default function StopoverBookingSummaryPage({
  hotel,
  city,
  nights,
  selectedFlightLegs,
  roomSelections,
  roomConfig,
  tripTotal,
  headerSlot,
  searchSummarySlot,
  onBack,
  onProceedToCheckout,
  onPersonalize,
}: {
  hotel: StopoverHotel | null;
  city: string;
  nights: number;
  // The full chosen-flight objects, so we can show the stopover segments.
  selectedFlightLegs: SelectedFlightLeg[];
  roomSelections: { [id: number]: RoomSelection | null };
  roomConfig: RoomConfig[];
  // The bundled stopover-package total (€) computed on the room page.
  tripTotal: number;
  // The FlightStepper (all steps done), built by App and passed in.
  headerSlot?: React.ReactNode;
  // The collapsed search-criteria row, rendered inside the white header strip
  // (under the back button) so it's an integral part of the header — matching
  // the flight results step.
  searchSummarySlot?: React.ReactNode;
  // "Back to discovery" — exits the whole flow.
  onBack: () => void;
  // PRIMARY CTA — placeholder for now (no checkout page yet).
  onProceedToCheckout: () => void;
  // SECONDARY CTA — open the Smart Planner to add activities/transfers.
  onPersonalize: () => void;
}) {
  // The bottom summary bar stays hidden until the user scrolls past the hero's
  // ticket capsule (same pattern as the Smart Planner page). Until then the CTAs
  // live in the hero, so showing the bar too would just duplicate them.
  // (Hooks must run before any early return, so they sit at the very top.)
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const sentinel = heroSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only reveal once the sentinel has scrolled ABOVE the viewport (i.e.
        // the user passed the hero), not while it's still below on tall screens.
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-xl font-bold">Booking not found</h1>
        <BackButton label="Back to discovery" onClick={onBack} />
      </div>
    );
  }

  // Total travellers across all rooms (drives the hero sub-line + summary bar).
  const totalGuests = roomConfig.reduce((sum, c) => sum + c.adults + c.children, 0);

  // The trip's FINAL destination — the outbound leg's arrival airport, mapped to
  // its city name. THIS is what the traveller is really buying; the stopover hub
  // (`city`) is a bonus along the way. So the hero headlines the destination and
  // frames the stopover as an extra.
  const destCode = selectedFlightLegs[0]?.leg.to ?? "";
  const finalDestination = findAirportByCode(destCode)?.city ?? destCode ?? city;

  // Trip span, derived from the first/last flight dates (for the bar's
  // "X nights · Y adults" line). Falls back gracefully if dates are missing.
  const firstLegDate = selectedFlightLegs[0]?.leg.date ?? new Date();
  const lastLegDate = selectedFlightLegs[selectedFlightLegs.length - 1]?.leg.date ?? firstLegDate;
  const tripNights = Math.max(1, differenceInCalendarDays(lastLegDate, firstLegDate));

  // Build the bottom bar's timeline items: one row per flight leg + the stay.
  const summaryItems: TimelineItem[] = [
    ...selectedFlightLegs.map((s, i) => ({
      kind: "flight" as const,
      id: `summary-flight-${i}`,
      direction: "leg" as const,
      date: s.leg.date ?? firstLegDate,
      flight: {
        from: s.leg.from,
        to: s.leg.to,
        stops: "",
        duration: s.option.duration,
        airline: s.option.airline,
        price: "",
      },
    })),
    {
      kind: "accommodation" as const,
      id: "summary-stay",
      checkIn: firstLegDate,
      nights,
      hotel: {
        name: hotel.name,
        image: hotel.image,
        stars: hotel.stars,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        location: city,
        price: tripTotal,
      },
    },
  ];

  // The bundled "Stopover package" line, then a bold "Total" row beneath it —
  // the "Total" label + "1,886 €" format match the hero card's footer. Amounts
  // are written as "<number> €" (not "€<number>") to stay consistent throughout.
  const priceBreakdown: PriceBreakdownLine[] = [
    { label: "Stopover package", labelNode: <StopoverPackageLabel />, value: `${tripTotal.toLocaleString()} €` },
    { label: "Total", value: `${tripTotal.toLocaleString()} €`, total: true },
  ];

  // The rooms the traveller actually selected (skip any empty slots defensively).
  const chosenRooms = roomConfig
    .map((config) => ({ config, sel: roomSelections[config.id] }))
    .filter((r): r is { config: RoomConfig; sel: RoomSelection } => r.sel != null);

  return (
    // pb-40 keeps the fixed bottom bar (taller on mobile with two stacked CTAs)
    // from covering the last of the page content.
    <div className="bg-grey-lightest min-h-screen pb-40">

      {/* ── WHITE HEADER STRIP — back button only (matches the room step) ──── */}
      <div className="bg-card border-b border-border z-30 relative">
        <PageContainer tier="narrow" className="px-4 md:px-6 py-4">
          {/* Back button + collapsed search criteria beneath it — same stacked
              header layout as the flight results step. */}
          <BackButton
            label="Back to discovery"
            onClick={onBack}
            className={searchSummarySlot ? "mb-3" : undefined}
          />
          {searchSummarySlot}
        </PageContainer>
      </div>

      {/* ── GREY SECTION — the all-done flight stepper ─────────────────────── */}
      <div className="bg-grey-lightest">
        <PageContainer tier="narrow" className="px-4 md:px-6 pt-4 pb-3">
          {headerSlot}
        </PageContainer>
      </div>

      {/* ── HERO — a compact horizontal "package card" (hotel-card style):
          the destination photo on the LEFT, the trip facts + booking CTAs on
          the RIGHT. Deliberately low-key (a calm confirmation card, not a tall
          full-bleed banner) so attention stays on confirming and booking. ───── */}
      <PageContainer tier="narrow" className="px-4 md:px-6 pt-4">
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col md:flex-row">

          {/* LEFT — destination photo. Fixed height when stacked below md; at
              md+ the photo is absolutely positioned (inset-0) so it contributes
              NO intrinsic height — that lets the text column drive the card
              height and the photo simply covers it. Without this the photo's
              natural height was taller than the text, so the flex row stretched
              and `mt-auto` left a big gap above the footer divider. */}
          <div className="relative w-full md:w-[300px] lg:w-[340px] h-[180px] md:h-auto shrink-0 overflow-hidden">
            <div className="md:absolute md:inset-0 w-full h-full">
              <ImageWithPlaceholder
                src={cityImage(finalDestination)}
                alt={finalDestination}
                priority
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* RIGHT — the information card. Everything left-aligned: title at
              the top, a single travellers · dates info row, then the total +
              booking CTAs pinned to the bottom. */}
          <div className="flex-1 flex flex-col gap-3 p-5 md:p-6 text-left">

            {/* Title — left-aligned, smaller than the old banner heading. */}
            <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
              Trip to {finalDestination} with {city} stopover
            </h1>

            {/* Info row — travellers · date range, each with an icon and
                separated by a thin divider (the same idiom the Discovery cards
                use). Icons use our foreground (black) token. Wraps on narrow
                widths. (The nights count was dropped — it lives on the stay
                card lower down, so it was redundant here.) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-foreground">
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-foreground shrink-0" aria-hidden="true" />
                {totalGuests} traveller{totalGuests !== 1 ? "s" : ""}
              </span>
              <span aria-hidden className="w-px h-4 bg-border" />
              <span className="flex items-center gap-1.5">
                <Calendar size={15} className="text-foreground shrink-0" aria-hidden="true" />
                {format(firstLegDate, "EEE, d MMM")} – {format(lastLegDate, "EEE, d MMM yyyy")}
              </span>
            </div>

            {/* Footer (pinned to the card bottom with `mt-auto`): a thin divider,
                then the total stacked on the LEFT and the two booking actions
                grouped together on the RIGHT — Personalize as a quiet text
                button beside the primary checkout CTA. Stacks on mobile. */}
            {/* Even 16px on both sides of the divider: above = the column's
                gap-3 (12px) topped up by mt-1 (4px); below = pt-4 (16px). Done
                this way (rather than bumping the column gap) so the title↔info
                spacing above stays unchanged. */}
            <div className="mt-1 pt-4 border-t border-border flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {/* LEFT — total label with the amount beneath it. */}
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="mt-1 text-2xl font-extrabold text-foreground">{tripTotal.toLocaleString()} €</span>
              </div>
              {/* RIGHT — actions grouped: Personalize (text button) + primary CTA. */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-primary hover:text-primary" onClick={onPersonalize}>
                  <Pencil size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Personalize this package</span>
                  <span className="sm:hidden">Personalize</span>
                </Button>
                <Button onClick={onProceedToCheckout}>
                  Proceed to checkout
                  <ChevronRight size={18} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Invisible sentinel just below the hero — once it scrolls off the top of
          the viewport, the IntersectionObserver reveals the sticky bottom bar. */}
      <div ref={heroSentinelRef} aria-hidden className="h-0 w-0" />

      {/* ── INTRO — confirm-step heading. The "personalize" action now lives in
          the hero card beside the checkout CTA, so this row is just the
          heading + a short instruction. */}
      <PageContainer tier="narrow" className="px-4 md:px-6 pt-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold text-foreground">Review your trip</h2>
          <p className="text-sm text-foreground">
            Check the details below — when everything looks right, proceed to checkout.
          </p>
        </div>
      </PageContainer>

      {/* ── FLIGHTS ────────────────────────────────────────────────────────── */}
      <PageContainer tier="narrow" className="px-4 md:px-6 pt-6 flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
          <Plane size={15} className="text-primary shrink-0" aria-hidden="true" />
          Your flights
        </h3>
        {selectedFlightLegs.map((leg, i) => (
          <FlightLegSummary key={`${leg.leg.id}-${i}`} leg={leg} />
        ))}
      </PageContainer>

      {/* ── HOTEL + CHOSEN ROOM(S) ─────────────────────────────────────────── */}
      <PageContainer tier="narrow" className="px-4 md:px-6 pt-8 flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
          <Bed size={15} className="text-primary shrink-0" aria-hidden="true" />
          Your stopover stay
        </h3>
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-4">
          {/* Hotel header — small picture first (unchanged). Beside it: the
              name + stars and dates · location on the LEFT, and the TrustYou
              score + reviews pushed to the RIGHT (`justify-between`) so the row
              reads balanced rather than everything bunched left. */}
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-lg">
              <ImageWithPlaceholder src={hotel.image} alt={hotel.name} containerClassName="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
              {/* LEFT — name + stars, then dates · location. */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-extrabold text-foreground truncate">{hotel.name}</h4>
                  <AccommodationStar rating={hotel.stars} offerName={hotel.name} offerId={hotel.id} size={14} />
                </div>
                {/* Dates · location — icons + text in our foreground (black),
                    split by a thin divider (same idiom as the hero info row). */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-foreground shrink-0" aria-hidden="true" />
                    Check-in {format(firstLegDate, "d MMM yyyy")} · {nights} night{nights !== 1 ? "s" : ""}
                  </span>
                  <span aria-hidden className="w-px h-4 bg-border" />
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-foreground shrink-0" aria-hidden="true" />
                    {city}
                  </span>
                </div>
              </div>
              {/* RIGHT — TrustYou score + reviews, pushed right for balance. */}
              <div className="shrink-0">
                <RatingBlock reviewScore={hotel.rating} reviewCount={hotel.reviewCount} />
              </div>
            </div>
          </div>

          {/* Chosen room(s) */}
          {chosenRooms.map(({ config, sel }, i) => (
            <RoomSummaryRow
              key={config.id}
              index={i}
              sel={sel}
              guests={config.adults + config.children}
              // Only prefix "Room N:" when there's more than one room.
              showLabel={chosenRooms.length > 1}
            />
          ))}
        </div>
      </PageContainer>

      {/* ── STICKY BOTTOM BAR — slides up once the user scrolls past the hero,
          carrying the total + both CTAs (the persistent action bar). ───────── */}
      <StickySummaryBar
        startDate={firstLegDate}
        endDate={lastLegDate}
        adults={totalGuests}
        nights={tripNights}
        totalPriceLabel={`${tripTotal.toLocaleString()} €`}
        items={summaryItems}
        priceBreakdown={priceBreakdown}
        // PRIMARY — proceed to checkout (placeholder for now).
        actionLabel={`Proceed to checkout · ${tripTotal.toLocaleString()} €`}
        actionIcon={<ChevronRight size={16} aria-hidden="true" />}
        onAction={onProceedToCheckout}
        // SECONDARY — back into the Smart Planner to personalize the package.
        secondaryActionLabel="Personalize this package"
        secondaryActionIcon={<Pencil size={16} aria-hidden="true" />}
        onSecondaryAction={onPersonalize}
        // Only slide up once the user has scrolled past the hero capsule (whose
        // CTA would otherwise be duplicated) — same behaviour as Smart Planner.
        show={showStickyBar}
      />
    </div>
  );
}
