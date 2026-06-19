// ─────────────────────────────────────────────────────────────────────────────
// ActivityDetailPage
//
// Single-page layout with sticky tabs — same visual structure as
// TourDetailPage. The big difference is that the section list is dynamic,
// driven by activity type:
//
//   cruise-ship / river-cruise        → Overview · Ports · Cabins · Highlights · Included · Excluded
//   multi-day-tour / safari / expedition / event → Overview · Itinerary · Highlights · Included · Excluded
//   walking-tour / bicycle-tour       → Overview · Route · Highlights · Included · Excluded
//
// All other UI (hero, gallery modal, sticky tabs IO, sidebar booking widget,
// mobile bottom sheet) is mirrored from TourDetailPage so the two pages feel
// like siblings.
//
// The booking widget's third dropdown adapts to the activity type:
//   cruise/river  → "Cabin type"
//   walking/bike  → "Difficulty preference"
//   default       → "Hotel preference"
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Languages,
  Activity as ActivityIcon,
  CalendarCheck,
  Check,
  Hotel,
  Bike,
  Footprints,
  Mountain,
  Anchor,
  ChevronDown,
  Plus,
  Minus,
  X,
  LayoutGrid,
  Star,
  Ship,
  Ruler,
  Waves,
} from "lucide-react";
// Shared design-system calendar (token-based colors). Aliased to DateCalendar
// because lucide's <Calendar> icon is already imported above under that name.
// Replaces the raw <DayPicker> + inline hex <style> these date fields used.
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
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../shared/components/ui/utils";
import type { Activity, ActivityCabin, ActivityPort, TourAttribute } from "../../../types";
import { DayByDaySection } from "../components/DayByDaySection";
import { InfoList } from "../components/InfoList";
import { TourRouteMap, TourRouteMapInline } from "../components/TourRouteMap";
import { ACTIVITY_TYPE_OPTIONS } from "../components/ActivitySearchForm";
// ImageWithPlaceholder — reserves space, lazy-loads, fades in.
// Hero gets `priority`; thumbnails, cabin photos and modal images stay lazy.
import { ImageWithPlaceholder } from "../../../shared/components/loading";

// Deep-ocean blue used only for cruise-specific accents — the sea-day row
// in the Ports table and the "Best value" badge on the cheapest cabin.
// Stored as a hex string so we can derive translucent variants with `${X}0D`
// (5% opacity) for the row wash without polluting the global Tailwind palette.
const CRUISE_ACCENT = "#0e4d92";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sym(currency: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", CHF: "CHF " };
  return map[currency] ?? currency + " ";
}

// AttributeIcon — same as TourDetailPage so the overview attribute pills look
// identical across tour and activity pages.
function AttributeIcon({
  iconKey,
  size = 15,
}: {
  iconKey: TourAttribute["iconKey"];
  size?: number;
}) {
  const cls = "text-primary shrink-0";
  if (iconKey === "users")          return <Users        size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "languages")      return <Languages    size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "activity")       return <ActivityIcon size={size} className={cls} aria-hidden="true" />;
  if (iconKey === "calendar-check") return <CalendarCheck size={size} className={cls} aria-hidden="true" />;
  return null;
}

// ── Section IDs ──────────────────────────────────────────────────────────────
// All possible section ids across activity types. The actual list shown on
// any given activity is filtered down by `getSections()` below.
type SectionId =
  | "overview"
  | "itinerary"
  | "ports"
  | "cabins"
  | "route"
  | "highlights"
  | "included"
  | "excluded";

const SECTION_LABELS: Record<SectionId, string> = {
  overview:   "Overview",
  itinerary:  "Itinerary",
  ports:      "Ports",
  cabins:     "Cabins",
  route:      "Route",
  highlights: "Highlights",
  included:   "Included",
  excluded:   "Excluded",
};

