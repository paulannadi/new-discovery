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
  startDate: Date;
  endDate: Date;
  travelersLabel: string;
  nights: number;
  budget: number;
  heroImage: string;
}

export interface PlanMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  // Small footer card inside AI bubbles ("Updated on canvas: Day 4 · Sintra").
  refCard?: string;
}

export interface PlanState {
  trip: TripMeta;
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
    "Plan a 5–8 day city break in Lisbon for two adults around mid-June. Budget €2,400, including flights from Zurich. We love food and walking, not so much beach.";

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
    trip: {
      title: "Lisbon city break",
      startDate: TRIP_START,
      endDate: TRIP_END,
      travelersLabel: "2 adults",
      nights: TRIP_NIGHTS,
      budget: 2400,
      heroImage: LISBON_IMG,
    },
    items,
    messages: [
      { id: newMsgId(), role: "user", text: userBrief },
      {
        id: newMsgId(),
        role: "ai",
        text: "Got it. I've sketched a **6-night Lisbon city break** for Fri Jun 12 — Sat Jun 20.\n\nFlights and the hotel are locked. Days 1–3 are filled with food-led picks. **Days 4–6 are open** — pick a chip below or just ask me anything.",
        refCard: "Trip summary & Days 1–3",
      },
    ],
    pendingActions: ["sintra", "lock56", "michelin", "cheaper"],
    hotelDrawer: false,
    justAddedIds: new Set<string>(),
    flightAltIdx: { outbound: 0, inbound: 0 },
    hotelAltIdx: 0,
  };
}

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
    apply: (_s) => buildInitialState(""),
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

  return {
    state,
    runAction,
    swapFlight,
    pickHotelAlt,
    closeHotelDrawer,
    sendReply,
    resetPlan,
  };
}
