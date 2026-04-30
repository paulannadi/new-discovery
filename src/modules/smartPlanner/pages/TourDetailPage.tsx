// ─────────────────────────────────────────────────────────────────────────────
// TourDetailPage — v3
//
// Layout matches PackageDetailPage exactly:
//   • bg-muted page background, Mulish font
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
  Check,
  MapPinned,
  Hotel,
  Bus,
  ChevronDown,

  Plus,
  Minus,
  X,
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
import { cn } from "../../../shared/components/ui/utils";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Tour, TourAttribute, TourDay, TourDayItem, TourStop } from "../../../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sym(currency: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", CHF: "CHF " };
  return map[currency] ?? currency + " ";
}

function AttributeIcon({ iconKey, size = 15 }: { iconKey: TourAttribute["iconKey"]; size?: number }) {
  const cls = "text-muted-foreground shrink-0";
  if (iconKey === "users")          return <Users size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "languages")      return <Languages size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "activity")       return <Activity size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "calendar-check") return <CalendarCheck size={size} className={cls} aria-hidden="true" />;
  return null;
}

function DayItemIcon({ type }: { type: TourDayItem["type"] }) {
  if (type === "highlight") return <MapPinned size={15} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />;
  if (type === "hotel")     return <Hotel     size={15} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />;
  if (type === "transport") return <Bus       size={15} className="text-foreground shrink-0 mt-0.5" aria-hidden="true" />;
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

type DetailTab = "overview" | "itinerary" | "highlights" | "included" | "excluded";

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function TourDetailPage({ tour, onBack, onBook, backLabel = "Back to all tours" }: TourDetailPageProps) {

  // Photos modal
  const [photosOpen, setPhotosOpen] = useState(false);


  // Booking widget state — lives in the sidebar (desktop) and bottom sheet (mobile)
  // openPanel controls which dropdown is visible at any time (only one at once)
  type BookingPanel = "date" | "guests" | "hotel" | null;
  const [openPanel, setOpenPanel]             = useState<BookingPanel>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | undefined>(undefined);
  const [adults, setAdults]                   = useState(tour.adults);
  const [children, setChildren]               = useState(0);
  const [hotelPreference, setHotelPreference] = useState("Standard");

  // Mobile bottom sheet — controls whether the booking fields are visible
  // on small screens. When closed, only the price + CTA show.
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

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

  // Detail tabs — top-level tab bar with sliding indicator (matches Discovery page)
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [hoveredTab, setHoveredTab] = useState<DetailTab | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key in DetailTab]?: HTMLButtonElement | null }>({});
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  // Update the sliding underline position whenever the active or hovered tab changes
  useEffect(() => {
    const target = hoveredTab ?? activeTab;
    const el = tabRefs.current[target];
    const bar = tabBarRef.current;
    if (el && bar) {
      setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab, hoveredTab]);

  const currency = sym(tour.price.currency);
  const totalPrice = tour.price.perPerson * adults;

  // Use the tour's real images (mainImage + gallery) instead of random picsum seeds.
  // This way each tour shows photos actually relevant to its destination.
  const slug = tour.tourId;
  const galleryImages = [
    tour.mainImage,
    ...tour.gallery,
  ].slice(0, 5);
  // Pad to 5 if needed (shouldn't happen with our data, but just in case)
  while (galleryImages.length < 5) {
    galleryImages.push(`https://picsum.photos/seed/${slug}-${galleryImages.length}/800/600`);
  }

  // Collect all day photos for the "All photos" modal — gives a rich, relevant gallery
  const dayImages = tour.days
    .filter((d) => d.image)
    .map((d) => d.image as string);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-grey-lightest"
      style={{ fontFamily: "'Mulish', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;900&display=swap');`}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          TOP WHITE CARD — back button + photo grid + tour title/facts
          Same structure as PackageDetailPage's main info card.
          The booking widget is NOT here — it lives in the right sidebar below.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-card">
        <div className="max-w-[1280px] mx-auto">

          {/* Back button */}
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-5">
            <BackButton label={backLabel} onClick={onBack} />
          </div>

          {/* ── Photo grid — 402px, 3fr / 2fr, same as PackageDetailPage ── */}
          <div className="relative mx-4 sm:mx-6 md:mx-10">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] grid-rows-1 h-[200px] sm:h-[240px] md:h-[402px] gap-2">

              {/* Main hero — auto-playing looping video if available, otherwise static image.
                  The video is muted (required by browsers for autoplay) and loops endlessly
                  to create an immersive first impression when you land on the page.
                  Video elements have intrinsic dimensions that can override grid sizing,
                  so we use absolute positioning inside a sized container to guarantee
                  the hero never exceeds the grid's fixed height. */}
              <div className="relative overflow-hidden rounded-xl">
                {tour.videoUrl ? (
                  <video
                    src={tour.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={galleryImages[0]}
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-label={`Tour video for ${tour.title}`}
                  />
                ) : (
                  <img
                    src={galleryImages[0]}
                    alt={tour.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Subtle gradient at the bottom so the video blends nicely */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* 2×2 thumbnail grid — desktop only, clicking opens the modal */}
              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {galleryImages.slice(1, 5).map((url, i) => (
                  <div
                    key={url}
                    className="overflow-hidden rounded-xl cursor-pointer group"
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
              className="absolute bottom-4 right-4 bg-white border border-primary text-primary text-sm font-semibold px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-primary hover:text-white transition-colors shadow-sm"
            >
              ⊞ See all photos
            </button>
          </div>

          {/* ── Tour title + quick facts — full width, no widget ── */}
          <div className="px-4 sm:px-6 md:px-10 pt-8 pb-5 md:pb-8 flex flex-col gap-4">

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
              {tour.title}
            </h1>

            {/* Duration + locations — same row style as PackageDetailPage */}
            <div className="flex items-center gap-4 text-base text-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>{tour.duration} days</span>
              </div>
              <span className="text-border hidden md:block">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>{tour.locationsLabel}</span>
              </div>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                <MapPinned size={14} aria-hidden="true" />
                Show on map
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE BODY — two-column grid, same as PackageDetailPage body
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

          {/* ╔═══════════════════════════════════════════════════════════════
              LEFT COLUMN — tabbed content area
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="flex flex-col min-w-0">

            {/* ── Tab bar — Discovery page style with sliding underline ──── */}
            <div
              ref={tabBarRef}
              className="relative border-b border-border mb-5 md:mb-8 flex gap-0 overflow-x-auto"
            >
              {(["overview", "itinerary", "highlights", "included", "excluded"] as DetailTab[]).map((tab) => {
                const labels: Record<DetailTab, string> = {
                  overview:   "Overview",
                  itinerary:  "Itinerary",
                  highlights: "Highlights",
                  included:   "Included",
                  excluded:   "Excluded",
                };
                return (
                  <button
                    key={tab}
                    ref={(el) => { tabRefs.current[tab] = el; }}
                    onClick={() => setActiveTab(tab)}
                    onMouseEnter={() => setHoveredTab(tab)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={cn(
                      "shrink-0 px-5 py-3 text-base font-bold whitespace-nowrap",
                      activeTab === tab ? "text-primary" : "text-foreground"
                    )}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
              {/* Sliding blue underline — animates between tabs */}
              <div
                className="absolute bottom-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ left: tabIndicator.left, width: tabIndicator.width }}
              />
            </div>

            {/* ── Tab content panels ─────────────────────────────────────── */}

            {/* Overview — quick facts, tour route with stops + map */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">

                {/* Quick facts — horizontal card row matching the screenshot design:
                    icon + title label on top, bold value below, vertical dividers between */}
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                    {tour.attributes.map((attr) => (
                      <div key={attr.title} className="flex flex-col gap-2 px-4 first:pl-0 last:pr-0 py-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <AttributeIcon iconKey={attr.iconKey} size={16} />
                          <span className="text-sm">{attr.title}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tour route — stops list on the left, map on the right */}
                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">

                    {/* Map — takes up 2/3 of the card.
                        "relative z-0" creates a stacking context so Leaflet's
                        internal z-indices (400–800) don't overlap the mobile footer. */}
                    <div className="h-[280px] md:h-auto md:min-h-[320px] relative z-0">
                      <TourRouteMapInline stops={tour.stops} />
                    </div>

                    {/* Stops list */}
                    <div className="p-5 md:border-l border-border">
                      <p className="text-base font-bold text-foreground mb-4">Tour stops</p>
                      <div className="flex flex-col gap-3">
                        {tour.stops.map((stop, i) => (
                          <div key={stop.destinationName} className="flex items-center gap-3">
                            <span className="bg-primary/10 text-primary text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{stop.destinationName}</p>
                              <p className="text-xs text-muted-foreground">
                                {stop.nights} {stop.nights === 1 ? "night" : "nights"} · {stop.dateRange}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* Itinerary — day-by-day accordion */}
            {activeTab === "itinerary" && (
              <DayByDaySection days={tour.days} slug={slug} />
            )}

            {/* Highlights */}
            {activeTab === "highlights" && (
              <div className="bg-card rounded-xl shadow-sm p-5">
                <InfoList title="Tour highlights" items={tour.highlights} variant="highlight" />
              </div>
            )}

            {/* Included */}
            {activeTab === "included" && (
              <div className="bg-card rounded-xl shadow-sm p-5">
                <InfoList title="What's included" items={tour.included} variant="check" />
              </div>
            )}

            {/* Excluded */}
            {activeTab === "excluded" && (
              <div className="bg-card rounded-xl shadow-sm p-5">
                <InfoList title="Not included" items={tour.excluded} variant="cross" />
              </div>
            )}

          </div>
          {/* ╚═══════════════════════ END LEFT COLUMN ════════════════════╝ */}

          {/* ╔═══════════════════════════════════════════════════════════════
              RIGHT COLUMN — STICKY BOOKING WIDGET SIDEBAR
              Identical container to the rate calendar sidebar in PackageDetailPage:
                bg-card, border border-border, rounded-xl,
                shadow-md, overflow-hidden
              Sits at sticky top-[64px], hidden on mobile (has footer instead).
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="hidden lg:block sticky top-[64px] pt-2">
            <div className="bg-card border border-border rounded-xl shadow-md">

              {/* ── Price summary ── */}
              <div className="px-5 pt-5 pb-5 border-b border-border">
                <div className="flex flex-col items-end text-right">
                  {/* Small grey label: per-person rate + tour length */}
                  <span className="text-grey text-xs">{currency}{tour.price.perPerson.toLocaleString()} per person · {tour.duration}-day guided tour</span>
                  {/* Big bold total — same as hotel page */}
                  <span className="text-foreground font-bold text-2xl">Total for {adults} {adults === 1 ? "adult" : "adults"}: {currency}{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* ── Booking fields ── */}
              {/* All three fields follow the same pattern as PackageSearchForm:
                  a clickable field div that toggles a panel, with bg-card
                  as the default background (not grey) */}
              <div ref={bookingRef} className="p-5 flex flex-col gap-3">

                <p className="text-xs font-bold text-grey uppercase tracking-wide mb-1">
                  Customise your trip
                </p>

                {/* ── Travel date — DayPicker panel (same as PackageSearchForm) ── */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
                    className={cn(
                      "h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "date"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    <Calendar size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        Travel date
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {travelDate}
                      </span>
                    </div>
                    <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "date" && "rotate-180")} aria-hidden="true" />
                  </button>

                  {/* DayPicker panel — same style as PackageSearchForm / HotelDetailPage */}
                  {openPanel === "date" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-lg border border-border p-4 animate-in fade-in zoom-in-95 duration-150">
                      <style>{`.rdp-root { --rdp-accent-color: hsl(var(--primary)); --rdp-accent-background-color: hsl(var(--primary) / 0.10); --rdp-day_button-border-radius: 6px; margin: 0; }`}</style>
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
                    className={cn(
                      "h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "guests"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        Travellers
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {adults} Adult{adults !== 1 ? "s" : ""}
                        {children > 0 ? ` · ${children} Child${children !== 1 ? "ren" : ""}` : ""}
                      </span>
                    </div>
                    <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "guests" && "rotate-180")} aria-hidden="true" />
                  </button>

                  {/* Guest counter panel — same layout as PackageSearchForm */}
                  {openPanel === "guests" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-card rounded-xl shadow-lg border border-border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { label: "Adults",   sub: "Age 12+",  value: adults,   min: 1, set: setAdults   },
                        { label: "Children", sub: "Age 2–11", value: children, min: 0, set: setChildren },
                      ].map(({ label, sub, value, min, set }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-foreground">{label}</div>
                            <div className="text-xs text-grey">{sub}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => set(Math.max(min, value - 1))}
                              disabled={value <= min}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                              aria-hidden="true"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-base font-bold text-foreground w-4 text-center">{value}</span>
                            <button
                              onClick={() => set(Math.min(9, value + 1))}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                              aria-hidden="true"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setOpenPanel(null)}
                        className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-colors"
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
                    className={cn(
                      "h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "hotel"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    <Hotel size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        Hotel preference
                      </span>
                      <span className="text-xs font-semibold text-foreground">{hotelPreference}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "hotel" && "rotate-180")} aria-hidden="true" />
                  </button>
                  {openPanel === "hotel" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-sm shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {["Standard", "Superior", "Deluxe", "Luxury"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setHotelPreference(opt); setOpenPanel(null); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors flex items-center justify-between",
                            hotelPreference === opt ? "text-primary bg-primary/10" : "text-foreground"
                          )}
                        >
                          {opt}
                          {hotelPreference === opt && <Check size={14} className="text-primary" aria-hidden="true" />}
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
                  className="w-full bg-primary hover:brightness-85 text-white font-bold text-base py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Start planning
                </button>
              </div>

            </div>
          </div>
          {/* ╚═══════════════════════ END RIGHT COLUMN ═══════════════════╝ */}

        </div>
      </div>

      {/* Spacer so the mobile footer doesn't overlap last content.
          28 = collapsed footer height (price row + CTA button + padding) */}
      <div className="lg:hidden h-28" />

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM SHEET — two states:
            • Collapsed: price summary + "Customise" link + CTA (same as before)
            • Expanded:  slides up to reveal the 3 booking fields, then CTA

          Uses a semi-transparent backdrop when expanded so the user knows
          they're in a modal-like context.  Tapping the backdrop closes it.
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Backdrop — only visible when the sheet is expanded */}
      {mobileSheetOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/30 z-40 animate-in fade-in duration-200"
          onClick={() => { setMobileSheetOpen(false); setOpenPanel(null); }}
          aria-hidden="true"
        />
      )}

      <div
        ref={mobileSheetRef}
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg transition-all duration-300 ease-out",
          // Rounded top corners when expanded to look like a sheet
          mobileSheetOpen ? "rounded-t-2xl" : ""
        )}
      >

        {/* ── Collapsed bar — always visible ── */}
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            {/* Small grey label */}
            <span className="text-grey text-xs">
              {currency}{tour.price.perPerson.toLocaleString()} per person
            </span>
            {/* Bold total */}
            <span className="text-foreground font-bold text-base">
              Total for {adults} {adults === 1 ? "adult" : "adults"}: {currency}{totalPrice.toLocaleString()}
            </span>
          </div>

          {/* Collapsed: primary "Customise" CTA (matches original footer layout) */}
          {!mobileSheetOpen && (
            <button
              onClick={() => setMobileSheetOpen(true)}
              className="flex items-center gap-2 bg-primary hover:brightness-85 text-white font-bold text-sm px-5 py-3 rounded-lg transition-colors shrink-0"
              aria-expanded={false}
              aria-label="Customise booking options"
            >
              Customise
            </button>
          )}

          {/* Expanded: secondary "Close" link (top-right, subtle) */}
          {mobileSheetOpen && (
            <button
              onClick={() => { setMobileSheetOpen(false); setOpenPanel(null); }}
              className="flex items-center gap-1 text-primary text-sm font-semibold shrink-0"
              aria-expanded={true}
              aria-label="Close booking options"
            >
              Close <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ── Expanded content — booking fields + CTA, visible when sheet is open ── */}
        {mobileSheetOpen && (<>
          <div className="px-5 pb-2 flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200">

            <p className="text-xs font-bold text-grey uppercase tracking-wide">
              Customise your trip
            </p>

            {/* ── Travel date ── */}
            <div className="relative">
              <button
                onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
                className={cn(
                  "h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left",
                  openPanel === "date"
                    ? "border-primary ring-2 ring-primary/20 bg-card"
                    : "border-border bg-card hover:border-primary"
                )}
              >
                <Calendar size={16} className="text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Travel date</span>
                  <span className="text-xs font-semibold text-foreground truncate">{travelDate}</span>
                </div>
                <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "date" && "rotate-180")} aria-hidden="true" />
              </button>

              {/* DayPicker — positioned above the field on mobile so it doesn't get cut off */}
              {openPanel === "date" && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-lg border border-border p-4 animate-in fade-in zoom-in-95 duration-150">
                  <style>{`.rdp-root { --rdp-accent-color: hsl(var(--primary)); --rdp-accent-background-color: hsl(var(--primary) / 0.10); --rdp-day_button-border-radius: 6px; margin: 0; }`}</style>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setSelectedDate(date);
                      setOpenPanel(null);
                    }}
                    disabled={{ before: new Date() }}
                    numberOfMonths={1}
                  />
                </div>
              )}
            </div>

            {/* ── Travellers ── */}
            <div className="relative">
              <button
                onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
                className={cn(
                  "h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left",
                  openPanel === "guests"
                    ? "border-primary ring-2 ring-primary/20 bg-card"
                    : "border-border bg-card hover:border-primary"
                )}
              >
                <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Travellers</span>
                  <span className="text-xs font-semibold text-foreground">
                    {adults} Adult{adults !== 1 ? "s" : ""}
                    {children > 0 ? ` · ${children} Child${children !== 1 ? "ren" : ""}` : ""}
                  </span>
                </div>
                <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "guests" && "rotate-180")} aria-hidden="true" />
              </button>

              {/* Guest counter — opens upward on mobile */}
              {openPanel === "guests" && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-card rounded-xl shadow-lg border border-border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { label: "Adults",   sub: "Age 12+",  value: adults,   min: 1, set: setAdults   },
                    { label: "Children", sub: "Age 2–11", value: children, min: 0, set: setChildren },
                  ].map(({ label, sub, value, min, set }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{label}</div>
                        <div className="text-xs text-grey">{sub}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => set(Math.max(min, value - 1))}
                          disabled={value <= min}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-base font-bold text-foreground w-4 text-center">{value}</span>
                        <button
                          onClick={() => set(Math.min(9, value + 1))}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setOpenPanel(null)}
                    className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* ── Hotel preference ── */}
            <div className="relative">
              <button
                onClick={() => setOpenPanel(openPanel === "hotel" ? null : "hotel")}
                className={cn(
                  "h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left",
                  openPanel === "hotel"
                    ? "border-primary ring-2 ring-primary/20 bg-card"
                    : "border-border bg-card hover:border-primary"
                )}
              >
                <Hotel size={16} className="text-primary shrink-0" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Hotel preference</span>
                  <span className="text-xs font-semibold text-foreground">{hotelPreference}</span>
                </div>
                <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "hotel" && "rotate-180")} aria-hidden="true" />
              </button>

              {/* Hotel options — opens upward on mobile */}
              {openPanel === "hotel" && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-sm shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {["Standard", "Superior", "Deluxe", "Luxury"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setHotelPreference(opt); setOpenPanel(null); }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors flex items-center justify-between",
                        hotelPreference === opt ? "text-primary bg-primary/10" : "text-foreground"
                      )}
                    >
                      {opt}
                      {hotelPreference === opt && <Check size={14} className="text-primary" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Primary CTA at the bottom of the expanded sheet ── */}
          <div className="px-5 pb-4 pt-2">
            <button
              onClick={() => onBook(tour, travelDate, adults, hotelPreference)}
              className="w-full bg-primary hover:brightness-85 text-white font-bold text-sm py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Start planning
            </button>
          </div>
        </>)}

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
            {/* Extra gallery images — 2-col grid, sourced from day photos + gallery */}
            {[...dayImages, ...galleryImages.slice(1)].filter(
              // Remove duplicates and the hero image (already shown above)
              (url, i, arr) => arr.indexOf(url) === i && url !== galleryImages[0]
            ).map((url, i) => (
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
// TourRouteMap — interactive map showing numbered day pins connected by a route
// ─────────────────────────────────────────────────────────────────────────────

// Creates a circular numbered pin (e.g. "1", "2") for each stop on the map.
// Blue circle with white number — visually ties back to the day pills.
function createDayPinIcon(dayNumber: number) {
  const html = `
    <div style="
      width: 28px; height: 28px;
      background: #2681FF;
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      font-size: 12px;
      font-weight: 700;
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    ">${dayNumber}</div>
  `;
  return L.divIcon({ html, className: "", iconSize: [28, 28], iconAnchor: [14, 14] });
}

// Fits the map to the stop bounds once on mount
function MapFitter({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || positions.length === 0) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    fitted.current = true;
  }, [positions, map]);
  return null;
}

function TourRouteMap({ stops }: { stops: TourStop[] }) {
  // Only use stops that have coordinates
  const stopsWithCoords = stops.filter(
    (s): s is TourStop & { lat: number; lng: number } =>
      s.lat != null && s.lng != null
  );

  if (stopsWithCoords.length === 0) return null;

  // Build the route line coordinates — in stop order
  const routePositions: [number, number][] = stopsWithCoords.map((s) => [s.lat, s.lng]);

  // Fallback center from the first stop
  const center: [number, number] = [stopsWithCoords[0].lat, stopsWithCoords[0].lng];

  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">Tour route</h3>
      <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
        <div className="h-[300px]">
          <MapContainer
            center={center}
            zoom={6}
            className="w-full h-full"
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapFitter positions={routePositions} />

            {/* Route line connecting all stops in order */}
            <Polyline
              positions={routePositions}
              pathOptions={{ color: "#2681FF", weight: 3, opacity: 0.7, dashArray: "8 6" }}
            />

            {/* Numbered day pins for each stop */}
            {stopsWithCoords.map((stop, i) => (
              <Marker
                key={stop.destinationName}
                position={[stop.lat, stop.lng]}
                icon={createDayPinIcon(i + 1)}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold text-foreground">{stop.destinationName}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {stop.nights} {stop.nights === 1 ? "night" : "nights"} · {stop.dateRange}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

// Inline variant — no heading or card wrapper, fills its parent container.
// Used inside the combined stops + map card on the Overview tab.
function TourRouteMapInline({ stops }: { stops: TourStop[] }) {
  const stopsWithCoords = stops.filter(
    (s): s is TourStop & { lat: number; lng: number } =>
      s.lat != null && s.lng != null
  );

  if (stopsWithCoords.length === 0) return null;

  const routePositions: [number, number][] = stopsWithCoords.map((s) => [s.lat, s.lng]);
  const center: [number, number] = [stopsWithCoords[0].lat, stopsWithCoords[0].lng];

  return (
    <MapContainer
      center={center}
      zoom={6}
      className="w-full h-full"
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapFitter positions={routePositions} />
      <Polyline
        positions={routePositions}
        pathOptions={{ color: "#2681FF", weight: 3, opacity: 0.7, dashArray: "8 6" }}
      />
      {stopsWithCoords.map((stop, i) => (
        <Marker
          key={stop.destinationName}
          position={[stop.lat, stop.lng]}
          icon={createDayPinIcon(i + 1)}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-bold text-foreground">{stop.destinationName}</div>
              <div className="text-muted-foreground text-xs mt-0.5">
                {stop.nights} {stop.nights === 1 ? "night" : "nights"} · {stop.dateRange}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DayByDaySection — manages which day is active (only one at a time)
// ─────────────────────────────────────────────────────────────────────────────

function DayByDaySection({ days, slug }: { days: TourDay[]; slug: string }) {
  // Only one day can be active/expanded at a time — default to day 1
  const [activeDayNumber, setActiveDayNumber] = useState(1);

  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">
        Day by day adventures
      </h3>
      <div className="flex flex-col gap-3">
        {days.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            slug={slug}
            isActive={day.dayNumber === activeDayNumber}
            onSelect={() => setActiveDayNumber(day.dayNumber)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DayCard — single day row; only the active day shows expanded content
// ─────────────────────────────────────────────────────────────────────────────

function DayCard({
  day,
  slug,
  isActive,
  onSelect,
}: {
  day: TourDay;
  slug: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const dayImage = day.image ?? `https://picsum.photos/seed/${slug}-day${day.dayNumber}/400/280`;

  return (
    <div className={cn(
      "bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow",
      // Active day gets a solid blue border all around
      isActive ? "border border-primary" : ""
    )}>

      {/* Header row — day pill, title, location */}
      <button
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
        onClick={onSelect}
      >
        {/* Day pill — light blue fill, matches holiday list card chips */}
        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap capitalize">
          Day {day.dayNumber}
        </span>
        {/* Day title — bold when active, medium weight when collapsed */}
        <span className={cn(
          "flex-1 text-sm text-foreground",
          isActive ? "font-bold" : "font-medium"
        )}>
          {day.title}
        </span>
        {/* Location — right-aligned */}
        {day.location && (
          <span className="text-xs text-muted-foreground shrink-0">
            {day.location}
          </span>
        )}
      </button>

      {/* Expanded content — only shown for the active day, no divider */}
      {isActive && (
        <div className="flex flex-col md:flex-row">

          {/* Day photo on the left */}
          <div className="md:w-[200px] shrink-0 p-4 md:pr-0">
            <div className="rounded-xl overflow-hidden h-[140px] md:h-full">
              <img
                src={dayImage}
                alt={`Day ${day.dayNumber}: ${day.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Items list on the right */}
          <div className="flex-1 px-5 py-4 flex flex-col gap-3">
            {day.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <DayItemIcon type={item.type} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-foreground mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
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
      <p className="text-base font-bold text-foreground">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              variant === "cross" ? "bg-red-50" : "bg-success/10"
            )}>
              {variant === "cross"
                ? <span className="text-red-400 text-xs font-bold leading-none">✕</span>
                : <Check size={11} className="text-success" aria-hidden="true" />
              }
            </div>
            <p className="text-sm text-foreground leading-normal">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
