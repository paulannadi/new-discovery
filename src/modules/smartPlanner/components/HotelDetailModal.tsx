// ─────────────────────────────────────────────────────────────────────────────
// HotelDetailModal
//
// Full-screen modal that opens when the user clicks a PackageCard.
// The right-hand panel switches based on the package's sourceMode:
//
//   sourceMode === 'cache' → Rate Calendar
//     Shows available departure dates from rateCalendar[].
//     The user can pick a different date to see updated pricing.
//     This is the key differentiator of cached supply — flexible date browsing.
//
//   sourceMode === 'live' → Package Details Panel
//     Shows room type, board type, and cancellation policy for the exact
//     package the user selected. No date flexibility since live supply
//     is tied to a specific departure.
//
// Both modes share the same hotel info area (left) and sticky footer (bottom).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { format, addDays } from "date-fns"; // addDays used for returnDateObj below
import { X, MapPin, Plane, Star, Wifi, Utensils, Dumbbell, Waves } from "lucide-react";
import { UnifiedPackage } from "../../../types";
import type { HolidaySearchCriteria } from "../../../App";
// RateCalendarPanel is a shared component — used here, on PackageCard, and on DiscoveryPage
import { RateCalendarPanel } from "./RateCalendarPanel";

// ── Currency helper ────────────────────────────────────────────────────────

function sym(currency: string): string {
  return currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency + " ";
}

// ── Date formatters ────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  try { return format(new Date(iso), "EEE, d MMM yyyy"); } catch { return iso; }
}

function fmtShort(iso: string): string {
  try { return format(new Date(iso), "d MMM"); } catch { return iso; }
}

// ── Star rating row ────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <span className="text-[#FFB700] font-bold text-sm">
      {"★".repeat(count)}{"☆".repeat(Math.max(0, 5 - count))}
    </span>
  );
}

// ── Amenity icon ──────────────────────────────────────────────────────────
// Maps amenity text to a Lucide icon (best-effort, falls back to a dot).

function AmenityIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("pool") || lower.includes("beach") || lower.includes("water")) return <Waves size={14} className="text-[#2681FF]" />;
  if (lower.includes("wifi") || lower.includes("internet")) return <Wifi size={14} className="text-[#2681FF]" />;
  if (lower.includes("dine") || lower.includes("restaurant") || lower.includes("food")) return <Utensils size={14} className="text-[#2681FF]" />;
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("sport")) return <Dumbbell size={14} className="text-[#2681FF]" />;
  if (lower.includes("spa") || lower.includes("wellness")) return <Star size={14} className="text-[#2681FF]" />;
  return <span className="w-[14px] h-[14px] flex items-center justify-center text-[#2681FF] text-[8px]">●</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Package Details Panel (live mode)
//
// Shows the exact room and conditions for the selected live package.
// No date flexibility — what you see is what you get.
// ─────────────────────────────────────────────────────────────────────────────

