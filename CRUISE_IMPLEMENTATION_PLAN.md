# Cruise Booking Funnel — Implementation Plan for Claude Code

> **Context:** This plan adds a full Cruises tab to the TripBuilder Discovery prototype.
> It follows the same patterns as the existing Holidays, Hotels, Flights, and Activities tabs.
> Execute each step in order — later steps depend on earlier ones.

---

## Overview

We're building three new pages + updating two existing files to create a complete cruise booking flow:

```
Discovery (Cruises tab) → CruiseListPage → CruiseDetailPage → SmartPlanner
```

### UX Research Summary (MSC, Royal Caribbean, Disney, Norwegian)

The design is informed by how the top cruise companies handle search and booking:

- **Flexible browsing first** — Royal Caribbean and Norwegian lead with destination regions (Caribbean, Mediterranean, Alaska) rather than forcing date-first search. We'll do the same: show curated region cards and featured cruise cards on the Discovery tab, with an optional search form.
- **Card layout** — All major lines show: ship image, cruise line logo/name, destination route (e.g. "Barcelona → Rome → Santorini"), duration, departure date, and price-per-person prominently. We'll match this on CruiseCard.
- **Detail page structure** — MSC and Royal Caribbean use: hero image → itinerary with port-of-call map → cabin category picker → pricing sidebar. We'll mirror this with our existing sticky-tabs pattern from ActivityDetailPage/TourDetailPage.
- **Filters that matter** — Cruise line, destination region, duration, departure month, price range, and ship. These are the consistent filters across all major sites.

---

## Step 0 — Read before you start

Before writing any code, read these files to understand the existing patterns:

```
src/App.tsx                                          — routing + state management pattern
src/types/index.ts                                   — how Activity/Tour types are structured
src/modules/smartPlanner/pages/DiscoveryPage.tsx      — tab system + search forms
src/modules/smartPlanner/pages/ActivityListPage.tsx   — list page with filters + map (closest pattern)
src/modules/smartPlanner/pages/ActivityDetailPage.tsx — detail page with sticky tabs (closest pattern)
src/modules/smartPlanner/components/ActivityCard.tsx  — card component pattern
src/modules/smartPlanner/components/ActivitySearchForm.tsx — search form pattern
src/mocks/activities.ts                              — mock data structure
src/styles/theme.css                                 — design tokens
```

---

## Step 1 — Add Cruise types to `src/types/index.ts`

**What:** Define the TypeScript types for cruise data.
**Pattern:** Follow how `Activity`, `ActivityPort`, and `ActivityCabin` are structured, but make cruise-specific.

Add these types at the bottom of the file:

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Cruise Types
//
// A Cruise is a ship-based voyage with a fixed itinerary of ports. Unlike
// Activity (which covers many experience types), Cruise is a dedicated
// first-class entity with its own search, list, and detail pages.
// ─────────────────────────────────────────────────────────────────────────────

// The cruise line operating the ship
export type CruiseLine =
  | "MSC Cruises"
  | "Royal Caribbean"
  | "Disney Cruise Line"
  | "Norwegian Cruise Line"
  | "Celebrity Cruises"
  | "Costa Cruises"
  | "TUI Cruises";

// Regions for browsing/filtering
export type CruiseRegion =
  | "Caribbean"
  | "Mediterranean"
  | "Northern Europe"
  | "Alaska"
  | "Asia"
  | "South Pacific"
  | "Transatlantic";

// One port stop on the itinerary
export interface CruisePort {
  name: string;           // e.g. "Barcelona, Spain"
  day: number;            // Day number in the cruise (1-based)
  arrives?: string;       // "08:00" — undefined for embarkation port
  departs?: string;       // "17:00" — undefined for disembarkation port
  isSeaDay?: boolean;     // true for "At Sea" days
  description?: string;   // 1-2 sentence port blurb
  lat?: number;           // For map pin placement
  lng?: number;
}

