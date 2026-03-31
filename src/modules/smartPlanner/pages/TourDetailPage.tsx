// ─────────────────────────────────────────────────────────────────────────────
// TourDetailPage — v3
//
// Layout matches PackageDetailPage exactly:
//   • bg-[#F3F5F6] page background, Mulish font
//   • Top white card: back button + photo grid + tour title/facts (no widget)
//   • Page body: grid-cols-[1fr_380px]
//       Left  — gallery, day-by-day, info tabs
//       Right — STICKY sidebar card (same container as rate calendar in PackageDetailPage)
//                 with booking widget: fields + price + CTA
//   • Mobile sticky footer with price + CTA
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Languages,
  Activity,
  CalendarCheck,
  Sparkles,
  Check,
  Info,
  MapPinned,
  Hotel,
  Bus,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { BackButton } from "../../../shared/components/BackButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import type { Tour, TourAttribute, TourDay, TourDayItem } from "../../../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sym(currency: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", CHF: "CHF " };
  return map[currency] ?? currency + " ";
}

function AttributeIcon({ iconKey }: { iconKey: TourAttribute["iconKey"] }) {
  const cls = "text-[#333743] shrink-0";
  if (iconKey === "users")          return <Users size={15} className={cls} />;
  if (iconKey === "languages")      return <Languages size={15} className={cls} />;
  if (iconKey === "activity")       return <Activity size={15} className={cls} />;
  if (iconKey === "calendar-check") return <CalendarCheck size={15} className={cls} />;
  return null;
}

