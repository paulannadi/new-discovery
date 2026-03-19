# Nezasa Dynamic Packaging — Unified Supply Prototype Plan
> **For Claude Code** — Prototype implementation only. Target project: `My set up` (local React app).
> **Goal:** Build a fully interactive prototype of the unified cache + live supply UX inside the existing `My set up` project, with all backend calls mocked locally.
> **Companion doc:** `DP-Unified-Supply-Implementation-Plan.md` covers the real TripBuilder production implementation.
> **Last updated:** March 2026

---

## What This Plan Is

This plan builds a **clickable, interactive prototype** of the full unified Dynamic Packaging experience. It is **not** connected to any Nezasa backend — all supply data, destinations, and prices come from mock files inside the project. The purpose is to:

1. Validate the full UX flow end-to-end before engineering picks it up
2. Give stakeholders a demo they can click through
3. Serve as a living visual spec alongside `DP-Unified-Supply-Implementation-Plan.md`

---

## Existing State of the Project

The following work has already been done in `My set up`. Do not redo it — build on top of it.

### Already implemented
- `src/App.tsx` — `HolidaySearchCriteria` type (includes `isCachedDestination`, `dateMode`, `selectedMonths`), `handleRefineHolidaySearch`, routing between pages
- `src/modules/smartPlanner/components/PackageSearchForm.tsx` — shared search form with `variant="hero"` / `variant="compact"`, destination dropdown with "Popular" badge, date mode toggle, flexible month grid with mock prices
- `src/modules/smartPlanner/pages/DiscoveryPage.tsx` — uses `<PackageSearchForm variant="hero" />`
- `src/modules/smartPlanner/pages/HolidayListPage.tsx` — uses `<PackageSearchForm variant="compact" initialValues={searchCriteria} />`, package card list, filters panel, map placeholder

### What is missing (this plan fills the gap)
- Mock data files for packages (cached + live)
- The simulated SSE streaming hook (`useUnifiedSearch`)
- Progressive merge logic (`mergeDeduplicated`)
- Live search progress banner
- `PackageCard` source-awareness (`sourceMode` field)
- Hotel Detail page dual-mode (rate calendar vs. Package Details panel)
- Animated list updates as "live" results arrive

---

## Project Structure After This Plan

```
My set up/src/
├── App.tsx                                  ← already done
├── mocks/
│   ├── destinations.ts                      ← NEW: mock destination list with isCached flag
│   ├── monthlyPrices.ts                     ← NEW: mock monthly prices per destination
│   └── packages/
│       ├── cachedPackages.ts                ← NEW: mock cached UnifiedPackage[]
│       └── livePackages.ts                  ← NEW: mock live UnifiedPackage[] (arrives later)
└── modules/smartPlanner/
    ├── components/
    │   ├── PackageSearchForm.tsx             ← already done
    │   ├── PackageCard.tsx                  ← NEW (or extend if exists)
    │   ├── LiveSearchProgressBanner.tsx     ← NEW
    │   └── HotelDetailModal.tsx             ← NEW: rate calendar OR package details panel
    ├── hooks/
    │   └── useUnifiedSearch.ts              ← NEW: simulated SSE hook
    ├── utils/
    │   └── mergeDeduplicated.ts             ← NEW
    └── pages/
        ├── DiscoveryPage.tsx                ← already done
        └── HolidayListPage.tsx              ← already done (extend for live banner + animation)
```

---

## Data Types

These types are already defined in `src/App.tsx`. Do not redefine them — import from there.

```typescript
// Already in App.tsx — import, don't redefine:
export type HolidaySearchCriteria = {
  from: string;
  to: string;
  isCachedDestination: boolean;
  dateMode: "specific" | "flexible";
  dateRange: DateRange | undefined;
  selectedMonths: string[];
  nights: number;
  adults: number;
  children: number;
};
```

Add the `UnifiedPackage` type to `src/types/index.ts` (create this file):

```typescript
// src/types/index.ts

export interface UnifiedPackage {
  packageId: string;
  sourceMode: 'cache' | 'live';
  deduplicationKey: string;       // `${giataId}_${outboundFlight}_${returnFlight}_${departureDate}`
  hotel: {
    giataId: string;
    name: string;
    category: number;             // star rating
    mainImage: string;
    trustYou: {
      rating: number;
      recommendationScore: number;
      reviewCount: number;
    };
    amenities: string[];
    location: string;
  };
  room: {
    roomType: string;
    boardType: string;
  };
  flights: {
    outbound: FlightLeg;
    return: FlightLeg;
  };
  price: {
    perPerson: number;
    total: number;
    currency: string;
  };
  rateCalendar?: RateCalendarEntry[];  // only populated for cached packages
}

export interface FlightLeg {
  carrier: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;          // ISO 8601
  arrivalTime: string;
  durationMinutes: number;
}

export interface RateCalendarEntry {
  departureDate: string;          // YYYY-MM-DD
  pricePerPerson: number;
  available: boolean;
}
```

