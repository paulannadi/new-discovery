// useAiPlanState — state hook backing the Conversation + Smart Planner canvas.
//
// The canvas on the right side IS the Smart Planner: it renders the existing
// `ItineraryTimeline` with real FlightCard / AccommodationCard / ActivityCard /
// TransferCard product cards. This hook drives that timeline so AI chat
// actions add, remove, and modify the same `TimelineItem`s the rest of the
// app uses.
//
// What's modelled here:
//   • `items: TimelineItem[]` — the flat array of products the timeline
//     renders, in chronological order.
//   • `messages: PlanMessage[]` — the chat transcript.
//   • `pendingActions: ActionId[]` — the suggestion chip ids currently
//     offered above the composer; rotates after each action.
//   • `hotelDrawer: boolean` — whether the in-canvas hotel alternatives
//     swap drawer is open.
//   • `justAddedIds: Set<string>` — TimelineItem ids that were added by the
//     most recent action. Drawn with a primary ring + "Just added" pulse on
//     the timeline so the user can see what just changed.
//   • `trip: TripMeta` — destination metadata (title, dates, budget) shown
//     in the canvas header strip and chat header.
//
// Translated from prototype-plan.jsx (Claude Design handoff, May 2026), but
// with the day-grouped intermediate format dropped — the prototype's
// day-card UI was bespoke; the real Smart Planner timeline is item-keyed,
// so we serve items directly.

import { useCallback, useState } from "react";
import { parseISO } from "date-fns";

import type {
  AccommodationItem,
  ActivityItem,
  FlightItem,
  TimelineItem,
} from "../../utils/seedTimeline";
import type { FlightData, HotelData } from "../../pages/SmartPlannerPage";

// ─── Domain meta ─────────────────────────────────────────────────────────

export interface TripMeta {
  title: string;
  // Clean place name for the context chip (the `title` is a phrase like
  // "Lisbon city break", so we keep a tidy destination separately). This is
  // the LIVE source of truth the brief chips read — never an accumulated copy.
  destination: string;
  startDate: Date;
  endDate: Date;
  travelersLabel: string;
  nights: number;
  budget: number;
  heroImage: string;
}

// ─── The running "trip brief" ──────────────────────────────────────────────
//
// As the conversation advances, the AI gradually learns these "slots" about
// the trip. They power two things:
//   1. The brief chips shown at the top of the conversation (the visible
//      shared state — "📍 Lisbon · 📅 12–20 Jun · 👥 2 adults").
//   2. The READINESS rule (see `computeReadiness`) — once enough slots are
//      filled, the itinerary is considered "ready" and we reveal it.
//
// Everything is a plain string because these are *display* values for a
// prototype, not parsed dates/numbers. Each is optional — they fill in over
// the course of the conversation.
export interface TripBrief {
  vibe?: string; // e.g. "Culture & food"
  destination?: string; // e.g. "Portugal", then refined to "Lisbon"
  duration?: string; // e.g. "6 nights"
  dates?: string; // e.g. "12–20 Jun"
  travellers?: string; // e.g. "2 adults"
}

// READY_SLOTS rule — the single, tweakable definition of "ready".
//
// The trip is ready to reveal once we know WHERE they're going, for HOW LONG
// (either a duration or concrete dates is enough), and WHO is travelling.
// Keep this rule here so "what counts as ready" lives in exactly one place.
export function computeReadiness(brief: TripBrief): boolean {
  const hasDestination = Boolean(brief.destination);
  const hasWhen = Boolean(brief.duration || brief.dates);
  const hasTravellers = Boolean(brief.travellers);
  return hasDestination && hasWhen && hasTravellers;
}

export interface PlanMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  // Small footer card inside AI bubbles ("Updated on canvas: Day 4 · Sintra").
  refCard?: string;
}

// The right-hand canvas walks through "generative" stages before it resolves
// to the real Smart Planner itinerary. Each stage shows a different set of
// AI-suggested cards:
//   • "countries" — user gave a vibe / vacation type → suggest countries
//   • "cities"    — a country is chosen → suggest cities (+ a template card)
//   • "templates" — ready-made trips from inventory
//   • "itinerary" — enough detail gathered → the Smart Planner timeline (final)
export type CanvasStage = "countries" | "cities" | "templates" | "itinerary";

// A single suggestion card rendered in the generative canvas grid. Deliberately
// lightweight — it's a chooser tile, not a full product card.
export interface SuggestionCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge?: string; // e.g. "Best match", "Template"
  meta?: string; // small footer line, e.g. "8 days · from €1,890 pp"
}

export interface PlanState {
  // Which canvas stage the right side is currently showing.
  canvasStage: CanvasStage;
  trip: TripMeta;
  // The running brief the conversation fills in (see TripBrief). Drives the
  // brief chips AND the readiness rule.
  brief: TripBrief;
  // Once-only latch. Set true the first time the trip becomes ready and we
  // show the "Your itinerary is ready!" announcement. Never reset except on a
  // full "start over" — this is what stops the toast re-nagging on later edits.
  readyAnnounced: boolean;
  // True after the AI has asked "when are you travelling, and how many?" and is
  // waiting for the user to tap a date/travellers quick-reply. This is the step
  // that flips readiness on, so it sits between picking a place and the reveal.
  awaitingDates: boolean;
  items: TimelineItem[];
  messages: PlanMessage[];
  pendingActions: ActionId[];
  hotelDrawer: boolean;
  // ids of items that should display a "Just added" highlight on the
  // timeline. Replaced on every action so only the most recent change pulses.
  justAddedIds: ReadonlySet<string>;
  // Per-flight "alternative pool" index. Lets the user cycle the outbound /
  // return flight without losing track of where they are in the pool.
  flightAltIdx: { outbound: number; inbound: number };
  // Hotel alternative index used by the in-canvas drawer.
  hotelAltIdx: number;
}

