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

import React, { useState, useRef, useEffect } from "react";
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
  Play,
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

function AttributeIcon({ iconKey }: { iconKey: TourAttribute["iconKey"] }) {
  const cls = "text-foreground shrink-0";
  if (iconKey === "users")          return <Users size={15} className={cls} aria-hidden="true" />;
  if (iconKey === "languages")      return <Languages size={15} className={cls} aria-hidden="true" />;
  if (iconKey === "activity")       return <Activity size={15} className={cls} aria-hidden="true" />;
  if (iconKey === "calendar-check") return <CalendarCheck size={15} className={cls} aria-hidden="true" />;
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

type InfoTab = "overview" | "highlights" | "included" | "excluded";

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
  const [activeTab, setActiveTab] = useState<InfoTab>("overview");

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
      className="min-h-screen bg-grey-lightest"
      style={{ fontFamily: "'Mulish', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;900&display=swap');`}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          Back button — full-width white background
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-card">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 pt-5 pb-5">
          <BackButton label={backLabel} onClick={onBack} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN GRID — spans from gallery (white bg) through content (grey bg).
          The white background is a full-width band behind the gallery/title
          using a wrapper with relative positioning + a bg-card pseudo-element.
          The booking widget starts next to the gallery and sticks as you scroll.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative">
        {/* Full-width white background band — covers only the gallery+title height.
            The ref measures the gallery area and sets the height dynamically,
            but a simpler approach: use a fixed-height white band behind the top. */}
        <div className="absolute inset-x-0 top-0 h-[540px] bg-card" aria-hidden="true" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col min-w-0">

            {/* Gallery */}
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] h-[200px] sm:h-[240px] md:h-[402px] gap-2">
                <div className="relative overflow-hidden rounded-xl group cursor-pointer">
                  <img src={galleryImages[0]} alt={tour.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Play size={20} className="text-[#1a1a1a] ml-1" fill="#1a1a1a" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="hidden md:grid grid-rows-2 gap-2">
                  {galleryImages.slice(1, 3).map((url, i) => (
                    <div key={url} className="overflow-hidden rounded-xl cursor-pointer group" onClick={() => setPhotosOpen(true)}>
                      <img src={url} alt={`Tour photo ${i + 2}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setPhotosOpen(true)} className="absolute bottom-4 right-4 bg-white border border-primary text-primary text-sm font-semibold px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-primary hover:text-white transition-colors shadow-sm">
                ⊞ See all photos
              </button>
            </div>

            {/* Title + details */}
            <div className="pt-8 pb-4 flex flex-col gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">{tour.title}</h1>
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

            {/* Quick facts */}
            <div className="mt-5">
              <h3 className="text-xl font-bold text-foreground mb-4">Quick facts</h3>
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-border">
                  {(["overview", "highlights", "included", "excluded"] as InfoTab[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const config: Record<InfoTab, { label: string; icon: React.ReactNode }> = {
                      overview:   { label: "Overview",   icon: <Info     size={15} aria-hidden="true" /> },
                      highlights: { label: "Highlights", icon: <Sparkles size={15} aria-hidden="true" /> },
                      included:   { label: "Included",   icon: <Check    size={15} aria-hidden="true" /> },
                      excluded:   { label: "Excluded",   icon: <Info     size={15} aria-hidden="true" /> },
                    };
                    const { label, icon } = config[tab];
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors",
                          isActive ? "border-primary text-primary" : "border-transparent text-grey hover:text-foreground"
                        )}
                      >
                        {icon}
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="p-5">
                  {activeTab === "overview" && (
                    <div className="flex flex-col gap-4">
                      <p className="text-base font-bold text-foreground">Tour details</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        {tour.attributes.map((attr) => (
                          <div key={attr.label} className="flex items-center gap-3">
                            <AttributeIcon iconKey={attr.iconKey} />
                            <span className="text-sm text-foreground">{attr.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === "highlights" && <InfoList title="Tour highlights" items={tour.highlights} variant="highlight" />}
                  {activeTab === "included" && <InfoList title="What's included" items={tour.included} variant="check" />}
                  {activeTab === "excluded" && <InfoList title="Not included" items={tour.excluded} variant="cross" />}
                </div>
              </div>
            </div>

            {/* Day-by-day */}
            <div className="mt-6">
              <DayByDaySection days={tour.days} slug={slug} />
            </div>

            {/* Tour route map */}
            <div className="mt-6">
              <TourRouteMap stops={tour.stops} />
            </div>

          </div>

          {/* ── Right column: sticky booking widget ── */}
          <div className="hidden lg:block sticky top-[56px]">
            <div className="bg-card border border-border rounded-xl shadow-md">

              <div className="px-5 pt-5 pb-5 border-b border-border">
                <div className="flex flex-col items-end text-right">
                  <span className="text-grey text-xs">{currency}{tour.price.perPerson.toLocaleString()} per person · {tour.duration}-day guided tour</span>
                  <span className="text-foreground font-bold text-2xl">Total for {adults} {adults === 1 ? "adult" : "adults"}: {currency}{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div ref={bookingRef} className="p-5 flex flex-col gap-3">
                <p className="text-xs font-bold text-grey uppercase tracking-wide mb-1">Customise your trip</p>

                {/* Travel date */}
                <div className="relative">
                  <button onClick={() => setOpenPanel(openPanel === "date" ? null : "date")} className={cn("h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left", openPanel === "date" ? "border-primary ring-2 ring-primary/20 bg-card" : "border-border bg-card hover:border-primary")}>
                    <Calendar size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Travel date</span>
                      <span className="text-xs font-semibold text-foreground truncate">{travelDate}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "date" && "rotate-180")} aria-hidden="true" />
                  </button>
                  {openPanel === "date" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-lg border border-border p-4 animate-in fade-in zoom-in-95 duration-150">
                      <style>{`.rdp-root { --rdp-accent-color: hsl(var(--primary)); --rdp-accent-background-color: hsl(var(--primary) / 0.10); --rdp-day_button-border-radius: 6px; margin: 0; }`}</style>
                      <DayPicker mode="single" selected={selectedDate} onSelect={(date) => { if (!date) return; setSelectedDate(date); setOpenPanel(null); }} disabled={{ before: new Date() }} numberOfMonths={1} />
                    </div>
                  )}
                </div>

                {/* Travellers */}
                <div className="relative">
                  <button onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")} className={cn("h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left", openPanel === "guests" ? "border-primary ring-2 ring-primary/20 bg-card" : "border-border bg-card hover:border-primary")}>
                    <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Travellers</span>
                      <span className="text-xs font-semibold text-foreground">{adults} Adult{adults !== 1 ? "s" : ""}{children > 0 ? ` · ${children} Child${children !== 1 ? "ren" : ""}` : ""}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "guests" && "rotate-180")} aria-hidden="true" />
                  </button>
                  {openPanel === "guests" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-card rounded-xl shadow-lg border border-border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { label: "Adults", sub: "Age 12+", value: adults, min: 1, set: setAdults },
                        { label: "Children", sub: "Age 2–11", value: children, min: 0, set: setChildren },
                      ].map(({ label, sub, value, min, set }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-foreground">{label}</div>
                            <div className="text-xs text-grey">{sub}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30" aria-hidden="true"><Minus size={14} /></button>
                            <span className="text-base font-bold text-foreground w-4 text-center">{value}</span>
                            <button onClick={() => set(Math.min(9, value + 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors" aria-hidden="true"><Plus size={14} /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setOpenPanel(null)} className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-colors">Done</button>
                    </div>
                  )}
                </div>

                {/* Hotel preference */}
                <div className="relative">
                  <button onClick={() => setOpenPanel(openPanel === "hotel" ? null : "hotel")} className={cn("h-[48px] rounded-sm border px-4 flex items-center gap-3 transition-colors w-full text-left", openPanel === "hotel" ? "border-primary ring-2 ring-primary/20 bg-card" : "border-border bg-card hover:border-primary")}>
                    <Hotel size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Hotel preference</span>
                      <span className="text-xs font-semibold text-foreground">{hotelPreference}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "hotel" && "rotate-180")} aria-hidden="true" />
                  </button>
                  {openPanel === "hotel" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-sm shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {["Standard", "Superior", "Deluxe", "Luxury"].map((opt) => (
                        <button key={opt} onClick={() => { setHotelPreference(opt); setOpenPanel(null); }} className={cn("w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors flex items-center justify-between", hotelPreference === opt ? "text-primary bg-primary/10" : "text-foreground")}>
                          {opt}
                          {hotelPreference === opt && <Check size={14} className="text-primary" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5">
                <button onClick={() => onBook(tour, travelDate, adults, hotelPreference)} className="w-full bg-primary hover:brightness-85 text-white font-bold text-base py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  Start planning
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
      </div>

      {/* Spacer so the mobile footer doesn't overlap last content */}
      <div className="lg:hidden h-20" />

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE STICKY FOOTER — price left, CTA right
          Same pattern as PackageDetailPage mobile footer.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-5 py-3 z-50 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col">
          {/* Small grey label — same as hotel mobile footer */}
          <span className="text-grey text-xs">{currency}{tour.price.perPerson.toLocaleString()} per person</span>
          {/* Bold total */}
          <span className="text-foreground font-bold text-base">Total for {adults} {adults === 1 ? "adult" : "adults"}: {currency}{totalPrice.toLocaleString()}</span>
        </div>
        <button
          onClick={() => onBook(tour, travelDate, adults, hotelPreference)}
          className="flex items-center gap-2 bg-primary hover:brightness-85 text-white font-bold text-sm px-5 py-3 rounded-lg transition-colors"
        >
          Start planning
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
