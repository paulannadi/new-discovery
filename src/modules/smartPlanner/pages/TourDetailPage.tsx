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
  LayoutGrid,
} from "lucide-react";
// Shared design-system calendar (token-based colors). Aliased to DateCalendar
// because lucide's <Calendar> icon is already imported above under that name.
import { Calendar as DateCalendar } from "../../../shared/components/ui/calendar";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { BackButton } from "../../../shared/components/BackButton";
import { PageContainer } from "../../../shared/components/PageContainer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { cn } from "../../../shared/components/ui/utils";
import type { Tour, TourAttribute } from "../../../types";
// Shared section components — extracted from TourDetailPage so ActivityDetailPage
// can render the same day-by-day accordion, info lists, and route map.
import { DayByDaySection } from "../components/DayByDaySection";
import { InfoList } from "../components/InfoList";
import { TourRouteMapInline } from "../components/TourRouteMap";
// ImageWithPlaceholder — reserves space + lazy-loads + fades in. We use
// `priority` for the hero (above the fold) and lazy for the thumbnails and
// modal gallery (below the fold or hidden until opened).
import { ImageWithPlaceholder } from "../../../shared/components/loading";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sym(currency: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", CHF: "CHF " };
  return map[currency] ?? currency + " ";
}

function AttributeIcon({ iconKey, size = 15 }: { iconKey: TourAttribute["iconKey"]; size?: number }) {
  const cls = "text-primary shrink-0";
  if (iconKey === "users")          return <Users size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "languages")      return <Languages size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "activity")       return <Activity size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "calendar-check") return <CalendarCheck size={size} className={cls} aria-hidden="true" />;
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