---

## Mock Data Files

### `src/mocks/destinations.ts`

Extend the destinations already present in `PackageSearchForm.tsx`. The mock file should export the canonical list so both `PackageSearchForm` and other components import from one place. Update `PackageSearchForm.tsx` to import from here instead of using an inline array.

```typescript
export interface DestinationOption {
  code: string;
  label: string;
  isCached: boolean;
  heroImage?: string;
}

export const DESTINATIONS: DestinationOption[] = [
  // Cached — appear under "Popular"
  { code: "CANCUN",   label: "Cancún, Mexico",       isCached: true  },
  { code: "ORLANDO",  label: "Orlando, USA",          isCached: true  },
  { code: "DUBAI",    label: "Dubai, UAE",             isCached: true  },
  { code: "BALI",     label: "Bali, Indonesia",        isCached: true  },
  { code: "MALDIVES", label: "Maldives",               isCached: true  },
  { code: "TENERIFE", label: "Tenerife, Spain",        isCached: true  },
  { code: "MALLORCA", label: "Mallorca, Spain",        isCached: true  },
  // Non-cached — appear under "All destinations"
  { code: "PHUKET",   label: "Phuket, Thailand",      isCached: false },
  { code: "LISBON",   label: "Lisbon, Portugal",       isCached: false },
  { code: "MIAMI",    label: "Miami, USA",             isCached: false },
];
```

### `src/mocks/monthlyPrices.ts`

```typescript
// Keyed by destination code, then month "YYYY-MM"
export const MONTHLY_PRICES: Record<string, Record<string, number | null>> = {
  CANCUN: {
    "2026-04": 799,  "2026-05": 849,  "2026-06": null,
    "2026-07": 1249, "2026-08": 1199, "2026-09": 849,
    "2026-10": 799,  "2026-11": 899,  "2026-12": 1099,
    "2027-01": 1149, "2027-02": 1099, "2027-03": 949,
  },
  DUBAI: {
    "2026-04": 1299, "2026-05": null, "2026-06": null,
    "2026-07": null, "2026-08": null, "2026-09": 1199,
    "2026-10": 999,  "2026-11": 1049,"2026-12": 1399,
    "2027-01": 1299, "2027-02": 1249,"2027-03": 1099,
  },
  // Add entries for ORLANDO, BALI, MALDIVES, TENERIFE, MALLORCA with realistic pricing
};
```

### `src/mocks/packages/cachedPackages.ts`

Create 6–8 realistic `UnifiedPackage` objects with `sourceMode: 'cache'` and a populated `rateCalendar` array (5–6 dates per package, 30–40 days ahead). Use Cancún as the default destination for the demo. Use real-sounding hotel names, IATA codes (LHR→CUN), and plausible pricing (£799–£1,499 pp).

### `src/mocks/packages/livePackages.ts`

Create 4–6 `UnifiedPackage` objects with `sourceMode: 'live'` and **no** `rateCalendar`. Include:
- **2 packages that share a `deduplicationKey` with a cached package** (same giataId + flight combo) — these will replace their cached counterparts when "live results arrive", demonstrating deduplication
- **3–4 packages with unique `deduplicationKey`** — these will be appended as new results from live supply

---

## Task 1 — Types and Mock Data Files

Create `src/types/index.ts` with `UnifiedPackage`, `FlightLeg`, and `RateCalendarEntry` as defined above. Create the four mock data files: `destinations.ts`, `monthlyPrices.ts`, `cachedPackages.ts`, `livePackages.ts`. Update `PackageSearchForm.tsx` to import `DESTINATIONS` and `MONTHLY_PRICES` from the mock files instead of using inline arrays.

Verify: `tsc --noEmit` passes with no new errors.

---

## Task 2 — `mergeDeduplicated` Utility

Create `src/modules/smartPlanner/utils/mergeDeduplicated.ts`:

```typescript
import { UnifiedPackage } from '../../../types';

export function mergeDeduplicated(
  existing: UnifiedPackage[],
  incoming: UnifiedPackage[]
): UnifiedPackage[] {
  const map = new Map(existing.map(p => [p.deduplicationKey, p]));

  for (const pkg of incoming) {
    map.set(pkg.deduplicationKey, pkg); // replaces if key exists, appends if new
  }

  const result: UnifiedPackage[] = [];
  const seen = new Set<string>();

  for (const pkg of existing) {
    result.push(map.get(pkg.deduplicationKey)!);
    seen.add(pkg.deduplicationKey);
  }

  for (const [key, pkg] of map) {
    if (!seen.has(key)) result.push(pkg);
  }

  return result;
}
```