// A bookable cabin category
export interface CruiseCabin {
  id: string;
  name: string;             // e.g. "Balcony Stateroom"
  category: "Interior" | "Ocean View" | "Balcony" | "Suite";
  pricePerPerson: number;
  image: string;
  description?: string;     // 1-line feature summary
  capacity: number;         // max guests
  sqMeters?: number;        // cabin size
}

// One available departure date with pricing
export interface CruiseDeparture {
  date: string;             // ISO "YYYY-MM-DD"
  pricePerPerson: number;   // Cheapest cabin for this date
  available: boolean;
}

// The top-level Cruise object
export interface Cruise {
  cruiseId: string;
  cruiseLine: CruiseLine;
  shipName: string;
  title: string;              // e.g. "Western Mediterranean Explorer"
  subtitle: string;           // 1-2 sentence description
  region: CruiseRegion;
  route: string;              // e.g. "Barcelona → Marseille → Rome → Naples → Barcelona"

  mainImage: string;
  gallery: string[];
  shipImage?: string;         // Photo of the ship itself

  durationNights: number;
  departurePort: string;      // e.g. "Barcelona, Spain"

  // Next available departure (for card display)
  nextDeparture: string;      // Display string e.g. "Jul 12, 2026"
  departures: CruiseDeparture[];  // All available dates

  price: {
    fromPerPerson: number;    // Cheapest starting price
    currency: string;
  };

  rating: { score: number; reviewCount: number };

  // Itinerary
  ports: CruisePort[];

  // Cabin options
  cabinTypes: CruiseCabin[];

  // Content sections
  highlights: string[];
  included: string[];
  excluded: string[];

  // Ship amenities shown as pills
  shipAmenities: string[];

  // For map display — use first/last port coordinates or route center
  lat?: number;
  lng?: number;
}