// Decide which sticky-tab sections to render for the given activity.
// Driven by activity type, but also defensive — if the relevant data block
// is missing on a mock we fall back to the shared sections only.
function getSections(activity: Activity): SectionId[] {
  const base: SectionId[] = ["overview", "highlights", "included", "excluded"];

  if (activity.type === "cruise-ship" || activity.type === "river-cruise") {
    const out: SectionId[] = ["overview"];
    if (activity.cruise?.ports?.length)        out.push("ports");
    if (activity.cruise?.cabinTypes?.length)   out.push("cabins");
    out.push("highlights", "included", "excluded");
    return out;
  }

  if (
    activity.type === "multi-day-tour" ||
    activity.type === "safari" ||
    activity.type === "expedition" ||
    activity.type === "event"
  ) {
    const out: SectionId[] = ["overview"];
    if (activity.itineraryDays?.length) out.push("itinerary");
    out.push("highlights", "included", "excluded");
    return out;
  }

  if (activity.type === "walking-tour" || activity.type === "bicycle-tour") {
    const out: SectionId[] = ["overview"];
    if (activity.routeStops?.length) out.push("route");
    out.push("highlights", "included", "excluded");
    return out;
  }

  return base;
}

// ── Type-specific booking-widget label / option set ─────────────────────────
function getPreferenceField(activity: Activity): {
  label: string;
  icon: React.ReactNode;
  options: string[];
} {
  if (activity.type === "cruise-ship" || activity.type === "river-cruise") {
    return {
      label: "Cabin type",
      icon: <Anchor size={16} className="text-primary shrink-0" aria-hidden="true" />,
      options: activity.cruise?.cabinTypes.map((c) => c.name) ?? [
        "Standard",
        "Sea-view",
        "Balcony",
        "Suite",
      ],
    };
  }
  if (activity.type === "walking-tour") {
    return {
      label: "Difficulty preference",
      icon: <Footprints size={16} className="text-primary shrink-0" aria-hidden="true" />,
      options: ["Easy", "Moderate", "Challenging"],
    };
  }
  if (activity.type === "bicycle-tour") {
    return {
      label: "Difficulty preference",
      icon: <Bike size={16} className="text-primary shrink-0" aria-hidden="true" />,
      options: ["Easy", "Moderate", "Challenging"],
    };
  }
  if (activity.type === "expedition") {
    return {
      label: "Cabin type",
      icon: <Mountain size={16} className="text-primary shrink-0" aria-hidden="true" />,
      options: ["Standard cabin", "Sea-view cabin", "Suite"],
    };
  }
  // Multi-day tours and safaris fall back to hotel preference, same as tours.
  return {
    label: "Accommodation preference",
    icon: <Hotel size={16} className="text-primary shrink-0" aria-hidden="true" />,
    options: ["Standard", "Superior", "Deluxe", "Luxury"],
  };
}

