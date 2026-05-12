// ─────────────────────────────────────────────────────────────────────────────
// CruiseDetailPage
//
// Single-page layout with sticky tabs — same visual structure as
// TourDetailPage / ActivityDetailPage, adapted for cruises.
//
// Sticky-tab sections:
//   1. Overview   — Attribute pills (line, ship, port, region, duration)
//   2. Itinerary  — Ports of call with day numbers, times, descriptions, and
//                   an inline Leaflet map of the route. Sea days get a
//                   special wave-pattern row.
//   3. Cabins     — Grid of cabin category cards (Interior / Ocean View /
//                   Balcony / Suite). Cheapest cabin shows a "Best value" badge.
//   4. Ship       — Ship amenities grid + (optional) ship photo.
//   5. Included   — Included + excluded lists.
//
// Booking widget (desktop sidebar + mobile bottom sheet):
//   • Departure date — calendar picker constrained to available dates
//   • Passengers     — counter
//   • Cabin type     — dropdown from cabinTypes[]
//   • CTA            — "Book this cruise" → onBook()
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  Moon,
  Calendar,
  Users,
  Check,
  MapPinned,
  Ship,
  Anchor,
  ChevronDown,
  Plus,
  Minus,
  X,
  LayoutGrid,
  Star,
  Globe,
  Waves,
  Sparkles,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import "react-day-picker/dist/style.css";
import { BackButton } from "../../../shared/components/BackButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { cn } from "../../../shared/components/ui/utils";
import type {
  Cruise,
  CruiseCabin,
  CruisePort,
  TourStop,
} from "../../../types";
import { InfoList } from "../components/InfoList";
import { TourRouteMapInline } from "../components/TourRouteMap";
import { ImageWithPlaceholder } from "../../../shared/components/loading";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sym(currency: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", CHF: "CHF " };
  return map[currency] ?? currency + " ";
}

// Deep ocean blue — cruise accent. Used sparingly on cruise-specific elements
// (route map polyline, "Best value" badge) so cruises feel distinct without
// overriding the design system's primary colour.
const CRUISE_ACCENT = "#0e4d92";

// ── Section IDs ──────────────────────────────────────────────────────────────
type SectionId =
  | "overview"
  | "itinerary"
  | "cabins"
  | "ship"
  | "included";

const SECTION_LABELS: Record<SectionId, string> = {
  overview:   "Overview",
  itinerary:  "Itinerary",
  cabins:     "Cabins",
  ship:       "Ship",
  included:   "What's included",
};

// ── Props ────────────────────────────────────────────────────────────────────
interface CruiseDetailPageProps {
  cruise: Cruise;
  onBack: () => void;
  onBook: (
    cruise: Cruise,
    departureDate: string,
    passengers: number,
    cabinId: string,
  ) => void;
  backLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CruiseDetailPage({
  cruise,
  onBack,
  onBook,
  backLabel = "Back to all cruises",
}: CruiseDetailPageProps) {
  // Photos modal
  const [photosOpen, setPhotosOpen] = useState(false);

  // ── Booking widget state ────────────────────────────────────────────────
  type BookingPanel = "date" | "guests" | "cabin" | null;
  const [openPanel, setOpenPanel] = useState<BookingPanel>(null);

  // Default the selected date to the first available departure (parsed as a
  // real Date so the DayPicker can highlight it).
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    cruise.departures[0]?.date ? parseISO(cruise.departures[0].date) : undefined,
  );
  const [passengers, setPassengers] = useState(2);
  const [selectedCabinId, setSelectedCabinId] = useState<string>(
    cruise.cabinTypes[0]?.id ?? "",
  );

  // Mobile bottom sheet
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Click-outside on booking dropdowns
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

  // Pre-compute lookups
  const selectedCabin = cruise.cabinTypes.find((c) => c.id === selectedCabinId);
  const cheapestCabin = useMemo(
    () =>
      [...cruise.cabinTypes].sort(
        (a, b) => a.pricePerPerson - b.pricePerPerson,
      )[0],
    [cruise.cabinTypes],
  );