// Search criteria from the Cruises tab search form
export interface CruiseSearchCriteria {
  region: CruiseRegion | "";
  cruiseLine: CruiseLine | "";
  departureMonth: string;       // "YYYY-MM" or "" for any
  durationRange: "any" | "short" | "week" | "long";  // any / 2-5 / 6-9 / 10+
  passengers: number;
}
```

---

## Step 2 — Create mock cruise data: `src/mocks/cruises.ts`

**What:** Create 6-8 mock cruises covering different regions and cruise lines.
**Pattern:** Follow `src/mocks/activities.ts` structure.

Create mock cruises with these specific examples (use Unsplash images for all photos):

1. **Western Mediterranean** — MSC Cruises, MSC Virtuosa, 7 nights, Barcelona roundtrip. Ports: Barcelona → Marseille → Genoa → Rome (Civitavecchia) → Palma de Mallorca → Barcelona.
2. **Caribbean Island Hopping** — Royal Caribbean, Wonder of the Seas, 7 nights, Miami. Ports: Miami → CocoCay → St. Thomas → St. Maarten → Miami.
3. **Disney Magic at Sea** — Disney Cruise Line, Disney Wish, 4 nights, Port Canaveral. Ports: Port Canaveral → Nassau → Castaway Cay → Port Canaveral.
4. **Norwegian Fjords** — Norwegian Cruise Line, Norwegian Star, 10 nights, Southampton. Ports: Southampton → Bergen → Geiranger → Ålesund → Stavanger → Southampton.
5. **Greek Islands & Turkey** — Celebrity Cruises, Celebrity Beyond, 7 nights, Athens (Piraeus). Ports: Piraeus → Mykonos → Kusadasi → Santorini → Rhodes → Piraeus.
6. **Alaska Inside Passage** — Royal Caribbean, Quantum of the Seas, 7 nights, Seattle. Ports: Seattle → Juneau → Skagway → Glacier Bay → Ketchikan → Seattle.

For each cruise, include:
- 4 gallery images (Unsplash: destination scenery, ship interiors, port towns)
- 4 cabin types: Interior ($800-1200pp), Ocean View ($1000-1500pp), Balcony ($1400-2000pp), Suite ($2500-4000pp)
- 3-6 departure dates spread across summer/autumn 2026
- Realistic port coordinates for Leaflet map
- 5-8 ship amenities (e.g. "Swimming pools", "Kids' club", "Spa & wellness", "Casino", "Theatre shows", "Specialty dining", "Fitness centre", "Rock climbing wall")

Export all cruises as `ALL_CRUISES` array and individually by name.

Also export:

```typescript
// Region cards for the Discovery tab hero section
export const CRUISE_REGIONS = [
  { id: "caribbean",       label: "Caribbean",        emoji: "🌴", image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=500&fit=crop", cruiseCount: 24 },
  { id: "mediterranean",   label: "Mediterranean",    emoji: "🏛️", image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=500&fit=crop", cruiseCount: 31 },
  { id: "northern-europe", label: "Northern Europe",   emoji: "🏔️", image: "https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=800&h=500&fit=crop", cruiseCount: 18 },
  { id: "alaska",          label: "Alaska",            emoji: "🐻", image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&h=500&fit=crop", cruiseCount: 12 },
  { id: "asia",            label: "Asia",              emoji: "⛩️", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop", cruiseCount: 15 },
  { id: "south-pacific",   label: "South Pacific",     emoji: "🌺", image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=500&fit=crop", cruiseCount: 9 },
];

// Featured cruises shown on Discovery tab (subset of ALL_CRUISES for the carousel)
export const FEATURED_CRUISES = ALL_CRUISES.slice(0, 4);
```

---

## Step 3 — Create `CruiseSearchForm` component

**File:** `src/modules/smartPlanner/components/CruiseSearchForm.tsx`

**What:** Search form with two variants (hero + compact), same pattern as `ActivitySearchForm.tsx`.

**Inputs (4 fields):**
1. **Region** — dropdown with CRUISE_REGIONS options + "Any region"
2. **When** — month picker (simpler than DayPicker — just show a grid of months like "Jul 2026", "Aug 2026", etc.)
3. **Duration** — dropdown: "Any length", "2-5 nights", "6-9 nights", "10+ nights"
4. **Passengers** — counter (same +/- pattern as ActivitySearchForm)

**Variant behaviour:**
- `variant="hero"` — large fields (h-[52px]), full "Search cruises" button with text
- `variant="compact"` — smaller fields (h-[48px]), icon-only search button

**Design notes:**
- Use the 🚢 Ship icon from lucide-react as the tab icon
- Follow the exact same dropdown/popover patterns as ActivitySearchForm
- The form calls `onSearch(criteria: CruiseSearchCriteria)` on submit

---

## Step 4 — Create `CruiseCard` component

**File:** `src/modules/smartPlanner/components/CruiseCard.tsx`

**What:** A result card for the CruiseListPage. Same responsive layout as ActivityCard.

**Layout (mirrors ActivityCard):**
- Below 680px: image full-width on top, details below (vertical)
- At 680px+: fixed 260px image on left, details on right (horizontal)

**Card content (cruise-specific info):**
- **Top-left badge** on image: Cruise line name (e.g. "MSC Cruises") with Ship icon
- **Image**: mainImage with ImageWithPlaceholder
- **Title**: cruise title (e.g. "Western Mediterranean Explorer")
- **Ship name**: in muted text below title (e.g. "MSC Virtuosa")
- **Route string**: with MapPin icon (e.g. "Barcelona → Marseille → Rome → Naples")
- **Meta row**: Duration (🌙 7 nights) · Departure (📅 Jul 12, 2026) · Rating (⭐ 4.6)
- **Amenity pills**: First 3-4 ship amenities as small badges
- **Price**: "from $899 per person" right-aligned, prominent
- **CTA button**: "View cruise" in primary colour

**Interactions:**
- `onSelect(cruise)` when clicked
- `onHover(isHovering)` for map marker coordination
- `isHovered` prop for external highlight (from map hover)

---

## Step 5 — Create `CruiseListPage`

**File:** `src/modules/smartPlanner/pages/CruiseListPage.tsx`

**What:** Search results page with split layout (cards left, map right). Mirror `ActivityListPage.tsx` exactly.

**Layout:**
- Top: BackButton + CruiseSearchForm (compact variant) for refining
- Below: horizontal filter pills row + result count
- Main: left side = scrollable card list, right side = Leaflet map with port pins

**Filter pills (same dropdown pattern as ActivityListPage):**
1. **Sort** — Recommended / Price ↑ / Price ↓ / Top rated / Shortest / Longest
2. **Cruise line** — multi-select checkboxes (MSC, Royal Caribbean, Disney, etc.)
3. **Region** — multi-select (Caribbean, Mediterranean, etc.)
4. **Duration** — 2-5 nights / 6-9 nights / 10+ nights
5. **Price** — dual-handle slider (same as ActivityListPage)

**Map behaviour:**
- Show markers for each cruise result (use the cruise's lat/lng or first port's coords)
- Hovering a card highlights the marker, hovering a marker highlights the card
- Clicking a marker scrolls to / selects that card

**Loading state:**
- Show 3 SkeletonCards for 1.5s on mount (same pattern as ActivityListPage)
- Use StaggeredList for the reveal animation

**Data source:** Filter and sort from `ALL_CRUISES` imported from mocks.

**Props:**
```typescript
type CruiseListPageProps = {
  searchCriteria: CruiseSearchCriteria;
  onViewDetail: (cruise: Cruise) => void;
  onBack: () => void;
  onRefineSearch: (criteria: CruiseSearchCriteria) => void;
};
```

---

## Step 6 — Create `CruiseDetailPage`

**File:** `src/modules/smartPlanner/pages/CruiseDetailPage.tsx`

**What:** Full detail page with sticky tabs. Mirror `ActivityDetailPage.tsx` for cruises.

**Hero section:**
- Full-width hero image (mainImage) with gradient overlay
- Cruise line badge (top-left)
- Title, subtitle, ship name
- Quick stats row: duration · departure port · next departure · rating
- Gallery button (opens modal grid, same as ActivityDetailPage)

**Sticky tab sections:**
1. **Overview** — attribute pills (Cruise line, Ship, Departure port, Duration, Region), description
2. **Itinerary** — Port-of-call list with day numbers, arrival/departure times, and descriptions. Include a Leaflet route map showing the cruise route with connected markers (use TourRouteMapInline). Sea days shown as a subtle divider row.
3. **Cabins** — Grid of cabin category cards (Interior, Ocean View, Balcony, Suite). Each shows: image, name, price, capacity, size. Selected cabin highlighted with primary border.
4. **Ship** — Ship amenities as a grid of icon+label cards. Ship image if available.
5. **What's Included** — included/excluded lists (reuse InfoList component)

**Booking sidebar (desktop) / bottom sheet (mobile):**
- Same pattern as ActivityDetailPage/TourDetailPage
- Fields: Departure date (calendar picker showing available dates from `departures[]`), Passengers (counter), Cabin type (dropdown from `cabinTypes[]`)
- Price display: updates based on selected cabin + departure date
- CTA: "Book this cruise" → calls `onBook()`

**Props:**
```typescript
type CruiseDetailPageProps = {
  cruise: Cruise;
  backLabel?: string;
  onBack: () => void;
  onBook: (cruise: Cruise, departureDate: string, passengers: number, cabinId: string) => void;
};
```

---

## Step 7 — Add Cruises tab to `DiscoveryPage.tsx`

**What:** Add "Cruises" as a new tab alongside Holidays, Hotels, Flights, Activities.

**Changes needed:**

1. **Update `TabId` type** — add `"cruises"` to the union
2. **Add tab to `TABS` array** — `{ id: "cruises", label: "Cruises", icon: <Ship size={20} /> }`. Place it after Holidays and before Hotels (cruises are a major product category).
3. **Add `onCruiseSearch` prop** to `DiscoveryPageProps`
4. **Import** `CruiseSearchForm` and `CRUISE_REGIONS`, `FEATURED_CRUISES` from mocks
5. **Render the Cruises tab content** in the tab panel area. Structure:

### Cruises tab content layout:

**A) Search form** — CruiseSearchForm variant="hero" at the top

**B) Browse by region** — horizontal scroll of region cards (similar to destination cards on Holidays tab):
- Each card: background image, region name, emoji, cruise count ("24 cruises")
- Clicking a region card triggers search with that region pre-filled
- Cards should have a gradient text overlay at the bottom

**C) Featured cruises** — "Popular cruises" section with 3-4 cruise cards in a horizontal scroll:
- Use a simplified card format (not the full CruiseCard): image, title, ship name, route, duration, price
- Each card: 280px wide, aspect-ratio image on top, info below
- Clicking navigates to CruiseListPage with no filters (shows all results, or pre-filtered if from region click)

**D) Cruise lines section** — "Browse by cruise line" row of logo/name pills:
- Each pill: cruise line name as text (we don't have logos in the prototype)
- Clicking a cruise line pill triggers search with that line pre-filled

---

## Step 8 — Wire up routing in `App.tsx`

**Changes needed:**

1. **Add to `currentPage` union:**
   ```typescript
   | "cruise-list"
   | "cruise-detail"
   ```

2. **Add state variables:**
   ```typescript
   const [cruiseSearchCriteria, setCruiseSearchCriteria] = useState<CruiseSearchCriteria>({
     region: "",
     cruiseLine: "",
     departureMonth: "",
     durationRange: "any",
     passengers: 2,
   });
   const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
   ```

3. **Add handler functions** (follow the exact pattern of `handleActivitySearch`, `handleActivitySelect`, etc.):
   ```typescript
   // Cruises tab: submit search → CruiseListPage
   const handleCruiseSearch = (criteria: CruiseSearchCriteria) => {
     setCruiseSearchCriteria(criteria);
     setCurrentPage("cruise-list");
     window.scrollTo(0, 0);
   };

   // CruiseListPage: refine search in-place
   const handleRefineCruiseSearch = (criteria: CruiseSearchCriteria) => {
     setCruiseSearchCriteria(criteria);
   };

   // CruiseListPage: click a cruise → CruiseDetailPage
   const handleCruiseSelect = (cruise: Cruise) => {
     setSelectedCruise(cruise);
     setCurrentPage("cruise-detail");
     window.scrollTo(0, 0);
   };
   ```

4. **Add screen renders** in the return JSX (follow the pattern of activity screens):
   ```tsx
   {currentPage === "cruise-list" && (
     <CruiseListPage
       searchCriteria={cruiseSearchCriteria}
       onViewDetail={handleCruiseSelect}
       onBack={handleBack}
       onRefineSearch={handleRefineCruiseSearch}
     />
   )}

   {currentPage === "cruise-detail" && selectedCruise && (
     <CruiseDetailPage
       cruise={selectedCruise}
       backLabel="Back to all cruises"
       onBack={() => { setCurrentPage("cruise-list"); window.scrollTo(0, 0); }}
       onBook={(cruise, departureDate, passengers, cabinId) => {
         setStartingContext({
           type: "cruise",
           cruise: {
             title: cruise.title,
             shipName: cruise.shipName,
             cruiseLine: cruise.cruiseLine,
             route: cruise.route,
             duration: `${cruise.durationNights} nights`,
             departureDate,
             price: `${cruise.price.currency === "USD" ? "$" : "£"}${cruise.price.fromPerPerson}`,
             image: cruise.mainImage,
           },
         });
         setCurrentPage("smart-planner");
         window.scrollTo(0, 0);
       }}
     />
   )}
   ```

5. **Pass `onCruiseSearch` to DiscoveryPage:**
   ```tsx
   <DiscoveryPage
     ... existing props ...
     onCruiseSearch={handleCruiseSearch}
   />
   ```

6. **Add imports** at the top for CruiseListPage, CruiseDetailPage, and Cruise/CruiseSearchCriteria types.

---

## Step 9 — Cruise-specific design flair

Since Paula asked for "TripBuilder + cruise flair", apply these subtle touches:

1. **Cruise accent colour** — Use a deep ocean blue (`#0e4d92`) as an accent for cruise-specific elements (badges, route lines on map, cabin category headers). Apply this via a CSS class or inline, NOT by changing the design system tokens.

2. **Route visualisation** — On CruiseCard, show the port route as a horizontal chain: small dots connected by a line, with the first and last port labeled. This is a visual signature that immediately says "this is a cruise".

3. **Night count instead of days** — Cruises use "nights" not "days" (industry convention). Use a Moon icon (🌙) instead of Clock for duration.

4. **Sea day indicators** — In the itinerary on CruiseDetailPage, sea days (no port) get a special wave-pattern row with a Waves icon and "Relaxation at sea" label.

5. **Cabin comparison feel** — The cabin grid on the detail page should feel like a pricing table: 4 columns (Interior / Ocean View / Balcony / Suite), each with image, features, and prominent price. The cheapest cabin has a "Best value" badge.

---

## Step 10 — Verify and test

After all steps are complete:

1. Run `npm run dev` and verify the app compiles without errors
2. Check the Discovery page — the Cruises tab should appear and show:
   - Search form
   - Region cards (horizontal scroll)
   - Featured cruise cards
3. Submit a search → CruiseListPage should show:
   - Filter pills working
   - Cruise cards rendering
   - Map with markers
4. Click a cruise card → CruiseDetailPage should show:
   - Hero with gallery
   - Sticky tabs (Overview, Itinerary, Cabins, Ship, Included)
   - Booking sidebar/sheet
5. Click "Book this cruise" → SmartPlanner should load
6. Test mobile viewport (< 768px) — all pages should be responsive

---

## File dependency order

Execute in this order to avoid import errors:

```
1. types/index.ts           (no deps)
2. mocks/cruises.ts         (depends on types)
3. CruiseSearchForm.tsx     (depends on types)
4. CruiseCard.tsx           (depends on types, CruiseSearchForm for type metadata)
5. CruiseListPage.tsx       (depends on all above + shared components)
6. CruiseDetailPage.tsx     (depends on all above + shared components)
7. DiscoveryPage.tsx        (depends on CruiseSearchForm + mocks)
8. App.tsx                  (depends on all pages + types)
```

---

## Reusable components (already exist — just import them)

These shared components from the codebase should be reused:

| Component | Location | Use for |
|---|---|---|
| `BackButton` | `shared/components/BackButton` | All page back navigation |
| `ImageWithPlaceholder` | `shared/components/loading` | All images (hero, cards, gallery) |
| `SkeletonCard` | `shared/components/loading` | Loading state on list page |
| `StaggeredList` | `shared/components/loading` | Card reveal animation |
| `LeafletMap` | `shared/components/LeafletMap` | Map on list + detail pages |
| `TourRouteMapInline` | `components/TourRouteMap` | Route map in itinerary section |
| `DayByDaySection` | `components/DayByDaySection` | Could adapt for port itinerary |
| `InfoList` | `components/InfoList` | Included/Excluded sections |
| `Dialog` | `shared/components/ui/dialog` | Gallery modal |
| `cn` | `shared/components/ui/utils` | Class merging utility |
| `AccommodationStar` | `shared/components/AccommodationStar` | Star ratings if needed |

---

## Notes for Claude Code

- This prototype uses **mock data only** — no API calls needed
- Use **Tailwind CSS** for all styling — no inline styles
- Use **shadcn/ui** components where they exist (Dialog, Badge, etc.)
- Use **Framer Motion** for animations (same as existing pages)
- Use **lucide-react** for all icons
- Use **ImageWithPlaceholder** for all images (don't use bare `<img>` tags)
- Follow the **comment style** from existing files — each file starts with a block comment explaining what it does
- Keep TypeScript types **simple** — basic types, no generics gymnastics
- **Unsplash images** — use `?w=800&h=600&fit=crop&auto=format` for card images, `?w=1600&q=80` for hero images