// ─── Static lookups ──────────────────────────────────────────────────────

const LISBON_IMG =
  "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1400&q=70";
const SINTRA_IMG =
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=70";
const BELEM_IMG =
  "https://images.unsplash.com/photo-1539020140153-e479b8c5fec0?auto=format&fit=crop&w=900&q=70";
const CASCAIS_IMG =
  "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=900&q=70";
const TILE_IMG =
  "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=70";
const RAMIRO_IMG =
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=70";
// Images for the generative-canvas cards (countries / cities / templates).
// All subject-verified Unsplash CDN photos — keyword image services don't load
// in this environment, so we point at specific photo IDs.
const PORTO_IMG =
  "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=70";
const SPAIN_IMG =
  "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=70";
const ITALY_IMG =
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=70";
const GREECE_IMG =
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=70";
const TRAM_IMG =
  "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=900&q=70";

// Flight alternative pools — each entry is the `FlightData` we splice into
// the FlightItem when the user cycles via the chat ("any-alt swap"). The
// `price` field doubles as the per-trip-leg cost we sum into the running
// total — keep the formatting consistent so `priceToNumber` reads it back.
const FLIGHT_OUT_ALTS: Array<{ flight: FlightData; price: number }> = [
  {
    flight: {
      from: "Zurich",
      to: "Lisbon",
      stops: "Direct",
      duration: "4h 25m",
      airline: "TAP TP933",
      price: "€189",
    },
    price: 189,
  },
  {
    flight: {
      from: "Zurich",
      to: "Lisbon",
      stops: "Direct",
      duration: "4h 15m",
      airline: "SWISS LX2086",
      price: "€215",
    },
    price: 215,
  },
  {
    flight: {
      from: "Zurich",
      to: "Lisbon",
      stops: "1 stop · via Madrid",
      duration: "7h 20m",
      airline: "Iberia IB3107",
      price: "€142",
    },
    price: 142,
  },
];

const FLIGHT_IN_ALTS: Array<{ flight: FlightData; price: number }> = [
  {
    flight: {
      from: "Lisbon",
      to: "Zurich",
      stops: "Direct",
      duration: "3h 15m",
      airline: "TAP TP934",
      price: "€176",
    },
    price: 176,
  },
  {
    flight: {
      from: "Lisbon",
      to: "Zurich",
      stops: "Direct",
      duration: "3h 15m",
      airline: "SWISS LX2087",
      price: "€198",
    },
    price: 198,
  },
];

// Hotel alternative pool — the user can swap into one of these from the
// in-canvas drawer. The first one is the default seeded into the trip.
export const HOTEL_ALTS: Array<{ hotel: HotelData; pricePerNight: number }> = [
  {
    hotel: {
      name: "Memmo Alfama",
      image: LISBON_IMG,
      stars: 4,
      rating: 8.8,
      reviewCount: 612,
      location: "Alfama, Lisbon",
      price: 220,
      roomType: "Deluxe Room",
      boardType: "Breakfast included",
    },
    pricePerNight: 220,
  },
  {
    hotel: {
      name: "The Lumiares Hotel",
      image: LISBON_IMG,
      stars: 4,
      rating: 8.7,
      reviewCount: 487,
      location: "Bairro Alto, Lisbon",
      price: 185,
      roomType: "Studio Suite",
      boardType: "Breakfast included",
    },
    pricePerNight: 185,
  },
  {
    hotel: {
      name: "Pousada de Lisboa",
      image: LISBON_IMG,
      stars: 5,
      rating: 9.0,
      reviewCount: 358,
      location: "Praça do Comércio, Lisbon",
      price: 260,
      roomType: "Heritage Room",
      boardType: "Breakfast included",
    },
    pricePerNight: 260,
  },
];

// ─── Generative-canvas card data ─────────────────────────────────────────
// Static suggestion cards for the pre-itinerary stages. The Portugal path is
// the "golden path" with the richest content; the other countries/cities are
// believable options that fall back to the Portugal plan in this prototype
// (the AI says so in chat, so the demo stays honest).

export const COUNTRY_CARDS: SuggestionCard[] = [
  {
    id: "portugal",
    title: "Portugal",
    subtitle: "Atlantic light, world-class food, hugely walkable cities.",
    image: LISBON_IMG,
    badge: "Best match",
    meta: "Culture · Food · Coast",
  },
  {
    id: "spain",
    title: "Spain",
    subtitle: "Tapas crawls, Gaudí, and late-night plazas.",
    image: SPAIN_IMG,
    meta: "Culture · Food · City life",
  },
  {
    id: "italy",
    title: "Italy",
    subtitle: "Ancient cities, regional cooking, espresso culture.",
    image: ITALY_IMG,
    meta: "Culture · Food · History",
  },
  {
    id: "greece",
    title: "Greece",
    subtitle: "Island towns, mezze tables, and sea views.",
    image: GREECE_IMG,
    meta: "Coast · Food · History",
  },
];