Write a quick test in the same file (or a `__tests__` folder) covering: (a) live package appended, (b) live package replaces cached match, (c) order of original packages preserved.

---

## Task 3 — `useUnifiedSearch` Hook (Simulated SSE)

Create `src/modules/smartPlanner/hooks/useUnifiedSearch.ts`.

This hook **simulates** the SSE stream using `setTimeout` instead of a real `EventSource`. The sequence mimics what the real backend would do:

```typescript
import { useState, useEffect } from 'react';
import { UnifiedPackage } from '../../../types';
import { HolidaySearchCriteria } from '../../../App';
import { mergeDeduplicated } from '../utils/mergeDeduplicated';
import { CACHED_PACKAGES } from '../../../mocks/packages/cachedPackages';
import { LIVE_PACKAGES } from '../../../mocks/packages/livePackages';

interface UnifiedSearchState {
  packages: UnifiedPackage[];
  isLiveLoading: boolean;
  liveProgress: { completed: number; total: number } | null;
  error: string | null;
}

export function useUnifiedSearch(criteria: HolidaySearchCriteria): UnifiedSearchState {
  const [state, setState] = useState<UnifiedSearchState>({
    packages: [],
    isLiveLoading: false,
    liveProgress: null,
    error: null,
  });

  useEffect(() => {
    // Reset state on new search
    setState({ packages: [], isLiveLoading: false, liveProgress: null, error: null });

    // Step 1 — cached results arrive immediately (simulated 200ms network delay)
    const t1 = setTimeout(() => {
      setState(prev => ({
        ...prev,
        packages: CACHED_PACKAGES,
        isLiveLoading: criteria.isCachedDestination, // only load live if cached destination
        liveProgress: criteria.isCachedDestination
          ? { completed: 0, total: 3 }
          : null,
      }));
    }, 200);

    if (!criteria.isCachedDestination) return () => clearTimeout(t1);

    // Step 2 — first live supplier responds (simulated 2s delay)
    const t2 = setTimeout(() => {
      setState(prev => ({
        ...prev,
        liveProgress: { completed: 1, total: 3 },
      }));
    }, 2000);

    // Step 3 — second live supplier responds with first batch of results (simulated 3.5s)
    const t3 = setTimeout(() => {
      const firstBatch = LIVE_PACKAGES.slice(0, 3);
      setState(prev => ({
        ...prev,
        packages: mergeDeduplicated(prev.packages, firstBatch),
        liveProgress: { completed: 2, total: 3 },
      }));
    }, 3500);

    // Step 4 — third live supplier responds with remaining results (simulated 5s)
    const t4 = setTimeout(() => {
      const secondBatch = LIVE_PACKAGES.slice(3);
      setState(prev => ({
        ...prev,
        packages: mergeDeduplicated(prev.packages, secondBatch),
        isLiveLoading: false,
        liveProgress: null,
      }));
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [
    criteria.from,
    criteria.to,
    criteria.isCachedDestination,
    criteria.dateMode,
    JSON.stringify(criteria.selectedMonths),
    JSON.stringify(criteria.dateRange),
    criteria.nights,
    criteria.adults,
    criteria.children,
  ]);

  return state;
}
```

Verify: importing this hook in a test component and triggering a search shows the correct sequence of state changes in React DevTools.

---

## Task 4 — `LiveSearchProgressBanner` Component

Create `src/modules/smartPlanner/components/LiveSearchProgressBanner.tsx`:

```tsx
interface LiveSearchProgressBannerProps {
  progress: { completed: number; total: number } | null;
}

export function LiveSearchProgressBanner({ progress }: LiveSearchProgressBannerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 mt-3">
      {/* Animated spinner */}
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      <span>
        {progress && progress.total > 0
          ? `Searching more suppliers… (${progress.completed} of ${progress.total} complete)`
          : 'Searching more suppliers…'}
      </span>
    </div>
  );
}
```

---

## Task 5 — `PackageCard` Component

Create (or extend) `src/modules/smartPlanner/components/PackageCard.tsx` to accept a `UnifiedPackage` and render it. Match the visual style already used in `HolidayListPage.tsx` for existing cards. Key requirements:

- Display hotel name, star rating, TrustYou score, room type, board type, amenity chips, location, price per person
- Show the departure date from `flights.outbound.departureTime` (format as "Tue, Apr 28 – Tue, May 5")
- A "View details" / "Select" button that calls an `onSelect?: (pkg: UnifiedPackage) => void` prop
- **No visible "Cached" or "Live" badge** — the source is invisible to the user
- Subtle **fade-in animation on mount** using a CSS transition or Tailwind's `animate-fade-in` (add a keyframe if not already in Tailwind config): `transition-all duration-200 ease-out`