// ── Props ────────────────────────────────────────────────────────────────────
interface ActivityDetailPageProps {
  activity: Activity;
  onBack: () => void;
  onBook: (
    activity: Activity,
    travelDate: string,
    travellers: number,
    preference: string
  ) => void;
  // Label shown on the back button — defaults to "Back to all activities"
  backLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ActivityDetailPage({
  activity,
  onBack,
  onBook,
  backLabel = "Back to all activities",
}: ActivityDetailPageProps) {
  // ── Photos modal ────────────────────────────────────────────────────────
  const [photosOpen, setPhotosOpen] = useState(false);

  // Booking widget state
  type BookingPanel = "date" | "guests" | "preference" | null;
  const [openPanel, setOpenPanel] = useState<BookingPanel>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [travellers, setTravellers] = useState(2);

  const preferenceField = useMemo(() => getPreferenceField(activity), [activity]);
  const [preference, setPreference] = useState(preferenceField.options[0] ?? "");

  // Mobile bottom sheet
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Click-outside to close booking dropdowns
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

  // Display labels
  const dateSummary = selectedDate ? format(selectedDate, "MMM d, yyyy") : activity.startDate;
  const travelDate = selectedDate ? format(selectedDate, "MMM d, yyyy") : activity.startDate;

  // ── Sticky tabs — IntersectionObserver-driven ──────────────────────────
  const sectionIds = useMemo(() => getSections(activity), [activity]);

  const [activeSection, setActiveSection] = useState<SectionId>(sectionIds[0]);
  const [hoveredTab, setHoveredTab] = useState<SectionId | null>(null);
  const tabBarRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<{ [key in SectionId]?: HTMLButtonElement | null }>({});
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  const sectionRefs = useRef<{ [k in SectionId]?: HTMLElement | null }>({});

  // Slide the underline whenever the active tab or hovered tab changes
  useEffect(() => {
    const target = hoveredTab ?? activeSection;
    const el = tabRefs.current[target];
    if (el && tabBarRef.current) {
      setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeSection, hoveredTab]);

  // IntersectionObserver — same config as TourDetailPage
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveSection(topmost.target.id as SectionId);
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  // ── Currency, total, gallery ────────────────────────────────────────────
  const currency = sym(activity.price.currency);
  const totalPrice = activity.price.perPerson * travellers;
  const slug = activity.activityId;

  const galleryImages = [activity.mainImage, ...activity.gallery].slice(0, 5);
  while (galleryImages.length < 5) {
    galleryImages.push(`https://picsum.photos/seed/${slug}-${galleryImages.length}/800/600`);
  }

  const dayImages = (activity.itineraryDays ?? [])
    .filter((d) => d.image)
    .map((d) => d.image as string);

  // Lookup the type meta (icon + label) once for reuse in the header
  const typeMeta = ACTIVITY_TYPE_OPTIONS.find((o) => o.id === activity.type);

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
        <PageContainer tier="standard">

          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-5">
            <BackButton label={backLabel} onClick={onBack} />
          </div>

          {/* Photo grid — auto-playing video on the left if available */}
          <div className="relative mx-4 sm:mx-6 md:mx-10">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] grid-rows-1 h-[200px] sm:h-[240px] md:h-[402px] gap-2">

              <div className="relative overflow-hidden rounded-xl">
                {activity.videoUrl ? (
                  <video
                    src={activity.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={galleryImages[0]}
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-label={`Activity video for ${activity.title}`}
                  />
                ) : (
                  <ImageWithPlaceholder
                    src={galleryImages[0]}
                    alt={activity.title}
                    priority
                    containerClassName="absolute inset-0 w-full h-full"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent pointer-events-none" />
              </div>

              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {galleryImages.slice(1, 5).map((url, i) => (
                  <button
                    key={url}
                    className="overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => setPhotosOpen(true)}
                    aria-label={`View activity photo ${i + 2}`}
                  >
                    <ImageWithPlaceholder
                      src={url}
                      alt={`Activity photo ${i + 2}`}
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

            {/* Activity-type badge — sits above the title to set context */}
            {typeMeta && (
              <span className="self-start flex items-center gap-1.5 text-foreground text-xs font-bold">
                {typeMeta.icon}
                {typeMeta.label}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
              {activity.title}
            </h1>

            {/* Subtitle — adds context to the activity in 1 sentence */}
            <p className="text-base text-muted-foreground leading-snug max-w-[820px]">
              {activity.subtitle}
            </p>

            <div className="flex items-center gap-4 text-base text-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>{activity.durationDays} days</span>
              </div>
              <span className="text-border hidden md:block">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-foreground shrink-0" aria-hidden="true" />
                <span>{activity.location}</span>
              </div>

              {/* Distance — only present on walking / bicycle */}
              {activity.distanceKm != null && (
                <>
                  <span className="text-border hidden md:block">|</span>
                  <div className="flex items-center gap-1.5">
                    <Ruler size={15} className="text-foreground shrink-0" aria-hidden="true" />
                    <span>{activity.distanceKm} km</span>
                  </div>
                </>
              )}

              {/* Cruise ship name — only present on cruises */}
              {activity.cruise?.ship && (
                <>
                  <span className="text-border hidden md:block">|</span>
                  <div className="flex items-center gap-1.5">
                    <Ship size={15} className="text-foreground shrink-0" aria-hidden="true" />
                    <span>{activity.cruise.ship}</span>
                  </div>
                </>
              )}

              {/* Rating row — always present */}
              <span className="text-border hidden md:block">|</span>
              <div className="flex items-center gap-1.5">
                <Star
                  size={15}
                  className="text-warning shrink-0"
                  fill="currentColor"
                  aria-hidden="true"
                />
                <span className="font-semibold">{activity.rating.score.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({activity.rating.reviewCount.toLocaleString()})
                </span>
              </div>
            </div>

          </div>
        </PageContainer>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BODY — sticky tabs + booking sidebar
      ══════════════════════════════════════════════════════════════════ */}
      <PageContainer tier="standard" className="px-3 sm:px-4 md:px-8 py-5 md:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 items-start">

          {/* LEFT — sticky tabs + section content */}
          <div className="flex flex-col min-w-0">

            {/* Sticky section nav — same pattern as TourDetailPage */}
            <nav
              ref={tabBarRef}
              aria-label="Activity sections"
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

            {/* All sections, stacked vertically */}
            <div className="flex flex-col gap-12 md:gap-16">

              {/* ── Overview ── */}
              <section
                id="overview"
                ref={(el) => { sectionRefs.current.overview = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Your experience at a glance
                </h3>

                <div className="bg-card rounded-xl shadow-sm overflow-visible">

                  {/* Attribute pills */}
                  <div className="p-5">
                    <p className="text-sm font-bold text-foreground mb-3">Activity details</p>
                    <div className="flex flex-wrap gap-2">
                      {activity.attributes.map((attr) => (
                        <div
                          key={attr.title}
                          className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2"
                        >
                          <AttributeIcon iconKey={attr.iconKey} size={15} />
                          <span className="text-sm text-foreground font-medium">
                            {attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inline route map + stops list — only shown when we have
                      route stop data on the activity. */}
                  {activity.routeStops && activity.routeStops.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]">
                        <div className="h-[260px] md:h-[300px] relative z-0 mt-0 rounded-bl-lg overflow-hidden border border-border">
                          <TourRouteMapInline stops={activity.routeStops} />
                        </div>
                        <div className="p-5 border-t">
                          <p className="text-sm font-bold text-foreground mb-4">
                            {activity.type === "cruise-ship" || activity.type === "river-cruise"
                              ? "Cruise route"
                              : "Activity route"}
                          </p>
                          <div className="flex flex-col gap-3">
                            {activity.routeStops.map((stop, i) => (
                              <div key={stop.destinationName + i} className="flex items-start gap-3">
                                <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                  {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground">
                                    {stop.destinationName}
                                    {stop.nights > 0 && (
                                      <span className="font-normal text-muted-foreground">
                                        {" "}· {stop.nights} {stop.nights === 1 ? "night" : "nights"}
                                      </span>
                                    )}
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
                    </>
                  )}
                </div>
              </section>

              {/* ── Itinerary (multi-day-tour / safari / expedition / event) ── */}
              {sectionIds.includes("itinerary") && activity.itineraryDays && (
                <section
                  id="itinerary"
                  ref={(el) => { sectionRefs.current.itinerary = el; }}
                  className="scroll-mt-[120px]"
                >
                  <DayByDaySection
                    days={activity.itineraryDays}
                    slug={slug}
                    title="Day by day"
                  />
                </section>
              )}

              {/* ── Ports (cruise / river-cruise) ── */}
              {sectionIds.includes("ports") && activity.cruise?.ports && (
                <section
                  id="ports"
                  ref={(el) => { sectionRefs.current.ports = el; }}
                  className="scroll-mt-[120px] flex flex-col gap-6"
                >
                  <h3 className="text-xl font-bold text-foreground">Ports of call</h3>
                  <PortsTable ports={activity.cruise.ports} />
                </section>
              )}

              {/* ── Cabins (cruise / river-cruise) ── */}
              {sectionIds.includes("cabins") && activity.cruise?.cabinTypes && (
                <section
                  id="cabins"
                  ref={(el) => { sectionRefs.current.cabins = el; }}
                  className="scroll-mt-[120px] flex flex-col gap-6"
                >
                  <h3 className="text-xl font-bold text-foreground">Choose your cabin</h3>
                  <CabinGrid
                    cabins={activity.cruise.cabinTypes}
                    currency={currency}
                    selected={preference}
                    onSelect={(name) => setPreference(name)}
                  />
                </section>
              )}

              {/* ── Route (walking / bicycle) ── */}
              {sectionIds.includes("route") && activity.routeStops && (
                <section
                  id="route"
                  ref={(el) => { sectionRefs.current.route = el; }}
                  className="scroll-mt-[120px] flex flex-col gap-6"
                >
                  <h3 className="text-xl font-bold text-foreground">Trail route</h3>

                  {/* Stat tiles — distance */}
                  <div className="grid grid-cols-2 gap-3">
                    {activity.distanceKm != null && (
                      <div className="bg-card rounded-xl shadow-sm p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Ruler size={18} className="text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-grey uppercase tracking-wide">
                            Distance
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {activity.distanceKm} km
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Full-width route map */}
                  <TourRouteMap stops={activity.routeStops} />
                </section>
              )}

              {/* ── Highlights ── */}
              <section
                id="highlights"
                ref={(el) => { sectionRefs.current.highlights = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Activity highlights
                </h3>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList
                    items={activity.highlights}
                    variant="highlight"
                  />
                </div>
              </section>

              {/* ── Included ── */}
              <section
                id="included"
                ref={(el) => { sectionRefs.current.included = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  What's included
                </h3>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList items={activity.included} variant="check" />
                </div>
              </section>

              {/* ── Excluded ── */}
              <section
                id="excluded"
                ref={(el) => { sectionRefs.current.excluded = el; }}
                className="scroll-mt-[120px] flex flex-col gap-6"
              >
                <h3 className="text-xl font-bold text-foreground">
                  Not included
                </h3>
                <div className="bg-card rounded-xl shadow-sm p-5">
                  <InfoList items={activity.excluded} variant="cross" />
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
                    {currency}{activity.price.perPerson.toLocaleString()} per person · {activity.durationDays}-day experience
                  </span>
                  <span className="text-foreground font-bold text-2xl">
                    Total for {travellers} {travellers === 1 ? "traveller" : "travellers"}: {currency}{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div ref={bookingRef} className="p-5 flex flex-col gap-3">

                <p className="text-xs font-bold text-grey uppercase tracking-wide mb-1">
                  Customise your trip
                </p>

                {/* Travel date */}
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
                        {dateSummary}
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

                {/* Travellers */}
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
                        {travellers} {travellers === 1 ? "Traveller" : "Travellers"}
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
                          <div className="text-sm font-semibold text-foreground">Travellers</div>
                          <div className="text-xs text-grey">All ages</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setTravellers(Math.max(1, travellers - 1))}
                            disabled={travellers <= 1}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                            aria-label="Decrease travellers"
                          >
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <span className="text-base font-bold text-foreground w-4 text-center">
                            {travellers}
                          </span>
                          <button
                            onClick={() => setTravellers(Math.min(12, travellers + 1))}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                            aria-label="Increase travellers"
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

                {/* Type-specific preference dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenPanel(openPanel === "preference" ? null : "preference")}
                    className={cn(
                      "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                      openPanel === "preference"
                        ? "border-primary ring-2 ring-primary/20 bg-card"
                        : "border-border bg-card hover:border-primary"
                    )}
                  >
                    {preferenceField.icon}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                        {preferenceField.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {preference}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-grey shrink-0 transition-transform",
                        openPanel === "preference" && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {openPanel === "preference" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {preferenceField.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setPreference(opt); setOpenPanel(null); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors flex items-center justify-between",
                            preference === opt ? "text-primary bg-primary/10" : "text-foreground"
                          )}
                        >
                          {opt}
                          {preference === opt && (
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
                  onClick={() => onBook(activity, travelDate, travellers, preference)}
                  className="w-full bg-primary hover:brightness-85 text-white font-bold text-base py-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  Start planning
                </button>
              </div>

            </div>
          </div>
          {/* END RIGHT COLUMN */}

        </div>
      </PageContainer>

      {/* Spacer so the mobile footer doesn't overlap last content */}
      <div className="lg:hidden h-28" />

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE BOTTOM SHEET — collapsed bar with price + CTA, expands to
          show the booking fields. Same UX as TourDetailPage.
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
              {currency}{activity.price.perPerson.toLocaleString()} per person
            </span>
            <span className="text-foreground font-bold text-base">
              Total for {travellers} {travellers === 1 ? "traveller" : "travellers"}: {currency}{totalPrice.toLocaleString()}
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

        {mobileSheetOpen && (<>
          <div className="px-5 pb-2 flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200">

            <p className="text-xs font-bold text-grey uppercase tracking-wide">
              Customise your trip
            </p>

            {/* Mobile travel date */}
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
                  <span className="text-xs font-semibold text-foreground truncate">{dateSummary}</span>
                </div>
                <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "date" && "rotate-180")} aria-hidden="true" />
              </button>

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

            {/* Mobile travellers */}
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
                    {travellers} {travellers === 1 ? "Traveller" : "Travellers"}
                  </span>
                </div>
                <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "guests" && "rotate-180")} aria-hidden="true" />
              </button>

              {openPanel === "guests" && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-card rounded-xl shadow-lg border border-border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Travellers</div>
                      <div className="text-xs text-grey">All ages</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTravellers(Math.max(1, travellers - 1))}
                        disabled={travellers <= 1}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
                        aria-label="Decrease travellers"
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="text-base font-bold text-foreground w-4 text-center">{travellers}</span>
                      <button
                        onClick={() => setTravellers(Math.min(12, travellers + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                        aria-label="Increase travellers"
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

            {/* Mobile preference */}
            <div className="relative">
              <button
                onClick={() => setOpenPanel(openPanel === "preference" ? null : "preference")}
                className={cn(
                  "h-[48px] rounded-lg border px-4 flex items-center gap-3 transition-colors w-full text-left",
                  openPanel === "preference"
                    ? "border-primary ring-2 ring-primary/20 bg-card"
                    : "border-border bg-card hover:border-primary"
                )}
              >
                {preferenceField.icon}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-grey uppercase tracking-wide leading-none mb-0.5">
                    {preferenceField.label}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{preference}</span>
                </div>
                <ChevronDown size={14} className={cn("text-grey shrink-0 transition-transform", openPanel === "preference" && "rotate-180")} aria-hidden="true" />
              </button>

              {openPanel === "preference" && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {preferenceField.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setPreference(opt); setOpenPanel(null); }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-primary/10 transition-colors flex items-center justify-between",
                        preference === opt ? "text-primary bg-primary/10" : "text-foreground"
                      )}
                    >
                      {opt}
                      {preference === opt && <Check size={14} className="text-primary" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="px-5 pb-4 pt-2">
            <button
              onClick={() => onBook(activity, travelDate, travellers, preference)}
              className="w-full bg-primary hover:brightness-85 text-white font-bold text-sm py-3.5 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              Start planning
            </button>
          </div>
        </>)}

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ALL PHOTOS MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={photosOpen} onOpenChange={setPhotosOpen}>
        <DialogContent className="max-w-[1040px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activity.title} — All photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="col-span-2">
              <ImageWithPlaceholder
                src={galleryImages[0]}
                alt={activity.title}
                aspectRatio="16/7"
                rounded="rounded-2xl"
              />
            </div>
            {[...dayImages, ...galleryImages.slice(1)]
              .filter((url, i, arr) => arr.indexOf(url) === i && url !== galleryImages[0])
              .map((url, i) => (
                <ImageWithPlaceholder
                  key={url}
                  src={url}
                  alt={`Activity photo ${i + 2}`}
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
// PortsTable — the ports of call shown on cruise / river-cruise pages.
//
// Each stop is its own small CARD in a vertical stack. The DAY TAG is the
// anchor of each card: a bold "Day N" badge on the left that the eye catches
// first, so the route reads as a clear sequence of days. The rest of the card
// layers down from there:
//
//   • Day badge   → the emphasised left-hand anchor ("DAY" + big number)
//   • Port name   → the bold hero of each card
//   • right chip  → arrival/departure times, OR an ocean "At sea" chip on a
//                   sea day (port.isSeaDay) using the cruise feature colour
//   • description → relaxed muted body text
// ─────────────────────────────────────────────────────────────────────────────
function PortsTable({ ports }: { ports: ActivityPort[] }) {
  return (
    // <ol> because the order of stops is meaningful (it's a route, day 1 → day N).
    // gap-3 puts a little air between the individual cards.
    <ol className="flex flex-col gap-3">
      {ports.map((port) => {
        const isSeaDay = !!port.isSeaDay;

        return (
          <li
            key={`${port.name}-${port.day}`}
            // The card shell — rounded, bordered, soft shadow. Every card looks
            // the same now; the "At sea" chip alone signals a sea day.
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            {/* Day badge — the emphasised anchor of the card. A stacked "DAY"
                label over a large bold number, in a tinted rounded box. min-w
                keeps every badge the same width so the cards line up neatly. */}
            <div className="flex min-w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 px-2 pt-1.5 pb-0.5 text-center leading-none text-primary">
              <span className="text-[10px] font-bold uppercase tracking-wider">Day</span>
              <span className="text-2xl font-bold">{port.day}</span>
            </div>

            {/* Card content. */}
            <div className="min-w-0 flex-1">
              {/* Header row — port name on the left; the chip on the right, on
                  one line so this reads across in a single glance. items-center
                  keeps the chip vertically aligned with the port name. */}
              <div className="flex items-center justify-between gap-3">
                {/* Port name — the hero of each card. Sea days have no port, so
                    we show a friendly label instead of a blank line. */}
                <h4 className="min-w-0 text-base font-bold text-foreground">
                  {isSeaDay ? "Relaxation day at sea" : port.name}
                </h4>

                {isSeaDay ? (
                  /* "At sea" chip — same shape as the time chip but in the
                     cruise feature colour with a wave icon, so a rest day reads
                     at a glance. */
                  <span
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold"
                    style={{ backgroundColor: `${CRUISE_ACCENT}1A`, color: CRUISE_ACCENT }} // 1A ≈ 10% opacity
                  >
                    <Waves size={12} aria-hidden="true" />
                    At sea
                  </span>
                ) : (
                  /* Time chip — one compact badge instead of two stacked lines.
                     Shows a range when the ship both arrives and departs, or a
                     single "Departs/Arrives" label for embark/disembark days. */
                  (port.arrives || port.departs) && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                      <Clock size={12} className="text-muted-foreground" aria-hidden="true" />
                      {port.arrives && port.departs
                        ? `${port.arrives} → ${port.departs}`
                        : port.departs
                          ? `Departs ${port.departs}`
                          : `Arrives ${port.arrives}`}
                    </span>
                  )
                )}
              </div>

              {/* Description — relaxed, muted body text. */}
              {port.description && (
                <p className="mt-1 text-sm">
                  {port.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CabinGrid — selectable cabin cards on cruise / river-cruise pages.
// The cheapest cabin gets a "Best value" badge in the top-left corner so
// budget-conscious travellers can spot it without scanning every price.
// ─────────────────────────────────────────────────────────────────────────────
function CabinGrid({
  cabins,
  currency,
  selected,
  onSelect,
}: {
  cabins: ActivityCabin[];
  currency: string;
  selected: string;
  onSelect: (name: string) => void;
}) {
  // Find the cheapest cabin by price. Skip the badge entirely when there's
  // only one cabin — "best value" is meaningless without a comparison.
  const cheapestName =
    cabins.length > 1
      ? cabins.reduce((min, c) => (c.pricePerPerson < min.pricePerPerson ? c : min)).name
      : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cabins.map((cabin) => {
        const isSelected = selected === cabin.name;
        const isCheapest = cabin.name === cheapestName;
        return (
          <div
            key={cabin.name}
            className={cn(
              // `relative` so the absolute-positioned "Best value" badge anchors here.
              // Selection styling mirrors the room cards on HotelDetailPage: always
              // border-2 (so selecting doesn't shift layout), with a black outline
              // and a lifted shadow when selected, transparent border otherwise.
              "relative bg-card rounded-xl shadow-sm hover:shadow-md overflow-hidden flex flex-col transition-all border-2",
              isSelected ? "border-foreground shadow-lg" : "border-transparent"
            )}
          >
            {/* "Best value" badge — only shown on the cheapest cabin */}
            {isCheapest && (
              <span
                className="absolute top-2 left-2 z-10 text-green-700 bg-green-50 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md"
              >
                Best value
              </span>
            )}
            <ImageWithPlaceholder
              src={cabin.image}
              alt={cabin.name}
              containerClassName="w-full h-[180px]"
            />
            <div className="p-4 flex flex-col gap-2 flex-1">
              <p className="text-base font-bold text-foreground">{cabin.name}</p>
              {cabin.description && (
                <p className="text-xs text-foreground leading-snug">{cabin.description}</p>
              )}
              {cabin.capacity && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Users size={12} aria-hidden="true" /> Up to {cabin.capacity} guests
                </p>
              )}
              <div className="flex items-end justify-between mt-auto pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">Per person from</span>
                  <span className="text-xl font-extrabold text-foreground leading-none">
                    {currency}{cabin.pricePerPerson.toLocaleString()}
                  </span>
                </div>
                {/* default = main action, secondary = already-selected
                    confirmation state — same pattern as the room cards */}
                <Button
                  onClick={() => onSelect(cabin.name)}
                  variant={isSelected ? "secondary" : "default"}
                  size="sm"
                  // Selected = solid light-gray bg + dark text (the secondary
                  // token's own colours). The bare secondary variant is
                  // transparent-until-hover, so we pin both bg and text here —
                  // including the hover states — so it stays stable.
                  className={cn(
                    isSelected &&
                      "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  {isSelected && <Check size={16} aria-hidden="true" />}
                  {isSelected ? "Selected" : "Choose cabin"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