export const CITY_CARDS: SuggestionCard[] = [
  {
    id: "lisbon",
    title: "Lisbon",
    subtitle: "Hilltop miradouros, fado nights, and the best seafood.",
    image: LISBON_IMG,
    badge: "Recommended",
    meta: "Great food + walkable",
  },
  {
    id: "porto",
    title: "Porto",
    subtitle: "Riverside cellars, port tasting, and azulejo facades.",
    image: PORTO_IMG,
    meta: "Wine · Riverside",
  },
  {
    id: "sintra",
    title: "Sintra",
    subtitle: "Fairytale palaces and forested hills, a day-trip away.",
    image: SINTRA_IMG,
    meta: "Palaces · Nature",
  },
  {
    id: "cascais",
    title: "Cascais",
    subtitle: "Easygoing coastal town on the Estoril line.",
    image: CASCAIS_IMG,
    meta: "Coast · Relaxed",
  },
];

export const TEMPLATE_CARDS: SuggestionCard[] = [
  {
    id: "tmpl-portugal-highlights",
    title: "Portugal Highlights",
    subtitle: "Lisbon, Sintra and Porto in one easy loop.",
    image: TRAM_IMG,
    badge: "Template",
    meta: "8 days · from €1,890 pp",
  },
  {
    id: "tmpl-lisbon-food-fado",
    title: "Lisbon Food & Fado",
    subtitle: "A long-weekend base built around eating and music.",
    image: LISBON_IMG,
    badge: "Template",
    meta: "5 days · from €1,290 pp",
  },
];

// The cards shown for a given stage. The "cities" stage appends one featured
// template card so the user can also start from a ready-made trip.
export function cardsForStage(stage: CanvasStage): SuggestionCard[] {
  if (stage === "countries") return COUNTRY_CARDS;
  if (stage === "cities") return [...CITY_CARDS, TEMPLATE_CARDS[0]];
  if (stage === "templates") return TEMPLATE_CARDS;
  return [];
}

// Heading + subtext shown above the grid for each generative stage.
export function stageMeta(stage: CanvasStage): { heading: string; subtext: string } {
  switch (stage) {
    case "countries":
      return {
        heading: "Countries that fit your vibe",
        subtext: "Matched on culture, food and walkable cities. Pick one to get specific.",
      };
    case "cities":
      return {
        heading: "Where to base yourself in Portugal",
        subtext: "Tap a place to build the trip around it — or start from a ready-made template.",
      };
    case "templates":
      return {
        heading: "Ready-made Portugal trips",
        subtext: "Proven itineraries from our inventory. Tap one to load it into Smart Planner.",
      };
    default:
      return { heading: "", subtext: "" };
  }
}

// ─── Item-id constants ──────────────────────────────────────────────────
// Stable ids let us mutate the same Flight / Hotel item across actions
// without losing its place in the timeline.
const ID_OUT_FLIGHT = "flight-outbound";
const ID_IN_FLIGHT = "flight-inbound";
const ID_HOTEL = "hotel-stay";
const ID_DINNER_RAMIRO = "act-dinner-ramiro";
const ID_BELEM = "act-belem-tour";
const ID_LUNCH_MARGEM = "act-lunch-margem";
const ID_LX_MARKET = "act-lx-market";
const ID_FADO = "act-fado-dinner";
const ID_COOKING = "act-cooking-class";
// Day 4 onwards — added by AI actions.
const ID_SINTRA = "act-sintra";
const ID_TAGUS_CRUISE = "act-tagus-cruise";
const ID_AZULEJO = "act-azulejo";
const ID_CASCAIS = "act-cascais-drive";
const ID_MICHELIN = "act-michelin";

// Trip-wide totals — these numbers feed the running-total bar. Activities
// have explicit `priceNumber` baked into the seed, so we keep that pattern
// rather than re-parsing the formatted strings.
const ACTIVITY_PRICES: Record<string, number> = {
  [ID_DINNER_RAMIRO]: 85,
  [ID_BELEM]: 42,
  [ID_LUNCH_MARGEM]: 55,
  [ID_LX_MARKET]: 0,
  [ID_FADO]: 140,
  [ID_COOKING]: 95,
  [ID_SINTRA]: 38,
  [ID_TAGUS_CRUISE]: 68,
  [ID_AZULEJO]: 12,
  [ID_CASCAIS]: 44,
  [ID_MICHELIN]: 290,
};

const newMsgId = () => "m" + Math.random().toString(36).slice(2, 8);
export const formatEuros = (n: number) => "€" + n.toLocaleString("en");

// Running-total math. Hotels are multiplied by night count (state.trip.nights),
// flights are the alternative's per-leg price, and activities use the static
// `ACTIVITY_PRICES` map keyed by item id.
export const computeSpent = (state: PlanState): number => {
  let total = 0;
  for (const it of state.items) {
    if (it.kind === "flight") {
      const pool = it.direction === "outbound" ? FLIGHT_OUT_ALTS : FLIGHT_IN_ALTS;
      const idx =
        it.direction === "outbound"
          ? state.flightAltIdx.outbound
          : state.flightAltIdx.inbound;
      total += pool[idx]?.price ?? 0;
    } else if (it.kind === "accommodation") {
      total += it.hotel.price * Math.max(1, it.nights);
    } else if (it.kind === "activity") {
      total += ACTIVITY_PRICES[it.id] ?? 0;
    }
  }
  return Math.round(total);
};