---

## Task 6 — Wire `useUnifiedSearch` into `HolidayListPage`

Update `HolidayListPage.tsx` to use the new hook and components:

1. Import `useUnifiedSearch` and call it with the current `searchCriteria`
2. Replace the existing static/hardcoded package list with the `packages` array from the hook
3. Add `<LiveSearchProgressBanner progress={liveProgress} />` below the last `PackageCard`, visible only when `isLiveLoading === true`
4. Pass each `UnifiedPackage` to a `<PackageCard>` component
5. On `PackageCard`'s `onSelect`, set a local `selectedPackage` state and open the `HotelDetailModal`

The list should update in real time as the simulated live results arrive (watch the state change at t=3.5s and t=5s).

---

## Task 7 — `HotelDetailModal` — Dual Mode

Create `src/modules/smartPlanner/components/HotelDetailModal.tsx`. This is a full-screen or large modal that renders differently based on `package.sourceMode`:

### When `sourceMode === 'cache'` — Rate Calendar

```
┌─────────────────────────────────────────────────────────────┐
│ [Hotel photos]                                              │
│                                                             │
│ Hotel Name ★★★★                    ┌─────────────────────┐ │
│ TrustYou score                     │ Explore travel dates │ │
│                                    │ ← April 2026 →       │ │
│ Hotel+Flights Package: £X,XXX /pp  │ Mo Tu We Th Fr Sa Su │ │
│                                    │    799  849  ---  ... │ │
│ Recommended because…               │ [selected date]      │ │
│ [review snippet]                   └─────────────────────-┘ │
└─────────────────────────────────────────────────────────────┘
```

The rate calendar is built from `package.rateCalendar`. Render a simple month grid: show the price for each available date, grey out unavailable dates, highlight the selected date. Clicking a date updates the selected departure date.

### When `sourceMode === 'live'` — Package Details Panel

```
┌─────────────────────────────────────────────────────────────┐
│ [Hotel photos]                                              │
│                                                             │
│ Hotel Name ★★★★                    ┌─────────────────────┐ │
│ TrustYou score                     │ Your package        │ │
│                                    │ Room: Double Std     │ │
│ Hotel+Flights Package: £X,XXX /pp  │ Board: All Inclusive │ │
│                                    │ Cancellation: Free   │ │
│ Recommended because…               │ until 14 days prior  │ │
│ [review snippet]                   └─────────────────────-┘ │
└─────────────────────────────────────────────────────────────┘
```

### Shared sticky footer (both modes)
```
Departing: [date] ─── Returning: [date]    7 nights · 2 Adults · £X,XXX /pp    [Personalise Your Holiday →]
```

The "Personalise Your Holiday" button can be a no-op (or `console.log('→ Smart Planner handoff')`) in the prototype.

---

## Task 8 — Demo Polish

Once all tasks above are done, make the prototype demo-ready:

1. **Reset on new search**: when the user submits a new search in the compact `PackageSearchForm` on `HolidayListPage`, call `onRefineSearch` which updates `searchCriteria` in `App.tsx` — this re-triggers `useUnifiedSearch` and restarts the simulated SSE sequence
2. **Non-cached destination demo path**: when the user searches for a non-cached destination (e.g. Phuket), `isCachedDestination` is `false`, so `useUnifiedSearch` skips the live loading phase and returns only cached results (or an empty list — use a small set of "live-only" mock packages gated on `!isCachedDestination`)
3. **Dedup demo**: ensure 2 of the live packages share a `deduplicationKey` with cached packages — you should visibly see a card's price update in place when live results arrive at t=3.5s

---

## What This Prototype Does NOT Include

The following are intentionally out of scope for the prototype. They are covered in `DP-Unified-Supply-Implementation-Plan.md` for production:

- Real API calls to `SearchBookingEngine` or TripCache
- Real SSE stream (`EventSource`)
- `PackageNormaliser` backend service
- Real deduplication on the backend
- `UNIFIED_SUPPLY_MODE` feature flag in TripBuilder Cockpit
- Smart Planner handoff (the button exists but is a no-op)
- Real booking / checkout flow
- Multi-tenancy / DC configuration

---

## Running the Prototype

The dev server is already configured. From the `My set up` project root:

```bash
npm run dev
```

The server starts at `http://localhost:5173/`. If you hit an EPERM error on `.vite/deps`, add `cacheDir: '/tmp/vite-cache'` to `vite.config.ts` (this was already done in a previous session — verify it's still there).

---

*Prototype plan prepared March 2026. For production implementation, see `DP-Unified-Supply-Implementation-Plan.md`.*