function DayItemIcon({ type }: { type: TourDayItem["type"] }) {
  if (type === "highlight") return <MapPinned size={15} className="text-[#9598a4] shrink-0 mt-0.5" />;
  if (type === "hotel")     return <Hotel     size={15} className="text-[#9598a4] shrink-0 mt-0.5" />;
  if (type === "transport") return <Bus       size={15} className="text-[#9598a4] shrink-0 mt-0.5" />;
  return null;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface TourDetailPageProps {
  tour: Tour;
  onBack: () => void;
  onBook: (tour: Tour, travelDate: string, adults: number, hotelPreference: string) => void;
  // Label shown on the back button — defaults to "Back to all tours"
  backLabel?: string;
}

type InfoTab = "highlights" | "included" | "excluded";

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function TourDetailPage({ tour, onBack, onBook, backLabel = "Back to all tours" }: TourDetailPageProps) {

  // Photos modal
  const [photosOpen, setPhotosOpen] = useState(false);

  // Booking widget state — lives in the sidebar
  // openPanel controls which dropdown is visible at any time (only one at once)
  type BookingPanel = "date" | "guests" | "hotel" | null;
  const [openPanel, setOpenPanel]             = useState<BookingPanel>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | undefined>(undefined);
  const [adults, setAdults]                   = useState(tour.adults);
  const [children, setChildren]               = useState(0);
  const [hotelPreference, setHotelPreference] = useState("Standard");

  // Ref used to close all panels when clicking outside the booking widget
  const bookingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bookingRef.current && !bookingRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Derived display labels
  const dateSummary = selectedDate ? format(selectedDate, "MMM d, yyyy") : tour.startDate;
  const travelDate  = selectedDate ? format(selectedDate, "MMM d, yyyy") : tour.startDate;

  // Info tabs
  const [activeTab, setActiveTab] = useState<InfoTab>("highlights");

  const currency = sym(tour.price.currency);
  const totalPrice = tour.price.perPerson * adults;

  // Consistent gallery images via picsum (same helper pattern as PackageDetailPage)
  const slug = tour.tourId;
  const galleryImages = [
    `https://picsum.photos/seed/${slug}-hero/800/600`,
    `https://picsum.photos/seed/${slug}-a/400/300`,
    `https://picsum.photos/seed/${slug}-b/400/300`,
    `https://picsum.photos/seed/${slug}-c/400/300`,
    `https://picsum.photos/seed/${slug}-d/400/300`,
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-[#F3F5F6]"
      style={{ fontFamily: "'Mulish', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;900&display=swap');`}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          TOP WHITE CARD — back button + photo grid + tour title/facts
          Same structure as PackageDetailPage's main info card.
          The booking widget is NOT here — it lives in the right sidebar below.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white">
        <div className="max-w-[1280px] mx-auto">

          {/* Back button */}
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-5">
            <BackButton label={backLabel} onClick={onBack} />
          </div>

          {/* ── Photo grid — 402px, 3fr / 2fr, same as PackageDetailPage ── */}
          <div className="relative mx-4 sm:mx-6 md:mx-10 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] h-[200px] sm:h-[240px] md:h-[402px] gap-2">

              {/* Main image with play button overlay */}
              <div className="relative overflow-hidden rounded-[16px] group cursor-pointer">
                <img
                  src={galleryImages[0]}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#333743]/30 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play size={20} className="text-[#1a1a1a] ml-1" fill="#1a1a1a" />
                  </div>
                </div>
              </div>

              {/* 2×2 thumbnail grid — desktop only, clicking opens the modal */}
              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {galleryImages.slice(1, 5).map((url, i) => (
                  <div
                    key={url}
                    className="overflow-hidden rounded-[16px] cursor-pointer group"
                    onClick={() => setPhotosOpen(true)}
                  >
                    <img
                      src={url}
                      alt={`Tour photo ${i + 2}`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* "See all photos" button — overlaid bottom-right, same as PackageDetailPage */}
            <button
              onClick={() => setPhotosOpen(true)}
              className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-[#DDDDDD] rounded-[8px] px-4 py-2 text-[14px] font-semibold text-[#2681FF] flex items-center gap-2 hover:bg-white transition-colors shadow-sm"
            >
              ⊞ See all photos
            </button>
          </div>

          {/* ── Tour title + quick facts — full width, no widget ── */}
          <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 flex flex-col gap-4">

            <h1 className="text-[24px] sm:text-[32px] md:text-[40px] font-black text-[#333743] leading-[1.1] tracking-tight">
              {tour.title}
            </h1>

            {/* Duration + locations — same row style as PackageDetailPage */}
            <div className="flex items-center gap-4 text-[16px] text-[#333743] flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-[#333743] shrink-0" />
                <span>{tour.duration} days</span>
              </div>
              <span className="text-[#DDDDDD] hidden sm:block">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-[#333743] shrink-0" />
                <span>{tour.locationsLabel}</span>
              </div>
              <button className="flex items-center gap-1.5 text-[14px] font-semibold text-[#2681FF] hover:underline">
                <MapPinned size={14} />
                Show on map
              </button>
            </div>

            {/* Tour details — same pattern as "Package details" in PackageDetailPage:
                plain icon + text rows, no chip borders or backgrounds */}
            <h3 className="text-[18px] font-bold text-[#333743]">Tour details</h3>
            <div className="flex flex-row flex-wrap gap-x-6 gap-y-2">
              {tour.attributes.map((attr) => (
                <div key={attr.label} className="flex items-center gap-2 text-[16px] text-[#333743]">
                  <AttributeIcon iconKey={attr.iconKey} />
                  <span>{attr.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE BODY — two-column grid, same as PackageDetailPage body
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-8">

        <h2 className="text-[26px] font-black text-[#333743] mb-6">
          Tour highlights & itinerary
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

          {/* ╔═══════════════════════════════════════════════════════════════
              LEFT COLUMN — gallery, day-by-day, info tabs
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* ── Day-by-day ──────────────────────────────────────────────── */}
            <div>
              <h3 className="text-[20px] font-bold text-[#222222] mb-4">
                Day by day adventures
              </h3>
              <div className="flex flex-col gap-3">
                {tour.days.map((day) => (
                  <DayCard key={day.dayNumber} day={day} slug={slug} />
                ))}
              </div>
            </div>

            {/* ── Info tabs ───────────────────────────────────────────────── */}
            <div>
              <h3 className="text-[20px] font-bold text-[#222222] mb-4">
                Don't forget to remember
              </h3>
              <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">

                {/* Tab bar */}
                <div className="flex border-b border-[#e0e2e8]">
                  {(["highlights", "included", "excluded"] as InfoTab[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const config = {
                      highlights: { label: "Highlights", icon: <Sparkles size={15} /> },
                      included:   { label: "Included",   icon: <Check    size={15} /> },
                      excluded:   { label: "Excluded",   icon: <Info     size={15} /> },
                    }[tab];
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-6 py-4 font-bold text-[14px] border-b-2 transition-colors ${
                          isActive
                            ? "border-[#2681FF] text-[#2681FF]"
                            : "border-transparent text-[#9598a4] hover:text-[#333743]"
                        }`}
                      >
                        {config.icon}
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="p-5">
                  {activeTab === "highlights" && (
                    <InfoList title="Tour highlights" items={tour.highlights} variant="highlight" />
                  )}
                  {activeTab === "included" && (
                    <InfoList title="What's included" items={tour.included} variant="check" />
                  )}
                  {activeTab === "excluded" && (
                    <InfoList title="Not included" items={tour.excluded} variant="cross" />
                  )}
                </div>
              </div>
            </div>

          </div>
          {/* ╚═══════════════════════ END LEFT COLUMN ════════════════════╝ */}

          {/* ╔═══════════════════════════════════════════════════════════════
              RIGHT COLUMN — STICKY BOOKING WIDGET SIDEBAR
              Identical container to the rate calendar sidebar in PackageDetailPage:
                bg-white, border border-[#E8E8E8], rounded-[16px],
                shadow-[0_4px_16px_rgba(0,0,0,0.10)], overflow-hidden
              Sits at sticky top-[64px], hidden on mobile (has footer instead).
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="hidden lg:block sticky top-[64px] pt-2">
            <div className="bg-white border border-[#E8E8E8] rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.10)]">

              {/* ── Price summary — same pattern as PackageDetailPage sidebar ── */}
              <div className="p-5">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-[28px] font-black text-[#333743] leading-none">
                    {currency}{tour.price.perPerson.toLocaleString()}
                  </span>
                  <span className="text-[14px] font-normal text-[#333743]">per person</span>
                </div>
                <div className="text-[13px] text-[#333743] mb-1">
                  {tour.duration}-day guided tour
                </div>
                <div className="text-[13px] text-[#717171]">
                  Total for {adults} {adults === 1 ? "adult" : "adults"}:{" "}
                  <strong className="text-[#333743] font-bold">
                    {currency}{totalPrice.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* ── Booking fields ── */}
              {/* All three fields follow the same pattern as PackageSearchForm:
                  a clickable field div that toggles a panel, with bg-white
                  as the default background (not grey) */}
              <div ref={bookingRef} className="border-t border-[#F0F0F0] p-5 flex flex-col gap-3">

                <p className="text-[12px] font-bold text-[#9598a4] uppercase tracking-wide mb-1">
                  Customise your trip
                </p>

                {/* ── Travel date — DayPicker panel (same as PackageSearchForm) ── */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
                    className={`h-[48px] rounded-[8px] border px-4 flex items-center gap-3 transition-colors w-full text-left ${
                      openPanel === "date"
                        ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                        : "border-[#e0e2e8] bg-white hover:border-[#2681FF]"
                    }`}
                  >
                    <Calendar size={16} className="text-[#2681FF] shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">
                        Travel date
                      </span>
                      <span className="text-[13px] font-semibold text-[#333743] truncate">
                        {travelDate}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-[#9598a4] shrink-0 transition-transform ${openPanel === "date" ? "rotate-180" : ""}`} />
                  </button>

                  {/* DayPicker panel — same style as PackageSearchForm / HotelDetailPage */}
                  {openPanel === "date" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-4 animate-in fade-in zoom-in-95 duration-150">
                      <style>{`.rdp-root { --rdp-accent-color: #2681FF; --rdp-accent-background-color: rgba(38,129,255,0.10); --rdp-day_button-border-radius: 8px; margin: 0; }`}</style>
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (!date) return;
                          setSelectedDate(date);
                          setOpenPanel(null); // close after selecting
                        }}
                        disabled={{ before: new Date() }}
                        numberOfMonths={1}
                      />
                    </div>
                  )}
                </div>

                {/* ── Travellers — panel with Adults/Children counter + Done ── */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
                    className={`h-[48px] rounded-[8px] border px-4 flex items-center gap-3 transition-colors w-full text-left ${
                      openPanel === "guests"
                        ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                        : "border-[#e0e2e8] bg-white hover:border-[#2681FF]"
                    }`}
                  >
                    <Users size={16} className="text-[#2681FF] shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">
                        Travellers
                      </span>
                      <span className="text-[13px] font-semibold text-[#333743]">
                        {adults} Adult{adults !== 1 ? "s" : ""}
                        {children > 0 ? ` · ${children} Child${children !== 1 ? "ren" : ""}` : ""}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-[#9598a4] shrink-0 transition-transform ${openPanel === "guests" ? "rotate-180" : ""}`} />
                  </button>

                  {/* Guest counter panel — same layout as PackageSearchForm */}
                  {openPanel === "guests" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white rounded-[16px] shadow-2xl border border-[#e0e2e8] p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { label: "Adults",   sub: "Age 12+",  value: adults,   min: 1, set: setAdults   },
                        { label: "Children", sub: "Age 2–11", value: children, min: 0, set: setChildren },
                      ].map(({ label, sub, value, min, set }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div>
                            <div className="text-[14px] font-semibold text-[#333743]">{label}</div>
                            <div className="text-[12px] text-[#9598a4]">{sub}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => set(Math.max(min, value - 1))}
                              disabled={value <= min}
                              className="w-8 h-8 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] transition-colors disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-[15px] font-bold text-[#333743] w-4 text-center">{value}</span>
                            <button
                              onClick={() => set(Math.min(9, value + 1))}
                              className="w-8 h-8 rounded-full border border-[#e0e2e8] flex items-center justify-center text-[#333743] hover:border-[#2681FF] hover:text-[#2681FF] transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setOpenPanel(null)}
                        className="w-full bg-[#2681FF] text-white font-bold text-[14px] py-2.5 rounded-[10px] hover:bg-[#1a6fd9] transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Hotel preference — dropdown ── */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "hotel" ? null : "hotel")}
                    className={`h-[48px] rounded-[8px] border px-4 flex items-center gap-3 transition-colors w-full text-left ${
                      openPanel === "hotel"
                        ? "border-[#2681FF] ring-2 ring-[#2681FF]/20 bg-white"
                        : "border-[#e0e2e8] bg-white hover:border-[#2681FF]"
                    }`}
                  >
                    <Hotel size={16} className="text-[#2681FF] shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#9598a4] uppercase tracking-wide leading-none mb-0.5">
                        Hotel preference
                      </span>
                      <span className="text-[13px] font-semibold text-[#333743]">{hotelPreference}</span>
                    </div>
                    <ChevronDown size={14} className={`text-[#9598a4] shrink-0 transition-transform ${openPanel === "hotel" ? "rotate-180" : ""}`} />
                  </button>
                  {openPanel === "hotel" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e2e8] rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {["Standard", "Superior", "Deluxe", "Luxury"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setHotelPreference(opt); setOpenPanel(null); }}
                          className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold hover:bg-[#EFF6FF] transition-colors flex items-center justify-between ${
                            hotelPreference === opt ? "text-[#2681FF] bg-[#EFF6FF]" : "text-[#333743]"
                          }`}
                        >
                          {opt}
                          {hotelPreference === opt && <Check size={14} className="text-[#2681FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* ── CTA button — same as PackageDetailPage sidebar CTA ── */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => onBook(tour, travelDate, adults, hotelPreference)}
                  className="w-full bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[16px] py-[16px] rounded-[10px] transition-colors flex items-center justify-center gap-2"
                >
                  Start planning
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>
          {/* ╚═══════════════════════ END RIGHT COLUMN ═══════════════════╝ */}

        </div>
      </div>

      {/* Spacer so the mobile footer doesn't overlap last content */}
      <div className="lg:hidden h-20" />

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE STICKY FOOTER — price left, CTA right
          Same pattern as PackageDetailPage mobile footer.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#E8E8E8] px-5 py-3 z-50 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div>
          <div className="text-[11px] text-[#717171]">Per person from</div>
          <div className="text-[20px] font-black text-[#333743] leading-none">
            {currency}{tour.price.perPerson.toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => onBook(tour, travelDate, adults, hotelPreference)}
          className="flex items-center gap-2 bg-[#2681FF] hover:bg-[#1a6fd9] text-white font-bold text-[14px] px-5 py-3 rounded-[10px] transition-colors"
        >
          Start planning
          <ArrowRight size={15} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ALL PHOTOS MODAL — same layout as PackageDetailPage photos dialog:
          one wide hero image spanning both columns, then a 2-col grid of extras.
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={photosOpen} onOpenChange={setPhotosOpen}>
        <DialogContent className="max-w-[1040px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tour.title} — All photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Hero image — full width */}
            <div className="col-span-2">
              <img
                src={galleryImages[0]}
                alt={tour.title}
                className="w-full aspect-[16/7] object-cover rounded-[16px]"
              />
            </div>
            {/* Extra gallery images — 2-col grid */}
            {[
              `https://picsum.photos/seed/${slug}-modal-1/900/600`,
              `https://picsum.photos/seed/${slug}-modal-2/900/600`,
              `https://picsum.photos/seed/${slug}-modal-3/900/600`,
              `https://picsum.photos/seed/${slug}-modal-4/900/600`,
              `https://picsum.photos/seed/${slug}-modal-5/900/600`,
              `https://picsum.photos/seed/${slug}-modal-6/900/600`,
              `https://picsum.photos/seed/${slug}-modal-7/900/600`,
              `https://picsum.photos/seed/${slug}-modal-8/900/600`,
            ].map((url, i) => (
              <img
                key={url}
                src={url}
                alt={`Tour photo ${i + 2}`}
                className="w-full aspect-[4/3] object-cover rounded-[16px]"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DayCard — collapsible day block matching the white card section pattern
// ─────────────────────────────────────────────────────────────────────────────

function DayCard({ day, slug }: { day: TourDay; slug: string }) {
  const [expanded, setExpanded] = useState(day.dayNumber <= 2);

  const dayImage = day.image ?? `https://picsum.photos/seed/${slug}-day${day.dayNumber}/400/280`;

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow overflow-hidden">

      {/* Header — always visible */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[11px] font-bold text-[#2681FF] bg-[#EFF6FF] px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wide whitespace-nowrap">
          Day {day.dayNumber}
        </span>
        <span className="flex-1 text-[16px] font-bold text-[#333743]">{day.title}</span>
        {expanded
          ? <ChevronUp   size={18} className="text-[#9598a4] shrink-0" />
          : <ChevronDown size={18} className="text-[#9598a4] shrink-0" />
        }
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="flex flex-col sm:flex-row border-t border-[#f3f5f6]">

          {/* Items list */}
          <div className="flex-1 px-5 py-4 flex flex-col gap-3">
            {day.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <DayItemIcon type={item.type} />
                <div>
                  <p className="text-[14px] font-semibold text-[#333743]">{item.label}</p>
                  {item.description && (
                    <p className="text-[13px] text-[#9598a4] mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Day photo — padded + rounded to sit inside the card */}
          <div className="sm:w-[200px] shrink-0 p-4 sm:pl-0">
            <div className="rounded-[12px] overflow-hidden h-[140px] sm:h-full">
              <img
                src={dayImage}
                alt={`Day ${day.dayNumber}: ${day.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoList — bullet list for Highlights / Included / Excluded tabs
// ─────────────────────────────────────────────────────────────────────────────

function InfoList({ title, items, variant }: {
  title: string;
  items: string[];
  variant: "highlight" | "check" | "cross";
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] font-bold text-[#333743]">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              variant === "cross" ? "bg-red-50" : "bg-[#e8f7ef]"
            }`}>
              {variant === "cross"
                ? <span className="text-red-400 text-[11px] font-bold leading-none">✕</span>
                : <Check size={11} className="text-[#19a974]" />
              }
            </div>
            <p className="text-[14px] text-[#333743] leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