// ─── Initial state ───────────────────────────────────────────────────────

const TRIP_START = parseISO("2026-06-12"); // Fri 12 Jun 2026
const TRIP_END = parseISO("2026-06-20"); // Sat 20 Jun 2026
const TRIP_NIGHTS = 6;

function buildInitialState(seedPrompt: string): PlanState {
  const userBrief =
    seedPrompt.trim() ||
    "I'd love a culture-and-food trip somewhere in Europe — great cities to walk around and amazing places to eat. Not really a beach holiday.";

  const items: TimelineItem[] = [
    {
      kind: "flight",
      id: ID_OUT_FLIGHT,
      direction: "outbound",
      date: parseISO("2026-06-12"),
      flight: FLIGHT_OUT_ALTS[0].flight,
    } as FlightItem,
    {
      kind: "accommodation",
      id: ID_HOTEL,
      checkIn: parseISO("2026-06-12"),
      nights: TRIP_NIGHTS,
      hotel: HOTEL_ALTS[0].hotel,
    } as AccommodationItem,
    {
      kind: "activity",
      id: ID_DINNER_RAMIRO,
      date: parseISO("2026-06-12"),
      title: "Dinner at Cervejaria Ramiro",
      description:
        "Cult Lisbon seafood institution — start with the prawns and don't skip the steak sandwich for dessert.",
      duration: "2 hours",
      location: "Intendente, Lisbon",
      image: RAMIRO_IMG,
      price: "€85 for two",
    } as ActivityItem,
    {
      kind: "activity",
      id: ID_BELEM,
      date: parseISO("2026-06-13"),
      title: "Belém Tower & Jerónimos walking tour",
      description:
        "Half-day, English-guided walk through Belém — the tower, the monastery, and pastéis from the original Casa Pastéis de Belém.",
      duration: "3 hours",
      location: "Belém, Lisbon",
      image: BELEM_IMG,
      price: "€42 pp",
    } as ActivityItem,
    {
      kind: "activity",
      id: ID_LUNCH_MARGEM,
      date: parseISO("2026-06-13"),
      title: "Lunch at A Margem",
      description:
        "Riverside terrace lunch under the Padrão dos Descobrimentos — the spot with the best Tagus view in Belém.",
      duration: "1.5 hours",
      location: "Belém, Lisbon",
      image: BELEM_IMG,
      price: "€55 for two",
    } as ActivityItem,
    {
      kind: "activity",
      id: ID_LX_MARKET,
      date: parseISO("2026-06-14"),
      title: "LX Factory & Time Out Market crawl",
      description:
        "Self-guided afternoon through the converted print-works at LX Factory, then dinner stops at Time Out Market.",
      duration: "Half day",
      location: "Alcântara, Lisbon",
      image: LISBON_IMG,
      price: "Self-guided",
    } as ActivityItem,
    {
      kind: "activity",
      id: ID_FADO,
      date: parseISO("2026-06-14"),
      title: "Fado dinner at Mesa de Frades",
      description:
        "Reservation-only fado house in a converted chapel — three sets, traditional Lisbon menu.",
      duration: "3 hours",
      location: "Alfama, Lisbon",
      image: LISBON_IMG,
      price: "€140 for two",
    } as ActivityItem,
    // Day 7 — extra cooking class that we keep even on the trimmed itinerary.
    {
      kind: "activity",
      id: ID_COOKING,
      date: parseISO("2026-06-18"),
      title: "Half-day cooking class with Chef Sara",
      description:
        "Market visit at Mercado da Ribeira, then a hands-on class — bacalhau à brás, custard tarts, and a long lunch.",
      duration: "3 hours",
      location: "Cais do Sodré, Lisbon",
      image: LISBON_IMG,
      price: "€95 pp",
    } as ActivityItem,
    {
      kind: "flight",
      id: ID_IN_FLIGHT,
      direction: "inbound",
      date: parseISO("2026-06-20"),
      flight: FLIGHT_IN_ALTS[0].flight,
    } as FlightItem,
  ];

  return {
    // Start in the generative flow: the user gave a vibe, so we suggest
    // countries first and only resolve to the itinerary once they've narrowed
    // it down. `items` is pre-built so the itinerary stage has data ready.
    canvasStage: "countries",
    trip: {
      title: "Lisbon city break",
      destination: "Lisbon",
      startDate: TRIP_START,
      endDate: TRIP_END,
      travelersLabel: "2 adults",
      nights: TRIP_NIGHTS,
      budget: 2400,
      heroImage: LISBON_IMG,
    },
    // The conversation opens with the user's vibe already understood (it came
    // from the moodboard composer on Discovery). Destination/dates/travellers
    // are still blank — they fill in as the user picks cards and answers.
    brief: { vibe: "Culture & food" },
    readyAnnounced: false,
    awaitingDates: false,
    items,
    messages: [
      { id: newMsgId(), role: "user", text: userBrief },
      {
        id: newMsgId(),
        role: "ai",
        text: "Love it — a **culture-and-food trip** with cities you can walk and eat your way through. Based on that, here are four countries that fit your vibe.\n\nPick one on the right and I'll get specific about *where* to go.",
        refCard: "4 countries match your vibe",
      },
    ],
    // No suggestion chips during the generative stages — the cards on the
    // right ARE the choices. Chips appear once we reach the itinerary.
    pendingActions: [],
    hotelDrawer: false,
    justAddedIds: new Set<string>(),
    flightAltIdx: { outbound: 0, inbound: 0 },
    hotelAltIdx: 0,
  };
}

