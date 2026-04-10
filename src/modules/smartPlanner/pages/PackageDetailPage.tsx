// ─────────────────────────────────────────────────────────────────────────────
// PackageDetailPage — v6 (Figma-precise: node 6113:2402)
//
// Major structural changes from v5:
//   • Page background → #F3F5F6 (fill_LOB3ZX)
//   • Hero height → 402px (matches Figma)
//   • "Package main info" white card (Elevation L shadow) wraps the hero +
//     info row (hotel name/rating + price/CTA side by side)
//   • Removed sticky navbar price/CTA — now lives in the top info card
//   • "Hotel and flight information" H2 section heading (Heading Black/H2)
//   • Room card: bg-white, rounded-[20px], Elevation S shadow
//   • Flight cards: bg-white, rounded-[16px], Elevation S shadow,
//     "Add baggage and extras →" link (fill_CTT1AZ = #2681FF)
//   • Hotel description: bg-white card, rounded-[16px], Elevation S shadow
//   • Hotel highlights: full pill badges (rounded-full, border only)
//   • Reviews: bg-white card, rounded-[16px], Elevation S shadow,
//     "4,3" European decimal format, restructured layout
//   • Rating badge format: "4,3" in green (#19A974) with borderRadius: 8px
//   • Font: Mulish throughout
//   • Right sidebar: rounded-[16px], border + shadow, rate calendar
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { format } from "date-fns";
import {
  MapPin,
  MapPinned,
  Plane,
  Star,
  Wifi,
  Utensils,
  Dumbbell,
  Waves,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Pencil,
  Building2,
  Luggage,
  BedDouble,
  AirVent,
  Eye,
  UtensilsCrossed,
  Users,
  Info,
} from "lucide-react";
import { UnifiedPackage } from "../../../types";
import type { HolidaySearchCriteria } from "../../../App";
import { BackButton } from "../../../shared/components/BackButton";
import { Button } from "../../../shared/components/ui/button";
import AccommodationStar from "../../../shared/components/AccommodationStar";
import RatingBlock from "../../../shared/components/RatingBlock";
import { RateCalendarPanel } from "../components/RateCalendarPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { DayPicker } from "react-day-picker";
import { cn } from "../../../shared/components/ui/utils";
import LeafletMap from "../../../shared/components/LeafletMap";
import { hotelDescription, nearbyPOIs } from "../../../shared/utils/hotelUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface PackageDetailPageProps {
  pkg: UnifiedPackage;
  searchCriteria: HolidaySearchCriteria;
  onBack: () => void;
  onBook: (pkg: UnifiedPackage, selectedDate: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function currencySymbol(code: string): string {
  if (code === "GBP") return "£";
  if (code === "USD") return "$";
  if (code === "EUR") return "€";
  return code + " ";
}

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "EEE, d MMM yyyy");
  } catch {
    return iso;
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatTime(iso: string): string {
  try {
    return format(new Date(iso), "HH:mm");
  } catch {
    return "—";
  }
}

function ratingLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 85) return "Outstanding";
  if (score >= 80) return "Excellent";
  if (score >= 75) return "Very good";
  return "Good";
}

// Converts a TrustYou score (0–100) to the European decimal format shown in
// Figma — e.g. 84 → "4,3" (using comma as decimal separator, scale 0–5)
function formatRatingEU(score: number): string {
  const out5 = (score / 100) * 5;
  // Format to one decimal place, then replace dot with comma
  return out5.toFixed(1).replace(".", ",");
}


