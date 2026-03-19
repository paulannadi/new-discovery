import { useState } from "react";
import { BackButton } from "../../../shared/components/BackButton";
import {
  ArrowLeft,
  Plane,
  Moon,
  Star,
  MapPin,
  Wifi,
  Waves,
  Dumbbell,
  Coffee,
  UtensilsCrossed,
  Umbrella,
  Car,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Users,
  Check,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import type { HolidayPackage, HolidaySearchCriteria } from "../../../App";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type HolidayDetailPageProps = {
  pkg: HolidayPackage;
  searchCriteria: HolidaySearchCriteria;
  onBook: (pkg: HolidayPackage) => void;
  onBack: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Room options — 4 tiers the user can upgrade to
// basePriceExtra is added on top of the package base price (£ per person)
// ─────────────────────────────────────────────────────────────────────────────

type RoomOption = {
  id: string;
  name: string;
  desc: string;
  image: string;
  basePriceExtra: number;
  cancellable: boolean;
};

const ROOM_OPTIONS: RoomOption[] = [
  {
    id: "standard",
    name: "Standard Room",
    desc: "King bed, sea-view balcony, all standard amenities.",
    image: "https://picsum.photos/seed/room-standard/400/300",
    basePriceExtra: 0,
    cancellable: true,
  },
  {
    id: "superior",
    name: "Superior Room",
    desc: "Larger room, premium furnishings, bathtub, enhanced sea views.",
    image: "https://picsum.photos/seed/room-superior/400/300",
    basePriceExtra: 150,
    cancellable: true,
  },
  {
    id: "deluxe",
    name: "Deluxe Suite",
    desc: "Separate living area, plunge pool, butler service.",
    image: "https://picsum.photos/seed/room-deluxe/400/300",
    basePriceExtra: 450,
    cancellable: false,
  },
  {
    id: "villa",
    name: "Private Pool Villa",
    desc: "Standalone villa, private pool, outdoor dining, 24h concierge.",
    image: "https://picsum.photos/seed/room-villa/400/300",
    basePriceExtra: 1200,
    cancellable: false,
  },
];

// Board type options — user can upgrade from the package default
const BOARD_OPTIONS = [
  { id: "ro", label: "Room only", shortLabel: "RO", priceExtra: -20 },
  { id: "bb", label: "Breakfast", shortLabel: "BB", priceExtra: 0 },
  { id: "hb", label: "Half board", shortLabel: "HB", priceExtra: 30 },
  { id: "ai", label: "All inclusive", shortLabel: "AI", priceExtra: 65 },
];

const REVIEWS = [
  {
    id: 1,
    name: "Sarah M.",
    date: "December 2025",
    rating: 5,
    comment: "Every detail was perfect. The staff were incredibly attentive and the location is breathtaking.",
    avatar: "https://picsum.photos/seed/sarah-review/100/100",
  },
  {
    id: 2,
    name: "James T.",
    date: "November 2025",
    rating: 5,
    comment: "Seamless package — flights were smooth, hotel exceeded expectations. All-inclusive was worth every penny.",
    avatar: "https://picsum.photos/seed/james-review/100/100",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock price calendar — March 2026
//
// Each entry is a price offset (£ per person) from the package base price.
// Positive = more expensive, negative = cheaper.
// Days 1–12 are in the past (today = 13 March) so they're shown but disabled.
//
// In a real system these cached prices would come from a live search API.
// We hardcode them here to simulate realistic demand-based pricing:
//   • Weekends (Sat/Sun) carry a small premium
//   • Mid-week departures are cheapest
//   • Late March gets more expensive as school Easter break approaches
// ─────────────────────────────────────────────────────────────────────────────

// Today's day-of-month — computed at runtime so past dates stay greyed out
// correctly regardless of when the prototype is opened.
const TODAY_DAY = new Date().getDate();

// Price offsets keyed by day number (1–31)
const MARCH_PRICE_OFFSETS: Record<number, number> = {
  // ── past (read-only, shown greyed out) ──
  1: 40, 2: -10, 3: -15, 4: -20, 5: -25, 6: 30, 7: 35,
  8: -5, 9: -30, 10: -35, 11: -20, 12: -15,
  // ── today ──────────────────────────────
  13: 0,
  // ── future (selectable) ────────────────
  14: -20,   // Sat — slight weekend bump, but lower demand
  15: 30,    // Sun — weekend
  16: 25,    // Mon
  17: -15,   // Tue — cheap midweek
  18: -30,   // Wed — cheapest available
  19: -25,   // Thu
  20: -10,   // Fri
  21: 40,    // Sat — weekend premium
  22: 45,    // Sun — weekend premium
  23: 15,    // Mon
  24: 10,    // Tue
  25: 5,     // Wed
  26: 20,    // Thu — prices creeping up
  27: 55,    // Fri — pre-Easter weekend starts
  28: 65,    // Sat — peak Easter
  29: 70,    // Sun — peak Easter
  30: 60,    // Mon — Easter Monday
  31: 45,    // Tue — post-Easter tail
};

// Calendar grid for March 2026.
// March 1 falls on a Sunday, so Mon–Sat of week 1 are empty (null).
// Each row is a Mon → Sun week.
const MARCH_CALENDAR_ROWS: (number | null)[][] = [
  [null, null, null, null, null, null, 1],
  [2,    3,    4,    5,    6,    7,    8],
  [9,    10,   11,   12,   13,   14,   15],
  [16,   17,   18,   19,   20,   21,   22],
  [23,   24,   25,   26,   27,   28,   29],
  [30,   31,   null, null, null, null, null],
];

// ─────────────────────────────────────────────────────────────────────────────
// HolidayDetailPage
// ─────────────────────────────────────────────────────────────────────────────

export default function HolidayDetailPage({
  pkg,
  searchCriteria,
  onBook,
  onBack,
}: HolidayDetailPageProps) {

  const [selectedRoomId, setSelectedRoomId] = useState<string>("standard");
  const selectedRoom = ROOM_OPTIONS.find((r) => r.id === selectedRoomId) ?? ROOM_OPTIONS[0];

  const defaultBoard = BOARD_OPTIONS.find((b) =>
    pkg.boardType.toLowerCase().includes(b.shortLabel.toLowerCase())
  ) ?? BOARD_OPTIONS[1];
  const [selectedBoardId, setSelectedBoardId] = useState<string>(defaultBoard.id);
  const selectedBoard = BOARD_OPTIONS.find((b) => b.id === selectedBoardId) ?? BOARD_OPTIONS[1];

  // Selected departure day — defaults to today, or the next available day if
  // today isn't in the price data (e.g. prototype opened on a day without mock prices)
  const firstAvailableDay = Object.keys(MARCH_PRICE_OFFSETS)
    .map(Number)
    .filter((d) => d >= TODAY_DAY)
    .sort((a, b) => a - b)[0] ?? TODAY_DAY;
  const [selectedDay, setSelectedDay] = useState<number>(firstAvailableDay);

  const [flightsOpen, setFlightsOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  // Price maths
  // The date offset shifts the base price up or down depending on
  // how demand-sensitive that departure date is (cheap midweek, expensive weekends/Easter)
  const dateOffset = MARCH_PRICE_OFFSETS[selectedDay] ?? 0;
  const basePrice = pkg.priceNum + dateOffset;
  const roomExtra = selectedRoom.basePriceExtra;
  const boardExtra = selectedBoard.priceExtra * pkg.nights;
  const totalPrice = basePrice + roomExtra + boardExtra;
  const taxesAndFees = Math.round(totalPrice * 0.12);

  // Guest count label — used once in the room section
  const guestLabel = `${searchCriteria.adults} adult${searchCriteria.adults !== 1 ? "s" : ""}${searchCriteria.children > 0 ? ` · ${searchCriteria.children} child${searchCriteria.children !== 1 ? "ren" : ""}` : ""}`;

  return (
    <div className="min-h-screen bg-[#F3F5F6] pb-28">

      {/* ── TOP — white bar with back button above the gallery ──────────── */}
      <div className="w-full bg-white border-b border-[#e0e2e8]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
          {/* Back to all holidays */}
          <BackButton label="Back to all holidays" onClick={onBack} />
        </div>
      </div>

      {/* ── HERO GALLERY ───────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[200px] md:h-[360px] rounded-[16px] overflow-hidden">
          <div className="col-span-4 md:col-span-2 row-span-2">
            <img
              src={`https://picsum.photos/seed/${pkg.destination.toLowerCase()}-main/800/600`}
              alt={pkg.destination}
              className="w-full h-full object-cover"
            />
          </div>
          {[`${pkg.destination}-2`, `${pkg.destination}-3`, `${pkg.destination}-4`].map((seed, i) => (
            <div key={i} className="hidden md:block col-span-1 row-span-1">
              <img
                src={`https://picsum.photos/seed/${seed.toLowerCase()}/400/300`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Hotel identity — name, stars, location, rating. Shown once, here only. */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-1">
              <h1 className="text-[26px] font-black text-[#333743] leading-tight">{pkg.hotelName}</h1>
              {/* Rating badge — top-right of the identity block */}
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <span className="bg-[#16a34a] text-white text-[14px] font-bold px-2.5 py-1 rounded-[8px]">
                  {pkg.rating}
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#333743]">{pkg.reviewLabel}</div>
                  <div className="text-[11px] text-[#9598a4]">{pkg.reviewCount.toLocaleString()} reviews</div>
                </div>
              </div>
            </div>

            {/* Stars + location on one line */}
            <div className="flex items-center gap-2 text-[13px] text-[#667080]">
              <span className="text-[#FFB700]">{"★".repeat(pkg.hotelStars)}</span>
              <span>·</span>
              <MapPin size={12} />
              <span>{pkg.destination}, {pkg.country}</span>
              <img
                src={`https://flagcdn.com/w40/${pkg.flag}.png`}
                alt={pkg.country}
                className="w-4 h-3 rounded-sm object-cover"
              />
            </div>
          </div>

          {/* ── INCLUDED FLIGHTS — collapsed by default ─────────────────── */}
          {/* The summary line gives all key info upfront; expand for times. */}
          <section className="bg-white rounded-[16px] border border-[#e0e2e8] overflow-hidden">

            {/* Always-visible summary row */}
            <button
              className="w-full px-6 py-4 flex items-center justify-between text-left"
              onClick={() => setFlightsOpen(!flightsOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EFF6FF] rounded-[8px] flex items-center justify-center text-[#2681FF]">
                  <Plane size={15} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#333743]">
                    {pkg.flightFromCode} → {pkg.flightToCode} · {pkg.flightStops} · {pkg.flightDuration}
                  </div>
                  <div className="text-[12px] text-[#9598a4]">{pkg.flightAirline} · Return included · 23kg baggage</div>
                </div>
              </div>
              {flightsOpen
                ? <ChevronUp size={16} className="text-[#9598a4] shrink-0" />
                : <ChevronDown size={16} className="text-[#9598a4] shrink-0" />
              }
            </button>

            {/* Expanded flight times */}
            {flightsOpen && (
              <div className="border-t border-[#f3f5f6]">
                <div className="px-6 py-5">
                  <div className="text-[11px] font-bold text-[#9598a4] uppercase tracking-wide mb-3">Outbound</div>
                  <FlightTimeline
                    fromCode={pkg.flightFromCode}
                    fromCity={pkg.flightFrom}
                    toCode={pkg.flightToCode}
                    toCity={pkg.destination}
                    departTime="09:30"
                    arriveTime={pkg.flightStops === "Direct" ? "20:15" : "13:05 +1"}
                    stops={pkg.flightStops}
                    duration={pkg.flightDuration}
                    airline={pkg.flightAirline}
                  />
                </div>
                <div className="border-t border-[#f3f5f6]" />
                <div className="px-6 py-5">
                  <div className="text-[11px] font-bold text-[#9598a4] uppercase tracking-wide mb-3">Return</div>
                  <FlightTimeline
                    fromCode={pkg.flightToCode}
                    fromCity={pkg.destination}
                    toCode={pkg.flightFromCode}
                    toCity={pkg.flightFrom}
                    departTime="14:45"
                    arriveTime="06:30 +1"
                    stops={pkg.flightStops}
                    duration={pkg.flightDuration}
                    airline={pkg.flightAirline}
                  />
                </div>
              </div>
            )}
          </section>

          {/* ── DEPARTURE DATE / PRICE CALENDAR ────────────────────────── */}
          {/* Shows cached prices for every day in the current month.
              Past dates are greyed out and unclickable.
              The cheapest available day gets a green "Best price" tag.
              Selecting a date updates the total price in real time. */}
          <section className="bg-white rounded-[16px] border border-[#e0e2e8] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f3f5f6]">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#2681FF]" />
                <h2 className="text-[17px] font-bold text-[#333743]">Choose your departure date</h2>
              </div>
              <div className="text-[12px] text-[#9598a4] mt-0.5">March 2026 · Prices per person, flights included</div>
            </div>

            <div className="px-4 py-4">
              {/* Day-of-week header */}
              <div className="grid grid-cols-7 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-[#9598a4] uppercase tracking-wide py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar rows — each row is one Mon→Sun week */}
              {MARCH_CALENDAR_ROWS.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((day, di) => {
                    // Empty cells for days outside the month
                    if (day === null) {
                      return <div key={di} />;
                    }

                    const isPast = day < TODAY_DAY;
                    const isToday = day === TODAY_DAY;
                    const isSelected = day === selectedDay;
                    const offset = MARCH_PRICE_OFFSETS[day] ?? 0;
                    const displayPrice = pkg.priceNum + offset;

                    // Find the cheapest available (non-past) day to badge it
                    const cheapestDay = Object.entries(MARCH_PRICE_OFFSETS)
                      .filter(([d]) => Number(d) >= TODAY_DAY)
                      .sort(([, a], [, b]) => a - b)[0];
                    const isCheapest = !isPast && cheapestDay && Number(cheapestDay[0]) === day;

                    return (
                      <button
                        key={day}
                        disabled={isPast}
                        onClick={() => setSelectedDay(day)}
                        className={`
                          relative flex flex-col items-center justify-center py-2 mx-0.5 my-0.5 rounded-[10px] transition-colors
                          ${isPast ? "opacity-35 cursor-not-allowed" : "cursor-pointer"}
                          ${isSelected ? "bg-[#2681FF] text-white" : ""}
                          ${!isSelected && !isPast ? "hover:bg-[#f3f5f6]" : ""}
                        `}
                      >
                        {/* "Best price" badge — only on the cheapest available day */}
                        {isCheapest && !isSelected && (
                          <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#16a34a] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none">
                            Best
                          </span>
                        )}

                        {/* Day number */}
                        <span className={`text-[13px] font-bold leading-none mb-1 ${isSelected ? "text-white" : isToday ? "text-[#2681FF]" : "text-[#333743]"}`}>
                          {day}
                        </span>

                        {/* Price — only show for today and future dates, not past */}
                        {!isPast && (
                          <span className={`text-[10px] leading-none font-semibold ${isSelected ? "text-white/80" : "text-[#667080]"}`}>
                            £{displayPrice.toLocaleString()}
                          </span>
                        )}

                        {/* Dot under today's number (when not selected) */}
                        {isToday && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#2681FF]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Selected date summary line below the calendar */}
              <div className="mt-3 pt-3 border-t border-[#f3f5f6] flex items-center justify-between text-[13px]">
                <span className="text-[#667080]">
                  Departing <span className="font-semibold text-[#333743]">{selectedDay} March 2026</span>
                  {selectedDay === TODAY_DAY && <span className="ml-1 text-[#2681FF] font-semibold">· Today</span>}
                </span>
                <span className={`font-bold text-[13px] ${dateOffset < 0 ? "text-[#16a34a]" : dateOffset > 0 ? "text-[#e05c2b]" : "text-[#333743]"}`}>
                  {dateOffset === 0 && "Base price"}
                  {dateOffset < 0 && `−£${Math.abs(dateOffset)} cheaper`}
                  {dateOffset > 0 && `+£${dateOffset} more`}
                </span>
              </div>
            </div>
          </section>

          {/* ── ROOM SELECTION ──────────────────────────────────────────── */}
          <section className="bg-white rounded-[16px] border border-[#e0e2e8] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f3f5f6]">
              <h2 className="text-[17px] font-bold text-[#333743]">Choose your room</h2>
              {/* Guest context shown once, here — not repeated in sidebar or pills */}
              <div className="text-[12px] text-[#9598a4] mt-0.5">{guestLabel} · {pkg.nights} nights</div>
            </div>

            <div className="divide-y divide-[#f3f5f6]">
              {ROOM_OPTIONS.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-5 flex gap-4 cursor-pointer transition-colors ${isSelected ? "bg-[#EFF6FF]" : "hover:bg-[#f9fafb]"}`}
                  >
                    {/* Room image */}
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-[110px] h-[80px] object-cover rounded-[10px] shrink-0 hidden sm:block"
                    />

                    {/* Room info */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[14px] font-bold text-[#333743]">{room.name}</div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-[#2681FF] rounded-full flex items-center justify-center shrink-0">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-[12px] text-[#667080]">{room.desc}</div>
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className={`text-[12px] font-semibold flex items-center gap-1 ${room.cancellable ? "text-[#16a34a]" : "text-[#9598a4]"}`}>
                          <ShieldCheck size={12} />
                          {room.cancellable ? "Free cancellation" : "Non-refundable"}
                        </span>
                        <div className="text-right">
                          <div className="text-[10px] text-[#9598a4]">from per person</div>
                          <div className="text-[17px] font-black text-[#333743]">
                            £{(pkg.priceNum + room.basePriceExtra).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Board type — shown once below the room list, not inside each row */}
            <div className="px-6 py-4 border-t border-[#f3f5f6] bg-[#f9fafb]">
              <div className="text-[12px] font-semibold text-[#667080] mb-2.5">Board type</div>
              <div className="flex flex-wrap gap-2">
                {BOARD_OPTIONS.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setSelectedBoardId(board.id)}
                    className={`px-3 py-1.5 rounded-[8px] text-[13px] font-semibold border transition-colors ${
                      selectedBoardId === board.id
                        ? "bg-[#2681FF] text-white border-[#2681FF]"
                        : "border-[#e0e2e8] text-[#333743] hover:border-[#2681FF]"
                    }`}
                  >
                    {board.label}
                    {board.priceExtra > 0 && <span className="ml-1 font-normal opacity-80">+£{board.priceExtra * pkg.nights}</span>}
                    {board.priceExtra < 0 && <span className="ml-1 font-normal opacity-80">−£{Math.abs(board.priceExtra * pkg.nights)}</span>}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOTEL HIGHLIGHTS — pills, not a repeat grid ─────────────── */}
          <section className="bg-white rounded-[16px] border border-[#e0e2e8] p-6">
            <h2 className="text-[17px] font-bold text-[#333743] mb-4">Hotel highlights</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Waves size={13} />, label: "Infinity pool" },
                { icon: <Wifi size={13} />, label: "Free WiFi" },
                { icon: <UtensilsCrossed size={13} />, label: "5 restaurants" },
                { icon: <Dumbbell size={13} />, label: "Fitness centre" },
                { icon: <Coffee size={13} />, label: "Daily breakfast" },
                { icon: <Umbrella size={13} />, label: "Private beach" },
                { icon: <Car size={13} />, label: "Airport transfer" },
                { icon: <Star size={13} />, label: "Spa & wellness" },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 bg-[#f3f5f6] text-[#333743] text-[13px] font-medium px-3 py-1.5 rounded-full"
                >
                  <span className="text-[#2681FF]">{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </section>

          {/* ── GUEST REVIEWS ───────────────────────────────────────────── */}
          {/* Rating score already shown in the hotel identity block above — not repeated here */}
          <section className="bg-white rounded-[16px] border border-[#e0e2e8] p-6">
            <h2 className="text-[17px] font-bold text-[#333743] mb-4">What guests say</h2>
            <div className="flex flex-col gap-4">
              {REVIEWS.map((review) => (
                <div key={review.id} className="flex gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-[#333743]">{review.name}</span>
                      <span className="text-[11px] text-[#9598a4]">{review.date}</span>
                      <span className="text-[12px] text-[#FFB700] ml-auto">{"★".repeat(review.rating)}</span>
                    </div>
                    <p className="text-[13px] text-[#667080] leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── RIGHT SIDEBAR (sticky booking card) ─────────────────────── */}
        <div className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-[80px]">
          <div className="bg-white rounded-[16px] border border-[#e0e2e8] overflow-hidden">

            {/* Price — the one place price lives; removed from the sticky header */}
            <div className="px-5 pt-5 pb-4 border-b border-[#f3f5f6]">
              <div className="text-[11px] text-[#9598a4] mb-0.5">Per person from</div>
              <div className="text-[30px] font-black text-[#333743] leading-none">£{totalPrice.toLocaleString()}</div>
              <div className="text-[12px] text-[#9598a4] mt-1">+£{taxesAndFees} taxes & fees</div>
            </div>

            {/* What's selected — room + board, confirmed by the user's choices above */}
            <div className="px-5 py-3 border-b border-[#f3f5f6] flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
                <Moon size={13} className="text-[#9598a4]" />
                <span>{pkg.nights} nights · {selectedRoom.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
                <Users size={13} className="text-[#9598a4]" />
                <span>{guestLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-[#333743]">
                <Star size={13} className="text-[#9598a4]" />
                <span>{selectedBoard.label}</span>
              </div>
            </div>

            {/* Price breakdown accordion */}
            <div className="px-5 py-3 border-b border-[#f3f5f6]">
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className="w-full flex items-center justify-between text-[13px] font-semibold text-[#667080]"
              >
                Price breakdown
                {priceOpen
                  ? <ChevronUp size={14} className="text-[#9598a4]" />
                  : <ChevronDown size={14} className="text-[#9598a4]" />
                }
              </button>
              {priceOpen && (
                <div className="mt-3 flex flex-col gap-2 text-[12px] text-[#667080]">
                  <div className="flex justify-between">
                    <span>Hotel ({pkg.nights} nights)</span>
                    <span className="font-semibold text-[#333743]">£{(basePrice * 0.6).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flights</span>
                    <span className="font-semibold text-[#333743]">£{(basePrice * 0.35).toFixed(0)}</span>
                  </div>
                  {roomExtra > 0 && (
                    <div className="flex justify-between">
                      <span>Room upgrade</span>
                      <span className="font-semibold text-[#333743]">+£{roomExtra}</span>
                    </div>
                  )}
                  {boardExtra !== 0 && (
                    <div className="flex justify-between">
                      <span>Board</span>
                      <span className="font-semibold text-[#333743]">{boardExtra > 0 ? "+" : ""}£{boardExtra}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Taxes & fees</span>
                    <span className="font-semibold text-[#333743]">£{taxesAndFees}</span>
                  </div>
                  <div className="border-t border-[#e0e2e8] pt-2 flex justify-between font-bold text-[#333743]">
                    <span>Total pp</span>
                    <span>£{(totalPrice + taxesAndFees).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trust signals — CTA is in the sticky bottom bar */}
            <div className="px-5 py-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#9598a4]">
                <ShieldCheck size={12} className="text-[#16a34a]" />
                ATOL protected · Secure payment
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#9598a4]">
                <Check size={12} className="text-[#16a34a]" />
                50% deposit option available
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── STICKY BOTTOM BAR ──────────────────────────────────────────── */}
      {/* Same pattern as SmartPlannerPage — fixed to bottom, white, rounded top corners.
          Left: trip summary (what's selected). Right: primary CTA. */}
      <div className="fixed bottom-0 left-0 w-full z-30 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] rounded-t-3xl px-4">
        <div className="max-w-[1200px] mx-auto py-4 lg:py-5 flex items-center justify-between gap-4">

          {/* Desktop summary — hotel · room · board · guests */}
          <div className="hidden lg:flex items-center gap-6 text-[14px] text-[#333743]">
            <div>
              <div className="font-bold">{pkg.hotelName}</div>
              <div className="text-[#9598a4] text-[12px]">{pkg.destination} · {pkg.nights} nights</div>
            </div>
            <div className="w-px h-8 bg-[#e0e2e8]" />
            <div className="text-[#667080]">
              {selectedRoom.name} · <span className="font-semibold text-[#333743]">{selectedBoard.label}</span>
            </div>
            <div className="w-px h-8 bg-[#e0e2e8]" />
            <div className="flex flex-col">
              <span className="font-semibold">£{totalPrice.toLocaleString()} <span className="font-normal text-[#9598a4]">pp</span></span>
              <span className="text-[12px] text-[#9598a4]">{guestLabel}</span>
            </div>
          </div>

          {/* Mobile summary — condensed */}
          <div className="flex lg:hidden flex-col gap-0.5 text-[13px]">
            <div className="font-bold text-[#333743]">{pkg.hotelName}</div>
            <div className="text-[#9598a4]">{pkg.nights} nights · {selectedBoard.label} · £{totalPrice.toLocaleString()} pp</div>
          </div>

          {/* CTA — "Personalise your holiday" takes the user to Smart Planner */}
          <button
            onClick={() => onBook(pkg)}
            className="flex items-center gap-2 bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[14px] lg:text-[15px] px-5 lg:px-6 py-3 rounded-[12px] transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles size={16} />
            Personalise your holiday
          </button>

        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FlightTimeline — departure / line / arrival, used inside the flights section
// ─────────────────────────────────────────────────────────────────────────────

function FlightTimeline({
  fromCode, fromCity, toCode, toCity,
  departTime, arriveTime, stops, duration, airline,
}: {
  fromCode: string; fromCity: string;
  toCode: string; toCity: string;
  departTime: string; arriveTime: string;
  stops: string; duration: string; airline: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center shrink-0">
        <div className="text-[20px] font-black text-[#333743]">{departTime}</div>
        <div className="text-[13px] font-bold text-[#333743]">{fromCode}</div>
        <div className="text-[11px] text-[#9598a4]">{fromCity}</div>
      </div>

      <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <div className="text-[11px] text-[#9598a4]">{duration}</div>
        <div className="flex items-center w-full gap-1">
          <div className="flex-1 h-px bg-[#e0e2e8]" />
          <Plane size={13} className="text-[#2681FF] shrink-0" />
          <div className="flex-1 h-px bg-[#e0e2e8]" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#667080]">
          <span>{stops}</span>
          <span>·</span>
          <span className="bg-[#f3f5f6] font-bold px-1.5 py-0.5 rounded-[4px] text-[#333743]">{airline}</span>
        </div>
      </div>

      <div className="text-center shrink-0">
        <div className="text-[20px] font-black text-[#333743]">{arriveTime}</div>
        <div className="text-[13px] font-bold text-[#333743]">{toCode}</div>
        <div className="text-[11px] text-[#9598a4]">{toCity}</div>
      </div>
    </div>
  );
}