// Suggestion chips offered the moment the itinerary stage is reached, so the
// user has somewhere to go after the trip is drafted.
const ITINERARY_START_ACTIONS: ActionId[] = ["sintra", "lock56", "michelin", "cheaper"];

// ─── Dates + travellers quick replies ──────────────────────────────────────
//
// After a place is chosen, the AI asks "when are you travelling, and how
// many?". These are the tappable quick-reply options. Each one writes its
// `dates` + `travellers` into the brief — which is the step that finally flips
// readiness on. The first option matches the pre-built June itinerary exactly;
// the others are believable variations (the underlying draft stays the same in
// this prototype, which the AI's reply quietly acknowledges).
export interface DateOption {
  id: string;
  label: string; // shown on the chip AND echoed as the user's message
  dates: string; // → brief.dates
  travellers: string; // → brief.travellers
}

export const DATE_OPTIONS: DateOption[] = [
  { id: "jun", label: "12–20 Jun · 2 adults", dates: "12–20 Jun", travellers: "2 adults" },
  { id: "flex", label: "Flexible dates · 2 adults", dates: "Flexible", travellers: "2 adults" },
  { id: "later", label: "Later this summer · 2 adults", dates: "This summer", travellers: "2 adults" },
];

// Short labels for each canvas stage — used by the demo stage-switcher.
export const STAGE_LABEL: Record<CanvasStage, string> = {
  countries: "Countries",
  cities: "Cities",
  templates: "Templates",
  itinerary: "Itinerary",
};

// Per-card chat copy for the golden Portugal → Lisbon path. Any card not listed
// here falls back to copy generated from the card title (see `pickSuggestion`).
const PICK_COPY: Record<string, { user: string; ai: string; ref: string }> = {
  portugal: {
    user: "Portugal, definitely.",
    ai: "Great call — **Portugal**. Atlantic light, incredible food, and very walkable cities.\n\nHere's where I'd base you, plus a ready-made template. Tap one and I'll build it out in Smart Planner.",
    ref: "Exploring Portugal",
  },
  lisbon: {
    user: "Let's build it around Lisbon.",
    ai: "Perfect — **Lisbon** as your base. I've drafted a 6-night plan: flights from Zurich, a hotel in Alfama, and food-led days. It's on the right in Smart Planner — tweak anything from here.",
    ref: "Lisbon itinerary drafted",
  },
  "tmpl-portugal-highlights": {
    user: "Load the Portugal Highlights template.",
    ai: "Loaded the **Portugal Highlights** template into Smart Planner — flights, hotel and the opening days are filled in. Adjust anything from the chat.",
    ref: "Template loaded",
  },
  "tmpl-lisbon-food-fado": {
    user: "Load the Lisbon Food & Fado template.",
    ai: "Loaded **Lisbon Food & Fado** into Smart Planner. Flights, hotel and the first days are in — let's tweak from here.",
    ref: "Template loaded",
  },
};

// ─── Action library ──────────────────────────────────────────────────────

export type ActionId =
  | "sintra"
  | "lock56"
  | "michelin"
  | "cheaper"
  | "shorter"
  | "restore8";

interface ActionDef {
  chip: string;
  userMsg: string;
  aiMsg: string;
  aiRef?: string;
  next: ActionId[];
  apply: (state: PlanState) => PlanState;
}

// AccommodationItem keys its date as `checkIn` (start of stay); every other
// kind uses `date`. This helper returns whichever the item carries so we
// can sort/filter a heterogeneous array uniformly.
function itemDate(it: TimelineItem): Date {
  return it.kind === "accommodation" ? it.checkIn : it.date;
}

// Insert items into the chronological timeline, keeping ordering by date.
function insertItems(items: TimelineItem[], newItems: TimelineItem[]): TimelineItem[] {
  return [...items, ...newItems].sort((a, b) => itemDate(a).getTime() - itemDate(b).getTime());
}