// ─────────────────────────────────────────────────────────────────────────────
// AmenityIcon — keyword → Lucide icon
// ─────────────────────────────────────────────────────────────────────────────
function AmenityIcon({ name, size = 15 }: { name: string; size?: number }) {
  const lower = name.toLowerCase();
  if (
    lower.includes("pool") ||
    lower.includes("beach") ||
    lower.includes("water")
  )
    return <Waves size={size} className="text-primary shrink-0" aria-hidden="true" />;
  if (lower.includes("wifi") || lower.includes("internet"))
    return <Wifi size={size} className="text-primary shrink-0" aria-hidden="true" />;
  if (
    lower.includes("dine") ||
    lower.includes("restaurant") ||
    lower.includes("food") ||
    lower.includes("dining") ||
    lower.includes("breakfast")
  )
    return <Utensils size={size} className="text-primary shrink-0" aria-hidden="true" />;
  if (
    lower.includes("gym") ||
    lower.includes("fitness") ||
    lower.includes("sport")
  )
    return <Dumbbell size={size} className="text-primary shrink-0" aria-hidden="true" />;
  if (lower.includes("spa") || lower.includes("wellness"))
    return <Star size={size} className="text-primary shrink-0" aria-hidden="true" />;
  // Default: blue dot bullet (matches Figma's "●" for extra highlights)
  return (
    <span className="w-[15px] h-[15px] flex items-center justify-center text-primary text-xs shrink-0" aria-hidden="true">
      ●
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PriceTrendChart — mini bar chart (unchanged from v5)
// ─────────────────────────────────────────────────────────────────────────────
function PriceTrendChart({
  rateCalendar,
  selectedDate,
  onSelectDate,
}: {
  rateCalendar: NonNullable<UnifiedPackage["rateCalendar"]>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const available = rateCalendar.filter((e) => e.available);
  if (available.length === 0) return null;

  const prices = available.map((e) => e.pricePerPerson);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const cheapestEntry = available.reduce((a, b) =>
    a.pricePerPerson < b.pricePerPerson ? a : b
  );
  const months = [
    ...new Set(available.map((e) => e.departureDate.slice(0, 7))),
  ];

  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-grey uppercase tracking-wide mb-2">
        Price trend
      </div>
      <div className="flex items-end gap-[2px] h-[40px]">
        {available.map((entry) => {
          const heightPct =
            20 + ((entry.pricePerPerson - minPrice) / priceRange) * 80;
          const isSelected = entry.departureDate === selectedDate;
          const isCheapest =
            entry.departureDate === cheapestEntry.departureDate;
          const barColour = cn(
            isSelected ? "bg-primary" : isCheapest ? "bg-success" : "bg-grey-light"
          );
          return (
            <button
              key={entry.departureDate}
              onClick={() => onSelectDate(entry.departureDate)}
              title={`${formatDate(entry.departureDate)}: £${entry.pricePerPerson.toLocaleString()}`}
              className={cn(`flex-1 rounded-t-[2px] transition-opacity hover:opacity-70`, barColour)}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-xs text-grey">
        <span>
          {months[0] ? format(new Date(months[0] + "-01"), "MMM yyyy") : ""}
        </span>
        {months.length > 1 && (
          <span>
            {format(
              new Date(months[months.length - 1] + "-01"),
              "MMM yyyy"
            )}
          </span>
        )}
      </div>
      <div className="flex gap-3 mt-1.5 text-xs text-grey">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success inline-block" />
          Best price
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          Selected
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FlightCard — v6 update
//
// Changes from v5:
//   • White background card with Elevation S shadow (was border-only)
//   • "Add baggage and extras →" text link in blue (#2681FF) — matches Figma
//   • "Outbound" badge: bg-[#EFF6FF] text-[#2681FF] (unchanged)
//   • "Return" badge: bg-[#F0FDF4] text-[#16A34A] (unchanged)
//   • "Direct" text: #16A34A green (unchanged)
//   • Departure time: 22px bold, airport code: 12px medium (matches Figma)
//   • borderRadius: 16px (unchanged)
//   • Shadow: shadow-[0_2px_8px_rgba(0,0,0,0.08)] = Elevation S
// ─────────────────────────────────────────────────────────────────────────────
function FlightCard({
  leg,
  direction,
}: {
  leg: UnifiedPackage["flights"]["outbound"];
  direction: "Outbound" | "Return";
}) {
  // Create an airline badge from the first two letters of the carrier name
  const initials = leg.carrier
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-card rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* ── Header: airline badge + name/number + direction badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Airline circle — dark blue like real airline logos */}
          <div className="w-9 h-9 rounded-full bg-[#003399] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div>
            {/* Airline name: Mulish 600, 14px — style_YT0WJ2 in Figma */}
            <div className="text-sm font-semibold text-foreground">
              {leg.carrier}
            </div>
            {/* Flight number: Mulish 400, 12px — style for "EZY8302" */}
            <div className="text-sm text-muted-foreground font-normal">
              {leg.flightNumber}
            </div>
          </div>
        </div>
        {/* Direction badge — exact Figma colors per direction */}
        <span
          className={cn(
            `text-xs font-semibold px-2.5 py-1 rounded-full`,
            direction === "Outbound"
              ? "bg-primary/10 text-primary"   // Figma: fill_6PNZ13 + fill_CTT1AZ
              : "bg-success/10 text-success"   // Figma: fill_8SIHEG + fill_A7KTJI
          )}
        >
          {direction}
        </span>
      </div>

      {/* ── Departure — duration line — Arrival */}
      <div className="flex items-center gap-4">
        {/* Departure side */}
        <div>
          {/* Time: Mulish 700, 22px — style_8FBHDW in Figma */}
          <div className="text-2xl font-bold text-foreground leading-tight tabular-nums">
            {formatTime(leg.departureTime)}
          </div>
          {/* Airport code: Mulish 500, 12px — style_OFZSTJ in Figma */}
          <div className="text-sm text-muted-foreground mt-0.5 font-medium">
            {leg.departureAirport}
          </div>
        </div>

        {/* Flight path line in the middle */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-sm text-muted-foreground">
            {formatDuration(leg.durationMinutes)}
          </div>
          <div className="w-full flex items-center gap-1">
            <div className="flex-1 h-[1px] bg-border" />
            <Plane size={12} className="text-grey shrink-0" aria-hidden="true" />
            <div className="flex-1 h-[1px] bg-border" />
          </div>
          {/* "Direct" in green — fill_A7KTJI = #16A34A in Figma */}
          <div className="text-xs text-success font-semibold">
            Direct
          </div>
        </div>

        {/* Arrival side */}
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground leading-tight tabular-nums">
            {formatTime(leg.arrivalTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5 font-medium">
            {leg.arrivalAirport}
          </div>
        </div>
      </div>

      {/* ── Footer: luggage info + "Add baggage" link
          Figma shows a horizontal border separating this from the flight info,
          with "🧳 Hand luggage included" on the left and an "Add baggage and
          extras →" text button on the right (fills: fill_CTT1AZ = #2681FF). */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Luggage size={13} className="shrink-0" aria-hidden="true" />
          <span>Hand luggage included</span>
        </div>
        {/* "Add baggage and extras →" — text button, fill_CTT1AZ (#2681FF) */}
        <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline shrink-0">
          Add baggage and extras
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// picsumImg — generates a deterministic picsum.photos URL from a seed word.
// Using picsum.photos: reliable, no API key, same seed = same image every time.
// (Per project memory: source.unsplash.com is deprecated — do NOT use it.)
// ─────────────────────────────────────────────────────────────────────────────
function picsumImg(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// hotelImageSet — stable set of images derived from the hotel slug
// ─────────────────────────────────────────────────────────────────────────────
function hotelImageSet(_location: string, hotelSlug: string) {
  const s = hotelSlug;
  return {
    gallery: [
      picsumImg(`${s}-pool`, 600, 400),
      picsumImg(`${s}-beach`, 600, 400),
      picsumImg(`${s}-room`, 600, 400),
      picsumImg(`${s}-dining`, 600, 400),
    ],
    room: picsumImg(`${s}-bedroom`, 480, 360),
    area: picsumImg(`${s}-aerial`, 1160, 400),
    modal: [
      picsumImg(`${s}-pool`, 900, 600),
      picsumImg(`${s}-beach`, 900, 600),
      picsumImg(`${s}-room`, 900, 600),
      picsumImg(`${s}-dining`, 900, 600),
      picsumImg(`${s}-lobby`, 900, 600),
      picsumImg(`${s}-terrace`, 900, 600),
      picsumImg(`${s}-spa`, 900, 600),
      picsumImg(`${s}-bar`, 900, 600),
    ],
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Static mock data
// ─────────────────────────────────────────────────────────────────────────────

const ROOM_FACILITIES_FULL = {
  Bathroom: [
    "🛁 Bathtub",
    "🚿 Separate shower",
    "💈 Hairdryer",
    "🧴 Toiletries provided",
  ],
  Bedroom: [
    "🛏️ Double bed",
    "❄️ Air conditioning",
    "📺 Flat-screen TV",
    "🪟 Ocean or garden view",
    "🧹 Daily housekeeping",
  ],
  "In-room": [
    "🍸 Minibar",
    "☕ Coffee machine",
    "📶 Free WiFi",
    "🔒 In-room safe",
    "🪑 Seating area",
  ],
};

// Figma shows exactly these 4 reviews with these exact dates and content
const MOCK_REVIEWS = [
  {
    score: "8/10",
    label: "Good",
    text: "Very stylish hotel.",
    date: "Jan 14, 2026",
  },
  {
    score: "10/10",
    label: "Excellent",
    text: "Clean, lovely accommodations. Staff were super helpful and friendly.",
    date: "Jan 18, 2026",
  },
  {
    score: "10/10",
    label: "Excellent",
    text: "Great hotel in a perfect location for exploring Lisbon. Nice breakfast and a small gym.",
    date: "Jan 26, 2026",
  },
  {
    score: "8/10",
    label: "Good",
    text: "Good size room. Nice breakfast.",
    date: "Jan 14, 2026",
  },
];

const AMENITY_GROUPS = [
  {
    label: "Pool & Beach",
    items: [
      "🏊 Outdoor pool",
      "🏖️ Private beach access",
      "🪂 Water sports",
      "🛶 Non-motorised watersports",
    ],
  },
  {
    label: "Food & Drink",
    items: ["🍽️ On-site restaurant", "🍸 Bar", "☕ Café", "🍹 Poolside bar"],
  },
  {
    label: "Wellness",
    items: [
      "💆 Full-service spa",
      "💪 Fitness centre",
      "🧖 Sauna",
      "🧘 Yoga classes",
    ],
  },
  {
    label: "Services",
    items: [
      "📶 Free WiFi throughout",
      "🅿️ Free parking",
      "🛎️ 24-hr concierge",
      "🚌 Airport shuttle (fee)",
      "👶 Kids' club",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PackageDetailPage — main component
// ─────────────────────────────────────────────────────────────────────────────

export default function PackageDetailPage({
  pkg,
  searchCriteria,
  onBack,
  onBook,
}: PackageDetailPageProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const defaultDate = pkg.flights.outbound.departureTime.split("T")[0];
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const [photosOpen, setPhotosOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [roomFacilitiesOpen, setRoomFacilitiesOpen] = useState(false);

  // "Show on map" modal
  const [showMapModal, setShowMapModal] = useState(false);

  // Mobile "Explore dates" accordion
  const [mobileDatesExpanded, setMobileDatesExpanded] = useState(false);

  // Date picker panel (for live/non-cached packages)
  const [datePanelOpen, setDatePanelOpen] = useState(false);

  // ── Derived values ─────────────────────────────────────────────────────────
  const currSym = currencySymbol(pkg.price.currency);
  const nights = searchCriteria.nights || 7;
  const adults = searchCriteria.adults || 2;

  const activeCalendarEntry = pkg.rateCalendar?.find(
    (e) => e.departureDate === selectedDate
  );
  const activePrice =
    activeCalendarEntry?.pricePerPerson ?? pkg.price.perPerson;
  const totalPrice = activePrice * adults;

  const hotelSlug = pkg.hotel.name.toLowerCase().replace(/\s+/g, "-");
  const hotelImages = hotelImageSet(pkg.hotel.location, hotelSlug);
  const desc = hotelDescription(pkg.hotel.name, pkg.hotel.location);

  // Rating in European decimal format (e.g. "4,3") — matches Figma
  const ratingEU = formatRatingEU(pkg.hotel.trustYou.rating);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    // ── ROOT: page background is muted, font is Mulish ──────
    // Mulish is loaded via Google Fonts @import inside the <style> tag below.
    // All font sizes and weights in this file reference Figma text styles.
    <div
      className="min-h-screen bg-grey-lightest"
      style={{ fontFamily: "'Mulish', sans-serif" }}
    >
      {/* Inject Mulish from Google Fonts — only for the prototype */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;900&display=swap');`}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          PACKAGE MAIN INFO CARD
          This is a white card (bg-card)
          that wraps both the hero gallery AND the hotel info + price row.
          It sits on the muted page background like an elevated card.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-card">
        <div className="max-w-[1280px] mx-auto">

          {/* Back button — sits above the hero inside the white card */}
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-5">
            <BackButton label="Back to all holidays" onClick={onBack} />
          </div>

          {/* ── HERO PHOTO GALLERY ────────────────────────────────────────────
              402px tall (matches Figma hero height).
              Left: large main hero image. Right: 2×2 thumbnail grid.
              "See all photos" secondary button floats bottom-right.
          ──────────────────────────────────────────────────────────────────── */}
          <div className="relative mx-4 sm:mx-6 md:mx-10">
            {/* Photo grid — h-[402px] on desktop matches Figma exactly */}
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] h-[280px] md:h-[402px] gap-2">

              {/* Main hero image — rounded corners on all sides */}
              <div className="relative overflow-hidden rounded-xl group">
                <img
                  src={pkg.hotel.mainImage}
                  alt={pkg.hotel.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                {/* Subtle gradient for the bottom edge legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* 2×2 thumbnail grid — desktop only */}
              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {hotelImages.gallery.map((url, i) => (
                  <div
                    key={url}
                    className="overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => setPhotosOpen(true)}
                  >
                    <img
                      src={url}
                      alt={`${pkg.hotel.name} — photo ${i + 2}`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* "See all photos" secondary button — overlaid bottom-right.
                Figma: Type=Secondary, text "See all photos", primary text */}
            <Button
              variant="secondary"
              onClick={() => setPhotosOpen(true)}
              className="absolute bottom-4 right-4"
            >
              ⊞ See all photos
            </Button>
          </div>

          {/* ── HOTEL INFO + PRICE ROW ─────────────────────────────────────────
              Below the hero: a row layout with hotel identity on the LEFT
              and the price/CTA block on the RIGHT.
              This matches the Figma "Frame 1000002102" structure exactly.
          ──────────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:gap-12 px-4 sm:px-6 md:px-10 pt-8 pb-5 md:pb-8">

            {/* ── LEFT: Hotel identity + Package details ──────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Quick facts row: rating badge + hotel name + stars */}
              {/* Figma node 6113:2448 "Quick facts" */}
              <div className="flex flex-col gap-1.5">

                {/* Rating badge — uses shared RatingBlock component (same as HotelDetailPage) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <RatingBlock
                    reviewScore={pkg.hotel.trustYou.rating / 10}
                    reviewCount={pkg.hotel.trustYou.reviewCount}
                  />
                  <button
                    onClick={() => setReviewsOpen(true)}
                    className="text-sm text-foreground underline hover:no-underline"
                  >
                    {pkg.hotel.trustYou.reviewCount.toLocaleString()} reviews
                  </button>
                </div>

                {/* Hotel name + star rating — AccommodationStar handles full/half/empty star logic */}
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                    {pkg.hotel.name}
                  </h1>
                  <AccommodationStar
                    rating={pkg.hotel.category}
                    offerName={pkg.hotel.name}
                    size={16}
                  />
                </div>
              </div>

              {/* Duration + Location row — duration first, then location, then map link */}
              <div className="flex items-center gap-4 text-base text-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-foreground shrink-0" aria-hidden="true" />
                  <span>{nights} days</span>
                </div>
                <span className="text-border hidden sm:block">|</span>
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-foreground shrink-0" aria-hidden="true" />
                  <span>{pkg.hotel.location}</span>
                </div>
                {/* "Show on map" link — same style as TourDetailPage */}
                <button
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <MapPinned size={14} aria-hidden="true" />
                  Show on map
                </button>
              </div>

              {/* Package details — Figma: small heading + 3-item list
                  "Package details" heading (medium bold)
                  Items: plane icon + "Return flights from London"
                         building icon + "Superior Ocean View Room"
                         utensils icon + "All Inclusive" */}
              {/* Package details — horizontal row, no background, Lucide icons */}
              <h3 className="text-lg font-bold text-foreground">Package details</h3>
              <div className="flex flex-row flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 text-base text-foreground">
                  <Plane size={15} className="text-foreground shrink-0" aria-hidden="true" />
                  <span>Return flights from {pkg.flights.outbound.departureAirport}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-foreground">
                  <Building2 size={15} className="text-foreground shrink-0" aria-hidden="true" />
                  <span>{pkg.room.roomType}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-foreground">
                  <Utensils size={15} className="text-foreground shrink-0" aria-hidden="true" />
                  <span>{pkg.room.boardType}</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Price + CTA ────────────────────────────────────────
                Figma node 6115:4151 "Frame 10029" — price block on the right.
                Contains: £828 bold + "per person" + "Flight + hotel · 7 nights"
                          + "Total for 2 adults: £1,656" + CTA button
                CTA: primary background, rounded-lg, white text
            ──────────────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 lg:min-w-[280px] lg:items-end">

              {/* Price block */}
              <div className="flex flex-col items-end text-right">
                {/* Small grey label: per-person rate + package details */}
                <span className="text-grey text-xs">{currSym}{activePrice.toLocaleString()} per person · Flight + hotel · {nights} nights</span>
                {/* Big bold total — same structure as hotel page */}
                <span className="text-foreground font-bold text-2xl">Total for {adults} adults: {currSym}{totalPrice.toLocaleString()}</span>
              </div>

              {/* CTA button — primary background, rounded-lg, white text */}
              <button
                onClick={() => onBook(pkg, selectedDate)}
                className="w-full lg:min-w-[280px] bg-primary hover:brightness-85 text-white font-bold text-base md:text-base py-3 md:py-4 px-4 md:px-6 rounded-lg transition-colors text-center"
              >
                Personalise Your Holiday
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE BODY — Two-column layout
          Left column: content sections
          Right column: sticky rate calendar sidebar
          Both columns sit on the grey #F3F5F6 page background.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-8">

        {/* ── "Hotel and flight information" H2 heading ─────────────────────
            Main section heading before the content columns begin. */}
        <h2 className="text-3xl font-bold text-foreground mb-6">
          Hotel and flight information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

          {/* ╔═══════════════════════════════════════════════════════════════
              LEFT COLUMN — all the content sections
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* ── SELECTED ROOM ──────────────────────────────────────────────
                Figma: "Selected room" heading (Heading Bold/H3) + "Change room"
                text button (fill_CTT1AZ). Room card: bg-white, rounded-[20px],
                effects: Elevation S (shadow).
            ──────────────────────────────────────────────────────────────── */}
            <div>
              {/* Section header row */}
              <div className="flex items-center justify-between mb-4">
                {/* "Selected room" — Heading Bold/H3 */}
                <h3 className="text-xl font-bold text-foreground">
                  Selected room
                </h3>
                {/* "Change room" — text button with pencil icon */}
                <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  <Pencil size={13} aria-hidden="true" />
                  Change room
                </button>
              </div>

              {/* Room card — bg-card, rounded-lg, shadow */}
              <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Room photo */}
                  <div className="h-[200px] sm:h-auto sm:w-[240px] shrink-0 overflow-hidden group">
                    <img
                      src={hotelImages.room}
                      alt={`${pkg.room.roomType} room`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>

                  {/* Room details */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="font-bold text-foreground text-lg mb-3">
                        {pkg.room.roomType}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-sm text-foreground">
                          <UtensilsCrossed size={12} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                          {pkg.room.boardType}
                        </span>
                        <span className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-sm text-foreground">
                          <Users size={12} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                          {adults} guests
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {[
                          { icon: <BedDouble size={13} className="text-muted-foreground shrink-0" />, label: "Double bed" },
                          { icon: <Eye size={13} className="text-muted-foreground shrink-0" />, label: "Ocean or garden view" },
                          { icon: <AirVent size={13} className="text-muted-foreground shrink-0" />, label: "Air conditioning" },
                          { icon: <Wifi size={13} className="text-muted-foreground shrink-0" />, label: "Free WiFi" },
                        ].map(({ icon, label }) => (
                          <div
                            key={label}
                            className="flex items-center gap-2 text-sm text-foreground"
                          >
                            {icon}
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setRoomFacilitiesOpen(true)}
                      className="mt-4 text-sm font-semibold text-primary hover:underline transition-all self-start"
                    >
                      Show all room facilities
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SELECTED FLIGHTS ──────────────────────────────────────────
                Each FlightCard is now card with shadow.
                "Change flights" link top-right.
            ──────────────────────────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Selected flights
                  </h3>
                </div>
                <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                  <Pencil size={13} aria-hidden="true" />
                  Change flights
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <FlightCard leg={pkg.flights.outbound} direction="Outbound" />
                <FlightCard leg={pkg.flights.return} direction="Return" />
              </div>
            </div>

            {/* ── HOTEL INFORMATION ─────────────────────────────────────────
                Section heading + card with description, highlights, and map.
            ──────────────────────────────────────────────────────────────── */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Hotel information</h3>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">

              {/* Description */}
              <div className="p-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={15} className="text-primary shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-bold text-foreground">About the hotel</h3>
                </div>
                <p className="text-base text-foreground leading-normal mb-2">
                  {desc.short}
                </p>
                <p className="text-base text-foreground leading-normal">
                  {desc.long}
                </p>
                <button
                  onClick={() => setDescriptionOpen(true)}
                  className="mt-4 text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
                >
                  Read more about the hotel
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-muted mx-5" />

              {/* Highlights — amenity pills */}
              <div className="p-5 pb-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {(pkg.hotel.amenities.length > 0
                    ? pkg.hotel.amenities.slice(0, 5)
                    : [
                        "Beachfront",
                        "Outdoor pool",
                        "Spa",
                        "All-day dining",
                        "Kids club",
                      ]
                  ).map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2"
                    >
                      <AmenityIcon name={amenity} size={15} />
                      <span className="text-sm text-foreground font-medium">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-muted mx-5" />

              {/* Location map */}
              <div className="p-5 pb-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Location</h3>
                <div className="rounded-lg overflow-hidden h-[220px] relative mb-4 cursor-pointer group">
                  <img
                    src={hotelImages.area}
                    alt="Hotel area map"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card rounded-full p-2.5 shadow-lg">
                      <MapPin size={22} className="text-primary" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-md px-3 py-1.5 text-sm font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                    <MapPin size={12} className="text-primary shrink-0" aria-hidden="true" />
                    {pkg.hotel.location}
                  </div>
                </div>

                {/* Getting around — POI pills with MapPin instead of emoji */}
                <h3 className="text-sm font-bold text-foreground mb-3">Getting around</h3>
                <div className="flex flex-wrap gap-2">
                  {nearbyPOIs(pkg.hotel.location).map((poi) => (
                    <span
                      key={poi.label}
                      className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2 text-sm"
                    >
                      <MapPin size={12} className="text-primary shrink-0" aria-hidden="true" />
                      <span className="font-medium text-foreground">
                        {poi.label}
                      </span>
                      <span className="text-muted-foreground">· {poi.distance}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>
            </div>

            {/* ── REVIEWS ───────────────────────────────────────────────────
                Row layout, card, rounded-lg, shadow.
                Left: score summary column. Right: horizontally scrollable review cards.
            ──────────────────────────────────────────────────────────────── */}
            <h3 className="text-xl font-bold text-foreground">Guest reviews</h3>
            <div className="bg-card rounded-lg shadow-xs flex flex-col md:flex-row gap-5 md:gap-10 p-4 md:py-6 md:pl-6 md:pr-0">

              {/* Left column — score summary using shared RatingBlock */}
              <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1 md:shrink-0 md:w-[100px]">
                <RatingBlock
                  reviewScore={pkg.hotel.trustYou.rating / 10}
                  reviewCount={pkg.hotel.trustYou.reviewCount}
                />
                <button
                  onClick={() => setReviewsOpen(true)}
                  className="text-xs text-foreground underline hover:no-underline text-left mt-1"
                >
                  {pkg.hotel.trustYou.reviewCount.toLocaleString()} verified reviews
                </button>
              </div>

              {/* Right column — horizontally scrollable cards + "See all" below */}
              <div className="flex flex-col gap-6 flex-1 min-w-0 overflow-hidden">

                {/* Scrollable card row — cards are ~295px wide, gap 16px, pr-6 for breathing room */}
                <div className="flex flex-row gap-4 overflow-x-auto pb-1 pr-6" style={{ scrollbarWidth: "none" }}>
                  {MOCK_REVIEWS.map((review, i) => (
                    // Each card: fixed 295×230px, border, rounded-lg, p-4
                    <div
                      key={i}
                      className="flex flex-col border border-border rounded-lg p-4 shrink-0 w-[78vw] sm:w-[280px] md:w-[295px] h-[210px] sm:h-[230px]"
                    >
                      {/* "8/10 Good" — Paragraph Bold/Default Bold */}
                      <div className="text-base font-bold text-foreground mb-2">
                        {review.score} {review.label}
                      </div>

                      {/* Review text — fills remaining space */}
                      <p className="text-base text-foreground leading-normal flex-1 overflow-hidden">
                        {review.text}
                      </p>

                      {/* "See details" — text button, primary, Paragraph Bold/Small Bold */}
                      <button className="text-xs font-bold text-primary hover:underline text-left mt-2 mb-1">
                        See details
                      </button>

                      {/* Date */}
                      <div className="text-base text-foreground">{review.date}</div>

                      {/* "Verified review" — Paragraph Regular/Small, grey */}
                      <div className="text-xs text-grey">Verified review</div>
                    </div>
                  ))}
                </div>

                {/* "See all 472 reviews" — Paragraph Bold/Default Bold, primary */}
                <button
                  onClick={() => setReviewsOpen(true)}
                  className="text-base font-bold text-primary hover:underline text-left"
                >
                  See all {pkg.hotel.trustYou.reviewCount.toLocaleString()} reviews
                </button>
              </div>

            </div>

            {/* ── MOBILE: EXPLORE DATES (cached packages only) ──────────────
                On desktop this lives in the right sticky sidebar.
                On mobile, surfaced here as an accordion (same as v5). */}
            {pkg.sourceMode === "cache" && pkg.rateCalendar && (
              <div className="lg:hidden">
                <div className="bg-card rounded-lg overflow-hidden shadow-sm">
                  <button
                    className="w-full flex items-center justify-between px-5 py-5"
                    onClick={() =>
                      setMobileDatesExpanded((prev) => !prev)
                    }
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-primary" aria-hidden="true" />
                        <span className="text-base font-bold text-foreground">
                          Explore travel dates
                        </span>
                      </div>
                      {!mobileDatesExpanded && (
                        <div className="text-sm text-muted-foreground mt-1 ml-[24px]">
                          {formatDate(selectedDate)} ·{" "}
                          <span className="font-bold text-foreground">
                            {currSym}{activePrice.toLocaleString()}/pp
                          </span>
                        </div>
                      )}
                    </div>
                    {mobileDatesExpanded ? (
                      <ChevronUp
                        size={18}
                        className="text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {mobileDatesExpanded && (
                    <div className="px-5 pb-5 border-t border-border">
                      <div className="pt-5">
                        <RateCalendarPanel
                          rateCalendar={pkg.rateCalendar}
                          selectedDate={selectedDate}
                          onSelectDate={setSelectedDate}
                          currency={pkg.price.currency}
                          nights={nights}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
          {/* ╚═══════════════════════ END LEFT COLUMN ════════════════════╝ */}

          {/* ╔═══════════════════════════════════════════════════════════════
              RIGHT COLUMN — STICKY RATE CALENDAR SIDEBAR
              Contains: price summary + "Explore travel dates" section
              with calendar and CTA button.
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="hidden lg:block sticky top-[64px] pt-2">
            {/* Sidebar card — bg-card, border, rounded-lg, shadow */}
            <div className="bg-card border border-border rounded-lg shadow-md">

              {/* ── Price summary block ──────────────────────────────────── */}
              <div className="px-5 pt-5 pb-0">
                <div className="flex flex-col items-end text-right">
                  {/* Small grey label: per-person rate + package details */}
                  <span className="text-grey text-xs">{currSym}{activePrice.toLocaleString()} per person · Flight + hotel · {nights} nights</span>
                  {/* Big bold total — same as hotel page */}
                  <span className="text-foreground font-bold text-2xl">Total for {adults} adults: {currSym}{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* ── "Explore travel dates" section ────────────────────────
                  For cached packages we show the rate calendar; for live
                  packages we show a date picker. */}
              <div className="bg-card p-5">
                {pkg.sourceMode === "cache" && pkg.rateCalendar ? (
                  <div>
                    <RateCalendarPanel
                      rateCalendar={pkg.rateCalendar}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      currency={pkg.price.currency}
                      nights={nights}
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      This price is for a specific departure. Pick a different
                      date to request an updated quote.
                    </p>
                    <div className="relative">
                      <button
                        onClick={() => setDatePanelOpen(o => !o)}
                        className={cn(
                          "h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left",
                          datePanelOpen
                            ? "border-primary ring-2 ring-primary/20 bg-card"
                            : "border-border bg-card hover:border-primary"
                        )}
                      >
                        <CalendarDays size={16} className="text-primary shrink-0" aria-hidden="true" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Travel date</span>
                          <span className="text-xs font-semibold text-foreground truncate">
                            {selectedDate ? format(new Date(selectedDate), "EEE, d MMM yyyy") : "Pick a date"}
                          </span>
                        </div>
                        <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", datePanelOpen && "rotate-180")} aria-hidden="true" />
                      </button>
                      {datePanelOpen && (
                        <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-lg border border-border p-4 animate-in fade-in zoom-in-95 duration-150">
                          <style>{`.rdp-root { --rdp-accent-color: hsl(var(--primary)); --rdp-accent-background-color: hsl(var(--primary) / 0.10); --rdp-day_button-border-radius: 6px; margin: 0; }`}</style>
                          <DayPicker
                            mode="single"
                            selected={selectedDate ? new Date(selectedDate) : undefined}
                            onSelect={(date) => {
                              if (!date) return;
                              setSelectedDate(format(date, "yyyy-MM-dd"));
                              setDatePanelOpen(false);
                            }}
                            disabled={{ before: new Date() }}
                            numberOfMonths={1}
                          />
                        </div>
                      )}
                    </div>

                    {/* Compact room/board summary */}
                    <div className="mt-3 bg-card border border-border rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Room</span>
                        <span className="font-medium text-foreground text-right max-w-[55%]">
                          {pkg.room.roomType}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Board</span>
                        <span className="font-medium text-foreground">
                          {pkg.room.boardType}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Cancellation</span>
                        <span className="font-medium text-success">
                          Free until 14 days
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CTA button ───────────────────────────────────────────── */}
              <div className="px-5 pb-5 bg-card rounded-b-lg">
                <button
                  onClick={() => onBook(pkg, selectedDate)}
                  className="w-full bg-primary hover:brightness-85 text-white font-bold text-base py-4 rounded-lg transition-colors"
                >
                  Personalise Your Holiday
                </button>
              </div>
            </div>
          </div>
          {/* ╚═══════════════════════ END RIGHT COLUMN ═══════════════════╝ */}

        </div>
      </div>

      {/* Spacer so the sticky footer doesn't overlap the last content section on mobile */}
      <div className="lg:hidden h-20" />

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE STICKY FOOTER
          Fixed bar at the bottom on mobile. Price left, CTA right.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-5 py-3 z-50 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col">
          {/* Small grey label — same as hotel mobile footer */}
          <span className="text-grey text-xs">{currSym}{activePrice.toLocaleString()} per person · {nights} nights</span>
          {/* Bold total */}
          <span className="text-foreground font-bold text-base">Total for {adults} adults: {currSym}{totalPrice.toLocaleString()}</span>
        </div>
        <button
          onClick={() => onBook(pkg, selectedDate)}
          className="bg-primary hover:brightness-85 text-white font-bold text-sm px-5 py-3 rounded-lg transition-colors whitespace-nowrap"
        >
          Personalise
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* All photos modal */}
      <Dialog open={photosOpen} onOpenChange={setPhotosOpen}>
        <DialogContent className="max-w-[1040px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{pkg.hotel.name} — All photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="col-span-2">
              <img
                src={pkg.hotel.mainImage}
                alt={pkg.hotel.name}
                className="w-full aspect-[16/7] object-cover rounded-xl"
              />
            </div>
            {hotelImages.modal.map((url, i) => (
              <img
                key={url}
                src={url}
                alt={`Hotel photo ${i + 2}`}
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* About the hotel modal */}
      <Dialog open={descriptionOpen} onOpenChange={setDescriptionOpen}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle>About {pkg.hotel.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 text-base text-foreground leading-normal">
            <p>
              {desc.short} {desc.long}
            </p>
            <p>
              With a TrustYou score of {(pkg.hotel.trustYou.rating / 10).toFixed(1)}/10 based on{" "}
              {pkg.hotel.trustYou.reviewCount.toLocaleString()} reviews — and a{" "}
              {pkg.hotel.trustYou.recommendationScore}% recommendation rate — guests
              consistently rate their experience here as{" "}
              {ratingLabel(pkg.hotel.trustYou.rating).toLowerCase()}.
            </p>
            <p>
              {pkg.hotel.name} is a {pkg.hotel.category}-star property in{" "}
              {pkg.hotel.location}, included in your package with{" "}
              {pkg.room.boardType} and direct return flights from{" "}
              {pkg.flights.outbound.departureAirport}.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* All amenities modal */}
      <Dialog open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All amenities</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {AMENITY_GROUPS.map((group) => (
              <div key={group.label} className="mb-5">
                <div className="text-xs font-bold uppercase tracking-wider text-grey mb-2 mt-3 first:mt-0">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {group.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-foreground"
                    >
                      <span className="text-xl w-7 text-center shrink-0">
                        {item.split(" ")[0]}
                      </span>
                      <span>{item.split(" ").slice(1).join(" ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {pkg.hotel.amenities.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-bold uppercase tracking-wider text-grey mb-2">
                  From this property
                </div>
                <div className="flex flex-wrap gap-2">
                  {pkg.hotel.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="flex items-center gap-1.5 bg-grey-light border border-border rounded-full px-3 py-1.5 text-sm text-foreground"
                    >
                      <AmenityIcon name={amenity} size={13} />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* All reviews modal */}
      <Dialog open={reviewsOpen} onOpenChange={setReviewsOpen}>
        <DialogContent className="max-w-[880px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guest reviews</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <div className="flex items-center gap-5 pb-5 border-b border-border mb-5">
              <div className="text-5xl font-bold text-foreground leading-none">
                {ratingEU}
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">
                  {ratingLabel(pkg.hotel.trustYou.rating)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Based on{" "}
                  {pkg.hotel.trustYou.reviewCount.toLocaleString()} verified
                  reviews · Powered by TrustYou
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {pkg.hotel.trustYou.recommendationScore}% of guests recommend
                  this hotel
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="border border-border rounded-lg p-4 flex flex-col gap-3"
                >
                  <div className="text-sm font-bold text-foreground">
                    {review.score} {review.label}
                  </div>
                  <p className="text-sm text-foreground leading-normal flex-1">
                    {review.text}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-xs text-foreground">
                      {review.date}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Verified review
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room facilities modal */}
      <Dialog
        open={roomFacilitiesOpen}
        onOpenChange={setRoomFacilitiesOpen}
      >
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {pkg.room.roomType} — Room facilities
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {Object.entries(ROOM_FACILITIES_FULL).map(
              ([category, items]) => (
                <div key={category} className="mb-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-grey mb-3">
                    {category}
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {items.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span className="text-lg w-6 text-center shrink-0">
                          {item.split(" ")[0]}
                        </span>
                        <span>{item.split(" ").slice(1).join(" ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