function PackageDetailsPanel({ pkg }: { pkg: UnifiedPackage }) {
  return (
    <div className="bg-[#f8fafc] border border-[#e0e2e8] rounded-[14px] p-4 flex flex-col gap-3">
      <div className="text-[13px] font-bold text-[#333743]">Your package</div>

      {/* Room + board */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[13px]">
          <span className="text-[#667080]">Room type</span>
          <span className="font-semibold text-[#333743] text-right max-w-[55%]">{pkg.room.roomType}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#667080]">Board</span>
          <span className="font-semibold text-[#333743]">{pkg.room.boardType}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#667080]">Cancellation</span>
          <span className="font-semibold text-[#16a34a]">Free until 14 days</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#e0e2e8]" />

      {/* Flight summary */}
      <div className="text-[13px] font-bold text-[#333743] mb-1">Included flights</div>
      <div className="flex flex-col gap-2">
        {/* Outbound */}
        <div className="flex items-start gap-2">
          <Plane size={13} className="text-[#2681FF] mt-0.5 shrink-0" />
          <div>
            <div className="text-[12px] font-semibold text-[#333743]">
              {pkg.flights.outbound.departureAirport} → {pkg.flights.outbound.arrivalAirport}
            </div>
            <div className="text-[11px] text-[#667080]">
              {fmtShort(pkg.flights.outbound.departureTime)} · {pkg.flights.outbound.carrier} {pkg.flights.outbound.flightNumber}
            </div>
          </div>
        </div>
        {/* Return */}
        <div className="flex items-start gap-2">
          <Plane size={13} className="text-[#2681FF] mt-0.5 shrink-0 rotate-180" />
          <div>
            <div className="text-[12px] font-semibold text-[#333743]">
              {pkg.flights.return.departureAirport} → {pkg.flights.return.arrivalAirport}
            </div>
            <div className="text-[11px] text-[#667080]">
              {fmtShort(pkg.flights.return.departureTime)} · {pkg.flights.return.carrier} {pkg.flights.return.flightNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HotelDetailModal — main component
// ─────────────────────────────────────────────────────────────────────────────

interface HotelDetailModalProps {
  pkg: UnifiedPackage | null;
  open: boolean;
  onClose: () => void;
  searchCriteria: HolidaySearchCriteria;
}

export function HotelDetailModal({ pkg, open, onClose, searchCriteria }: HotelDetailModalProps) {
  // For cache mode: the currently selected departure date.
  // Initialised to the package's default outbound date.
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (!pkg) return "";
    return pkg.flights.outbound.departureTime.split("T")[0];
  });

  // Update selectedDate when pkg changes (new card opened)
  // We use a key on the modal root to reset state when the package changes

  if (!open || !pkg) return null;

  const currSym = sym(pkg.price.currency);

  // For cached packages, the selected date determines the displayed price
  const activeCalendarEntry = pkg.rateCalendar?.find(e => e.departureDate === selectedDate);
  const activePrice = activeCalendarEntry?.pricePerPerson ?? pkg.price.perPerson;

  // Compute return date from selected departure + nights from search criteria
  const nights = searchCriteria.nights || 7;
  const departureDateObj = new Date(selectedDate || pkg.flights.outbound.departureTime);
  const returnDateObj = addDays(departureDateObj, nights);

  const departureDisplay = fmtDate(departureDateObj.toISOString());
  const returnDisplay = fmtDate(returnDateObj.toISOString());

  return (
    // Modal backdrop — clicking outside closes the modal
    <div
      className="fixed inset-0 z-50 bg-[#333743]/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal content — stop clicks from bubbling to backdrop */}
      <div
        className="bg-white rounded-[20px] shadow-2xl w-full max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Scrollable main content ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Hotel hero image */}
          <div className="relative">
            <img
              src={pkg.hotel.mainImage}
              alt={pkg.hotel.name}
              className="w-full h-[240px] object-cover"
            />
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <X size={18} className="text-[#333743]" />
            </button>
          </div>

          {/* ── Two-column content area ──────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-6 p-6">

            {/* LEFT column: hotel info */}
            <div className="flex-1 flex flex-col gap-4">

              {/* Location + name + stars */}
              <div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#667080] mb-1">
                  <MapPin size={12} className="shrink-0" />
                  {pkg.hotel.location}
                </div>
                <h2 className="text-[22px] font-black text-[#333743] leading-tight">{pkg.hotel.name}</h2>
                <div className="mt-1">
                  <StarRating count={pkg.hotel.category} />
                </div>
              </div>

              {/* TrustYou score */}
              <div className="flex items-center gap-3">
                <div className="bg-[#16a34a] text-white font-black text-[20px] px-3 py-1.5 rounded-[10px] leading-none">
                  {(pkg.hotel.trustYou.rating / 10).toFixed(1)}
                </div>
                <div>
                  <div className="font-bold text-[#333743] text-[14px]">
                    {pkg.hotel.trustYou.rating >= 90 ? "Exceptional"
                      : pkg.hotel.trustYou.rating >= 85 ? "Outstanding"
                      : pkg.hotel.trustYou.rating >= 80 ? "Excellent"
                      : "Very good"}
                  </div>
                  <div className="text-[#667080] text-[13px]">
                    {pkg.hotel.trustYou.recommendationScore}% recommend · {pkg.hotel.trustYou.reviewCount.toLocaleString()} reviews
                  </div>
                </div>
              </div>

              {/* Hotel + Flights price headline */}
              <div className="bg-[#f0f7ff] rounded-[12px] px-4 py-3">
                <div className="text-[12px] text-[#667080]">Hotel + Flights package</div>
                <div className="text-[24px] font-black text-[#333743] leading-tight">
                  {currSym}{activePrice.toLocaleString()} <span className="text-[14px] font-semibold text-[#667080]">per person</span>
                </div>
                <div className="text-[12px] text-[#667080] mt-0.5">
                  Total: {currSym}{(activePrice * 2).toLocaleString()} for 2 adults
                </div>
              </div>

              {/* Amenities */}
              <div>
                <div className="text-[13px] font-bold text-[#333743] mb-2">Hotel highlights</div>
                <div className="flex flex-col gap-2">
                  {pkg.hotel.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-[13px] text-[#333743]">
                      <AmenityIcon name={amenity} />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review snippet (placeholder) */}
              <div className="bg-[#f9fafb] rounded-[12px] px-4 py-3 border border-[#e0e2e8]">
                <div className="text-[11px] text-[#FFB700] font-bold mb-1">★★★★★</div>
                <div className="text-[13px] text-[#333743] italic">
                  "The staff were incredibly welcoming and the rooms were spotless.
                  The beach access made this feel like a true luxury escape."
                </div>
                <div className="text-[11px] text-[#9598a4] mt-1.5">— Verified guest review via TrustYou</div>
              </div>

            </div>

            {/* RIGHT column: rate calendar (cache) or package details (live) */}
            <div className="md:w-[300px] shrink-0">
              {pkg.sourceMode === "cache" && pkg.rateCalendar ? (
                <RateCalendarPanel
                  rateCalendar={pkg.rateCalendar}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  currency={pkg.price.currency}
                  nights={nights}
                />
              ) : (
                <PackageDetailsPanel pkg={pkg} />
              )}
            </div>

          </div>
        </div>

        {/* ── Sticky footer ─────────────────────────────────────────────── */}
        {/* Shows departure/return dates, duration + pax, and the CTA. */}
        <div className="border-t border-[#e0e2e8] bg-white px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">

          {/* Trip summary */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#333743]">
            <div>
              <span className="text-[#9598a4]">Departing:</span>{" "}
              <span className="font-semibold">{departureDisplay}</span>
            </div>
            <div>
              <span className="text-[#9598a4]">Returning:</span>{" "}
              <span className="font-semibold">{returnDisplay}</span>
            </div>
            <div className="text-[#667080]">
              {nights} nights · {searchCriteria.adults || 2} Adults
              {(searchCriteria.children || 0) > 0 ? ` · ${searchCriteria.children} Children` : ""}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-[#9598a4]">from</div>
              <div className="text-[20px] font-black text-[#333743] leading-none">
                {currSym}{activePrice.toLocaleString()} <span className="text-[12px] font-semibold text-[#667080]">/pp</span>
              </div>
            </div>
            <button
              onClick={() => {
                // In the real product this would hand off to Smart Planner.
                // For the prototype it's a no-op with a console trace.
                console.log("→ Smart Planner handoff", { packageId: pkg.packageId, selectedDate });
              }}
              className="bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[14px] px-5 py-3 rounded-[12px] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Personalise Your Holiday →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