const ACTIONS: Record<ActionId, ActionDef> = {
  sintra: {
    chip: "Add a Sintra day-trip",
    userMsg: "Can we keep day 4 free for a Sintra day-trip?",
    aiMsg:
      "**Done — Day 4 is Sintra.** I've added the Pena Palace + Quinta da Regaleira combo and a return train ticket. The €38 cost is reflected in the running total.\n\nWant me to lock days 5 and 6 next, or shift the budget toward a Michelin dinner?",
    aiRef: "Day 4 · Sintra",
    next: ["lock56", "michelin", "cheaper"],
    apply: (s) => ({
      ...s,
      items: insertItems(s.items, [
        {
          kind: "activity",
          id: ID_SINTRA,
          date: parseISO("2026-06-15"),
          title: "Pena Palace + Quinta da Regaleira",
          description:
            "Train round-trip to Sintra with timed tickets — the Pena Palace in the morning, Quinta da Regaleira after lunch.",
          duration: "Full day",
          location: "Sintra",
          image: SINTRA_IMG,
          price: "€38 pp",
        } as ActivityItem,
      ]),
      justAddedIds: new Set([ID_SINTRA]),
    }),
  },

  lock56: {
    chip: "Lock days 5 & 6",
    userMsg: "Sounds good — go ahead and lock days 5 and 6.",
    aiMsg:
      "Locked. **Day 5** is a Tagus river cruise + tile museum, **Day 6** is a Sintra-Cascais coastal drive with a stop at Boca do Inferno. Added €124 total.\n\nAnything else you'd like to tweak before checkout?",
    aiRef: "Days 5 & 6 · Locked",
    next: ["michelin", "cheaper", "shorter"],
    apply: (s) => ({
      ...s,
      items: insertItems(s.items, [
        {
          kind: "activity",
          id: ID_TAGUS_CRUISE,
          date: parseISO("2026-06-16"),
          title: "Sunset cruise on the Tagus",
          description:
            "Two-hour sailboat cruise on the Tagus at sunset, with drinks and snacks. Boards from Doca de Belém.",
          duration: "2 hours",
          location: "Belém marina",
          image: BELEM_IMG,
          price: "€68 pp",
        } as ActivityItem,
        {
          kind: "activity",
          id: ID_AZULEJO,
          date: parseISO("2026-06-16"),
          title: "Museu Nacional do Azulejo",
          description:
            "Self-guided afternoon at the National Tile Museum — five centuries of Portuguese tile work in a former convent.",
          duration: "2 hours",
          location: "Madre de Deus, Lisbon",
          image: TILE_IMG,
          price: "€12 pp",
        } as ActivityItem,
        {
          kind: "activity",
          id: ID_CASCAIS,
          date: parseISO("2026-06-17"),
          title: "Coastal drive · Cascais & Boca do Inferno",
          description:
            "Half-day private drive along the Estoril coast — Boca do Inferno, Cascais marina, lunch on the seafront.",
          duration: "Half day",
          location: "Cascais",
          image: CASCAIS_IMG,
          price: "€44 pp",
        } as ActivityItem,
      ]),
      justAddedIds: new Set([ID_TAGUS_CRUISE, ID_AZULEJO, ID_CASCAIS]),
    }),
  },

  michelin: {
    chip: "Add a Michelin dinner",
    userMsg: "Could we slot in a Michelin dinner one of the nights?",
    aiMsg:
      "Reserved **Belcanto (2★ Michelin)** for Wed 17 Jun, 20:00. Tasting menu, 2 covers. That's €290 — I've made room by dropping the Fado dinner on Day 3 to a more relaxed wine bar (saving €50).\n\nNet impact: +€240.",
    aiRef: "Belcanto · Day 6",
    next: ["cheaper", "shorter"],
    apply: (s) => ({
      ...s,
      items: insertItems(
        // Swap the Fado dinner item in-place for the cheaper wine bar.
        s.items.map((it) =>
          it.id === ID_FADO
            ? ({
                ...it,
                title: "Wine & petiscos at Senhor Vinho",
                description:
                  "Lower-key Bairro Alto petiscos joint — same fado vibe, smaller menu, ~30% cheaper than Mesa de Frades.",
                price: "€90 for two",
              } as ActivityItem)
            : it,
        ),
        [
          {
            kind: "activity",
            id: ID_MICHELIN,
            date: parseISO("2026-06-17"),
            title: "Dinner at Belcanto (2★ Michelin)",
            description:
              "Chef José Avillez's flagship — 12-course tasting, wine pairing, 20:00 seating, two covers.",
            duration: "3 hours",
            location: "Chiado, Lisbon",
            image: LISBON_IMG,
            price: "€290 for two",
          } as ActivityItem,
        ],
      ),
      // Also swap-update the Fado item's id stays the same; only Michelin
      // is newly added. Highlight both so the user notices the swap.
      justAddedIds: new Set([ID_MICHELIN, ID_FADO]),
    }),
  },

  cheaper: {
    chip: "Show cheaper hotel options",
    userMsg: "What if we tried a cheaper hotel?",
    aiMsg:
      "Here are three cheaper picks. Tap one and I'll swap it into Day 1 — the running total updates automatically.",
    aiRef: "Hotel alternatives",
    next: ["lock56", "michelin", "shorter"],
    apply: (s) => ({ ...s, hotelDrawer: true, justAddedIds: new Set() }),
  },

  shorter: {
    chip: "Make it a 5-day version",
    userMsg: "What does a shorter, 5-day version look like?",
    aiMsg:
      "Trimmed it to **5 days, 4 nights** — out Mon, back Fri. Days 6–7 dropped, return flight pulled forward to Fri 19 Jun.\n\nLet me know if you want the original 8-day back.",
    aiRef: "Shortened to 5 days",
    next: ["restore8", "michelin", "cheaper"],
    apply: (s) => {
      // Drop items that fall after 18 Jun. Keep the inbound flight but move
      // it to 19 Jun.
      const cutoff = parseISO("2026-06-19").getTime();
      const trimmed = s.items
        .filter((it) => itemDate(it).getTime() <= cutoff)
        .map((it) =>
          it.id === ID_IN_FLIGHT
            ? ({ ...it, date: parseISO("2026-06-19") } as FlightItem)
            : it,
        );
      // Also reduce hotel nights to 4.
      const withHotel = trimmed.map((it) =>
        it.id === ID_HOTEL ? ({ ...it, nights: 4 } as AccommodationItem) : it,
      );
      return {
        ...s,
        trip: {
          ...s.trip,
          title: "Lisbon city break · 5 days",
          endDate: parseISO("2026-06-19"),
          nights: 4,
        },
        items: withHotel,
        justAddedIds: new Set(),
      };
    },
  },

  restore8: {
    chip: "Restore the 8-day version",
    userMsg: "Actually, restore the 8-day version.",
    aiMsg: "Restored. Welcome back to the full 8-day Lisbon trip.",
    aiRef: "Restored 8 days",
    next: ["michelin", "cheaper", "shorter"],
    // IMPORTANT: this is a SCOPED edit, not a reset. We only restore the trip
    // days + dates from a fresh build — we must NOT touch `canvasStage`,
    // `brief`, `readyAnnounced` or `awaitingDates`, or the user would get
    // bounced back to the country picker and the "ready" toast would re-fire.
    apply: (s) => {
      const fresh = buildInitialState("");
      return {
        ...s,
        trip: fresh.trip,
        items: fresh.items,
        justAddedIds: new Set(),
      };
    },
  },
};