  // Display labels
  const dateLabel = selectedDate
    ? format(selectedDate, "MMM d, yyyy")
    : cruise.nextDeparture;
  const bookingDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : cruise.departures[0]?.date ?? "";

  // ── Available-departure date set for the DayPicker ───────────────────────
  // We use this to highlight available dates and disable everything else.
  const availableDates = useMemo(
    () =>
      cruise.departures
        .filter((d) => d.available)
        .map((d) => parseISO(d.date)),
    [cruise.departures],
  );

  // ── Convert CruisePort[] → TourStop[] for the inline route map ──────────
  // The map only needs lat/lng + destinationName, so we fill the rest with
  // sensible defaults. Sea-day entries without coords get filtered by the map.
  const mapStops: TourStop[] = useMemo(() => {
    return cruise.ports.map((p) => ({
      destinationName: p.name,
      dateRange: `Day ${p.day}`,
      nights: 0,
      description: p.description ?? "",
      accommodation: {
        hotelName: cruise.shipName,
        stars: 0,
        checkIn: "—",
        checkOut: "—",
        checkInISO: "",
        checkOutISO: "",
        roomType: "Cabin",
        boardType: "Full board",
      },
      activities: [],
      lat: p.lat,
      lng: p.lng,
    }));
  }, [cruise.ports, cruise.shipName]);

  // ── Sticky tabs — IntersectionObserver-driven ────────────────────────────
  const sectionIds: SectionId[] = ["overview", "itinerary", "cabins", "ship", "included"];

  const [activeSection, setActiveSection] = useState<SectionId>(sectionIds[0]);
  const [hoveredTab, setHoveredTab] = useState<SectionId | null>(null);
  const tabBarRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<{ [key in SectionId]?: HTMLButtonElement | null }>({});
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  const sectionRefs = useRef<{ [k in SectionId]?: HTMLElement | null }>({});

