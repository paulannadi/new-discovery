// ─────────────────────────────────────────────────────────────────────────────
// Tour Mock Data
//
// "Grand Train Tour of Switzerland – Best of Winter"
// Based on the real Swiss Travel System itinerary, adapted for TripBuilder.
// ─────────────────────────────────────────────────────────────────────────────

import type { Tour } from "../types";

export const SWISS_WINTER_TOUR: Tour = {
  tourId: "swiss-winter-grand-train",
  title: "Grand Train Tour of Switzerland – Best of Winter",
  subtitle: "Experience the most iconic panoramic railways in the heart of the Alps.",
  tripType: "individual-tour",
  duration: 8,
  locationsLabel: "Lucerne · Interlaken · Brig · Chur",
  highlights: [
    "Scenic panoramic trains",
    "UNESCO World Heritage",
    "Mountain villages",
    "Glacier Express included",
  ],
  mainImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  price: {
    perPerson: 2128,
    total: 4256,
    currency: "GBP",
    paidBefore: 1098,
    paidAtDestination: 1031,
  },
  startDate: "Mar 31, 2026",
  endDate: "Apr 07, 2026",
  adults: 2,

  // ── Quick-fact attribute chips ────────────────────────────────────────────
  attributes: [
    { iconKey: "users",           label: "Individual tour" },
    { iconKey: "languages",       label: "Guided in English" },
    { iconKey: "activity",        label: "All levels" },
    { iconKey: "calendar-check",  label: "Age 18+" },
  ],

  // ── Photo gallery ─────────────────────────────────────────────────────────
  // Four landscape photos shown in the "Discover the beauty of Switzerland" section
  gallery: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=800&q=80",
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
  ],

  // ── Day-by-day itinerary ──────────────────────────────────────────────────
  days: [
    {
      dayNumber: 1,
      title: "Arrival in Lucerne",
      items: [
        {
          type: "highlight",
          label: "Arrive in Lucerne & settle in",
          description:
            "Check in to your hotel in the heart of Lucerne. Spend the evening strolling along the lakefront and the iconic Chapel Bridge.",
        },
        {
          type: "hotel",
          label: "De la Paix *** or similar",
        },
      ],
      image: "https://images.unsplash.com/photo-1444210971048-6130cf0c46cf?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Luzern-Interlaken Express",
      items: [
        {
          type: "highlight",
          label: "Panoramic train to Interlaken",
          description:
            "Board the scenic Luzern-Interlaken Express for a 2-hour panoramic journey through the Bernese Oberland.",
        },
        {
          type: "transport",
          label: "Luzern-Interlaken Express",
          description: "2 hours · Panoramic rail journey",
        },
        {
          type: "hotel",
          label: "Hotel Metropole **** or similar",
        },
      ],
      image: "https://images.unsplash.com/photo-1527856263669-12c3a0af2aa6?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Free day in Interlaken",
      items: [
        {
          type: "highlight",
          label: "Explore Interlaken & the Jungfrau region",
          description:
            "A free day to explore. Take the train up to Jungfraujoch — the 'Top of Europe' — or browse the charming town centre.",
        },
        {
          type: "hotel",
          label: "Hotel Metropole **** or similar",
        },
      ],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Travel to Brig",
      items: [
        {
          type: "highlight",
          label: "Journey through the Valais",
          description:
            "Travel south through the Rhône valley to the sun-drenched town of Brig, gateway to the Simplon Pass.",
        },
        {
          type: "transport",
          label: "Scenic rail transfer",
          description: "Approx. 2 hours",
        },
        {
          type: "hotel",
          label: "Victoria *** or similar",
        },
      ],
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Day excursion to Zermatt",
      items: [
        {
          type: "highlight",
          label: "Visit Zermatt & the Matterhorn",
          description:
            "Join a full-day excursion to Zermatt, the car-free Alpine village below the iconic Matterhorn peak.",
        },
        {
          type: "transport",
          label: "Excursion from Brig",
          description: "Return by train · Included",
        },
        {
          type: "hotel",
          label: "Victoria *** or similar",
        },
      ],
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Glacier Express to Chur",
      items: [
        {
          type: "highlight",
          label: "Ride the legendary Glacier Express",
          description:
            "Considered the world's most scenic rail journey, the Glacier Express crosses 291 bridges and 91 tunnels on its 4-hour route from Brig to Chur.",
        },
        {
          type: "transport",
          label: "Glacier Express",
          description: "4 hours · Panoramic windows · Seat reservation included",
        },
        {
          type: "hotel",
          label: "Central Hotel Post *** or similar",
        },
      ],
      image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Bernina Express to Poschiavo",
      items: [
        {
          type: "highlight",
          label: "UNESCO-listed Bernina Express",
          description:
            "Take the Bernina Express over the highest railway pass in the Alps and down to the Italian-speaking village of Poschiavo. Return by regional train.",
        },
        {
          type: "transport",
          label: "Bernina Express · Regional return train",
          description: "UNESCO World Heritage route",
        },
        {
          type: "hotel",
          label: "Central Hotel Post *** or similar",
        },
      ],
      image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure day",
      items: [
        {
          type: "highlight",
          label: "Check out & onward travel",
          description:
            "Enjoy a final breakfast in Chur before heading onward. Switzerland's efficient rail network connects you easily to any Swiss airport.",
        },
      ],
    },
  ],

  // ── Included / Excluded ───────────────────────────────────────────────────
  included: [
    "7 nights' accommodation with daily breakfast",
    "Swiss Travel Pass covering all rail journeys",
    "Glacier Express seat reservation (Brig – Chur)",
    "Bernina Express seat reservation (Chur – Poschiavo)",
    "Luzern-Interlaken Express journey",
    "Zermatt day excursion from Brig",
    "English-speaking travel concierge",
    "All rail transfers between destinations",
  ],
  excluded: [
    "International flights to/from Switzerland",
    "Travel insurance",
    "Lunches and dinners (unless stated)",
    "Optional activities and entrance fees",
    "Jungfraujoch excursion (optional extra)",
    "Hotel extras (minibar, room service, etc.)",
    "Airport transfers",
  ],

  // ── TourCard fields (route breadcrumb) ───────────────────────────────────
  stops: [
    {
      destinationName: "Lucerne",
      dateRange: "Mar 31 – Apr 01",
      nights: 1,
      description: "Lucerne — the city, the lake, and the mountains.",
      accommodation: {
        hotelName: "De la Paix",
        stars: 3,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80",
        checkIn: "Mar 31", checkOut: "Apr 01",
        checkInISO: "2026-03-31", checkOutISO: "2026-04-01",
        roomType: "Double Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 47.0502, lng: 8.3093,
    },
    {
      destinationName: "Interlaken",
      dateRange: "Apr 01 – 03",
      nights: 2,
      description: "Between Lake Thun and Lake Brienz in the Bernese Oberland.",
      accommodation: {
        hotelName: "Hotel Metropole",
        stars: 4,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
        checkIn: "Apr 01", checkOut: "Apr 03",
        checkInISO: "2026-04-01", checkOutISO: "2026-04-03",
        roomType: "Double Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 46.6863, lng: 7.8632,
    },
    {
      destinationName: "Brig",
      dateRange: "Apr 03 – 05",
      nights: 2,
      description: "Sunny Upper Valais at the foot of the Simplon Pass.",
      accommodation: {
        hotelName: "Victoria",
        stars: 3,
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80",
        checkIn: "Apr 03", checkOut: "Apr 05",
        checkInISO: "2026-04-03", checkOutISO: "2026-04-05",
        roomType: "Double Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 46.3167, lng: 7.9872,
    },
    {
      destinationName: "Chur",
      dateRange: "Apr 05 – 07",
      nights: 2,
      description: "Switzerland's oldest city and gateway to Graubünden.",
      accommodation: {
        hotelName: "Central Hotel Post",
        stars: 3,
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80",
        checkIn: "Apr 05", checkOut: "Apr 07",
        checkInISO: "2026-04-05", checkOutISO: "2026-04-07",
        roomType: "Comfort Double Room", boardType: "Continental breakfast",
      },
      activities: [],
      lat: 46.8499, lng: 9.5329,
    },
  ],
  transfers: [
    {
      from: "Lucerne", to: "Interlaken",
      date: "Apr 01, Tour & Transfer", mode: "Tour & Transfer",
      description: "2h Panoramic journey on the Luzern-Interlaken Express",
    },
    {
      from: "Interlaken", to: "Brig",
      date: "Apr 03, Tour & Transfer", mode: "Tour & Transfer",
      description: "Scenic rail transfer through the Valais",
    },
    {
      from: "Brig", to: "Chur",
      date: "Apr 05, Tour & Transfer", mode: "Tour & Transfer",
      description: "4h Glacier Express — the world's most scenic train journey",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Thailand — "Classic Thailand Explorer"
// Maps to Discovery tour cards: Thailand (ids 1, 4, 7, 8, 9)
// ─────────────────────────────────────────────────────────────────────────────

export const THAILAND_EXPLORER_TOUR: Tour = {
  tourId: "thailand-explorer",
  title: "Classic Thailand Explorer",
  subtitle: "Temples, street food, elephant sanctuaries, and turquoise island beaches in one unforgettable journey.",
  tripType: "group-tour",
  duration: 8,
  locationsLabel: "Bangkok · Chiang Mai · Koh Samui",
  highlights: [
    "Grand Palace & Wat Pho",
    "Elephant sanctuary visit",
    "Floating markets",
    "Island beach time",
  ],
  mainImage: "https://picsum.photos/seed/thailand-hero/800/600",
  price: {
    perPerson: 1650,
    total: 3300,
    currency: "USD",
    paidBefore: 850,
    paidAtDestination: 800,
  },
  startDate: "Oct 05, 2026",
  endDate: "Oct 12, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           label: "Group tour (max 16)" },
    { iconKey: "languages",       label: "Guided in English" },
    { iconKey: "activity",        label: "Easy to moderate" },
    { iconKey: "calendar-check",  label: "Age 18+" },
  ],
  gallery: [
    "https://picsum.photos/seed/thailand-g1/800/600",
    "https://picsum.photos/seed/thailand-g2/800/600",
    "https://picsum.photos/seed/thailand-g3/800/600",
    "https://picsum.photos/seed/thailand-g4/800/600",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Bangkok",
      items: [
        { type: "highlight", label: "Welcome to Bangkok", description: "Arrive at Suvarnabhumi Airport. Transfer to your hotel in the heart of the city. Evening welcome dinner with the group." },
        { type: "hotel",    label: "Chatrium Hotel Riverside ****" },
      ],
      image: "https://picsum.photos/seed/thailand-day1/400/280",
    },
    {
      dayNumber: 2,
      title: "Bangkok Temples & Markets",
      items: [
        { type: "highlight",  label: "Grand Palace & Wat Pho", description: "Morning guided tour of the Grand Palace complex and the reclining Buddha at Wat Pho." },
        { type: "highlight",  label: "Chao Phraya River cruise", description: "Afternoon boat ride past golden temples and wooden stilt houses." },
        { type: "highlight",  label: "Chatuchak Weekend Market", description: "Explore one of the world's largest outdoor markets — 15,000 stalls." },
        { type: "hotel",      label: "Chatrium Hotel Riverside ****" },
      ],
      image: "https://picsum.photos/seed/thailand-day2/400/280",
    },
    {
      dayNumber: 3,
      title: "Floating Markets & Flight North",
      items: [
        { type: "highlight",  label: "Damnoen Saduak Floating Market", description: "Early morning canal boat tour through the iconic floating market." },
        { type: "transport",  label: "Bangkok → Chiang Mai (flight)", description: "1 hour 15 min · Domestic flight included" },
        { type: "hotel",      label: "Anantara Chiang Mai Resort *****" },
      ],
      image: "https://picsum.photos/seed/thailand-day3/400/280",
    },
    {
      dayNumber: 4,
      title: "Elephant Sanctuary",
      items: [
        { type: "highlight",  label: "Elephant Nature Park", description: "Full day at an ethical elephant sanctuary — feed, bathe, and walk alongside rescued elephants in the jungle." },
        { type: "hotel",      label: "Anantara Chiang Mai Resort *****" },
      ],
      image: "https://picsum.photos/seed/thailand-day4/400/280",
    },
    {
      dayNumber: 5,
      title: "Chiang Mai Old City",
      items: [
        { type: "highlight",  label: "Doi Suthep Temple", description: "Morning hike up 309 steps to Wat Phra That Doi Suthep for panoramic city views." },
        { type: "highlight",  label: "Night Bazaar", description: "Evening at the famous Chiang Mai Night Bazaar — handcrafts, silk, and street food." },
        { type: "hotel",      label: "Anantara Chiang Mai Resort *****" },
      ],
      image: "https://picsum.photos/seed/thailand-day5/400/280",
    },
    {
      dayNumber: 6,
      title: "Fly to Koh Samui",
      items: [
        { type: "transport",  label: "Chiang Mai → Koh Samui (flight)", description: "Approx. 2 hours · Domestic flight included" },
        { type: "highlight",  label: "Chaweng Beach afternoon", description: "Check in and spend the afternoon on the powdery white sand of Chaweng Beach." },
        { type: "hotel",      label: "Samui Palm Beach Resort ****" },
      ],
      image: "https://picsum.photos/seed/thailand-day6/400/280",
    },
    {
      dayNumber: 7,
      title: "Island & Snorkelling",
      items: [
        { type: "highlight",  label: "Angthong Marine Park boat trip", description: "Full-day speedboat excursion to the 42 uninhabited islands of Angthong National Marine Park. Snorkelling, kayaking, and a lagoon swim included." },
        { type: "hotel",      label: "Samui Palm Beach Resort ****" },
      ],
      image: "https://picsum.photos/seed/thailand-day7/400/280",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      items: [
        { type: "highlight", label: "Check out & farewell", description: "Final morning on the beach before transferring to Koh Samui Airport for onward flights." },
      ],
    },
  ],
  included: [
    "7 nights' accommodation (4–5 star throughout)",
    "Daily breakfast + 3 group dinners",
    "All domestic flights (Bangkok–Chiang Mai, Chiang Mai–Koh Samui)",
    "Elephant Nature Park full-day experience",
    "Angthong Marine Park speedboat trip",
    "Grand Palace & Wat Pho guided tour",
    "Floating market boat tour",
    "English-speaking group guide throughout",
    "All transfers & airport pickups",
  ],
  excluded: [
    "International flights to/from Thailand",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional spa treatments",
    "Personal expenses & tips",
    "Thai visa (if applicable)",
  ],
  stops: [
    {
      destinationName: "Bangkok",
      dateRange: "Oct 05 – 07",
      nights: 2,
      description: "Thailand's dazzling capital — temples, canals, street food, and world-class nightlife.",
      accommodation: {
        hotelName: "Chatrium Hotel Riverside",
        stars: 4,
        image: "https://picsum.photos/seed/bkk-hotel/400/300",
        checkIn: "Oct 05", checkOut: "Oct 07",
        checkInISO: "2026-10-05", checkOutISO: "2026-10-07",
        roomType: "Superior Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 13.7563, lng: 100.5018,
    },
    {
      destinationName: "Chiang Mai",
      dateRange: "Oct 07 – 10",
      nights: 3,
      description: "Northern Thailand's cultural heart — ancient temples, hill tribes, and elephant sanctuaries.",
      accommodation: {
        hotelName: "Anantara Chiang Mai Resort",
        stars: 5,
        image: "https://picsum.photos/seed/cnx-hotel/400/300",
        checkIn: "Oct 07", checkOut: "Oct 10",
        checkInISO: "2026-10-07", checkOutISO: "2026-10-10",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 18.7883, lng: 98.9853,
    },
    {
      destinationName: "Koh Samui",
      dateRange: "Oct 10 – 12",
      nights: 2,
      description: "Tropical island paradise with white-sand beaches and crystal-clear turquoise waters.",
      accommodation: {
        hotelName: "Samui Palm Beach Resort",
        stars: 4,
        image: "https://picsum.photos/seed/usm-hotel/400/300",
        checkIn: "Oct 10", checkOut: "Oct 12",
        checkInISO: "2026-10-10", checkOutISO: "2026-10-12",
        roomType: "Pool View Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 9.5120, lng: 100.0136,
    },
  ],
  transfers: [
    { from: "Bangkok", to: "Chiang Mai", date: "Oct 07, flight", mode: "Domestic flight", description: "1h 15m included domestic flight" },
    { from: "Chiang Mai", to: "Koh Samui", date: "Oct 10, flight", mode: "Domestic flight", description: "Approx. 2h domestic flight" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Bali — "Cultural Bali Discovery"
// Maps to Discovery tour cards: Indonesia/Bali (ids 2, 10, 11, 12)
// ─────────────────────────────────────────────────────────────────────────────

export const BALI_DISCOVERY_TOUR: Tour = {
  tourId: "bali-discovery",
  title: "Cultural Bali Discovery",
  subtitle: "Sacred temples, emerald rice terraces, artisan villages, and sunset sea views across the Island of the Gods.",
  tripType: "individual-tour",
  duration: 8,
  locationsLabel: "Ubud · Bedugul · Seminyak",
  highlights: [
    "Tegallalang Rice Terraces",
    "Traditional craft workshops",
    "Sacred temples & ceremonies",
    "Seminyak beach sunsets",
  ],
  mainImage: "https://picsum.photos/seed/bali-hero/800/600",
  price: {
    perPerson: 1980,
    total: 3960,
    currency: "USD",
    paidBefore: 1050,
    paidAtDestination: 930,
  },
  startDate: "Sep 14, 2026",
  endDate: "Sep 21, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           label: "Individual tour" },
    { iconKey: "languages",       label: "Guided in English" },
    { iconKey: "activity",        label: "All levels" },
    { iconKey: "calendar-check",  label: "Age 16+" },
  ],
  gallery: [
    "https://picsum.photos/seed/bali-g1/800/600",
    "https://picsum.photos/seed/bali-g2/800/600",
    "https://picsum.photos/seed/bali-g3/800/600",
    "https://picsum.photos/seed/bali-g4/800/600",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Ubud",
      items: [
        { type: "highlight", label: "Arrive at Ngurah Rai Airport", description: "Transfer north to Ubud, Bali's cultural and artistic heart. Evening welcome dinner at a traditional warung." },
        { type: "hotel",    label: "Komaneka at Bisma ***** or similar" },
      ],
      image: "https://picsum.photos/seed/bali-day1/400/280",
    },
    {
      dayNumber: 2,
      title: "Ubud Temples & Art",
      items: [
        { type: "highlight", label: "Tirta Empul Holy Spring Temple", description: "Watch or participate in a traditional Balinese purification ritual at this 10th-century sacred spring." },
        { type: "highlight", label: "Ubud Art Market & Monkey Forest", description: "Browse handmade textiles, silver jewellery, and woodcarvings before walking through the Sacred Monkey Forest Sanctuary." },
        { type: "hotel",    label: "Komaneka at Bisma *****" },
      ],
      image: "https://picsum.photos/seed/bali-day2/400/280",
    },
    {
      dayNumber: 3,
      title: "Rice Terraces & Crafts",
      items: [
        { type: "highlight", label: "Tegallalang Rice Terraces", description: "Morning walk through the UNESCO-listed terraced rice paddies, carved into the hillside over centuries." },
        { type: "highlight", label: "Silver & batik workshops", description: "Afternoon visits to artisan workshops in Celuk (silver) and Batuan (batik painting)." },
        { type: "hotel",    label: "Komaneka at Bisma *****" },
      ],
      image: "https://picsum.photos/seed/bali-day3/400/280",
    },
    {
      dayNumber: 4,
      title: "Bedugul Lake & Temple",
      items: [
        { type: "highlight", label: "Pura Ulun Danu Bratan", description: "Drive north to the iconic water temple dramatically perched on the edge of volcanic Lake Bratan." },
        { type: "highlight", label: "Jatiluwih UNESCO Rice Terraces", description: "A vast panorama of UNESCO-listed terraces — quieter and more dramatic than Tegallalang." },
        { type: "hotel",    label: "Komaneka at Bisma *****" },
      ],
      image: "https://picsum.photos/seed/bali-day4/400/280",
    },
    {
      dayNumber: 5,
      title: "Tanah Lot & Move to Seminyak",
      items: [
        { type: "highlight", label: "Tanah Lot Temple at sunset", description: "Bali's most photographed sight — a sea temple perched on a rocky outcrop, best seen as the sun dips below the horizon." },
        { type: "transport", label: "Transfer to Seminyak", description: "Approx. 45 minutes south to the coast" },
        { type: "hotel",    label: "The Layar *****" },
      ],
      image: "https://picsum.photos/seed/bali-day5/400/280",
    },
    {
      dayNumber: 6,
      title: "Seminyak Beach Day",
      items: [
        { type: "highlight", label: "Seminyak Beach free day", description: "A full free day to relax, surf, swim, or browse the boutiques and beach clubs of Seminyak and Petitenget." },
        { type: "hotel",    label: "The Layar *****" },
      ],
      image: "https://picsum.photos/seed/bali-day6/400/280",
    },
    {
      dayNumber: 7,
      title: "Uluwatu Cliff Temple",
      items: [
        { type: "highlight", label: "Uluwatu Temple & Kecak Fire Dance", description: "Clifftop temple 70m above the Indian Ocean. Evening Kecak fire dance performed at sunset on the clifftop stage — one of Bali's most memorable experiences." },
        { type: "hotel",    label: "The Layar *****" },
      ],
      image: "https://picsum.photos/seed/bali-day7/400/280",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      items: [
        { type: "highlight", label: "Check out & farewell", description: "Final morning in Seminyak before transferring to Ngurah Rai Airport. Ubud is just 90 minutes away — ideal for a last coffee stop." },
      ],
    },
  ],
  included: [
    "7 nights' accommodation (5-star villas & resorts)",
    "Daily breakfast throughout",
    "Tirta Empul Temple visit & entry fees",
    "Guided Tegallalang & Jatiluwih rice terrace walks",
    "Silver & batik workshop visits",
    "Pura Ulun Danu Bratan & Tanah Lot entry",
    "Kecak Fire Dance at Uluwatu (seat reserved)",
    "Private English-speaking driver-guide throughout",
    "All transfers & airport pickup",
  ],
  excluded: [
    "International flights to/from Bali",
    "Travel insurance",
    "Lunches and dinners (except welcome dinner)",
    "Optional spa or yoga sessions",
    "Personal shopping & tips",
    "Visa on arrival (if applicable)",
  ],
  stops: [
    {
      destinationName: "Ubud",
      dateRange: "Sep 14 – 18",
      nights: 4,
      description: "Bali's cultural capital — temples, rice paddies, and world-class Balinese cuisine.",
      accommodation: {
        hotelName: "Komaneka at Bisma",
        stars: 5,
        image: "https://picsum.photos/seed/ubud-hotel/400/300",
        checkIn: "Sep 14", checkOut: "Sep 18",
        checkInISO: "2026-09-14", checkOutISO: "2026-09-18",
        roomType: "Forest Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.5069, lng: 115.2625,
    },
    {
      destinationName: "Seminyak",
      dateRange: "Sep 18 – 21",
      nights: 3,
      description: "Bali's stylish beachfront neighbourhood — boutiques, beach clubs, and spectacular sunsets.",
      accommodation: {
        hotelName: "The Layar",
        stars: 5,
        image: "https://picsum.photos/seed/seminyak-hotel/400/300",
        checkIn: "Sep 18", checkOut: "Sep 21",
        checkInISO: "2026-09-18", checkOutISO: "2026-09-21",
        roomType: "1-Bedroom Private Pool Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.6905, lng: 115.1620,
    },
  ],
  transfers: [
    { from: "Ubud", to: "Seminyak", date: "Sep 18, transfer", mode: "Private car", description: "Approx. 45 min private transfer" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Peru — "Classic Peru Adventure"
// Maps to Discovery tour cards: Peru (ids 3, 5, 6, 13, 14, 15)
// ─────────────────────────────────────────────────────────────────────────────

export const PERU_ADVENTURE_TOUR: Tour = {
  tourId: "peru-adventure",
  title: "Classic Peru Adventure",
  subtitle: "From Lima's colonial heart to the ancient citadel of Machu Picchu and the Sacred Valley of the Incas.",
  tripType: "group-tour",
  duration: 8,
  locationsLabel: "Lima · Cusco · Sacred Valley · Machu Picchu",
  highlights: [
    "Machu Picchu guided tour",
    "Sacred Valley of the Incas",
    "Cusco colonial architecture",
    "Peru Rail scenic train",
  ],
  mainImage: "https://picsum.photos/seed/peru-hero/800/600",
  price: {
    perPerson: 1980,
    total: 3960,
    currency: "USD",
    paidBefore: 1050,
    paidAtDestination: 930,
  },
  startDate: "Jul 06, 2026",
  endDate: "Jul 13, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           label: "Group tour (max 12)" },
    { iconKey: "languages",       label: "Guided in English & Spanish" },
    { iconKey: "activity",        label: "Moderate (some walking at altitude)" },
    { iconKey: "calendar-check",  label: "Age 14+" },
  ],
  gallery: [
    "https://picsum.photos/seed/peru-g1/800/600",
    "https://picsum.photos/seed/peru-g2/800/600",
    "https://picsum.photos/seed/peru-g3/800/600",
    "https://picsum.photos/seed/peru-g4/800/600",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Lima",
      items: [
        { type: "highlight", label: "Welcome to Lima", description: "Arrive at Jorge Chávez International Airport. Transfer to the upscale Miraflores district. Welcome dinner at a celebrated cevichería." },
        { type: "hotel",    label: "JW Marriott Lima *****" },
      ],
      image: "https://picsum.photos/seed/peru-day1/400/280",
    },
    {
      dayNumber: 2,
      title: "Lima City & Fly to Cusco",
      items: [
        { type: "highlight", label: "Historic Lima Centro", description: "Morning tour of the Plaza Mayor, Cathedral, and the gold-leaf baroque church of San Francisco." },
        { type: "transport", label: "Lima → Cusco (flight)", description: "1 hour 20 min · Domestic flight included. Arrive at 3,400m — afternoon rest recommended." },
        { type: "hotel",    label: "Palacio del Inca *****" },
      ],
      image: "https://picsum.photos/seed/peru-day2/400/280",
    },
    {
      dayNumber: 3,
      title: "Cusco Exploration",
      items: [
        { type: "highlight", label: "Cusco Old City walking tour", description: "Explore the Inca and colonial architecture of the UNESCO-listed historic centre — Qorikancha, Cathedral, and Inca walls." },
        { type: "highlight", label: "San Pedro Market", description: "Taste local produce, chicherón, and fresh juices in Cusco's vibrant covered market." },
        { type: "hotel",    label: "Palacio del Inca *****" },
      ],
      image: "https://picsum.photos/seed/peru-day3/400/280",
    },
    {
      dayNumber: 4,
      title: "Sacred Valley",
      items: [
        { type: "highlight", label: "Pisac Inca ruins & market", description: "Morning at Pisac: hike the terraced hilltop ruins then browse the famous artisan market below." },
        { type: "highlight", label: "Ollantaytambo fortress", description: "Afternoon at the largest still-functioning Inca town — massive military terraces and a working water channel system." },
        { type: "hotel",    label: "Inkaterra Hacienda Urubamba *****" },
      ],
      image: "https://picsum.photos/seed/peru-day4/400/280",
    },
    {
      dayNumber: 5,
      title: "Machu Picchu",
      items: [
        { type: "transport", label: "Peru Rail: Ollantaytambo → Aguas Calientes", description: "Scenic valley train · 1h 40m · Seat included" },
        { type: "highlight", label: "Machu Picchu guided tour", description: "A full morning exploring the citadel with your expert guide — Sun Gate, Temple of the Sun, Intihuatana stone, and more." },
        { type: "hotel",    label: "Sumaq Machu Picchu Hotel *****" },
      ],
      image: "https://picsum.photos/seed/peru-day5/400/280",
    },
    {
      dayNumber: 6,
      title: "Machu Picchu free time & return",
      items: [
        { type: "highlight", label: "Second visit or Huayna Picchu hike", description: "Free morning to revisit the ruins or hike Huayna Picchu mountain for the iconic aerial view (optional, pre-booking required)." },
        { type: "transport", label: "Aguas Calientes → Cusco (train + transfer)", description: "Return journey included" },
        { type: "hotel",    label: "Palacio del Inca *****" },
      ],
      image: "https://picsum.photos/seed/peru-day6/400/280",
    },
    {
      dayNumber: 7,
      title: "Rainbow Mountain (optional) or Lima farewell",
      items: [
        { type: "highlight", label: "Vinicunca Rainbow Mountain", description: "Optional full-day hike to the striking coloured peaks at 5,200m (challenging — requires good fitness and acclimatisation)." },
        { type: "transport", label: "Cusco → Lima (evening flight)", description: "1h 20m · Domestic flight included" },
        { type: "hotel",    label: "JW Marriott Lima *****" },
      ],
      image: "https://picsum.photos/seed/peru-day7/400/280",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      items: [
        { type: "highlight", label: "Check out & farewell brunch", description: "Final morning in Miraflores. Lima's airport is 20 minutes from the hotel." },
      ],
    },
  ],
  included: [
    "7 nights' accommodation (5-star throughout)",
    "Daily breakfast + 2 group dinners (Lima & Cusco)",
    "All domestic flights (Lima–Cusco, Cusco–Lima)",
    "Peru Rail scenic train (Ollantaytambo–Aguas Calientes return)",
    "Machu Picchu bus tickets and entrance fee (2 visits)",
    "All guided tours: Lima, Cusco, Pisac, Ollantaytambo, Machu Picchu",
    "English- and Spanish-speaking expert guide",
    "All transfers and airport pickups",
    "Altitude sickness prevention kit",
  ],
  excluded: [
    "International flights to/from Peru",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional Huayna Picchu / Rainbow Mountain entry",
    "Personal expenses & tips",
    "Peruvian tourist card",
  ],
  stops: [
    {
      destinationName: "Lima",
      dateRange: "Jul 06 – 07",
      nights: 1,
      description: "Peru's capital on the Pacific coast — colonial history, world-renowned gastronomy, and the Miraflores clifftops.",
      accommodation: {
        hotelName: "JW Marriott Lima",
        stars: 5,
        image: "https://picsum.photos/seed/lima-hotel/400/300",
        checkIn: "Jul 06", checkOut: "Jul 07",
        checkInISO: "2026-07-06", checkOutISO: "2026-07-07",
        roomType: "Ocean View Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -12.1211, lng: -77.0298,
    },
    {
      destinationName: "Cusco",
      dateRange: "Jul 07 – 10",
      nights: 3,
      description: "The ancient Inca capital at 3,400m — cobbled streets, baroque churches built on Inca foundations.",
      accommodation: {
        hotelName: "Palacio del Inca",
        stars: 5,
        image: "https://picsum.photos/seed/cusco-hotel/400/300",
        checkIn: "Jul 07", checkOut: "Jul 10",
        checkInISO: "2026-07-07", checkOutISO: "2026-07-10",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -13.5319, lng: -71.9675,
    },
    {
      destinationName: "Sacred Valley",
      dateRange: "Jul 10 – 11",
      nights: 1,
      description: "The fertile Urubamba valley — Inca terraces, artisan markets, and the gateway to Machu Picchu.",
      accommodation: {
        hotelName: "Inkaterra Hacienda Urubamba",
        stars: 5,
        image: "https://picsum.photos/seed/valley-hotel/400/300",
        checkIn: "Jul 10", checkOut: "Jul 11",
        checkInISO: "2026-07-10", checkOutISO: "2026-07-11",
        roomType: "Hacienda Suite", boardType: "Full board",
      },
      activities: [],
      lat: -13.3200, lng: -72.1300,
    },
    {
      destinationName: "Machu Picchu",
      dateRange: "Jul 11 – 13",
      nights: 2,
      description: "The 15th-century Inca citadel — one of the world's greatest archaeological sites.",
      accommodation: {
        hotelName: "Sumaq Machu Picchu Hotel",
        stars: 5,
        image: "https://picsum.photos/seed/machupichu-hotel/400/300",
        checkIn: "Jul 11", checkOut: "Jul 13",
        checkInISO: "2026-07-11", checkOutISO: "2026-07-13",
        roomType: "Deluxe Andean Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -13.1631, lng: -72.5450,
    },
  ],
  transfers: [
    { from: "Lima", to: "Cusco", date: "Jul 07, flight", mode: "Domestic flight", description: "1h 20m included domestic flight" },
    { from: "Cusco", to: "Sacred Valley", date: "Jul 10, private transfer", mode: "Private coach", description: "Approx. 1h via Pisac" },
    { from: "Sacred Valley", to: "Machu Picchu", date: "Jul 11, Peru Rail", mode: "Scenic train", description: "1h 40m scenic valley train from Ollantaytambo" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Japan — "Japan Highlights"
// Maps to Discovery tour cards: Japan (ids 16, 17, 18)
// ─────────────────────────────────────────────────────────────────────────────

export const JAPAN_HIGHLIGHTS_TOUR: Tour = {
  tourId: "japan-highlights",
  title: "Japan Highlights",
  subtitle: "Tokyo skyscrapers, Kyoto's ancient temples, Hiroshima's peace parks, and Osaka street food — in one epic journey.",
  tripType: "group-tour",
  duration: 11,
  locationsLabel: "Tokyo · Hakone · Kyoto · Hiroshima · Osaka",
  highlights: [
    "Shinkansen bullet train",
    "Fushimi Inari shrine gates",
    "Mt Fuji views from Hakone",
    "Hiroshima Peace Memorial",
  ],
  mainImage: "https://picsum.photos/seed/japan-hero/800/600",
  price: {
    perPerson: 2890,
    total: 5780,
    currency: "USD",
    paidBefore: 1490,
    paidAtDestination: 1400,
  },
  startDate: "Apr 02, 2027",
  endDate: "Apr 12, 2027",
  adults: 2,
  attributes: [
    { iconKey: "users",           label: "Group tour (max 14)" },
    { iconKey: "languages",       label: "Guided in English" },
    { iconKey: "activity",        label: "Easy — mostly flat walking" },
    { iconKey: "calendar-check",  label: "All ages welcome" },
  ],
  gallery: [
    "https://picsum.photos/seed/japan-g1/800/600",
    "https://picsum.photos/seed/japan-g2/800/600",
    "https://picsum.photos/seed/japan-g3/800/600",
    "https://picsum.photos/seed/japan-g4/800/600",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Tokyo",
      items: [
        { type: "highlight", label: "Welcome to Tokyo", description: "Transfer from Narita or Haneda to your hotel in Shinjuku. Evening walk through the neon-lit streets of Kabukicho." },
        { type: "hotel",    label: "Park Hyatt Tokyo *****" },
      ],
      image: "https://picsum.photos/seed/japan-day1/400/280",
    },
    {
      dayNumber: 2,
      title: "Tokyo Highlights",
      items: [
        { type: "highlight", label: "Tsukiji Outer Market breakfast", description: "Start the day with the freshest sushi and tamagoyaki at the famous outer market." },
        { type: "highlight", label: "Shibuya Crossing & Meiji Shrine", description: "Afternoon: the world's busiest pedestrian crossing, then a peaceful forest walk to the Shinto Meiji Jingu shrine." },
        { type: "hotel",    label: "Park Hyatt Tokyo *****" },
      ],
      image: "https://picsum.photos/seed/japan-day2/400/280",
    },
    {
      dayNumber: 3,
      title: "Asakusa & TeamLab",
      items: [
        { type: "highlight", label: "Senso-ji Temple, Asakusa", description: "Tokyo's oldest and most colourful temple — arrive early for the best atmosphere before the crowds." },
        { type: "highlight", label: "teamLab Borderless digital art museum", description: "Immersive digital art environment — one of Tokyo's most unique experiences." },
        { type: "hotel",    label: "Park Hyatt Tokyo *****" },
      ],
      image: "https://picsum.photos/seed/japan-day3/400/280",
    },
    {
      dayNumber: 4,
      title: "Hakone & Mt Fuji Views",
      items: [
        { type: "transport", label: "Tokyo → Hakone (Romancecar express)", description: "Approx. 85 min scenic mountain railway included" },
        { type: "highlight", label: "Hakone Open-Air Museum & Ropeway", description: "Art installations against mountain backdrop, then a gondola ride across Lake Ashi for classic Fuji views (weather permitting)." },
        { type: "hotel",    label: "Hakone Kowakien Ten-yu *****" },
      ],
      image: "https://picsum.photos/seed/japan-day4/400/280",
    },
    {
      dayNumber: 5,
      title: "Bullet Train to Kyoto",
      items: [
        { type: "transport", label: "Hakone → Kyoto (Shinkansen)", description: "Approx. 2h 20m · Japan Rail Pass covers this journey" },
        { type: "highlight", label: "Gion Evening Walk", description: "Stroll through Kyoto's historic geisha district at dusk — you may spot a maiko on her way to an appointment." },
        { type: "hotel",    label: "Hyatt Regency Kyoto *****" },
      ],
      image: "https://picsum.photos/seed/japan-day5/400/280",
    },
    {
      dayNumber: 6,
      title: "Kyoto Temples",
      items: [
        { type: "highlight", label: "Fushimi Inari Shrine", description: "Early morning hike through thousands of vermilion torii gates winding up the mountain — magical before the crowds arrive." },
        { type: "highlight", label: "Kinkaku-ji Golden Pavilion", description: "Kyoto's most iconic sight — a Zen temple covered in gold leaf reflected on a mirror pond." },
        { type: "hotel",    label: "Hyatt Regency Kyoto *****" },
      ],
      image: "https://picsum.photos/seed/japan-day6/400/280",
    },
    {
      dayNumber: 7,
      title: "Arashiyama Bamboo Grove",
      items: [
        { type: "highlight", label: "Arashiyama Bamboo Grove", description: "Walk through towering bamboo stalks at dawn — one of the world's most surreal natural landscapes." },
        { type: "highlight", label: "Tenryu-ji Garden", description: "UNESCO World Heritage Zen garden with a pond designed to frame the mountains beyond." },
        { type: "hotel",    label: "Hyatt Regency Kyoto *****" },
      ],
      image: "https://picsum.photos/seed/japan-day7/400/280",
    },
    {
      dayNumber: 8,
      title: "Day Trip to Hiroshima & Miyajima",
      items: [
        { type: "transport", label: "Kyoto → Hiroshima (Shinkansen)", description: "Approx. 1h · JR Pass included" },
        { type: "highlight", label: "Peace Memorial Museum & Park", description: "Moving and essential — the A-Bomb Dome, the Paper Crane memorial, and the Peace Museum." },
        { type: "highlight", label: "Miyajima Island & Floating Torii", description: "Ferry to the sacred island and the iconic floating torii gate of Itsukushima Shrine." },
        { type: "hotel",    label: "Hyatt Regency Kyoto *****" },
      ],
      image: "https://picsum.photos/seed/japan-day8/400/280",
    },
    {
      dayNumber: 9,
      title: "Move to Osaka",
      items: [
        { type: "transport", label: "Kyoto → Osaka (Shinkansen, 15 min)", description: "JR Pass covered" },
        { type: "highlight", label: "Osaka Castle", description: "Afternoon visit to the magnificent 16th-century castle and its surrounding parkland." },
        { type: "highlight", label: "Dotonbori Street Food Walk", description: "Evening in Osaka's famous dining strip — takoyaki, ramen, kushikatsu, and neon signs everywhere." },
        { type: "hotel",    label: "Conrad Osaka *****" },
      ],
      image: "https://picsum.photos/seed/japan-day9/400/280",
    },
    {
      dayNumber: 10,
      title: "Osaka Free Day",
      items: [
        { type: "highlight", label: "Kuromon Ichiba Market", description: "Known as 'Osaka's Kitchen' — a covered market selling everything from fresh seafood to Wagyu beef." },
        { type: "highlight", label: "Day trip to Nara (optional)", description: "45 min by train — roam freely with 1,200 semi-tame deer in Nara Park and visit the giant bronze Buddha at Todai-ji." },
        { type: "hotel",    label: "Conrad Osaka *****" },
      ],
      image: "https://picsum.photos/seed/japan-day10/400/280",
    },
    {
      dayNumber: 11,
      title: "Departure Day",
      items: [
        { type: "highlight", label: "Farewell & check out", description: "Transfer to Kansai International Airport (KIX) for international departures." },
      ],
    },
  ],
  included: [
    "10 nights' accommodation (5-star throughout)",
    "Daily breakfast + 3 group dinners",
    "Japan Rail Pass (7-day) covering all Shinkansen journeys",
    "Hakone Romancecar express & Hakone Ropeway",
    "All guided tours: Tokyo, Hakone, Kyoto, Hiroshima, Osaka",
    "TeamLab Borderless museum ticket",
    "Hiroshima Peace Museum entry",
    "Miyajima ferry return",
    "English-speaking expert guide throughout",
    "All transfers & airport pickup",
  ],
  excluded: [
    "International flights to/from Japan",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional Nara day trip (self-guided)",
    "Personal expenses & tips",
    "Japan tourist visa (if applicable)",
  ],
  stops: [
    {
      destinationName: "Tokyo",
      dateRange: "Apr 02 – 05",
      nights: 3,
      description: "Japan's hyper-modern capital — neon districts, ancient shrines, and the world's best ramen.",
      accommodation: {
        hotelName: "Park Hyatt Tokyo",
        stars: 5,
        image: "https://picsum.photos/seed/tokyo-hotel/400/300",
        checkIn: "Apr 02", checkOut: "Apr 05",
        checkInISO: "2027-04-02", checkOutISO: "2027-04-05",
        roomType: "Park Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 35.6762, lng: 139.6503,
    },
    {
      destinationName: "Hakone",
      dateRange: "Apr 05 – 06",
      nights: 1,
      description: "Mountain retreat with hot-spring ryokan, the Hakone Ropeway, and Mt Fuji views.",
      accommodation: {
        hotelName: "Hakone Kowakien Ten-yu",
        stars: 5,
        image: "https://picsum.photos/seed/hakone-hotel/400/300",
        checkIn: "Apr 05", checkOut: "Apr 06",
        checkInISO: "2027-04-05", checkOutISO: "2027-04-06",
        roomType: "Mountain View Room", boardType: "Full board (kaiseki)",
      },
      activities: [],
      lat: 35.2322, lng: 139.1069,
    },
    {
      destinationName: "Kyoto",
      dateRange: "Apr 06 – 09",
      nights: 3,
      description: "Japan's ancient imperial capital — 1,600 Buddhist temples, Zen gardens, and geisha districts.",
      accommodation: {
        hotelName: "Hyatt Regency Kyoto",
        stars: 5,
        image: "https://picsum.photos/seed/kyoto-hotel/400/300",
        checkIn: "Apr 06", checkOut: "Apr 09",
        checkInISO: "2027-04-06", checkOutISO: "2027-04-09",
        roomType: "Regency King Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 35.0116, lng: 135.7681,
    },
    {
      destinationName: "Osaka",
      dateRange: "Apr 10 – 12",
      nights: 2,
      description: "Japan's food capital — Dotonbori, Osaka Castle, and the most vibrant street food scene in the country.",
      accommodation: {
        hotelName: "Conrad Osaka",
        stars: 5,
        image: "https://picsum.photos/seed/osaka-hotel/400/300",
        checkIn: "Apr 10", checkOut: "Apr 12",
        checkInISO: "2027-04-10", checkOutISO: "2027-04-12",
        roomType: "Corner Suite", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 34.6937, lng: 135.5023,
    },
  ],
  transfers: [
    { from: "Tokyo", to: "Hakone", date: "Apr 05, Romancecar", mode: "Scenic train", description: "85 min Odakyu Romancecar express" },
    { from: "Hakone", to: "Kyoto", date: "Apr 06, Shinkansen", mode: "Bullet train", description: "Approx. 2h 20m via Odawara" },
    { from: "Kyoto", to: "Osaka", date: "Apr 10, Shinkansen", mode: "Bullet train", description: "15 min · JR Pass covered" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Morocco — "Imperial Cities of Morocco"
// Maps to Discovery tour cards: Morocco (ids 19, 20, 21)
// ─────────────────────────────────────────────────────────────────────────────

export const MOROCCO_IMPERIAL_TOUR: Tour = {
  tourId: "morocco-imperial",
  title: "Imperial Cities of Morocco",
  subtitle: "Four royal capitals, ancient medinas, the vast Sahara, and the blue city of Chefchaouen in one magnificent circuit.",
  tripType: "group-tour",
  duration: 9,
  locationsLabel: "Casablanca · Fes · Sahara · Marrakech",
  highlights: [
    "Fes medieval medina",
    "Sahara camel trek & camp",
    "Marrakech souks & Djemaa el-Fna",
    "Blue city of Chefchaouen",
  ],
  mainImage: "https://picsum.photos/seed/morocco-hero/800/600",
  price: {
    perPerson: 1540,
    total: 3080,
    currency: "USD",
    paidBefore: 800,
    paidAtDestination: 740,
  },
  startDate: "Nov 09, 2026",
  endDate: "Nov 17, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           label: "Group tour (max 14)" },
    { iconKey: "languages",       label: "Guided in English & French" },
    { iconKey: "activity",        label: "Easy to moderate" },
    { iconKey: "calendar-check",  label: "Age 16+" },
  ],
  gallery: [
    "https://picsum.photos/seed/morocco-g1/800/600",
    "https://picsum.photos/seed/morocco-g2/800/600",
    "https://picsum.photos/seed/morocco-g3/800/600",
    "https://picsum.photos/seed/morocco-g4/800/600",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Casablanca",
      items: [
        { type: "highlight", label: "Hassan II Mosque", description: "Arrive at Mohammed V Airport. Transfer to Casablanca. Visit the spectacular Hassan II Mosque — the world's third largest, partly built over the Atlantic Ocean." },
        { type: "hotel",    label: "Four Seasons Casablanca *****" },
      ],
      image: "https://picsum.photos/seed/morocco-day1/400/280",
    },
    {
      dayNumber: 2,
      title: "Drive North to Chefchaouen",
      items: [
        { type: "transport", label: "Casablanca → Chefchaouen", description: "Approx. 4h by private coach through the Rif Mountains" },
        { type: "highlight", label: "Chefchaouen Blue City walk", description: "Wander the labyrinthine alleys of this photogenic mountain town — every surface washed in vivid shades of blue." },
        { type: "hotel",    label: "Riad Lina & Spa ****" },
      ],
      image: "https://picsum.photos/seed/morocco-day2/400/280",
    },
    {
      dayNumber: 3,
      title: "Ancient Fes",
      items: [
        { type: "transport", label: "Chefchaouen → Fes", description: "Approx. 3h" },
        { type: "highlight", label: "Fes el-Bali medina guided tour", description: "The world's largest medieval city on foot — the Chouara tanneries, Bou Inania madrasa, and the blue gate of Bab Bou Jeloud." },
        { type: "hotel",    label: "Riad Fes ***** or similar" },
      ],
      image: "https://picsum.photos/seed/morocco-day3/400/280",
    },
    {
      dayNumber: 4,
      title: "Fes Deep Dive",
      items: [
        { type: "highlight", label: "Al-Qarawiyyin — the world's oldest university", description: "Founded in 859 AD, this mosque-university complex is still active today." },
        { type: "highlight", label: "Pottery & zellige tile workshop visit", description: "Watch master craftsmen paint intricate Fassi geometric patterns by hand." },
        { type: "hotel",    label: "Riad Fes *****" },
      ],
      image: "https://picsum.photos/seed/morocco-day4/400/280",
    },
    {
      dayNumber: 5,
      title: "Across the Atlas to the Sahara",
      items: [
        { type: "transport", label: "Fes → Merzouga (private coach, full day)", description: "Over the Middle Atlas — cedar forests, the town of Ifrane, and down through the Ziz palm valley gorge" },
        { type: "highlight", label: "Erg Chebbi sand dunes", description: "Arrive at dusk as the great orange dunes of Erg Chebbi glow in the last light." },
        { type: "hotel",    label: "Kasbah Mohayut Desert Camp *****" },
      ],
      image: "https://picsum.photos/seed/morocco-day5/400/280",
    },
    {
      dayNumber: 6,
      title: "Sahara Camel Trek & Sunrise",
      items: [
        { type: "highlight", label: "Sunset camel trek into the dunes", description: "Ride out into the Sahara as the sun sets, guided to a traditional Berber camp for dinner under a sky full of stars." },
        { type: "highlight", label: "Sunrise on the dunes", description: "Early morning hike to a high dune to watch the sun rise over thousands of kilometres of empty desert." },
        { type: "hotel",    label: "Kasbah Mohayut Desert Camp *****" },
      ],
      image: "https://picsum.photos/seed/morocco-day6/400/280",
    },
    {
      dayNumber: 7,
      title: "Draa Valley & Kasbahs",
      items: [
        { type: "transport", label: "Merzouga → Ouarzazate via Draa Valley", description: "Approx. 5h — through the Valley of a Thousand Kasbahs" },
        { type: "highlight", label: "Aït Benhaddou UNESCO kasbah", description: "A fortified ksar of mud-brick towers — one of Morocco's most spectacular sights and a famous film location." },
        { type: "hotel",    label: "Berber Palace Ouarzazate ****" },
      ],
      image: "https://picsum.photos/seed/morocco-day7/400/280",
    },
    {
      dayNumber: 8,
      title: "Over the Atlas to Marrakech",
      items: [
        { type: "transport", label: "Ouarzazate → Marrakech (Tizi n'Tichka pass)", description: "Approx. 4h — the highest road pass in the Atlas Mountains at 2,260m" },
        { type: "highlight", label: "Djemaa el-Fna square", description: "Arrive in Marrakech and dive straight into the world's greatest open-air theatre — snake charmers, storytellers, and food stalls under the stars." },
        { type: "hotel",    label: "Royal Mansour Marrakech *****" },
      ],
      image: "https://picsum.photos/seed/morocco-day8/400/280",
    },
    {
      dayNumber: 9,
      title: "Departure Day",
      items: [
        { type: "highlight", label: "Medina & farewell", description: "Morning exploration of the Marrakech souks and Bahia Palace before transferring to Menara Airport." },
      ],
    },
  ],
  included: [
    "8 nights' accommodation (4–5 star riads & desert camp)",
    "Daily breakfast throughout",
    "All private coach transfers between cities",
    "Guided tours: Fes medina, Chefchaouen, Aït Benhaddou",
    "Sahara camel trek and traditional desert camp (1 night)",
    "Pottery & zellige tile workshop",
    "Hassan II Mosque guided entry",
    "English- and French-speaking expert guide",
    "All airport pickups",
  ],
  excluded: [
    "International flights to/from Morocco",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional hammam visit",
    "Personal shopping & tips",
    "Moroccan visa (most EU/UK passport holders visa-free)",
  ],
  stops: [
    {
      destinationName: "Casablanca",
      dateRange: "Nov 09 – 10",
      nights: 1,
      description: "Morocco's cosmopolitan business hub — Art Deco boulevards and the iconic Hassan II Mosque.",
      accommodation: {
        hotelName: "Four Seasons Casablanca",
        stars: 5,
        image: "https://picsum.photos/seed/casa-hotel/400/300",
        checkIn: "Nov 09", checkOut: "Nov 10",
        checkInISO: "2026-11-09", checkOutISO: "2026-11-10",
        roomType: "Ocean View Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 33.5731, lng: -7.5898,
    },
    {
      destinationName: "Fes",
      dateRange: "Nov 10 – 12",
      nights: 2,
      description: "The spiritual and cultural heart of Morocco — the world's largest car-free medieval city.",
      accommodation: {
        hotelName: "Riad Fes",
        stars: 5,
        image: "https://picsum.photos/seed/fes-hotel/400/300",
        checkIn: "Nov 10", checkOut: "Nov 12",
        checkInISO: "2026-11-10", checkOutISO: "2026-11-12",
        roomType: "Luxury Riad Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 34.0181, lng: -5.0078,
    },
    {
      destinationName: "Sahara (Merzouga)",
      dateRange: "Nov 12 – 14",
      nights: 2,
      description: "The Erg Chebbi dunes — Morocco's most dramatic desert landscape with camel treks and starry skies.",
      accommodation: {
        hotelName: "Kasbah Mohayut Desert Camp",
        stars: 5,
        image: "https://picsum.photos/seed/sahara-hotel/400/300",
        checkIn: "Nov 12", checkOut: "Nov 14",
        checkInISO: "2026-11-12", checkOutISO: "2026-11-14",
        roomType: "Desert Suite", boardType: "Full board",
      },
      activities: [],
      lat: 31.1000, lng: -3.9667,
    },
    {
      destinationName: "Marrakech",
      dateRange: "Nov 15 – 17",
      nights: 2,
      description: "The Red City — vibrant souks, Djemaa el-Fna, and the most famous riads in the world.",
      accommodation: {
        hotelName: "Royal Mansour Marrakech",
        stars: 5,
        image: "https://picsum.photos/seed/marrakech-hotel/400/300",
        checkIn: "Nov 15", checkOut: "Nov 17",
        checkInISO: "2026-11-15", checkOutISO: "2026-11-17",
        roomType: "Private Riad", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 31.6295, lng: -7.9811,
    },
  ],
  transfers: [
    { from: "Casablanca", to: "Fes (via Chefchaouen)", date: "Nov 10, coach", mode: "Private coach", description: "Via the blue city of Chefchaouen — approx. 7h total" },
    { from: "Fes", to: "Merzouga", date: "Nov 12, coach", mode: "Private coach", description: "Full-day drive over the Atlas — approx. 9h with stops" },
    { from: "Merzouga", to: "Marrakech (via Ouarzazate)", date: "Nov 14–15, coach", mode: "Private coach", description: "Via Aït Benhaddou and Tizi n'Tichka mountain pass" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Master lookup — used by App.tsx to find a Tour by tourId
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_TOURS: Tour[] = [
  SWISS_WINTER_TOUR,
  THAILAND_EXPLORER_TOUR,
  BALI_DISCOVERY_TOUR,
  PERU_ADVENTURE_TOUR,
  JAPAN_HIGHLIGHTS_TOUR,
  MOROCCO_IMPERIAL_TOUR,
];

// Maps a Discovery TourCardData.id to a Tour object.
// Multiple cards can map to the same Tour (e.g. all Thailand cards → THAILAND_EXPLORER_TOUR).
export const DISCOVERY_TOUR_MAP: Record<number, Tour> = {
  1:  THAILAND_EXPLORER_TOUR,   // Classic Thailand Explorer
  2:  BALI_DISCOVERY_TOUR,      // Cultural Bali Discovery
  3:  PERU_ADVENTURE_TOUR,      // Classic Peru Adventure
  4:  THAILAND_EXPLORER_TOUR,   // Island Paradise (Thailand)
  5:  PERU_ADVENTURE_TOUR,      // Inca Trail Adventure
  6:  PERU_ADVENTURE_TOUR,      // Amazon & Andes
  7:  THAILAND_EXPLORER_TOUR,   // Bangkok & Beyond
  8:  THAILAND_EXPLORER_TOUR,   // Northern Thailand Highlights
  9:  THAILAND_EXPLORER_TOUR,   // Phuket & the Islands
  10: BALI_DISCOVERY_TOUR,      // Bali Bliss
  11: BALI_DISCOVERY_TOUR,      // Java & Bali Explorer
  12: BALI_DISCOVERY_TOUR,      // Lombok & the Gilis
  13: PERU_ADVENTURE_TOUR,      // Classic Peru Adventure (v2)
  14: PERU_ADVENTURE_TOUR,      // Inca Trail Adventure (v2)
  15: PERU_ADVENTURE_TOUR,      // Amazon & Andes (v2)
  16: JAPAN_HIGHLIGHTS_TOUR,    // Japan Highlights
  17: JAPAN_HIGHLIGHTS_TOUR,    // Kyoto & Beyond
  18: JAPAN_HIGHLIGHTS_TOUR,    // Japan Rail Adventure
  19: MOROCCO_IMPERIAL_TOUR,    // Imperial Cities of Morocco
  20: MOROCCO_IMPERIAL_TOUR,    // Sahara & Kasbahs
  21: MOROCCO_IMPERIAL_TOUR,    // Coastal Morocco
};