export const getActionLabel = (id: ActionId) => ACTIONS[id].chip;

// ─── Hook ────────────────────────────────────────────────────────────────

export function useAiPlanState(seedPrompt: string) {
  const [state, setState] = useState<PlanState>(() => buildInitialState(seedPrompt));

  const runAction = useCallback((id: ActionId) => {
    const a = ACTIONS[id];
    if (!a) return;
    setState((s) => {
      const mutated = a.apply(s);
      return {
        ...mutated,
        messages: [
          ...s.messages,
          { id: newMsgId(), role: "user", text: a.userMsg },
          { id: newMsgId(), role: "ai", text: a.aiMsg, refCard: a.aiRef },
        ],
        pendingActions: a.next,
      };
    });
  }, []);

  // Pick a generative-canvas card (a country, city or template). Pushes the
  // choice into the conversation as a user+AI exchange, then advances the flow:
  //   • countries → cities (narrow down the place)
  //   • cities / templates → ask for dates + travellers (NOT the itinerary yet)
  //
  // Crucially, picking a place no longer reveals the itinerary directly. It
  // records the destination + duration into the brief and asks "when, and how
  // many?". That dates step (see `chooseDates`) is what finally flips readiness.
  const pickSuggestion = useCallback((cardId: string) => {
    setState((s) => {
      const stage = s.canvasStage;
      const card = cardsForStage(stage).find((c) => c.id === cardId);
      if (!card) return s;

      // ── Country step: narrow to cities, record the country in the brief ──
      if (stage === "countries") {
        const tailored = PICK_COPY[cardId];
        let user: string;
        let ai: string;
        let ref: string;
        if (tailored) {
          ({ user, ai, ref } = tailored);
        } else {
          // Non-Portugal country: be transparent that the demo's deep
          // inventory is Portugal, then continue the same flow.
          user = `Let's look at ${card.title}.`;
          ai = `Nice — **${card.title}** is a great fit too. For this preview my richest inventory is **Portugal**, so I'll walk you through that flow; it works the same for ${card.title} once it's connected.`;
          ref = "Showing Portugal";
        }
        return {
          ...s,
          canvasStage: "cities",
          brief: { ...s.brief, destination: card.title },
          messages: [
            ...s.messages,
            { id: newMsgId(), role: "user", text: user },
            { id: newMsgId(), role: "ai", text: ai, refCard: ref },
          ],
        };
      }

      // ── Place step (a city or a template): record destination + duration,
      //    then ASK FOR DATES instead of jumping to the itinerary. ──
      const tailored = PICK_COPY[cardId];
      // For a template the destination is the country it covers, so keep the
      // existing brief destination; for a city, refine to the city name.
      const isTemplate = cardId.startsWith("tmpl-");
      const destination = isTemplate
        ? s.brief.destination ?? card.title
        : card.title;

      // The user's line — reuse tailored copy where we have it.
      const user =
        tailored?.user ??
        (isTemplate
          ? `Load the ${card.title} template.`
          : `Can we center it on ${card.title}?`);

      // The AI now asks for dates rather than announcing a draft. Keeping this
      // copy in one place (not in PICK_COPY) means every place lands on the
      // same dates question.
      const ai = `Perfect — **${card.title}** it is. When are you travelling, and how many of you?`;

      return {
        ...s,
        // Stay on the "cities" cards visually; the dates question renders as
        // quick replies in the conversation. We only move canvasStage to
        // "itinerary" once dates are picked (in `chooseDates`).
        brief: {
          ...s.brief,
          destination,
          duration: `${s.trip.nights} nights`,
        },
        awaitingDates: true,
        messages: [
          ...s.messages,
          { id: newMsgId(), role: "user", text: user },
          { id: newMsgId(), role: "ai", text: ai, refCard: "Just need your dates" },
        ],
      };
    });
  }, []);

  // Answer the dates + travellers question. This is the moment the trip
  // becomes "ready": we write the final brief slots, advance the canvas to the
  // itinerary stage, and offer the first round of refine chips. The component
  // watches `isItineraryReady` (derived below) to fire the one-time toast.
  const chooseDates = useCallback((optionId: string) => {
    setState((s) => {
      const opt = DATE_OPTIONS.find((o) => o.id === optionId);
      if (!opt) return s;
      return {
        ...s,
        canvasStage: "itinerary",
        awaitingDates: false,
        brief: { ...s.brief, dates: opt.dates, travellers: opt.travellers },
        pendingActions: ITINERARY_START_ACTIONS,
        messages: [
          ...s.messages,
          { id: newMsgId(), role: "user", text: opt.label },
          {
            id: newMsgId(),
            role: "ai",
            text: "Done — I've laid out your trip day by day. Take a look whenever you're ready. ✨",
            refCard: "Itinerary ready",
          },
        ],
      };
    });
  }, []);

  // Jump straight to a canvas stage — used by the DEBUG-only stage switcher
  // (gated behind ?debug=1) so the designer can preview each state. Drops a
  // short note in the chat so the transcript stays coherent. When jumping to
  // the itinerary we also fill any empty brief slots so readiness is satisfied
  // (otherwise the preview would show an itinerary that state says isn't ready).
  const setCanvasStage = useCallback((stage: CanvasStage) => {
    setState((s) => {
      if (s.canvasStage === stage) return s;
      const jumpingToItinerary = stage === "itinerary";
      const note = jumpingToItinerary
        ? "Here's the full **Smart Planner** itinerary — the final step of the flow."
        : `Showing the **${STAGE_LABEL[stage].toLowerCase()}** suggestions.`;
      return {
        ...s,
        canvasStage: stage,
        awaitingDates: false,
        brief: jumpingToItinerary
          ? {
              vibe: s.brief.vibe ?? "Culture & food",
              destination: s.brief.destination ?? "Lisbon",
              duration: s.brief.duration ?? `${s.trip.nights} nights`,
              dates: s.brief.dates ?? "12–20 Jun",
              travellers: s.brief.travellers ?? "2 adults",
            }
          : s.brief,
        pendingActions: jumpingToItinerary ? ITINERARY_START_ACTIONS : [],
        messages: [...s.messages, { id: newMsgId(), role: "ai", text: note }],
      };
    });
  }, []);

  // Flip the once-only "ready announced" latch. The component calls this the
  // first time it shows the ready toast, so the toast never re-fires.
  const markReadyAnnounced = useCallback(() => {
    setState((s) => (s.readyAnnounced ? s : { ...s, readyAnnounced: true }));
  }, []);

  // Cycle the outbound or inbound flight to the next alternative in its pool.
  const swapFlight = useCallback(
    (direction: "outbound" | "inbound"): string | null => {
      let swappedAirline: string | null = null;
      setState((s) => {
        const pool = direction === "outbound" ? FLIGHT_OUT_ALTS : FLIGHT_IN_ALTS;
        const cur =
          direction === "outbound" ? s.flightAltIdx.outbound : s.flightAltIdx.inbound;
        const nextIdx = (cur + 1) % pool.length;
        const alt = pool[nextIdx];
        swappedAirline = alt.flight.airline;
        return {
          ...s,
          flightAltIdx: { ...s.flightAltIdx, [direction]: nextIdx },
          items: s.items.map((it) =>
            it.kind === "flight" && it.direction === direction
              ? ({ ...it, flight: alt.flight } as FlightItem)
              : it,
          ),
          justAddedIds: new Set(
            direction === "outbound" ? [ID_OUT_FLIGHT] : [ID_IN_FLIGHT],
          ),
        };
      });
      return swappedAirline;
    },
    [],
  );

  // Pick a specific hotel alternative from the drawer.
  const pickHotelAlt = useCallback((idx: number) => {
    setState((s) => {
      const alt = HOTEL_ALTS[idx];
      return {
        ...s,
        hotelAltIdx: idx,
        hotelDrawer: false,
        items: s.items.map((it) =>
          it.id === ID_HOTEL
            ? ({ ...it, hotel: alt.hotel } as AccommodationItem)
            : it,
        ),
        justAddedIds: new Set([ID_HOTEL]),
        messages: [
          ...s.messages,
          { id: newMsgId(), role: "user", text: `Let's try the ${alt.hotel.name}.` },
          {
            id: newMsgId(),
            role: "ai",
            text: `Swapped — you're now in **${alt.hotel.name}** at €${alt.pricePerNight}/night. Running total updated.`,
            refCard: "Hotel swapped",
          },
        ],
      };
    });
  }, []);

  const closeHotelDrawer = useCallback(() => {
    setState((s) => ({ ...s, hotelDrawer: false }));
  }, []);

  // Free-text reply from the composer. Generic AI nudge — the prototype
  // doesn't do real NLU.
  const sendReply = useCallback((text: string) => {
    const v = text.trim();
    if (!v) return;
    setState((s) => ({
      ...s,
      messages: [
        ...s.messages,
        { id: newMsgId(), role: "user", text: v },
        {
          id: newMsgId(),
          role: "ai",
          text:
            "Noted — give me a second to slot that in. *(Try one of the suggestion chips below for a faster path.)*",
        },
      ],
    }));
  }, []);

  // Reset for "Plan another trip".
  const resetPlan = useCallback(() => {
    setState(buildInitialState(""));
  }, []);

  // DERIVED readiness — recomputed from the brief on every render so there's
  // no second source of truth to keep in sync. `readyAnnounced` (in state) is
  // the separate once-only latch for the toast.
  const isItineraryReady = computeReadiness(state.brief);

  return {
    state,
    isItineraryReady,
    runAction,
    pickSuggestion,
    chooseDates,
    setCanvasStage,
    markReadyAnnounced,
    swapFlight,
    pickHotelAlt,
    closeHotelDrawer,
    sendReply,
    resetPlan,
  };
}