// Each section on the page has a stable id. The id is what the sticky
// nav links to (#overview, #itinerary, etc) and what the IntersectionObserver
// reports back when a section scrolls into the active band.
type SectionId = "overview" | "itinerary" | "highlights" | "included" | "excluded";
const SECTION_IDS: SectionId[] = ["overview", "itinerary", "highlights", "included", "excluded"];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function TourDetailPage({ tour, onBack, onBook, backLabel = "Back to all tours" }: TourDetailPageProps) {

  // Photos modal
  const [photosOpen, setPhotosOpen] = useState(false);


  // Booking widget state — lives in the sidebar (desktop) and bottom sheet (mobile)
  // openPanel controls which dropdown is visible at any time (only one at once).
  // The "hotel" panel doubles as the "departure point" panel for coach/bus tours;
  // we swap the label, icon, and options based on whether `tour.departurePoints` is set.
  type BookingPanel = "date" | "guests" | "hotel" | null;
  const [openPanel, setOpenPanel]             = useState<BookingPanel>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | undefined>(undefined);
  const [adults, setAdults]                   = useState(tour.adults);
  const [children, setChildren]               = useState(0);

  // When the tour has `departurePoints`, this state holds the chosen pickup point
  // (e.g. "Freiburg"). Otherwise it holds the chosen hotel preference ("Standard"…).
  // Same dropdown UI for both — only the label/icon/options change.
  const isDepartureMode = (tour.departurePoints?.length ?? 0) > 0;
  const preferenceLabel = isDepartureMode ? "Departure point" : "Hotel preference";
  const preferenceOptions = isDepartureMode
    ? (tour.departurePoints as string[])
    : ["Standard", "Superior", "Deluxe", "Luxury"];
  const [hotelPreference, setHotelPreference] = useState(preferenceOptions[0]);

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

  // Section nav — sticky tab bar with sliding indicator (matches Discovery page).
  // `activeSection` is now driven by scroll position via IntersectionObserver
  // (set up in a useEffect below), NOT by clicks. Clicks only smooth-scroll
  // to the target section; the IO updates `activeSection` as the page scrolls.
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [hoveredTab, setHoveredTab] = useState<SectionId | null>(null);
  const tabBarRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<{ [key in SectionId]?: HTMLButtonElement | null }>({});
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  // Refs for each <section> on the page — used both for smooth-scroll-on-click
  // AND for the IntersectionObserver to track which section is in view.
  const sectionRefs = useRef<{ [k in SectionId]?: HTMLElement | null }>({});

  // Update the sliding underline position whenever the active section
  // (scroll-driven) or the hovered tab (mouse-driven) changes.
  useEffect(() => {
    const target = hoveredTab ?? activeSection;
    const el = tabRefs.current[target];
    const bar = tabBarRef.current;
    if (el && bar) {
      setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeSection, hoveredTab]);

  // ── IntersectionObserver: which section is currently "in view"? ──
  // We watch all five <section> elements. The rootMargin is the trick that
  // makes this feel right: it shrinks the observed viewport from the top
  // (to ignore the area covered by the app header + sticky nav) and from
  // the bottom (so a section is only "active" when its top is in the
  // upper part of the screen, not the very bottom).
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        // Pick whichever intersecting section is closest to the top of the
        // observed band — that's the one the user is reading right now.
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveSection(topmost.target.id as SectionId);
      },
      // top    -88px → ignore the 32px sticky offset + ~56px sticky nav
      // bottom -55%  → only count a section once it's in the upper ~45% of the screen
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 }
    );

    SECTION_IDS.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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
        <PageContainer tier="standard">

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
                  <ImageWithPlaceholder
                    src={galleryImages[0]}
                    alt={tour.title}
                    priority
                    containerClassName="absolute inset-0 w-full h-full"
                  />
                )}
                {/* Subtle gradient at the bottom so the video blends nicely */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* 2×2 thumbnail grid — desktop only, clicking opens the modal */}
              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {galleryImages.slice(1, 5).map((url, i) => (
                  <button
                    key={url}
                    className="overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => setPhotosOpen(true)}
                    aria-label={`View tour photo ${i + 2}`}
                  >
                    <ImageWithPlaceholder
                      src={url}
                      alt={`Tour photo ${i + 2}`}
                      containerClassName="w-full h-full"
                      className="group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* "See all photos" button — overlaid bottom-right, same as PackageDetailPage */}
            <button
              onClick={() => setPhotosOpen(true)}
              className="absolute bottom-4 right-4 bg-card border border-primary text-primary text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary hover:text-white transition-colors shadow-sm"
            >
              <LayoutGrid size={16} aria-hidden="true" /> See all photos
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
        </PageContainer>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE BODY — two-column grid, same as PackageDetailPage body
      ══════════════════════════════════════════════════════════════════════ */}
      <PageContainer tier="standard" className="px-3 sm:px-4 md:px-8 py-5 md:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

          {/* ╔═══════════════════════════════════════════════════════════════
              LEFT COLUMN — tabbed content area
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="flex flex-col min-w-0">

            {/* ── Sticky section nav — Discovery-style sliding underline ──
                Pinned at top:0 of the viewport once the user scrolls past
                the hero. The 32px of grey breathing room you see above the
                tabs at rest comes from the body wrapper's py-8 padding (the
                grid container above) — it scrolls away naturally, so when
                stuck the nav sits flush at the very top.

                Background = bg-grey-lightest (matches the page body) so
                content scrolling up beneath the nav visually "disappears"
                behind it.

                Negative side-margins + matching padding stretch the grey
                full-width inside the column so the disappearing effect
                covers the entire content width.

                z-30 keeps it above the Leaflet map (z-0) but below dialogs
                (z-50). */}
            <nav
              ref={tabBarRef}
              aria-label="Tour sections"
              className="sticky top-[32px] z-30 -mx-3 sm:-mx-4 md:-mx-8 px-3 sm:px-4 md:px-8 bg-grey-lightest mb-8"
            >
              {/* Cover strip — sits 32px ABOVE the nav. When the nav is
                  pinned at top:32, this lands at top:0 and covers the gap
                  band (hiding any section heading scrolling through it).
                  At rest, it overlaps the body wrapper's py-8 padding —
                  same grey, so it's invisible and adds no extra height. */}
              <div
                aria-hidden="true"
                className="absolute -top-8 left-0 right-0 h-8 bg-grey-lightest"
              />
              {/* Inner wrapper at content-width — carries the bottom hairline
                  AND is the offsetParent for the sliding underline. We split
                  the nav this way so the GREY BG can extend to the column
                  edges (covering scrolled content) while the LINE stops
                  exactly where the tab buttons stop. */}
              <div className="relative flex gap-0 overflow-x-auto border-b border-border">
                {SECTION_IDS.map((tab) => {
                  const labels: Record<SectionId, string> = {
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
                      // Smooth-scroll to the corresponding <section>. The IO
                      // will pick up the new active section as the page scrolls.
                      onClick={() => sectionRefs.current[tab]?.scrollIntoView({ behavior: "smooth" })}
                      onMouseEnter={() => setHoveredTab(tab)}
                      onMouseLeave={() => setHoveredTab(null)}
                      aria-current={activeSection === tab ? "true" : undefined}
                      className={cn(
                        "shrink-0 px-5 py-3 text-base font-bold whitespace-nowrap",
                        activeSection === tab ? "text-primary" : "text-foreground"
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
            </nav>

            {/* ── All sections, stacked vertically ──────────────────────
                Each <section> has:
                  • a stable id (so #overview, #itinerary, etc. work as deep links)
                  • a ref the IntersectionObserver attaches to
                  • scroll-mt-[120px] so when we scroll TO this section,
                    the heading lands just below the ~56px sticky nav
                    with a bit of breathing room, not jammed under it. */}
            <div className="flex flex-col gap-12 md:gap-16">

              {/* Overview — tour details pills + tour route map */}
              <section
                id="overview"
                ref={(el) => { sectionRefs.current.overview = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Your journey at a glance
                </h3>

                {/* ── Single card: Tour details pills + divider + Tour route ── */}
                <div className="bg-card rounded-xl shadow-sm overflow-visible">

                  {/* Tour details — pill badges */}
                  <div className="p-5">
                    <p className="text-sm font-bold text-foreground mb-3">Tour details</p>
                    <div className="flex flex-wrap gap-2">
                      {tour.attributes.map((attr) => (
                        <div
                          key={attr.title}
                          className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2"
                        >
                          <AttributeIcon iconKey={attr.iconKey} size={15} />
                          <span className="text-sm text-foreground font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border mx-5" />

                  {/* Tour route — map + stops side by side */}
                  <div className="p-5 pb-0">
                    <p className="text-sm font-bold text-foreground mb-4">Tour route</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]">

                    {/* Map */}
                    <div className="h-[260px] md:h-[300px] relative z-0 m-5 mt-0 rounded-xl overflow-hidden border border-border">
                      <TourRouteMapInline stops={tour.stops} />
                    </div>

                    {/* Destinations list */}
                    <div className="px-5 pb-5 md:pl-0">
                      <p className="text-xs font-bold text-grey uppercase tracking-wide mb-3">Destinations</p>
                      <div className="flex flex-col gap-3">
                        {tour.stops.map((stop, i) => (
                          <div key={stop.destinationName} className="flex items-start gap-3">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {stop.destinationName}
                                <span className="font-normal text-muted-foreground"> · {stop.nights} {stop.nights === 1 ? "night" : "nights"}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {stop.dateRange}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* Itinerary — day-by-day accordion */}
              <section
                id="itinerary"
                ref={(el) => { sectionRefs.current.itinerary = el; }}
                className="scroll-mt-[120px]"
              >
                <DayByDaySection days={tour.days} slug={slug} />
              </section>

              {/* Highlights */}
              <section
                id="highlights"
                ref={(el) => { sectionRefs.current.highlights = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Moments you won't forget
                </h3>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList title="Tour highlights" items={tour.highlights} variant="highlight" />
                </div>
              </section>

              {/* Included */}
              <section
                id="included"
                ref={(el) => { sectionRefs.current.included = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Everything taken care of
                </h3>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList title="What's included" items={tour.included} variant="check" />
                </div>
              </section>

              {/* Excluded */}
              <section
                id="excluded"
                ref={(el) => { sectionRefs.current.excluded = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Good to know before you go
                </h3>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList title="Not included" items={tour.excluded} variant="cross" />
                </div>
              </section>

            </div>

          </div>
          {/* ╚═══════════════════════ END LEFT COLUMN ════════════════════╝ */}

          {/* ╔═══════════════════════════════════════════════════════════════
              RIGHT COLUMN — STICKY BOOKING WIDGET SIDEBAR
              Same container style as the rate calendar in PackageDetailPage
              (bg-card, rounded-xl, shadow-md). Pins at top:0 — same Y as
              the sticky tabs, so they align as a single horizontal band
              when stuck. The 32px grey buffer above both at rest comes
              from the body wrapper's py-8 padding above this grid.
              Hidden on mobile (the bottom-sheet footer takes over).
          ═══════════════════════════════════════════════════════════════╗ */}
          <div className="hidden lg:block sticky top-[32px]">
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
                      "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
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
                      {/* Shared design-system Calendar (token-based, no hex). */}
                      <DateCalendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (!date) return;
                          setSelectedDate(date);
                          setOpenPanel(null); // close after selecting
                        }}
                        disabled={{ before: new Date() }}
                        numberOfMonths={1}
                        className="p-0"
                      />
                    </div>
                  )}
                </div>

                {/* ── Travellers — panel with Adults/Children counter + Done ── */}
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
                              aria-label={`Decrease ${label}`}
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span className="text-base font-bold text-foreground w-4 text-center">{value}</span>
                            <button
                              onClick={() => set(Math.min(9, value + 1))}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                              aria-label={`Increase ${label}`}
                            >
                              <Plus size={14} aria-hidden="true" />
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

                {/* ── Hotel preference (or Departure point for coach tours) ── */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "hotel" ? null : "hotel")}
                    className={cn(
                      "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "hotel"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    {isDepartureMode
                      ? <Bus   size={16} className="text-primary shrink-0" aria-hidden="true" />
                      : <Hotel size={16} className="text-primary shrink-0" aria-hidden="true" />}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        {preferenceLabel}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{hotelPreference}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "hotel" && "rotate-180")} aria-hidden="true" />
                  </button>
                  {openPanel === "hotel" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {preferenceOptions.map((opt) => (
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
      </PageContainer>

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
                  "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
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
                  {/* Shared design-system Calendar (token-based, no hex). */}
                  <DateCalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setSelectedDate(date);
                      setOpenPanel(null);
                    }}
                    disabled={{ before: new Date() }}
                    numberOfMonths={1}
                    className="p-0"
                  />
                </div>
              )}
            </div>

            {/* ── Travellers ── */}
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
                          aria-label={`Decrease ${label}`}
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="text-base font-bold text-foreground w-4 text-center">{value}</span>
                        <button
                          onClick={() => set(Math.min(9, value + 1))}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                          aria-label={`Increase ${label}`}
                        >
                          <Plus size={14} aria-hidden="true" />
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

            {/* ── Hotel preference (or Departure point for coach tours) ── */}
            <div className="relative">
              <button
                onClick={() => setOpenPanel(openPanel === "hotel" ? null : "hotel")}
                className={cn(
                  "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                  openPanel === "hotel"
                    ? "border-primary ring-2 ring-primary/20 bg-card"
                    : "border-border bg-card hover:border-primary"
                )}
              >
                {isDepartureMode
                  ? <Bus   size={16} className="text-primary shrink-0" aria-hidden="true" />
                  : <Hotel size={16} className="text-primary shrink-0" aria-hidden="true" />}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">{preferenceLabel}</span>
                  <span className="text-xs font-semibold text-foreground">{hotelPreference}</span>
                </div>
                <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "hotel" && "rotate-180")} aria-hidden="true" />
              </button>

              {/* Dropdown options — opens upward on mobile */}
              {openPanel === "hotel" && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {preferenceOptions.map((opt) => (
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
              <ImageWithPlaceholder
                src={galleryImages[0]}
                alt={tour.title}
                aspectRatio="16/7"
                rounded="rounded-2xl"
              />
            </div>
            {/* Extra gallery images — 2-col grid, sourced from day photos + gallery.
                Lazy-loaded by default since they're below the fold inside the modal. */}
            {[...dayImages, ...galleryImages.slice(1)].filter(
              // Remove duplicates and the hero image (already shown above)
              (url, i, arr) => arr.indexOf(url) === i && url !== galleryImages[0]
            ).map((url, i) => (
              <ImageWithPlaceholder
                key={url}
                src={url}
                alt={`Tour photo ${i + 2}`}
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

// All inline section components (DayByDaySection, DayCard, InfoList,
// TourRouteMap/Inline, MapFitter, createDayPinIcon) used to live here.
// They're now imported at the top of this file from:
//   ../components/DayByDaySection
//   ../components/InfoList
//   ../components/TourRouteMap
// so that ActivityDetailPage can reuse the same pieces.