  useEffect(() => {
    const target = hoveredTab ?? activeSection;
    const el = tabRefs.current[target];
    if (el && tabBarRef.current) {
      setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeSection, hoveredTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveSection(topmost.target.id as SectionId);
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 },
    );

    sectionIds.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  // Price & gallery
  const currency = sym(cruise.price.currency);
  const cabinPrice = selectedCabin?.pricePerPerson ?? cruise.price.fromPerPerson;
  const totalPrice = cabinPrice * passengers;
  const slug = cruise.cruiseId;

  // First 5 images for the hero photo grid. Pad with picsum if a cruise has
  // fewer than 5 photos so the grid always renders.
  const galleryImages = [cruise.mainImage, ...cruise.gallery].slice(0, 5);
  while (galleryImages.length < 5) {
    galleryImages.push(`https://picsum.photos/seed/${slug}-${galleryImages.length}/800/600`);
  }

  // Overview attribute pills — keep the same shape as ActivityDetailPage so
  // the visual feels familiar.
  const overviewPills: { icon: React.ReactNode; label: string }[] = [
    { icon: <Ship   size={15} className="text-primary" />, label: cruise.cruiseLine },
    { icon: <Anchor size={15} className="text-primary" />, label: cruise.shipName },
    { icon: <Globe  size={15} className="text-primary" />, label: cruise.region },
    { icon: <MapPin size={15} className="text-primary" />, label: cruise.departurePort },
    { icon: <Moon   size={15} className="text-primary" />, label: `${cruise.durationNights} nights` },
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

      {/* ══════════════════════════════════════════════════════════════════
          TOP CARD — back button + photo grid + title + facts
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-card">
        <div className="max-w-[1280px] mx-auto">

          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-5">
            <BackButton label={backLabel} onClick={onBack} />
          </div>

          {/* Photo grid — same layout as ActivityDetailPage */}
          <div className="relative mx-4 sm:mx-6 md:mx-10">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] grid-rows-1 h-[200px] sm:h-[240px] md:h-[402px] gap-2">

              <div className="relative overflow-hidden rounded-xl">
                <ImageWithPlaceholder
                  src={galleryImages[0]}
                  alt={cruise.title}
                  priority
                  containerClassName="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent pointer-events-none" />
              </div>

              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {galleryImages.slice(1, 5).map((url, i) => (
                  <button
                    key={url}
                    className="overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => setPhotosOpen(true)}
                    aria-label={`View cruise photo ${i + 2}`}
                  >
                    <ImageWithPlaceholder
                      src={url}
                      alt={`Cruise photo ${i + 2}`}
                      containerClassName="w-full h-full"
                      className="group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPhotosOpen(true)}
              className="absolute bottom-4 right-4 bg-card border border-primary text-primary text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary hover:text-white transition-colors shadow-sm"
            >
              <LayoutGrid size={16} aria-hidden="true" /> See all photos
            </button>
          </div>

          {/* Title + quick facts */}
          <div className="px-4 sm:px-6 md:px-10 pt-8 pb-5 md:pb-8 flex flex-col gap-4">

            {/* Cruise-line badge */}
            <span className="self-start flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              <Ship size={14} aria-hidden="true" />
              {cruise.cruiseLine}
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
              {cruise.title}
            </h1>

            <p className="text-base text-muted-foreground leading-snug max-w-[820px]">
              {cruise.subtitle}
            </p>

            <div className="flex items-center gap-4 text-base text-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Moon size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>{cruise.durationNights} nights</span>
              </div>
              <span className="text-border hidden md:block">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>{cruise.departurePort}</span>
              </div>
              <span className="text-border hidden md:block">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>Next: {cruise.nextDeparture}</span>
              </div>
              <span className="text-border hidden md:block">|</span>
              <div className="flex items-center gap-1.5">
                <Anchor size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>{cruise.shipName}</span>
              </div>
              <span className="text-border hidden md:block">|</span>
              <div className="flex items-center gap-1.5">
                <Star
                  size={15}
                  className="text-warning shrink-0"
                  fill="currentColor"
                  aria-hidden="true"
                />
                <span className="font-semibold">{cruise.rating.score.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({cruise.rating.reviewCount.toLocaleString()})
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BODY — sticky tabs + booking sidebar
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

          {/* LEFT — sticky tabs + section content */}
          <div className="flex flex-col min-w-0">

            {/* Sticky section nav */}
            <nav
              ref={tabBarRef}
              aria-label="Cruise sections"
              className="sticky top-[32px] z-30 -mx-3 sm:-mx-4 md:-mx-8 px-3 sm:px-4 md:px-8 bg-grey-lightest mb-8"
            >
              <div
                aria-hidden="true"
                className="absolute -top-8 left-0 right-0 h-8 bg-grey-lightest"
              />
              <div className="relative flex gap-0 overflow-x-auto border-b border-border">
                {sectionIds.map((tab) => (
                  <button
                    key={tab}
                    ref={(el) => { tabRefs.current[tab] = el; }}
                    onClick={() => sectionRefs.current[tab]?.scrollIntoView({ behavior: "smooth" })}
                    onMouseEnter={() => setHoveredTab(tab)}
                    onMouseLeave={() => setHoveredTab(null)}
                    aria-current={activeSection === tab ? "true" : undefined}
                    className={cn(
                      "shrink-0 px-5 py-3 text-base font-bold whitespace-nowrap",
                      activeSection === tab ? "text-primary" : "text-foreground"
                    )}
                  >
                    {SECTION_LABELS[tab]}
                  </button>
                ))}
                <div
                  className="absolute bottom-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ left: tabIndicator.left, width: tabIndicator.width }}
                />
              </div>
            </nav>

            {/* All sections stacked vertically */}
            <div className="flex flex-col gap-12 md:gap-16">

              {/* ── Overview ── */}
              <section
                id="overview"
                ref={(el) => { sectionRefs.current.overview = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Your cruise at a glance
                </h3>

                <div className="bg-card rounded-xl shadow-sm overflow-visible">
                  {/* Attribute pills */}
                  <div className="p-5">
                    <p className="text-sm font-bold text-foreground mb-3">Cruise details</p>
                    <div className="flex flex-wrap gap-2">
                      {overviewPills.map((pill) => (
                        <div
                          key={pill.label}
                          className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2"
                        >
                          {pill.icon}
                          <span className="text-sm text-foreground font-medium">
                            {pill.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights moved into overview as a sub-block */}
                  <div className="border-t border-border mx-5" />
                  <div className="p-5">
                    <InfoList
                      title="Why you'll love this cruise"
                      items={cruise.highlights}
                      variant="highlight"
                    />
                  </div>
                </div>
              </section>

              {/* ── Itinerary ── */}
              <section
                id="itinerary"
                ref={(el) => { sectionRefs.current.itinerary = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">Itinerary</h3>

                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  {/* Route map at the top */}
                  <div className="h-[260px] md:h-[320px] relative z-0 border-b border-border">
                    <TourRouteMapInline stops={mapStops} />
                  </div>

                  {/* Port-of-call list */}
                  <div className="p-5">
                    <PortsTable ports={cruise.ports} />
                  </div>
                </div>
              </section>

              {/* ── Cabins ── */}
              <section
                id="cabins"
                ref={(el) => { sectionRefs.current.cabins = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">Choose your cabin</h3>
                <CabinGrid
                  cabins={cruise.cabinTypes}
                  currency={currency}
                  selectedId={selectedCabinId}
                  cheapestId={cheapestCabin?.id}
                  onSelect={(id) => setSelectedCabinId(id)}
                />
              </section>

              {/* ── Ship ── */}
              <section
                id="ship"
                ref={(el) => { sectionRefs.current.ship = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  About {cruise.shipName}
                </h3>

                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  {cruise.shipImage && (
                    <ImageWithPlaceholder
                      src={cruise.shipImage}
                      alt={cruise.shipName}
                      containerClassName="w-full h-[240px]"
                    />
                  )}
                  <div className="p-5">
                    <p className="text-sm font-bold text-foreground mb-3">
                      Onboard amenities
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      {cruise.shipAmenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-2 bg-grey-lightest rounded-lg px-3 py-2.5 border border-border"
                        >
                          <Sparkles size={14} className="text-primary shrink-0" aria-hidden="true" />
                          <span className="text-xs font-semibold text-foreground">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Included / Excluded ── */}
              <section
                id="included"
                ref={(el) => { sectionRefs.current.included = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  What's included
                </h3>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList
                    title="Included in your fare"
                    items={cruise.included}
                    variant="check"
                  />
                </div>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList
                    title="Not included"
                    items={cruise.excluded}
                    variant="cross"
                  />
                </div>
              </section>

            </div>
          </div>
          {/* END LEFT COLUMN */}

          {/* RIGHT — sticky booking widget (desktop) */}
          <div className="hidden lg:block sticky top-[32px]">
            <div className="bg-card border border-border rounded-xl shadow-md">

              <div className="px-5 pt-5 pb-5 border-b border-border">
                <div className="flex flex-col items-end text-right">
                  <span className="text-grey text-xs">
                    {currency}{cabinPrice.toLocaleString()} per person · {cruise.durationNights} nights
                  </span>
                  <span className="text-foreground font-bold text-2xl">
                    Total for {passengers} {passengers === 1 ? "passenger" : "passengers"}: {currency}{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div ref={bookingRef} className="p-5 flex flex-col gap-3">

                <p className="text-xs font-bold text-grey uppercase tracking-wide mb-1">
                  Customise your cruise
                </p>

                {/* Departure date */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
                    className={cn(
                      "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "date"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    <Calendar size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        Departure date
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {dateLabel}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-grey shrink-0 transition-transform",
                        openPanel === "date" && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {openPanel === "date" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-card rounded-xl shadow-lg border border-border p-4 animate-in fade-in zoom-in-95 duration-150">
                      <style>{`.rdp-root { --rdp-accent-color: hsl(var(--primary)); --rdp-accent-background-color: hsl(var(--primary) / 0.10); --rdp-day_button-border-radius: 6px; margin: 0; }`}</style>
                      {/* Only allow the user to pick an actual cruise departure */}
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (!date) return;
                          setSelectedDate(date);
                          setOpenPanel(null);
                        }}
                        disabled={(date) =>
                          !availableDates.some(
                            (d) => d.getTime() === date.getTime(),
                          )
                        }
                        modifiers={{ available: availableDates }}
                        modifiersClassNames={{
                          available: "font-bold underline",
                        }}
                        numberOfMonths={1}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Underlined dates have available departures.
                      </p>
                    </div>
                  )}
                </div>

                {/* Passengers */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
                    className={cn(
                      "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "guests"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        Passengers
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-grey shrink-0 transition-transform",
                        openPanel === "guests" && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {openPanel === "guests" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-card rounded-xl shadow-lg border border-border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-foreground">Passengers</div>
                          <div className="text-xs text-grey">Sharing a cabin</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPassengers(Math.max(1, passengers - 1))}
                            disabled={passengers <= 1}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                            aria-label="Decrease passengers"
                          >
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <span className="text-base font-bold text-foreground w-4 text-center">
                            {passengers}
                          </span>
                          <button
                            onClick={() => setPassengers(Math.min(12, passengers + 1))}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                            aria-label="Increase passengers"
                          >
                            <Plus size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setOpenPanel(null)}
                        className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* Cabin type dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "cabin" ? null : "cabin")}
                    className={cn(
                      "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "cabin"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    <Anchor size={16} className="text-primary shrink-0" aria-hidden="true" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        Cabin type
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {selectedCabin?.name ?? "Select a cabin"}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-grey shrink-0 transition-transform",
                        openPanel === "cabin" && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {openPanel === "cabin" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {cruise.cabinTypes.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCabinId(c.id); setOpenPanel(null); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors flex items-center justify-between",
                            selectedCabinId === c.id ? "text-primary bg-primary/10" : "text-foreground"
                          )}
                        >
                          <span>
                            {c.name}
                            <span className="ml-2 text-muted-foreground font-normal">
                              from {currency}{c.pricePerPerson.toLocaleString()}
                            </span>
                          </span>
                          {selectedCabinId === c.id && (
                            <Check size={14} className="text-primary" aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={() => onBook(cruise, bookingDate, passengers, selectedCabinId)}
                  className="w-full bg-primary hover:brightness-85 text-white font-bold text-base py-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  Book this cruise
                </button>
              </div>

            </div>
          </div>
          {/* END RIGHT COLUMN */}

        </div>
      </div>

      {/* Spacer so the mobile footer doesn't overlap content */}
      <div className="lg:hidden h-28" />

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE BOTTOM SHEET — collapsed bar with price + CTA
      ══════════════════════════════════════════════════════════════════ */}
      {mobileSheetOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/30 z-40 animate-in fade-in duration-200"
          onClick={() => { setMobileSheetOpen(false); setOpenPanel(null); }}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg transition-all duration-300 ease-out",
          mobileSheetOpen ? "rounded-t-2xl" : ""
        )}
      >
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-grey text-xs">
              {currency}{cabinPrice.toLocaleString()} per person
            </span>
            <span className="text-foreground font-bold text-base">
              Total for {passengers} {passengers === 1 ? "passenger" : "passengers"}: {currency}{totalPrice.toLocaleString()}
            </span>
          </div>

          {!mobileSheetOpen && (
            <button
              onClick={() => setMobileSheetOpen(true)}
              className="flex items-center gap-2 bg-primary hover:brightness-85 text-white font-bold text-sm px-5 py-3 rounded-md transition-colors shrink-0"
              aria-expanded={false}
              aria-label="Customise booking options"
            >
              Customise
            </button>
          )}

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

        {mobileSheetOpen && (
          <>
            <div className="px-5 pb-2 flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200">

              <p className="text-xs font-bold text-grey uppercase tracking-wide">
                Customise your cruise
              </p>

              {/* Mobile date */}
              <div className="relative">
                <button
                  onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
                  className={cn(
                    "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                    openPanel === "date"
                      ? "border-primary ring-2 ring-primary/20 bg-card"
                      : "border-border bg-card hover:border-primary"
                  )}
                >
                  <Calendar size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Departure date</span>
                    <span className="text-xs font-semibold text-foreground truncate">{dateLabel}</span>
                  </div>
                  <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "date" && "rotate-180")} aria-hidden="true" />
                </button>

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
                      disabled={(date) =>
                        !availableDates.some((d) => d.getTime() === date.getTime())
                      }
                      modifiers={{ available: availableDates }}
                      modifiersClassNames={{ available: "font-bold underline" }}
                      numberOfMonths={1}
                    />
                  </div>
                )}
              </div>

              {/* Mobile passengers */}
              <div className="relative">
                <button
                  onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
                  className={cn(
                    "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                    openPanel === "guests"
                      ? "border-primary ring-2 ring-primary/20 bg-card"
                      : "border-border bg-card hover:border-primary"
                  )}
                >
                  <Users size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Passengers</span>
                    <span className="text-xs font-semibold text-foreground">
                      {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                    </span>
                  </div>
                  <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "guests" && "rotate-180")} aria-hidden="true" />
                </button>

                {openPanel === "guests" && (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-card rounded-xl shadow-lg border border-border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Passengers</div>
                        <div className="text-xs text-grey">Sharing a cabin</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPassengers(Math.max(1, passengers - 1))}
                          disabled={passengers <= 1}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                          aria-label="Decrease passengers"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="text-base font-bold text-foreground w-4 text-center">{passengers}</span>
                        <button
                          onClick={() => setPassengers(Math.min(12, passengers + 1))}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                          aria-label="Increase passengers"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpenPanel(null)}
                      className="w-full bg-primary text-white font-bold text-sm py-2.5 rounded-lg hover:brightness-85 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile cabin */}
              <div className="relative">
                <button
                  onClick={() => setOpenPanel(openPanel === "cabin" ? null : "cabin")}
                  className={cn(
                    "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                    openPanel === "cabin"
                      ? "border-primary ring-2 ring-primary/20 bg-card"
                      : "border-border bg-card hover:border-primary"
                  )}
                >
                  <Anchor size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">Cabin type</span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedCabin?.name ?? "Select a cabin"}
                    </span>
                  </div>
                  <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "cabin" && "rotate-180")} aria-hidden="true" />
                </button>

                {openPanel === "cabin" && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {cruise.cabinTypes.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCabinId(c.id); setOpenPanel(null); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors flex items-center justify-between",
                          selectedCabinId === c.id ? "text-primary bg-primary/10" : "text-foreground"
                        )}
                      >
                        <span>
                          {c.name}
                          <span className="ml-2 text-muted-foreground font-normal">
                            from {currency}{c.pricePerPerson.toLocaleString()}
                          </span>
                        </span>
                        {selectedCabinId === c.id && <Check size={14} className="text-primary" aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="px-5 pb-4 pt-2">
              <button
                onClick={() => onBook(cruise, bookingDate, passengers, selectedCabinId)}
                className="w-full bg-primary hover:brightness-85 text-white font-bold text-sm py-3.5 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                Book this cruise
              </button>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ALL PHOTOS MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={photosOpen} onOpenChange={setPhotosOpen}>
        <DialogContent className="max-w-[1040px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{cruise.title} — All photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="col-span-2">
              <ImageWithPlaceholder
                src={galleryImages[0]}
                alt={cruise.title}
                aspectRatio="16/7"
                rounded="rounded-2xl"
              />
            </div>
            {galleryImages.slice(1).map((url, i) => (
              <ImageWithPlaceholder
                key={url}
                src={url}
                alt={`Cruise photo ${i + 2}`}
                aspectRatio="4/3"
                rounded="rounded-2xl"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PortsTable — list of ports with sea-day indicators
// ─────────────────────────────────────────────────────────────────────────────
function PortsTable({ ports }: { ports: CruisePort[] }) {
  return (
    <div className="flex flex-col">
      {ports.map((port, i) => {
        // Sea days get their own styled row (wave pattern bg + Waves icon)
        if (port.isSeaDay) {
          return (
            <div
              key={`${port.name}-${port.day}`}
              className={cn(
                "grid grid-cols-[auto_1fr] gap-4 items-center py-3 px-3 rounded-md",
                i < ports.length - 1 && "border-b border-border",
              )}
              style={{ backgroundColor: `${CRUISE_ACCENT}0D` }} // 5% opacity wash
            >
              <span
                className="text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: CRUISE_ACCENT }}
              >
                Day {port.day}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <Waves size={16} className="shrink-0" style={{ color: CRUISE_ACCENT }} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    At sea — relaxation day
                  </p>
                  {port.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {port.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={`${port.name}-${port.day}`}
            className={cn(
              "grid grid-cols-[auto_1fr_auto] gap-4 items-start py-3",
              i < ports.length - 1 && "border-b border-border"
            )}
          >
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
              Day {port.day}
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <MapPinned size={13} className="text-foreground shrink-0" aria-hidden="true" />
                {port.name}
              </p>
              {port.description && (
                <p className="text-xs text-foreground mt-1 leading-snug">
                  {port.description}
                </p>
              )}
            </div>

            <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
              {port.arrives && (
                <p>
                  <span className="font-semibold text-foreground">Arrives</span> {port.arrives}
                </p>
              )}
              {port.departs && (
                <p>
                  <span className="font-semibold text-foreground">Departs</span> {port.departs}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CabinGrid — 2x2 pricing-table feel for cabin categories
// ─────────────────────────────────────────────────────────────────────────────
function CabinGrid({
  cabins,
  currency,
  selectedId,
  cheapestId,
  onSelect,
}: {
  cabins: CruiseCabin[];
  currency: string;
  selectedId: string;
  cheapestId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cabins.map((cabin) => {
        const isSelected = selectedId === cabin.id;
        const isCheapest = cabin.id === cheapestId;
        return (
          <div
            key={cabin.id}
            className={cn(
              "bg-card rounded-xl shadow-sm overflow-hidden flex flex-col transition-all relative",
              isSelected ? "border-2 border-primary" : "border border-border",
            )}
          >
            {/* "Best value" badge on the cheapest cabin */}
            {isCheapest && (
              <span
                className="absolute top-2 left-2 z-10 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md"
                style={{ backgroundColor: CRUISE_ACCENT }}
              >
                Best value
              </span>
            )}

            <ImageWithPlaceholder
              src={cabin.image}
              alt={cabin.name}
              containerClassName="w-full h-[140px]"
            />
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div>
                <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">
                  {cabin.category}
                </p>
                <p className="text-base font-bold text-foreground mt-0.5">
                  {cabin.name}
                </p>
              </div>
              {cabin.description && (
                <p className="text-xs text-foreground leading-snug">
                  {cabin.description}
                </p>
              )}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users size={12} aria-hidden="true" /> Up to {cabin.capacity} guests
                </span>
                {cabin.sqMeters && (
                  <span className="flex items-center gap-1.5">
                    <LayoutGrid size={12} aria-hidden="true" /> {cabin.sqMeters} m²
                  </span>
                )}
              </div>
              <div className="mt-auto pt-3 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground">From</span>
                  <span className="text-lg font-extrabold text-foreground leading-none">
                    {currency}{cabin.pricePerPerson.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">per person</span>
                </div>
                <button
                  onClick={() => onSelect(cabin.id)}
                  className={cn(
                    "text-xs font-bold px-3 py-2 rounded-md transition-colors whitespace-nowrap",
                    isSelected
                      ? "bg-primary text-white"
                      : "border border-primary text-primary hover:bg-primary hover:text-white",
                  )}
                >
                  {isSelected ? "Selected" : "Choose"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
