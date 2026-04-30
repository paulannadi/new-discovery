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
  destinationCodes: ["SWITZERLAND"],

  // ── Quick-fact attribute chips ────────────────────────────────────────────
  attributes: [
    { iconKey: "users",           title: "Group size",  value: "Individual tour" },
    { iconKey: "activity",        title: "Activity",    value: "All levels" },
    { iconKey: "languages",       title: "Language",    value: "English" },
    { iconKey: "calendar-check",  title: "Min age",     value: "18+" },
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
      location: "Lucerne",
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
      location: "Lucerne → Interlaken",
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
      location: "Interlaken",
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
      location: "Interlaken → Brig",
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
      location: "Brig → Zermatt",
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
      location: "Brig → Chur",
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
      location: "Chur → Poschiavo",
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
      location: "Chur",
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
  mainImage: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
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
    { iconKey: "users",           title: "Group size",  value: "Max 16 travellers" },
    { iconKey: "activity",        title: "Activity",    value: "Easy to moderate" },
    { iconKey: "languages",       title: "Language",    value: "English" },
    { iconKey: "calendar-check",  title: "Min age",     value: "18+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80",
    "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Bangkok",
      location: "Bangkok",
      items: [
        { type: "highlight", label: "Welcome to Bangkok", description: "Arrive at Suvarnabhumi Airport. Transfer to your hotel in the heart of the city. Evening welcome dinner with the group." },
        { type: "hotel",    label: "Chatrium Hotel Riverside ****" },
      ],
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80",
    },
    {
      dayNumber: 2,
      title: "Bangkok Temples & Markets",
      location: "Bangkok",
      items: [
        { type: "highlight",  label: "Grand Palace & Wat Pho", description: "Morning guided tour of the Grand Palace complex and the reclining Buddha at Wat Pho." },
        { type: "highlight",  label: "Chao Phraya River cruise", description: "Afternoon boat ride past golden temples and wooden stilt houses." },
        { type: "highlight",  label: "Chatuchak Weekend Market", description: "Explore one of the world's largest outdoor markets — 15,000 stalls." },
        { type: "hotel",      label: "Chatrium Hotel Riverside ****" },
      ],
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80",
    },
    {
      dayNumber: 3,
      title: "Floating Markets & Flight North",
      location: "Bangkok → Chiang Mai",
      items: [
        { type: "highlight",  label: "Damnoen Saduak Floating Market", description: "Early morning canal boat tour through the iconic floating market." },
        { type: "transport",  label: "Bangkok → Chiang Mai (flight)", description: "1 hour 15 min · Domestic flight included" },
        { type: "hotel",      label: "Anantara Chiang Mai Resort *****" },
      ],
      image: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=400&q=80",
    },
    {
      dayNumber: 4,
      title: "Elephant Sanctuary",
      location: "Chiang Mai",
      items: [
        { type: "highlight",  label: "Elephant Nature Park", description: "Full day at an ethical elephant sanctuary — feed, bathe, and walk alongside rescued elephants in the jungle." },
        { type: "hotel",      label: "Anantara Chiang Mai Resort *****" },
      ],
      image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80",
    },
    {
      dayNumber: 5,
      title: "Chiang Mai Old City",
      location: "Chiang Mai",
      items: [
        { type: "highlight",  label: "Doi Suthep Temple", description: "Morning hike up 309 steps to Wat Phra That Doi Suthep for panoramic city views." },
        { type: "highlight",  label: "Night Bazaar", description: "Evening at the famous Chiang Mai Night Bazaar — handcrafts, silk, and street food." },
        { type: "hotel",      label: "Anantara Chiang Mai Resort *****" },
      ],
      image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=400&q=80",
    },
    {
      dayNumber: 6,
      title: "Fly to Koh Samui",
      location: "Chiang Mai → Koh Samui",
      items: [
        { type: "transport",  label: "Chiang Mai → Koh Samui (flight)", description: "Approx. 2 hours · Domestic flight included" },
        { type: "highlight",  label: "Chaweng Beach afternoon", description: "Check in and spend the afternoon on the powdery white sand of Chaweng Beach." },
        { type: "hotel",      label: "Samui Palm Beach Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=400&q=80",
    },
    {
      dayNumber: 7,
      title: "Island & Snorkelling",
      location: "Koh Samui",
      items: [
        { type: "highlight",  label: "Angthong Marine Park boat trip", description: "Full-day speedboat excursion to the 42 uninhabited islands of Angthong National Marine Park. Snorkelling, kayaking, and a lagoon swim included." },
        { type: "hotel",      label: "Samui Palm Beach Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      location: "Koh Samui",
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
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
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
  destinationCodes: ["PHUKET"],
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
  mainImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
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
    { iconKey: "users",           title: "Group size",  value: "Individual tour" },
    { iconKey: "activity",        title: "Activity",    value: "All levels" },
    { iconKey: "languages",       title: "Language",    value: "English" },
    { iconKey: "calendar-check",  title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
    "https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80",
    "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Ubud",
      location: "Denpasar → Ubud",
      items: [
        { type: "highlight", label: "Arrive at Ngurah Rai Airport", description: "Transfer north to Ubud, Bali's cultural and artistic heart. Evening welcome dinner at a traditional warung." },
        { type: "hotel",    label: "Komaneka at Bisma ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80",
    },
    {
      dayNumber: 2,
      title: "Ubud Temples & Art",
      location: "Ubud",
      items: [
        { type: "highlight", label: "Tirta Empul Holy Spring Temple", description: "Watch or participate in a traditional Balinese purification ritual at this 10th-century sacred spring." },
        { type: "highlight", label: "Ubud Art Market & Monkey Forest", description: "Browse handmade textiles, silver jewellery, and woodcarvings before walking through the Sacred Monkey Forest Sanctuary." },
        { type: "hotel",    label: "Komaneka at Bisma *****" },
      ],
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=80",
    },
    {
      dayNumber: 3,
      title: "Rice Terraces & Crafts",
      location: "Ubud",
      items: [
        { type: "highlight", label: "Tegallalang Rice Terraces", description: "Morning walk through the UNESCO-listed terraced rice paddies, carved into the hillside over centuries." },
        { type: "highlight", label: "Silver & batik workshops", description: "Afternoon visits to artisan workshops in Celuk (silver) and Batuan (batik painting)." },
        { type: "hotel",    label: "Komaneka at Bisma *****" },
      ],
      image: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&q=80",
    },
    {
      dayNumber: 4,
      title: "Bedugul Lake & Temple",
      location: "Bedugul",
      items: [
        { type: "highlight", label: "Pura Ulun Danu Bratan", description: "Drive north to the iconic water temple dramatically perched on the edge of volcanic Lake Bratan." },
        { type: "highlight", label: "Jatiluwih UNESCO Rice Terraces", description: "A vast panorama of UNESCO-listed terraces — quieter and more dramatic than Tegallalang." },
        { type: "hotel",    label: "Komaneka at Bisma *****" },
      ],
      image: "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=400&q=80",
    },
    {
      dayNumber: 5,
      title: "Tanah Lot & Move to Seminyak",
      location: "Ubud → Seminyak",
      items: [
        { type: "highlight", label: "Tanah Lot Temple at sunset", description: "Bali's most photographed sight — a sea temple perched on a rocky outcrop, best seen as the sun dips below the horizon." },
        { type: "transport", label: "Transfer to Seminyak", description: "Approx. 45 minutes south to the coast" },
        { type: "hotel",    label: "The Layar *****" },
      ],
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400&q=80",
    },
    {
      dayNumber: 6,
      title: "Seminyak Beach Day",
      location: "Seminyak",
      items: [
        { type: "highlight", label: "Seminyak Beach free day", description: "A full free day to relax, surf, swim, or browse the boutiques and beach clubs of Seminyak and Petitenget." },
        { type: "hotel",    label: "The Layar *****" },
      ],
      image: "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=400&q=80",
    },
    {
      dayNumber: 7,
      title: "Uluwatu Cliff Temple",
      location: "Seminyak → Uluwatu",
      items: [
        { type: "highlight", label: "Uluwatu Temple & Kecak Fire Dance", description: "Clifftop temple 70m above the Indian Ocean. Evening Kecak fire dance performed at sunset on the clifftop stage — one of Bali's most memorable experiences." },
        { type: "hotel",    label: "The Layar *****" },
      ],
      image: "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      location: "Seminyak → Denpasar",
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
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
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
  destinationCodes: ["BALI"],
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
  mainImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
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
    { iconKey: "users",           title: "Group size",  value: "Max 12 travellers" },
    { iconKey: "activity",        title: "Activity",    value: "Moderate" },
    { iconKey: "languages",       title: "Language",    value: "English & Spanish" },
    { iconKey: "calendar-check",  title: "Min age",     value: "14+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800&q=80",
    "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    "https://images.unsplash.com/photo-1591266752934-9cb8c1a3804b?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Lima",
      items: [
        { type: "highlight", label: "Welcome to Lima", description: "Arrive at Jorge Chávez International Airport. Transfer to the upscale Miraflores district. Welcome dinner at a celebrated cevichería." },
        { type: "hotel",    label: "JW Marriott Lima *****" },
      ],
      image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=400&q=80",
    },
    {
      dayNumber: 2,
      title: "Lima City & Fly to Cusco",
      items: [
        { type: "highlight", label: "Historic Lima Centro", description: "Morning tour of the Plaza Mayor, Cathedral, and the gold-leaf baroque church of San Francisco." },
        { type: "transport", label: "Lima → Cusco (flight)", description: "1 hour 20 min · Domestic flight included. Arrive at 3,400m — afternoon rest recommended." },
        { type: "hotel",    label: "Palacio del Inca *****" },
      ],
      image: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=400&q=80",
    },
    {
      dayNumber: 3,
      title: "Cusco Exploration",
      items: [
        { type: "highlight", label: "Cusco Old City walking tour", description: "Explore the Inca and colonial architecture of the UNESCO-listed historic centre — Qorikancha, Cathedral, and Inca walls." },
        { type: "highlight", label: "San Pedro Market", description: "Taste local produce, chicherón, and fresh juices in Cusco's vibrant covered market." },
        { type: "hotel",    label: "Palacio del Inca *****" },
      ],
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&q=80",
    },
    {
      dayNumber: 4,
      title: "Sacred Valley",
      items: [
        { type: "highlight", label: "Pisac Inca ruins & market", description: "Morning at Pisac: hike the terraced hilltop ruins then browse the famous artisan market below." },
        { type: "highlight", label: "Ollantaytambo fortress", description: "Afternoon at the largest still-functioning Inca town — massive military terraces and a working water channel system." },
        { type: "hotel",    label: "Inkaterra Hacienda Urubamba *****" },
      ],
      image: "https://images.unsplash.com/photo-1591266752934-9cb8c1a3804b?w=400&q=80",
    },
    {
      dayNumber: 5,
      title: "Machu Picchu",
      items: [
        { type: "transport", label: "Peru Rail: Ollantaytambo → Aguas Calientes", description: "Scenic valley train · 1h 40m · Seat included" },
        { type: "highlight", label: "Machu Picchu guided tour", description: "A full morning exploring the citadel with your expert guide — Sun Gate, Temple of the Sun, Intihuatana stone, and more." },
        { type: "hotel",    label: "Sumaq Machu Picchu Hotel *****" },
      ],
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&q=80",
    },
    {
      dayNumber: 6,
      title: "Machu Picchu free time & return",
      items: [
        { type: "highlight", label: "Second visit or Huayna Picchu hike", description: "Free morning to revisit the ruins or hike Huayna Picchu mountain for the iconic aerial view (optional, pre-booking required)." },
        { type: "transport", label: "Aguas Calientes → Cusco (train + transfer)", description: "Return journey included" },
        { type: "hotel",    label: "Palacio del Inca *****" },
      ],
      image: "https://images.unsplash.com/photo-1569575834128-ab65dce4b2d7?w=400&q=80",
    },
    {
      dayNumber: 7,
      title: "Rainbow Mountain (optional) or Lima farewell",
      items: [
        { type: "highlight", label: "Vinicunca Rainbow Mountain", description: "Optional full-day hike to the striking coloured peaks at 5,200m (challenging — requires good fitness and acclimatisation)." },
        { type: "transport", label: "Cusco → Lima (evening flight)", description: "1h 20m · Domestic flight included" },
        { type: "hotel",    label: "JW Marriott Lima *****" },
      ],
      image: "https://images.unsplash.com/photo-1504457047772-27faf794c6c8?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80",
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
  destinationCodes: ["COSTARICA"],
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
  mainImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
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
    { iconKey: "users",           title: "Group size",  value: "Max 14 travellers" },
    { iconKey: "activity",        title: "Activity",    value: "Easy" },
    { iconKey: "languages",       title: "Language",    value: "English" },
    { iconKey: "calendar-check",  title: "Min age",     value: "All ages" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Tokyo",
      items: [
        { type: "highlight", label: "Welcome to Tokyo", description: "Transfer from Narita or Haneda to your hotel in Shinjuku. Evening walk through the neon-lit streets of Kabukicho." },
        { type: "hotel",    label: "Park Hyatt Tokyo *****" },
      ],
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
    },
    {
      dayNumber: 2,
      title: "Tokyo Highlights",
      items: [
        { type: "highlight", label: "Tsukiji Outer Market breakfast", description: "Start the day with the freshest sushi and tamagoyaki at the famous outer market." },
        { type: "highlight", label: "Shibuya Crossing & Meiji Shrine", description: "Afternoon: the world's busiest pedestrian crossing, then a peaceful forest walk to the Shinto Meiji Jingu shrine." },
        { type: "hotel",    label: "Park Hyatt Tokyo *****" },
      ],
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80",
    },
    {
      dayNumber: 3,
      title: "Asakusa & TeamLab",
      items: [
        { type: "highlight", label: "Senso-ji Temple, Asakusa", description: "Tokyo's oldest and most colourful temple — arrive early for the best atmosphere before the crowds." },
        { type: "highlight", label: "teamLab Borderless digital art museum", description: "Immersive digital art environment — one of Tokyo's most unique experiences." },
        { type: "hotel",    label: "Park Hyatt Tokyo *****" },
      ],
      image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80",
    },
    {
      dayNumber: 4,
      title: "Hakone & Mt Fuji Views",
      items: [
        { type: "transport", label: "Tokyo → Hakone (Romancecar express)", description: "Approx. 85 min scenic mountain railway included" },
        { type: "highlight", label: "Hakone Open-Air Museum & Ropeway", description: "Art installations against mountain backdrop, then a gondola ride across Lake Ashi for classic Fuji views (weather permitting)." },
        { type: "hotel",    label: "Hakone Kowakien Ten-yu *****" },
      ],
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80",
    },
    {
      dayNumber: 5,
      title: "Bullet Train to Kyoto",
      items: [
        { type: "transport", label: "Hakone → Kyoto (Shinkansen)", description: "Approx. 2h 20m · Japan Rail Pass covers this journey" },
        { type: "highlight", label: "Gion Evening Walk", description: "Stroll through Kyoto's historic geisha district at dusk — you may spot a maiko on her way to an appointment." },
        { type: "hotel",    label: "Hyatt Regency Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80",
    },
    {
      dayNumber: 6,
      title: "Kyoto Temples",
      items: [
        { type: "highlight", label: "Fushimi Inari Shrine", description: "Early morning hike through thousands of vermilion torii gates winding up the mountain — magical before the crowds arrive." },
        { type: "highlight", label: "Kinkaku-ji Golden Pavilion", description: "Kyoto's most iconic sight — a Zen temple covered in gold leaf reflected on a mirror pond." },
        { type: "hotel",    label: "Hyatt Regency Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&q=80",
    },
    {
      dayNumber: 7,
      title: "Arashiyama Bamboo Grove",
      items: [
        { type: "highlight", label: "Arashiyama Bamboo Grove", description: "Walk through towering bamboo stalks at dawn — one of the world's most surreal natural landscapes." },
        { type: "highlight", label: "Tenryu-ji Garden", description: "UNESCO World Heritage Zen garden with a pond designed to frame the mountains beyond." },
        { type: "hotel",    label: "Hyatt Regency Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400&q=80",
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
      image: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=400&q=80",
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
      image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80",
    },
    {
      dayNumber: 10,
      title: "Osaka Free Day",
      items: [
        { type: "highlight", label: "Kuromon Ichiba Market", description: "Known as 'Osaka's Kitchen' — a covered market selling everything from fresh seafood to Wagyu beef." },
        { type: "highlight", label: "Day trip to Nara (optional)", description: "45 min by train — roam freely with 1,200 semi-tame deer in Nara Park and visit the giant bronze Buddha at Todai-ji." },
        { type: "hotel",    label: "Conrad Osaka *****" },
      ],
      image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80",
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
  destinationCodes: ["HOCHIMINH"],
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
  mainImage: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80",
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
    { iconKey: "users",           title: "Group size",  value: "Max 14 travellers" },
    { iconKey: "activity",        title: "Activity",    value: "Easy to moderate" },
    { iconKey: "languages",       title: "Language",    value: "English & French" },
    { iconKey: "calendar-check",  title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1548018560-c7196e4f3e46?w=800&q=80",
    "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
    "https://images.unsplash.com/photo-1553899017-7b15c5d3590b?w=800&q=80",
    "https://images.unsplash.com/photo-1545601445-4d6a29737163?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Casablanca",
      items: [
        { type: "highlight", label: "Hassan II Mosque", description: "Arrive at Mohammed V Airport. Transfer to Casablanca. Visit the spectacular Hassan II Mosque — the world's third largest, partly built over the Atlantic Ocean." },
        { type: "hotel",    label: "Four Seasons Casablanca *****" },
      ],
      image: "https://images.unsplash.com/photo-1548018560-c7196e4f3e46?w=400&q=80",
    },
    {
      dayNumber: 2,
      title: "Drive North to Chefchaouen",
      items: [
        { type: "transport", label: "Casablanca → Chefchaouen", description: "Approx. 4h by private coach through the Rif Mountains" },
        { type: "highlight", label: "Chefchaouen Blue City walk", description: "Wander the labyrinthine alleys of this photogenic mountain town — every surface washed in vivid shades of blue." },
        { type: "hotel",    label: "Riad Lina & Spa ****" },
      ],
      image: "https://images.unsplash.com/photo-1553899017-7b15c5d3590b?w=400&q=80",
    },
    {
      dayNumber: 3,
      title: "Ancient Fes",
      items: [
        { type: "transport", label: "Chefchaouen → Fes", description: "Approx. 3h" },
        { type: "highlight", label: "Fes el-Bali medina guided tour", description: "The world's largest medieval city on foot — the Chouara tanneries, Bou Inania madrasa, and the blue gate of Bab Bou Jeloud." },
        { type: "hotel",    label: "Riad Fes ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&q=80",
    },
    {
      dayNumber: 4,
      title: "Fes Deep Dive",
      items: [
        { type: "highlight", label: "Al-Qarawiyyin — the world's oldest university", description: "Founded in 859 AD, this mosque-university complex is still active today." },
        { type: "highlight", label: "Pottery & zellige tile workshop visit", description: "Watch master craftsmen paint intricate Fassi geometric patterns by hand." },
        { type: "hotel",    label: "Riad Fes *****" },
      ],
      image: "https://images.unsplash.com/photo-1545601445-4d6a29737163?w=400&q=80",
    },
    {
      dayNumber: 5,
      title: "Across the Atlas to the Sahara",
      items: [
        { type: "transport", label: "Fes → Merzouga (private coach, full day)", description: "Over the Middle Atlas — cedar forests, the town of Ifrane, and down through the Ziz palm valley gorge" },
        { type: "highlight", label: "Erg Chebbi sand dunes", description: "Arrive at dusk as the great orange dunes of Erg Chebbi glow in the last light." },
        { type: "hotel",    label: "Kasbah Mohayut Desert Camp *****" },
      ],
      image: "https://images.unsplash.com/photo-1504541525549-86a5f5b7b4e5?w=400&q=80",
    },
    {
      dayNumber: 6,
      title: "Sahara Camel Trek & Sunrise",
      items: [
        { type: "highlight", label: "Sunset camel trek into the dunes", description: "Ride out into the Sahara as the sun sets, guided to a traditional Berber camp for dinner under a sky full of stars." },
        { type: "highlight", label: "Sunrise on the dunes", description: "Early morning hike to a high dune to watch the sun rise over thousands of kilometres of empty desert." },
        { type: "hotel",    label: "Kasbah Mohayut Desert Camp *****" },
      ],
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
    },
    {
      dayNumber: 7,
      title: "Draa Valley & Kasbahs",
      items: [
        { type: "transport", label: "Merzouga → Ouarzazate via Draa Valley", description: "Approx. 5h — through the Valley of a Thousand Kasbahs" },
        { type: "highlight", label: "Aït Benhaddou UNESCO kasbah", description: "A fortified ksar of mud-brick towers — one of Morocco's most spectacular sights and a famous film location." },
        { type: "hotel",    label: "Berber Palace Ouarzazate ****" },
      ],
      image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80",
    },
    {
      dayNumber: 8,
      title: "Over the Atlas to Marrakech",
      items: [
        { type: "transport", label: "Ouarzazate → Marrakech (Tizi n'Tichka pass)", description: "Approx. 4h — the highest road pass in the Atlas Mountains at 2,260m" },
        { type: "highlight", label: "Djemaa el-Fna square", description: "Arrive in Marrakech and dive straight into the world's greatest open-air theatre — snake charmers, storytellers, and food stalls under the stars." },
        { type: "hotel",    label: "Royal Mansour Marrakech *****" },
      ],
      image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
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
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80",
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
  destinationCodes: ["MARRAKECH"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Dubai — "Dubai Highlights City Tour"
// ─────────────────────────────────────────────────────────────────────────────

export const DUBAI_HIGHLIGHTS_TOUR: Tour = {
  tourId: "dubai-highlights",
  title: "Dubai Highlights City Tour",
  subtitle: "From the golden deserts to the world's tallest tower — experience ultra-modern Dubai with expert local guides.",
  tripType: "individual-tour",
  duration: 7,
  locationsLabel: "Dubai · Palm Jumeirah · Desert",
  highlights: [
    "Burj Khalifa observation deck",
    "Desert safari & camel riding",
    "Souks & Spice market",
    "Palm Jumeirah cruise",
  ],
  mainImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  price: { perPerson: 1599, total: 3198, currency: "GBP", paidBefore: 799, paidAtDestination: 800 },
  startDate: "Apr 14, 2026",
  endDate: "Apr 21, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           title: "Group size",  value: "Individual tour" },
    { iconKey: "activity",        title: "Activity",    value: "All levels" },
    { iconKey: "languages",       title: "Language",    value: "English" },
    { iconKey: "calendar-check",  title: "Min age",     value: "12+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    "https://images.unsplash.com/photo-1545579133-99bb5ad189be?w=800&q=80",
    "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=800&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrival in Dubai",
      items: [
        { type: "highlight", label: "Arrive at Dubai International Airport", description: "Transfer to your hotel in Downtown Dubai. Evening at leisure — stroll along the Dubai Fountain." },
        { type: "hotel", label: "Address Downtown or similar" },
      ],
      image: "https://images.unsplash.com/photo-1545579133-99bb5ad189be?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Burj Khalifa & Downtown",
      items: [
        { type: "highlight", label: "Burj Khalifa — At the Top", description: "Access to level 124 observation deck with 360° views across the city and desert." },
        { type: "highlight", label: "Dubai Mall & Dubai Fountain show", description: "World's largest shopping mall. Evening Dubai Fountain water performance." },
        { type: "hotel", label: "Address Downtown or similar" },
      ],
      image: "https://images.unsplash.com/photo-1545579133-99bb5ad189be?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Old Dubai & Souks",
      items: [
        { type: "highlight", label: "Spice Souk & Gold Souk", description: "Explore the vibrant traditional markets of Deira. Take an abra (water taxi) across the Creek." },
        { type: "highlight", label: "Al Fahidi Historic District", description: "Wind-tower architecture and the Dubai Museum — the city's fascinating transformation." },
        { type: "hotel", label: "Address Downtown or similar" },
      ],
      image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Desert Safari",
      items: [
        { type: "highlight", label: "Dune bashing & camel riding", description: "Afternoon 4x4 desert safari over the red dunes, sandboarding, and camel riding." },
        { type: "highlight", label: "Bedouin camp dinner under the stars", description: "Traditional Arabian dinner with belly dancing and stargazing in the desert." },
        { type: "hotel", label: "Address Downtown or similar" },
      ],
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Palm Jumeirah & Marina",
      items: [
        { type: "highlight", label: "Palm Jumeirah cruise", description: "Scenic cruise around the iconic palm-shaped island with views of Atlantis and the Burj Al Arab." },
        { type: "highlight", label: "Dubai Marina Walk", description: "Afternoon stroll along the glittering marina waterfront." },
        { type: "hotel", label: "Address Downtown or similar" },
      ],
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Day at Leisure",
      items: [
        { type: "highlight", label: "Optional: Wild Wadi Waterpark or Ski Dubai", description: "Choose your own adventure — world-class waterpark or indoor ski slope in the desert." },
        { type: "hotel", label: "Address Downtown or similar" },
      ],
      image: "https://images.unsplash.com/photo-1582610116397-edb72270f707?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Departure",
      items: [
        { type: "highlight", label: "Final morning in Dubai", description: "Check out and transfer to Dubai International Airport for your return flight." },
      ],
    },
  ],
  included: [
    "6 nights accommodation in 5★ hotel",
    "Daily breakfast",
    "Return airport transfers",
    "Desert safari with dinner",
    "Burj Khalifa At the Top tickets",
    "Palm Jumeirah cruise",
    "Old Dubai walking tour with guide",
  ],
  excluded: [
    "International flights",
    "Lunches and dinners (except day 4 safari dinner)",
    "Travel insurance",
    "Personal shopping",
    "Optional activities",
  ],
  stops: [
    {
      destinationName: "Dubai",
      dateRange: "Apr 14 – 17",
      nights: 3,
      description: "The glittering skyline, souks, and world records of the UAE's most iconic city.",
      accommodation: {
        hotelName: "Address Downtown",
        stars: 5,
        checkIn: "Apr 14", checkOut: "Apr 17",
        checkInISO: "2026-04-14", checkOutISO: "2026-04-17",
        roomType: "Deluxe Room", boardType: "Breakfast included",
      },
      activities: [
        { date: "Apr 15", name: "Burj Khalifa At the Top", description: "Observatory deck experience" },
        { date: "Apr 16", name: "Old Dubai & Souks Tour", description: "Deira Spice & Gold Souks + abra crossing" },
      ],
      lat: 25.197, lng: 55.274,
    },
    {
      destinationName: "Desert Camp",
      dateRange: "Apr 17 – 18",
      nights: 1,
      description: "The vast red dunes of the Hatta desert, 90 minutes from the city.",
      accommodation: {
        hotelName: "Bedouin Desert Camp",
        stars: 4,
        checkIn: "Apr 17", checkOut: "Apr 18",
        checkInISO: "2026-04-17", checkOutISO: "2026-04-18",
        roomType: "Luxury Tent", boardType: "Full board",
      },
      activities: [
        { date: "Apr 17", name: "Dune Bashing & Camel Riding", description: "4x4 desert safari + camel ride" },
      ],
      lat: 24.897, lng: 56.042,
    },
    {
      destinationName: "Palm Jumeirah",
      dateRange: "Apr 18 – 21",
      nights: 3,
      description: "The world-famous man-made island jutting into the Arabian Gulf.",
      accommodation: {
        hotelName: "Atlantis The Palm",
        stars: 5,
        checkIn: "Apr 18", checkOut: "Apr 21",
        checkInISO: "2026-04-18", checkOutISO: "2026-04-21",
        roomType: "King Room Ocean View", boardType: "Breakfast included",
      },
      activities: [
        { date: "Apr 19", name: "Palm Jumeirah Cruise", description: "Scenic boat tour around the Palm" },
        { date: "Apr 20", name: "Aquaventure Waterpark", description: "Full day at Atlantis waterpark" },
      ],
      lat: 25.130, lng: 55.117,
    },
  ],
  transfers: [
    { from: "Dubai Downtown", to: "Desert Camp", date: "Apr 17, 4x4 transfer", mode: "Private 4x4", description: "Approx. 1h 30m scenic drive to the dunes" },
    { from: "Desert Camp", to: "Palm Jumeirah", date: "Apr 18, private transfer", mode: "Private car", description: "Approx. 1h 45m back to the coast" },
  ],
  destinationCodes: ["DUBAI"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Cancún — "Riviera Maya Explorer"
// ─────────────────────────────────────────────────────────────────────────────

export const CANCUN_RIVIERA_TOUR: Tour = {
  tourId: "cancun-riviera-maya",
  title: "Riviera Maya Explorer",
  subtitle: "Ancient Mayan ruins, cenote swims, tropical jungle and the Caribbean's most spectacular beaches.",
  tripType: "group-tour",
  duration: 10,
  locationsLabel: "Cancún · Tulum · Chichen Itza",
  highlights: [
    "Chichen Itza sunrise visit",
    "Cenote snorkelling",
    "Tulum Mayan ruins",
    "Playa del Carmen",
  ],
  mainImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
  price: { perPerson: 1899, total: 3798, currency: "GBP", paidBefore: 999, paidAtDestination: 900 },
  startDate: "Apr 28, 2026",
  endDate: "May 08, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           title: "Group size",  value: "Group tour" },
    { iconKey: "activity",        title: "Activity",    value: "Moderate" },
    { iconKey: "languages",       title: "Language",    value: "English & Spanish" },
    { iconKey: "calendar-check",  title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrival in Cancún",
      items: [
        { type: "highlight", label: "Arrive at Cancún International Airport", description: "Welcome briefing and check-in at your Hotel Zone resort." },
        { type: "hotel", label: "Moon Palace or similar" },
      ],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Cancún Beach Day",
      items: [
        { type: "highlight", label: "Hotel Zone beaches", description: "Free day to explore Cancún's famous turquoise beaches and Hotel Zone." },
        { type: "hotel", label: "Moon Palace or similar" },
      ],
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Chichen Itza",
      items: [
        { type: "highlight", label: "Sunrise visit to Chichen Itza", description: "One of the Seven Wonders of the World — see the iconic El Castillo pyramid with expert guides." },
        { type: "transport", label: "Coach transfer", description: "3h each way · Air-conditioned coach" },
        { type: "hotel", label: "Moon Palace or similar" },
      ],
      image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Transfer to Tulum",
      items: [
        { type: "highlight", label: "Playa del Carmen stop", description: "Stroll along 5th Avenue for shopping and lunch." },
        { type: "hotel", label: "Azulik Tulum or similar" },
      ],
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    },
  ],
  included: [
    "9 nights accommodation",
    "Daily breakfast",
    "Chichen Itza entrance + guide",
    "Cenote snorkelling excursion",
    "Tulum ruins guided tour",
    "All internal coach transfers",
  ],
  excluded: [
    "International flights",
    "Lunches and dinners",
    "Travel insurance",
    "Optional zip-lining excursion",
  ],
  stops: [
    {
      destinationName: "Cancún",
      dateRange: "Apr 28 – May 02",
      nights: 4,
      description: "The Caribbean's most famous resort strip, with powdery white sand beaches and turquoise waters.",
      accommodation: {
        hotelName: "Moon Palace Golf & Spa Resort",
        stars: 5,
        checkIn: "Apr 28", checkOut: "May 02",
        checkInISO: "2026-04-28", checkOutISO: "2026-05-02",
        roomType: "Deluxe Suite Ocean View", boardType: "All Inclusive",
      },
      activities: [
        { date: "Apr 30", name: "Chichen Itza Day Trip", description: "Sunrise guided visit to the Mayan pyramid" },
        { date: "May 01", name: "Cenote Swim", description: "Snorkelling in a sacred freshwater cenote" },
      ],
      lat: 21.075, lng: -86.806,
    },
    {
      destinationName: "Tulum",
      dateRange: "May 02 – 08",
      nights: 6,
      description: "Cliffside Mayan ruins above the turquoise Caribbean — the most photographed ruin in Mexico.",
      accommodation: {
        hotelName: "Azulik Eco Resort",
        stars: 5,
        checkIn: "May 02", checkOut: "May 08",
        checkInISO: "2026-05-02", checkOutISO: "2026-05-08",
        roomType: "Villa Sea View", boardType: "Breakfast included",
      },
      activities: [
        { date: "May 03", name: "Tulum Ruins Guided Tour", description: "Morning visit to the cliffside Mayan archaeological site" },
        { date: "May 05", name: "Coba Bike & Swim", description: "Cycle through jungle to Coba pyramid + cenote swim" },
      ],
      lat: 20.211, lng: -87.465,
    },
  ],
  transfers: [
    { from: "Cancún", to: "Tulum", date: "May 02, coach", mode: "Private coach", description: "Approx. 2h with Playa del Carmen stop" },
  ],
  destinationCodes: ["CANCUN"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Maldives — "Island Hopping Maldives"
// ─────────────────────────────────────────────────────────────────────────────

export const MALDIVES_ISLAND_TOUR: Tour = {
  tourId: "maldives-island-hopping",
  title: "Island Hopping Maldives",
  subtitle: "Drift between remote atolls, dive pristine reefs, and sleep in overwater bungalows above the Indian Ocean.",
  tripType: "individual-tour",
  duration: 10,
  locationsLabel: "Malé · North Malé Atoll · Baa Atoll",
  highlights: [
    "Overwater bungalow stays",
    "Manta ray snorkelling",
    "Sunset dolphin cruise",
    "Coral reef PADI dive",
  ],
  mainImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  price: { perPerson: 4299, total: 8598, currency: "GBP", paidBefore: 2299, paidAtDestination: 2000 },
  startDate: "Apr 18, 2026",
  endDate: "Apr 28, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           title: "Group size",  value: "Individual tour" },
    { iconKey: "activity",        title: "Activity",    value: "All levels" },
    { iconKey: "languages",       title: "Language",    value: "English" },
    { iconKey: "calendar-check",  title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80",
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
    "https://images.unsplash.com/photo-1540202404-8d0de77c3573?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrival in Malé",
      items: [
        { type: "highlight", label: "Arrive at Velana International Airport, Malé", description: "Speedboat transfer to your first island resort." },
        { type: "hotel", label: "Gili Lankanfushi or similar" },
      ],
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "North Malé Atoll Exploration",
      items: [
        { type: "highlight", label: "House reef snorkelling", description: "Explore the technicolour coral reef directly off your water villa." },
        { type: "highlight", label: "Sunset dolphin cruise", description: "Spot spinner dolphins at dusk on a traditional dhoni boat." },
        { type: "hotel", label: "Gili Lankanfushi or similar" },
      ],
      image: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Transfer to Baa Atoll",
      items: [
        { type: "transport", label: "Seaplane transfer to Baa Atoll", description: "Breathtaking 30-min scenic seaplane flight over the atolls" },
        { type: "hotel", label: "Six Senses Laamu or similar" },
      ],
      image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Hanifaru Bay — Manta Rays",
      items: [
        { type: "highlight", label: "Hanifaru Bay UNESCO Biosphere snorkel", description: "UNESCO World Biosphere Reserve — snorkel with hundreds of manta rays in season." },
        { type: "hotel", label: "Six Senses Laamu or similar" },
      ],
      image: "https://images.unsplash.com/photo-1540202404-8d0de77c3573?w=800&q=80",
    },
    {
      dayNumber: 10,
      title: "Departure",
      items: [
        { type: "highlight", label: "Final morning at leisure", description: "Farewell breakfast on your overwater terrace before transfer to the airport." },
      ],
    },
  ],
  included: [
    "9 nights overwater accommodation",
    "All meals (full board both resorts)",
    "Speedboat & seaplane inter-island transfers",
    "Hanifaru Bay manta snorkel excursion",
    "Dolphin sunset cruise",
    "House reef snorkelling equipment",
  ],
  excluded: [
    "International flights to Malé",
    "Travel insurance",
    "PADI dive courses (optional extra)",
    "Spa treatments",
  ],
  stops: [
    {
      destinationName: "North Malé Atoll",
      dateRange: "Apr 18 – 23",
      nights: 5,
      description: "Crystal-clear lagoons and pristine reef just 30 minutes by speedboat from Malé.",
      accommodation: {
        hotelName: "Gili Lankanfushi",
        stars: 5,
        checkIn: "Apr 18", checkOut: "Apr 23",
        checkInISO: "2026-04-18", checkOutISO: "2026-04-23",
        roomType: "Crusoe Residence Over Water", boardType: "All Inclusive",
      },
      activities: [
        { date: "Apr 19", name: "House Reef Snorkel", description: "Guided coral reef snorkelling" },
        { date: "Apr 20", name: "Sunset Dolphin Cruise", description: "Dhoni boat cruise with spinner dolphins" },
      ],
      lat: 4.203, lng: 73.514,
    },
    {
      destinationName: "Baa Atoll",
      dateRange: "Apr 23 – 28",
      nights: 5,
      description: "UNESCO World Biosphere Reserve, famous for manta ray and whale shark encounters.",
      accommodation: {
        hotelName: "Six Senses Laamu",
        stars: 5,
        checkIn: "Apr 23", checkOut: "Apr 28",
        checkInISO: "2026-04-23", checkOutISO: "2026-04-28",
        roomType: "Water Villa with Pool", boardType: "Breakfast Included",
      },
      activities: [
        { date: "Apr 24", name: "Hanifaru Bay Manta Snorkel", description: "UNESCO biosphere snorkel — mantas in season" },
        { date: "Apr 26", name: "Whale Shark Search", description: "Excursion to look for whale sharks" },
      ],
      lat: 5.145, lng: 72.973,
    },
  ],
  transfers: [
    { from: "North Malé Atoll", to: "Baa Atoll", date: "Apr 23, seaplane", mode: "Seaplane", description: "30 min scenic flight over the atolls" },
  ],
  destinationCodes: ["MALDIVES"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Tenerife — "Tenerife Volcanic & Beaches"
// ─────────────────────────────────────────────────────────────────────────────

export const TENERIFE_TOUR: Tour = {
  tourId: "tenerife-volcanic-beaches",
  title: "Tenerife: Volcanoes & Atlantic Beaches",
  subtitle: "Hike through lunar volcanic landscapes in Teide National Park, then unwind on Tenerife's golden southern beaches.",
  tripType: "individual-tour",
  duration: 8,
  locationsLabel: "Santa Cruz · Teide · Costa Adeje",
  highlights: [
    "Mount Teide cable car",
    "Lava fields at Teide National Park",
    "Whale & dolphin watching cruise",
    "Masca gorge hike",
  ],
  mainImage: "https://images.unsplash.com/photo-1500320576215-ac78814dfe80?w=800&q=80",
  price: { perPerson: 1099, total: 2198, currency: "GBP", paidBefore: 549, paidAtDestination: 550 },
  startDate: "Apr 11, 2026",
  endDate: "Apr 19, 2026",
  adults: 2,
  attributes: [
    { iconKey: "users",           title: "Group size",  value: "Individual tour" },
    { iconKey: "activity",        title: "Activity",    value: "Moderate" },
    { iconKey: "languages",       title: "Language",    value: "English" },
    { iconKey: "calendar-check",  title: "Min age",     value: "12+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1500320576215-ac78814dfe80?w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrival in Tenerife",
      items: [
        { type: "highlight", label: "Arrive at Tenerife South Airport", description: "Transfer to Costa Adeje and check in to your resort." },
        { type: "hotel", label: "Bahía del Duque or similar" },
      ],
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Teide National Park",
      items: [
        { type: "highlight", label: "Mount Teide cable car ascent", description: "Cable car to 3,555m — stunning views across the Canary Islands on a clear day." },
        { type: "highlight", label: "Roques de García lava field walk", description: "Guided walk through the otherworldly volcanic landscape." },
        { type: "hotel", label: "Bahía del Duque or similar" },
      ],
      image: "https://images.unsplash.com/photo-1500320576215-ac78814dfe80?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Masca Gorge Hike",
      items: [
        { type: "highlight", label: "Masca village & gorge descent", description: "Stunning 3h hike from the mountain village to the sea, with boat pick-up." },
        { type: "hotel", label: "Bahía del Duque or similar" },
      ],
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Whale & Dolphin Cruise",
      items: [
        { type: "highlight", label: "Whale & dolphin watching from Los Cristianos", description: "3h catamaran cruise to see resident pilot whales and bottlenose dolphins." },
        { type: "hotel", label: "Bahía del Duque or similar" },
      ],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure",
      items: [
        { type: "highlight", label: "Morning beach time, then fly home", description: "Final morning on the beach before transfer to Tenerife South Airport." },
      ],
    },
  ],
  included: [
    "7 nights accommodation",
    "Daily breakfast",
    "Return airport transfers",
    "Teide National Park guided tour",
    "Masca gorge hike + boat pickup",
    "Whale & dolphin cruise",
  ],
  excluded: [
    "International flights",
    "Lunches and dinners",
    "Travel insurance",
    "Optional quad bike tours",
  ],
  stops: [
    {
      destinationName: "Costa Adeje",
      dateRange: "Apr 11 – 15",
      nights: 4,
      description: "Tenerife's premium resort area with golden beaches, turquoise Atlantic waters, and luxury hotels.",
      accommodation: {
        hotelName: "Bahía del Duque",
        stars: 5,
        checkIn: "Apr 11", checkOut: "Apr 15",
        checkInISO: "2026-04-11", checkOutISO: "2026-04-15",
        roomType: "Junior Suite Garden View", boardType: "Breakfast included",
      },
      activities: [
        { date: "Apr 12", name: "Teide National Park Day", description: "Cable car + volcanic landscape walk" },
        { date: "Apr 14", name: "Masca Gorge Hike", description: "Mountain village to sea, boat pickup" },
      ],
      lat: 28.095, lng: -16.749,
    },
    {
      destinationName: "Los Cristianos",
      dateRange: "Apr 15 – 19",
      nights: 4,
      description: "Bustling harbour town and year-round whale & dolphin watching capital of the Canaries.",
      accommodation: {
        hotelName: "Hard Rock Hotel Tenerife",
        stars: 5,
        checkIn: "Apr 15", checkOut: "Apr 19",
        checkInISO: "2026-04-15", checkOutISO: "2026-04-19",
        roomType: "Platinum King Room Sea View", boardType: "All Inclusive",
      },
      activities: [
        { date: "Apr 16", name: "Whale & Dolphin Cruise", description: "3h catamaran from Los Cristianos harbour" },
        { date: "Apr 18", name: "Playa de las Américas beach day", description: "Free day on Tenerife's most popular beach" },
      ],
      lat: 28.048, lng: -16.713,
    },
  ],
  transfers: [
    { from: "Costa Adeje", to: "Los Cristianos", date: "Apr 15, taxi", mode: "Private car", description: "Approx. 10 min coastal transfer" },
  ],
  destinationCodes: ["TENERIFE"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Thailand — "Island Paradise" (Koh Phi Phi, Krabi, Railay)
// Maps to Discovery card id 4
// ─────────────────────────────────────────────────────────────────────────────

export const THAILAND_ISLANDS_TOUR: Tour = {
  tourId: "thailand-island-paradise",
  title: "Island Paradise Thailand",
  subtitle: "Turquoise lagoons, limestone cliffs, and pristine beaches — island-hop through Thailand's Andaman coast.",
  tripType: "group-tour",
  duration: 9,
  locationsLabel: "Phuket · Krabi · Koh Phi Phi",
  highlights: [
    "Phi Phi Islands speedboat tour",
    "Railay Beach rock climbing",
    "Maya Bay sunset swim",
    "Four Islands snorkelling",
  ],
  mainImage: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
  price: {
    perPerson: 1790,
    total: 3580,
    currency: "USD",
    paidBefore: 920,
    paidAtDestination: 870,
  },
  startDate: "Nov 10, 2026",
  endDate: "Nov 18, 2026",
  adults: 2,
  destinationCodes: ["PHUKET"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 14 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Easy to moderate" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "18+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
    "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80",
    "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80",
    "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Phuket",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Welcome to Phuket", description: "Arrive at Phuket International Airport. Transfer to Patong Beach for welcome drinks at sunset." },
        { type: "hotel", label: "The Shore at Katathani *****" },
      ],
      image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Phuket Old Town & Beaches",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Phuket Old Town walking tour", description: "Stroll through colourful Sino-Portuguese shophouses, street art, and local cafés." },
        { type: "highlight", label: "Kata Noi Beach afternoon", description: "Relax on one of Phuket's most beautiful and less crowded beaches." },
        { type: "hotel", label: "The Shore at Katathani *****" },
      ],
      image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Phi Phi Islands Day Trip",
      location: "Phuket → Phi Phi → Phuket",
      items: [
        { type: "highlight", label: "Phi Phi Islands speedboat tour", description: "Full-day tour: Maya Bay, Pileh Lagoon, Monkey Beach, and snorkelling at Shark Point." },
        { type: "hotel", label: "The Shore at Katathani *****" },
      ],
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Transfer to Krabi",
      location: "Phuket → Krabi",
      items: [
        { type: "transport", label: "Ferry to Krabi", description: "2h scenic ferry across Phang Nga Bay" },
        { type: "highlight", label: "Ao Nang Beach sunset", description: "Settle in and watch the sun set over the Andaman Sea from Ao Nang promenade." },
        { type: "hotel", label: "Centara Grand Beach Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Railay Beach & Rock Climbing",
      location: "Krabi",
      items: [
        { type: "highlight", label: "Railay Beach longtail boat trip", description: "Longtail boat to the stunning peninsula accessible only by sea — dramatic limestone cliffs and crystal-clear water." },
        { type: "highlight", label: "Beginner rock climbing session", description: "Optional half-day rock climbing on Railay's world-famous limestone karsts with certified guides." },
        { type: "hotel", label: "Centara Grand Beach Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Four Islands Tour",
      location: "Krabi",
      items: [
        { type: "highlight", label: "Four Islands snorkelling tour", description: "Full-day longtail boat trip: Koh Tub, Koh Mor, Koh Poda, and Phra Nang Cave Beach." },
        { type: "hotel", label: "Centara Grand Beach Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Transfer to Koh Phi Phi",
      location: "Krabi → Koh Phi Phi",
      items: [
        { type: "transport", label: "Speedboat to Koh Phi Phi", description: "45 min speedboat transfer" },
        { type: "highlight", label: "Phi Phi Viewpoint hike", description: "Climb to the famous double-bay viewpoint for sunset — one of Thailand's most iconic views." },
        { type: "hotel", label: "Zeavola Resort *****" },
      ],
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Koh Phi Phi Free Day",
      location: "Koh Phi Phi",
      items: [
        { type: "highlight", label: "Beach & snorkelling at leisure", description: "Free day to snorkel, kayak, or simply relax on Long Beach." },
        { type: "hotel", label: "Zeavola Resort *****" },
      ],
      image: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80",
    },
    {
      dayNumber: 9,
      title: "Departure Day",
      location: "Koh Phi Phi → Phuket",
      items: [
        { type: "highlight", label: "Ferry back to Phuket & farewell", description: "Morning ferry to Phuket for onward flights home." },
      ],
    },
  ],
  included: [
    "8 nights accommodation (4–5 star throughout)",
    "Daily breakfast + 2 group dinners",
    "Phi Phi Islands full-day speedboat tour",
    "Four Islands snorkelling trip",
    "Railay Beach longtail boat excursion",
    "All ferry & speedboat transfers between islands",
    "English-speaking group guide throughout",
    "All airport transfers",
  ],
  excluded: [
    "International flights to/from Thailand",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional rock climbing session",
    "Personal expenses & tips",
    "Thai visa (if applicable)",
  ],
  stops: [
    {
      destinationName: "Phuket",
      dateRange: "Nov 10 – 13",
      nights: 3,
      description: "Thailand's largest island — golden beaches, vibrant nightlife, and Sino-Portuguese old town charm.",
      accommodation: {
        hotelName: "The Shore at Katathani",
        stars: 5,
        checkIn: "Nov 10", checkOut: "Nov 13",
        checkInISO: "2026-11-10", checkOutISO: "2026-11-13",
        roomType: "Pool Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 7.8804, lng: 98.3923,
    },
    {
      destinationName: "Krabi",
      dateRange: "Nov 13 – 16",
      nights: 3,
      description: "Dramatic limestone karsts, emerald waters, and world-class rock climbing on the Andaman coast.",
      accommodation: {
        hotelName: "Centara Grand Beach Resort",
        stars: 4,
        checkIn: "Nov 13", checkOut: "Nov 16",
        checkInISO: "2026-11-13", checkOutISO: "2026-11-16",
        roomType: "Deluxe Ocean Facing", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 8.0863, lng: 98.9063,
    },
    {
      destinationName: "Koh Phi Phi",
      dateRange: "Nov 16 – 18",
      nights: 2,
      description: "Iconic twin-bay island made famous by 'The Beach' — turquoise water and jungle-clad cliffs.",
      accommodation: {
        hotelName: "Zeavola Resort",
        stars: 5,
        checkIn: "Nov 16", checkOut: "Nov 18",
        checkInISO: "2026-11-16", checkOutISO: "2026-11-18",
        roomType: "Garden Suite", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 7.7407, lng: 98.7784,
    },
  ],
  transfers: [
    { from: "Phuket", to: "Krabi", date: "Nov 13, ferry", mode: "Ferry", description: "2h scenic ferry across Phang Nga Bay" },
    { from: "Krabi", to: "Koh Phi Phi", date: "Nov 16, speedboat", mode: "Speedboat", description: "45 min speedboat transfer" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Thailand — "Bangkok & Beyond"
// Maps to Discovery card id 7
// ─────────────────────────────────────────────────────────────────────────────

export const THAILAND_BANGKOK_TOUR: Tour = {
  tourId: "thailand-bangkok-beyond",
  title: "Bangkok & Beyond",
  subtitle: "Dive deep into Bangkok's electric street life, then journey west to ancient Ayutthaya and the River Kwai.",
  tripType: "group-tour",
  duration: 10,
  locationsLabel: "Bangkok · Ayutthaya · Kanchanaburi",
  highlights: [
    "Ayutthaya UNESCO ruins",
    "Bridge over River Kwai",
    "Erawan waterfall trek",
    "Bangkok street food tour",
  ],
  mainImage: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
  price: {
    perPerson: 1480,
    total: 2960,
    currency: "USD",
    paidBefore: 780,
    paidAtDestination: 700,
  },
  startDate: "Jan 15, 2027",
  endDate: "Jan 24, 2027",
  adults: 2,
  destinationCodes: ["PHUKET"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 16 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Easy to moderate" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Bangkok",
      location: "Bangkok",
      items: [
        { type: "highlight", label: "Welcome to Bangkok", description: "Transfer from Suvarnabhumi Airport to your riverside hotel. Evening tuk-tuk food tour through Chinatown." },
        { type: "hotel", label: "Mandarin Oriental Bangkok *****" },
      ],
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Bangkok Temples & Street Food",
      location: "Bangkok",
      items: [
        { type: "highlight", label: "Wat Arun & Wat Pho", description: "Morning visit to the Temple of Dawn and the reclining Buddha — two of Bangkok's most sacred sites." },
        { type: "highlight", label: "Khao San Road & street food crawl", description: "Afternoon guided street food tour — pad thai, mango sticky rice, and boat noodles." },
        { type: "hotel", label: "Mandarin Oriental Bangkok *****" },
      ],
      image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Bangkok Canals & Markets",
      location: "Bangkok",
      items: [
        { type: "highlight", label: "Klong boat tour", description: "Longtail boat through Bangkok's hidden canals — wooden stilt houses and secret temples." },
        { type: "highlight", label: "Chatuchak Market", description: "Explore 15,000 stalls at one of the world's largest weekend markets." },
        { type: "hotel", label: "Mandarin Oriental Bangkok *****" },
      ],
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Day Trip to Ayutthaya",
      location: "Bangkok → Ayutthaya → Bangkok",
      items: [
        { type: "transport", label: "Van to Ayutthaya", description: "1h 30m north of Bangkok" },
        { type: "highlight", label: "Ayutthaya Historical Park", description: "UNESCO World Heritage Site — explore the crumbling temples and Buddha statues of the ancient Siamese capital, destroyed in 1767." },
        { type: "highlight", label: "Wat Mahathat — Buddha head in tree roots", description: "The iconic Buddha face entwined in the roots of a banyan tree." },
        { type: "hotel", label: "Mandarin Oriental Bangkok *****" },
      ],
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Transfer to Kanchanaburi",
      location: "Bangkok → Kanchanaburi",
      items: [
        { type: "transport", label: "Coach to Kanchanaburi", description: "Approx. 2h 30m west of Bangkok" },
        { type: "highlight", label: "Bridge over the River Kwai", description: "Walk across the historic bridge and visit the WWII museum and war cemetery." },
        { type: "hotel", label: "River Kwai Jungle Rafts ****" },
      ],
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Erawan National Park",
      location: "Kanchanaburi",
      items: [
        { type: "highlight", label: "Erawan Waterfall trek", description: "Hike through seven tiers of emerald-green waterfalls in the jungle — swimming pools at each level." },
        { type: "hotel", label: "River Kwai Jungle Rafts ****" },
      ],
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Hellfire Pass & Death Railway",
      location: "Kanchanaburi",
      items: [
        { type: "highlight", label: "Hellfire Pass Memorial Museum", description: "Walk through the mountain cutting carved by WWII POWs — a powerful and moving experience." },
        { type: "highlight", label: "Death Railway scenic train ride", description: "Ride along the original wartime railway over the dramatic Wampo Viaduct clinging to the cliff face." },
        { type: "hotel", label: "River Kwai Jungle Rafts ****" },
      ],
      image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Return to Bangkok",
      location: "Kanchanaburi → Bangkok",
      items: [
        { type: "transport", label: "Return to Bangkok", description: "2h 30m coach transfer" },
        { type: "highlight", label: "Jim Thompson House Museum", description: "Tour the silk merchant's beautiful Thai teak house and garden — a hidden gem in central Bangkok." },
        { type: "hotel", label: "Mandarin Oriental Bangkok *****" },
      ],
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
    },
    {
      dayNumber: 9,
      title: "Bangkok Free Day",
      location: "Bangkok",
      items: [
        { type: "highlight", label: "Free day to explore", description: "Spa, shopping at Siam Paragon, or a Muay Thai show — your choice." },
        { type: "hotel", label: "Mandarin Oriental Bangkok *****" },
      ],
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    },
    {
      dayNumber: 10,
      title: "Departure Day",
      location: "Bangkok",
      items: [
        { type: "highlight", label: "Check out & farewell", description: "Transfer to Suvarnabhumi Airport for onward flights." },
      ],
    },
  ],
  included: [
    "9 nights accommodation (4–5 star)",
    "Daily breakfast + 3 group dinners",
    "Ayutthaya Historical Park guided tour",
    "Bridge over River Kwai & WWII museum",
    "Erawan Waterfall National Park entry",
    "Hellfire Pass museum + Death Railway train ride",
    "Bangkok street food guided tour",
    "English-speaking guide throughout",
    "All transfers & airport pickups",
  ],
  excluded: [
    "International flights to/from Thailand",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional Muay Thai show tickets",
    "Personal expenses & tips",
    "Thai visa (if applicable)",
  ],
  stops: [
    {
      destinationName: "Bangkok",
      dateRange: "Jan 15 – 19",
      nights: 4,
      description: "Thailand's dazzling capital — temples, canals, tuk-tuks, and the world's best street food.",
      accommodation: {
        hotelName: "Mandarin Oriental Bangkok",
        stars: 5,
        checkIn: "Jan 15", checkOut: "Jan 19",
        checkInISO: "2027-01-15", checkOutISO: "2027-01-19",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 13.7563, lng: 100.5018,
    },
    {
      destinationName: "Kanchanaburi",
      dateRange: "Jan 19 – 22",
      nights: 3,
      description: "Jungle rivers, WWII history, and dramatic waterfalls west of Bangkok.",
      accommodation: {
        hotelName: "River Kwai Jungle Rafts",
        stars: 4,
        checkIn: "Jan 19", checkOut: "Jan 22",
        checkInISO: "2027-01-19", checkOutISO: "2027-01-22",
        roomType: "Floating Raft Room", boardType: "Full board",
      },
      activities: [],
      lat: 14.0223, lng: 99.5328,
    },
    {
      destinationName: "Bangkok (return)",
      dateRange: "Jan 22 – 24",
      nights: 2,
      description: "Final days in Bangkok — spa, shopping, and last-chance street food.",
      accommodation: {
        hotelName: "Mandarin Oriental Bangkok",
        stars: 5,
        checkIn: "Jan 22", checkOut: "Jan 24",
        checkInISO: "2027-01-22", checkOutISO: "2027-01-24",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 13.7563, lng: 100.5018,
    },
  ],
  transfers: [
    { from: "Bangkok", to: "Kanchanaburi", date: "Jan 19, coach", mode: "Private coach", description: "Approx. 2h 30m west of Bangkok" },
    { from: "Kanchanaburi", to: "Bangkok", date: "Jan 22, coach", mode: "Private coach", description: "Approx. 2h 30m return" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Thailand — "Northern Thailand Highlights"
// Maps to Discovery card id 8
// ─────────────────────────────────────────────────────────────────────────────

export const THAILAND_NORTH_TOUR: Tour = {
  tourId: "thailand-northern-highlights",
  title: "Northern Thailand Highlights",
  subtitle: "Hill tribes, misty mountains, and the cultural soul of Thailand — from Chiang Mai to Chiang Rai and the laid-back town of Pai.",
  tripType: "group-tour",
  duration: 7,
  locationsLabel: "Chiang Mai · Chiang Rai · Pai",
  highlights: [
    "White Temple (Wat Rong Khun)",
    "Hill tribe village trek",
    "Pai Canyon sunset",
    "Night Safari Chiang Mai",
  ],
  mainImage: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80",
  price: {
    perPerson: 1250,
    total: 2500,
    currency: "USD",
    paidBefore: 650,
    paidAtDestination: 600,
  },
  startDate: "Dec 01, 2026",
  endDate: "Dec 07, 2026",
  adults: 2,
  destinationCodes: ["PHUKET"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 12 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Moderate" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80",
    "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800&q=80",
    "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80",
    "https://images.unsplash.com/photo-1600807840746-c6ac89a24520?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Chiang Mai",
      location: "Chiang Mai",
      items: [
        { type: "highlight", label: "Welcome to Chiang Mai", description: "Arrive at Chiang Mai International Airport. Transfer to your boutique hotel in the Old City. Evening visit to the Sunday Walking Street market." },
        { type: "hotel", label: "137 Pillars House *****" },
      ],
      image: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Chiang Mai Temples & Night Safari",
      location: "Chiang Mai",
      items: [
        { type: "highlight", label: "Doi Suthep Temple morning hike", description: "Climb 309 steps to Chiang Mai's most sacred hilltop temple for panoramic city views." },
        { type: "highlight", label: "Night Safari Chiang Mai", description: "Evening tram ride through the open zoo — spot deer, giraffes, and predators under the stars." },
        { type: "hotel", label: "137 Pillars House *****" },
      ],
      image: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Drive to Chiang Rai",
      location: "Chiang Mai → Chiang Rai",
      items: [
        { type: "transport", label: "Coach to Chiang Rai", description: "3h through misty mountain roads" },
        { type: "highlight", label: "White Temple (Wat Rong Khun)", description: "Thailand's most unusual temple — a dazzling, surreal masterpiece of white plaster and mirrors by artist Chalermchai Kositpipat." },
        { type: "highlight", label: "Blue Temple & Black House", description: "Afternoon visits to two more extraordinary Chiang Rai art-temples." },
        { type: "hotel", label: "Le Méridien Chiang Rai ****" },
      ],
      image: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Hill Tribe Trek & Golden Triangle",
      location: "Chiang Rai",
      items: [
        { type: "highlight", label: "Hill tribe village trek", description: "Half-day guided trek through Akha and Lahu hill tribe villages — meet locals, see traditional bamboo houses, and learn about their culture." },
        { type: "highlight", label: "Golden Triangle viewpoint", description: "Stand at the point where Thailand, Laos, and Myanmar meet at the confluence of the Mekong and Ruak rivers." },
        { type: "hotel", label: "Le Méridien Chiang Rai ****" },
      ],
      image: "https://images.unsplash.com/photo-1600807840746-c6ac89a24520?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Transfer to Pai",
      location: "Chiang Rai → Pai",
      items: [
        { type: "transport", label: "Van to Pai via Chiang Mai", description: "Approx. 5h with a stop in Chiang Mai" },
        { type: "highlight", label: "Pai Walking Street", description: "Explore this bohemian mountain town's night market — handmade crafts, live music, and Thai crêpes." },
        { type: "hotel", label: "Pai Village Boutique Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Pai Exploration",
      location: "Pai",
      items: [
        { type: "highlight", label: "Pai Canyon sunrise hike", description: "Walk the narrow ridgeline at dawn for 360° views of the Pai valley — dramatic and unforgettable." },
        { type: "highlight", label: "Pam Bok Waterfall & hot springs", description: "Morning swim under a jungle waterfall, then soak in natural hot springs surrounded by forest." },
        { type: "hotel", label: "Pai Village Boutique Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Departure Day",
      location: "Pai → Chiang Mai",
      items: [
        { type: "highlight", label: "Return to Chiang Mai & farewell", description: "3h scenic drive back through 762 mountain curves to Chiang Mai Airport." },
      ],
    },
  ],
  included: [
    "6 nights accommodation (4–5 star)",
    "Daily breakfast + 2 group dinners",
    "White Temple, Blue Temple & Black House entries",
    "Hill tribe village guided trek",
    "Night Safari Chiang Mai entry",
    "All coach & van transfers",
    "English-speaking guide throughout",
  ],
  excluded: [
    "International flights to/from Thailand",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional motorbike rental in Pai",
    "Personal expenses & tips",
  ],
  stops: [
    {
      destinationName: "Chiang Mai",
      dateRange: "Dec 01 – 03",
      nights: 2,
      description: "Northern Thailand's cultural heart — moated old city, 300+ temples, and legendary street food.",
      accommodation: {
        hotelName: "137 Pillars House",
        stars: 5,
        checkIn: "Dec 01", checkOut: "Dec 03",
        checkInISO: "2026-12-01", checkOutISO: "2026-12-03",
        roomType: "Rajah Brooke Suite", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 18.7883, lng: 98.9853,
    },
    {
      destinationName: "Chiang Rai",
      dateRange: "Dec 03 – 05",
      nights: 2,
      description: "Thailand's northernmost province — the White Temple, hill tribes, and the Golden Triangle.",
      accommodation: {
        hotelName: "Le Méridien Chiang Rai",
        stars: 4,
        checkIn: "Dec 03", checkOut: "Dec 05",
        checkInISO: "2026-12-03", checkOutISO: "2026-12-05",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 19.9105, lng: 99.8406,
    },
    {
      destinationName: "Pai",
      dateRange: "Dec 05 – 07",
      nights: 2,
      description: "Bohemian mountain town in a misty valley — canyon hikes, hot springs, and laid-back vibes.",
      accommodation: {
        hotelName: "Pai Village Boutique Resort",
        stars: 4,
        checkIn: "Dec 05", checkOut: "Dec 07",
        checkInISO: "2026-12-05", checkOutISO: "2026-12-07",
        roomType: "Garden Bungalow", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 19.3622, lng: 98.4408,
    },
  ],
  transfers: [
    { from: "Chiang Mai", to: "Chiang Rai", date: "Dec 03, coach", mode: "Private coach", description: "3h through mountain roads" },
    { from: "Chiang Rai", to: "Pai", date: "Dec 05, van", mode: "Minivan", description: "Approx. 5h via Chiang Mai" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Thailand — "Phuket & the Islands"
// Maps to Discovery card id 9
// ─────────────────────────────────────────────────────────────────────────────

export const THAILAND_PHUKET_TOUR: Tour = {
  tourId: "thailand-phuket-islands",
  title: "Phuket & the Islands",
  subtitle: "Sun-soaked beaches, James Bond Island, Similan diving, and Phuket's legendary nightlife in one beach-lover's dream.",
  tripType: "individual-tour",
  duration: 9,
  locationsLabel: "Phuket · James Bond Island · Similan Islands",
  highlights: [
    "James Bond Island kayak tour",
    "Similan Islands diving",
    "Big Buddha viewpoint",
    "Phang Nga Bay longtail",
  ],
  mainImage: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
  price: {
    perPerson: 1890,
    total: 3780,
    currency: "USD",
    paidBefore: 990,
    paidAtDestination: 900,
  },
  startDate: "Feb 12, 2027",
  endDate: "Feb 20, 2027",
  adults: 2,
  destinationCodes: ["PHUKET"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Individual tour" },
    { iconKey: "activity",       title: "Activity",   value: "Easy to moderate" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "12+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
    "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
    "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80",
    "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Phuket",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Welcome to Phuket", description: "Arrive at Phuket International Airport. Transfer to your beachfront resort in Kata." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Phuket Beaches & Big Buddha",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Big Buddha viewpoint", description: "Visit the 45m marble Buddha statue on Nakkerd Hill with panoramic views over southern Phuket." },
        { type: "highlight", label: "Kata & Karon Beach afternoon", description: "Relax on two of Phuket's best beaches — golden sand and turquoise Andaman water." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Phang Nga Bay & James Bond Island",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Phang Nga Bay longtail tour", description: "Full-day longtail boat tour through towering limestone karsts and mangrove caves." },
        { type: "highlight", label: "James Bond Island (Ko Tapu)", description: "See the iconic leaning limestone needle made famous by 'The Man with the Golden Gun'." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Similan Islands Dive Day",
      location: "Phuket → Similan Islands → Phuket",
      items: [
        { type: "transport", label: "Speedboat to Similan Islands", description: "1h 30m from Phuket" },
        { type: "highlight", label: "Similan Islands snorkel & dive", description: "Crystal-clear visibility, manta rays, and pristine coral — one of the world's top 10 dive sites." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Phuket Old Town",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Phuket Old Town heritage walk", description: "Sino-Portuguese architecture, street art murals, local coffee shops, and the Thalang Road market." },
        { type: "highlight", label: "Thai cooking class", description: "Afternoon hands-on cooking class — green curry, tom kha gai, and mango sticky rice." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Free Beach Day",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Free day at leisure", description: "Relax by the infinity pool, book a Thai massage, or explore Freedom Beach by longtail boat." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Koh Racha Day Trip",
      location: "Phuket → Koh Racha → Phuket",
      items: [
        { type: "highlight", label: "Koh Racha Yai island trip", description: "Speedboat to the 'Maldives of Thailand' — powdery white sand, gin-clear water, and amazing snorkelling." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Sunset Dinner Cruise",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Sunset dinner cruise", description: "Sail along Phuket's west coast at golden hour with a Thai seafood dinner onboard a traditional junk boat." },
        { type: "hotel", label: "Kata Rocks *****" },
      ],
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80",
    },
    {
      dayNumber: 9,
      title: "Departure Day",
      location: "Phuket",
      items: [
        { type: "highlight", label: "Check out & farewell", description: "Final morning by the pool before transferring to Phuket Airport." },
      ],
    },
  ],
  included: [
    "8 nights accommodation at 5-star beachfront resort",
    "Daily breakfast",
    "Phang Nga Bay & James Bond Island full-day tour",
    "Similan Islands snorkel/dive day trip",
    "Koh Racha island day trip",
    "Sunset dinner cruise with Thai seafood",
    "Thai cooking class",
    "All transfers & airport pickup",
  ],
  excluded: [
    "International flights to/from Thailand",
    "Travel insurance",
    "Lunches and non-included dinners",
    "Optional PADI dive certification",
    "Personal expenses & tips",
    "Thai visa (if applicable)",
  ],
  stops: [
    {
      destinationName: "Phuket (Kata Beach)",
      dateRange: "Feb 12 – 16",
      nights: 4,
      description: "Phuket's stunning west coast — dramatic cliffs, golden beaches, and world-class dining.",
      accommodation: {
        hotelName: "Kata Rocks",
        stars: 5,
        checkIn: "Feb 12", checkOut: "Feb 16",
        checkInISO: "2027-02-12", checkOutISO: "2027-02-16",
        roomType: "Sky Pool Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 7.8184, lng: 98.2983,
    },
    {
      destinationName: "Phuket (Patong)",
      dateRange: "Feb 16 – 20",
      nights: 4,
      description: "Phuket's vibrant heart — Bangla Road nightlife, beach bars, and endless energy.",
      accommodation: {
        hotelName: "Kata Rocks",
        stars: 5,
        checkIn: "Feb 16", checkOut: "Feb 20",
        checkInISO: "2027-02-16", checkOutISO: "2027-02-20",
        roomType: "Sky Pool Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 7.8953, lng: 98.2961,
    },
  ],
  transfers: [
    { from: "Phuket Airport", to: "Kata Beach", date: "Feb 12, private car", mode: "Private car", description: "45 min airport transfer" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Bali — "Bali Bliss" (Relaxation-focused)
// Maps to Discovery card id 10
// ─────────────────────────────────────────────────────────────────────────────

export const BALI_BLISS_TOUR: Tour = {
  tourId: "bali-bliss",
  title: "Bali Bliss",
  subtitle: "A wellness escape through Bali's most tranquil corners — spa retreats, yoga sessions, and serene beach sunsets.",
  tripType: "individual-tour",
  duration: 9,
  locationsLabel: "Nusa Dua · Jimbaran · Ubud",
  highlights: [
    "Luxury spa & wellness retreat",
    "Jimbaran seafood beach dinner",
    "Ubud yoga & meditation",
    "Private pool villa stay",
  ],
  mainImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  price: {
    perPerson: 2350,
    total: 4700,
    currency: "USD",
    paidBefore: 1250,
    paidAtDestination: 1100,
  },
  startDate: "Oct 20, 2026",
  endDate: "Oct 28, 2026",
  adults: 2,
  destinationCodes: ["BALI"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Individual tour" },
    { iconKey: "activity",       title: "Activity",   value: "Easy — relaxation focus" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=800&q=80",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Nusa Dua",
      location: "Nusa Dua",
      items: [
        { type: "highlight", label: "Welcome to Bali", description: "Arrive at Ngurah Rai Airport. Transfer to your luxury beachfront resort in Nusa Dua. Welcome flower bath ritual and evening cocktail." },
        { type: "hotel", label: "The Mulia *****" },
      ],
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Nusa Dua Beach & Spa",
      location: "Nusa Dua",
      items: [
        { type: "highlight", label: "Morning beach walk", description: "Stroll along the manicured white-sand beach of Nusa Dua — calm, warm, crystal-clear water." },
        { type: "highlight", label: "Balinese spa experience", description: "2-hour traditional Balinese massage, body scrub, and flower bath at the resort spa." },
        { type: "hotel", label: "The Mulia *****" },
      ],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Water Blow & Water Sports",
      location: "Nusa Dua",
      items: [
        { type: "highlight", label: "Water Blow cliff walk", description: "Watch ocean waves crash dramatically against limestone cliffs at Nusa Dua's natural blowhole." },
        { type: "highlight", label: "Stand-up paddleboarding", description: "Gentle SUP session on the calm waters of Nusa Dua's protected bay." },
        { type: "hotel", label: "The Mulia *****" },
      ],
      image: "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Transfer to Jimbaran",
      location: "Nusa Dua → Jimbaran",
      items: [
        { type: "transport", label: "Transfer to Jimbaran", description: "20 min coastal drive" },
        { type: "highlight", label: "Jimbaran seafood dinner on the beach", description: "Choose your fresh fish at the beachside grill — dine with your toes in the sand as the sun sets over the Indian Ocean." },
        { type: "hotel", label: "Four Seasons Jimbaran Bay *****" },
      ],
      image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Jimbaran & Uluwatu",
      location: "Jimbaran",
      items: [
        { type: "highlight", label: "Morning at Jimbaran Fish Market", description: "Walk through the colourful fish market where fishermen bring in their morning catch." },
        { type: "highlight", label: "Uluwatu Temple & Kecak Dance", description: "Evening at the cliffside temple perched 70m above the ocean, followed by a mesmerising Kecak fire dance at sunset." },
        { type: "hotel", label: "Four Seasons Jimbaran Bay *****" },
      ],
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Transfer to Ubud",
      location: "Jimbaran → Ubud",
      items: [
        { type: "transport", label: "Transfer to Ubud", description: "1h 30m north to the rice terraces" },
        { type: "highlight", label: "Tegallalang Rice Terraces walk", description: "Afternoon stroll through the iconic cascading rice paddies carved into the hillside." },
        { type: "hotel", label: "Viceroy Bali *****" },
      ],
      image: "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Ubud Yoga & Meditation",
      location: "Ubud",
      items: [
        { type: "highlight", label: "Sunrise yoga session", description: "Morning yoga overlooking the Ayung River valley — led by a Balinese yoga teacher." },
        { type: "highlight", label: "Tirta Empul purification ritual", description: "Participate in a traditional Balinese water purification ceremony at the sacred spring temple." },
        { type: "hotel", label: "Viceroy Bali *****" },
      ],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Ubud Free Day",
      location: "Ubud",
      items: [
        { type: "highlight", label: "Free day in Ubud", description: "Book a Balinese cooking class, visit the Monkey Forest, or simply relax by your private pool surrounded by jungle." },
        { type: "hotel", label: "Viceroy Bali *****" },
      ],
      image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    },
    {
      dayNumber: 9,
      title: "Departure Day",
      location: "Ubud → Denpasar",
      items: [
        { type: "highlight", label: "Final morning & farewell", description: "One last yoga session or pool moment before transferring to Ngurah Rai Airport." },
      ],
    },
  ],
  included: [
    "8 nights luxury accommodation (5-star throughout)",
    "Daily breakfast + 2 special dinners",
    "Balinese spa treatment (2 hours)",
    "Jimbaran beach seafood dinner",
    "Uluwatu Temple entry + Kecak Dance",
    "Yoga & meditation sessions in Ubud",
    "Private driver-guide throughout",
    "All transfers & airport pickup",
  ],
  excluded: [
    "International flights to/from Bali",
    "Travel insurance",
    "Lunches and non-included dinners",
    "Optional cooking class",
    "Personal expenses & tips",
    "Visa on arrival (if applicable)",
  ],
  stops: [
    {
      destinationName: "Nusa Dua",
      dateRange: "Oct 20 – 23",
      nights: 3,
      description: "Bali's most exclusive resort enclave — pristine beaches, calm waters, and manicured gardens.",
      accommodation: {
        hotelName: "The Mulia",
        stars: 5,
        checkIn: "Oct 20", checkOut: "Oct 23",
        checkInISO: "2026-10-20", checkOutISO: "2026-10-23",
        roomType: "The Earl Suite", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.8028, lng: 115.2314,
    },
    {
      destinationName: "Jimbaran",
      dateRange: "Oct 23 – 25",
      nights: 2,
      description: "A charming fishing village known for its golden sand beach and sunset seafood grills.",
      accommodation: {
        hotelName: "Four Seasons Jimbaran Bay",
        stars: 5,
        checkIn: "Oct 23", checkOut: "Oct 25",
        checkInISO: "2026-10-23", checkOutISO: "2026-10-25",
        roomType: "Garden Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.7652, lng: 115.1629,
    },
    {
      destinationName: "Ubud",
      dateRange: "Oct 25 – 28",
      nights: 3,
      description: "Bali's spiritual heart — jungle-clad valleys, rice terraces, and world-class wellness retreats.",
      accommodation: {
        hotelName: "Viceroy Bali",
        stars: 5,
        checkIn: "Oct 25", checkOut: "Oct 28",
        checkInISO: "2026-10-25", checkOutISO: "2026-10-28",
        roomType: "Deluxe Terrace Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.5069, lng: 115.2625,
    },
  ],
  transfers: [
    { from: "Nusa Dua", to: "Jimbaran", date: "Oct 23, car", mode: "Private car", description: "20 min coastal drive" },
    { from: "Jimbaran", to: "Ubud", date: "Oct 25, car", mode: "Private car", description: "1h 30m north through rice paddies" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Java & Bali — "Java & Bali Explorer"
// Maps to Discovery card id 11
// ─────────────────────────────────────────────────────────────────────────────

export const JAVA_BALI_TOUR: Tour = {
  tourId: "java-bali-explorer",
  title: "Java & Bali Explorer",
  subtitle: "Ancient temples, volcanic sunrises, and emerald rice terraces — discover the best of Indonesia's two most iconic islands.",
  tripType: "group-tour",
  duration: 12,
  locationsLabel: "Yogyakarta · Borobudur · Mt Bromo · Bali",
  highlights: [
    "Borobudur sunrise",
    "Mt Bromo volcanic crater",
    "Prambanan temple at sunset",
    "Ubud rice terraces",
  ],
  mainImage: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80",
  price: {
    perPerson: 2280,
    total: 4560,
    currency: "USD",
    paidBefore: 1200,
    paidAtDestination: 1080,
  },
  startDate: "Aug 10, 2026",
  endDate: "Aug 21, 2026",
  adults: 2,
  destinationCodes: ["BALI"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 14 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Moderate" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "14+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80",
    "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Yogyakarta",
      location: "Yogyakarta",
      items: [
        { type: "highlight", label: "Welcome to Java", description: "Arrive at Adisucipto Airport. Transfer to your hotel in the cultural heart of Java. Evening walk through Malioboro Street." },
        { type: "hotel", label: "The Phoenix Hotel Yogyakarta *****" },
      ],
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Borobudur Sunrise",
      location: "Yogyakarta",
      items: [
        { type: "highlight", label: "Borobudur Temple at sunrise", description: "4am start for an unforgettable sunrise over the world's largest Buddhist temple — 2,672 relief panels and 504 Buddha statues emerging from the morning mist." },
        { type: "highlight", label: "Kraton Palace & Taman Sari", description: "Afternoon visit to the Sultan's Palace and the hidden Water Castle gardens." },
        { type: "hotel", label: "The Phoenix Hotel Yogyakarta *****" },
      ],
      image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Prambanan & Batik",
      location: "Yogyakarta",
      items: [
        { type: "highlight", label: "Prambanan Temple at sunset", description: "The largest Hindu temple in Southeast Asia — 47m tall and adorned with Ramayana reliefs." },
        { type: "highlight", label: "Batik workshop", description: "Morning hands-on workshop learning traditional Javanese batik wax-resist dyeing." },
        { type: "hotel", label: "The Phoenix Hotel Yogyakarta *****" },
      ],
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Train to Surabaya",
      location: "Yogyakarta → Surabaya",
      items: [
        { type: "transport", label: "Scenic train to Surabaya", description: "6h through Javanese rice paddies and volcanic landscape" },
        { type: "hotel", label: "Bumi Surabaya City Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Mt Bromo Sunrise",
      location: "Surabaya → Mt Bromo",
      items: [
        { type: "transport", label: "4x4 Jeep to Mt Bromo", description: "3h pre-dawn drive to the volcanic crater" },
        { type: "highlight", label: "Mt Bromo sunrise & crater walk", description: "Stand on the rim of an active volcano as the sun rises over the Sea of Sand — one of Indonesia's most breathtaking sights." },
        { type: "hotel", label: "Jiwa Jawa Resort Bromo ****" },
      ],
      image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Bromo & Ijen Overview",
      location: "Mt Bromo",
      items: [
        { type: "highlight", label: "Tengger Caldera exploration", description: "Full day exploring the vast volcanic caldera — ride horses across the Sea of Sand and hike to Bromo's steaming crater." },
        { type: "hotel", label: "Jiwa Jawa Resort Bromo ****" },
      ],
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Ferry to Bali",
      location: "Mt Bromo → Bali",
      items: [
        { type: "transport", label: "Drive & ferry to Bali", description: "5h drive to Ketapang Port + 45 min ferry to Gilimanuk, Bali" },
        { type: "highlight", label: "Arrive in north Bali", description: "Check in to your resort by Lovina Beach — black volcanic sand and calm seas." },
        { type: "hotel", label: "Lovina Beach Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Lovina Dolphins & Temples",
      location: "Bali (North)",
      items: [
        { type: "highlight", label: "Lovina dolphin watching", description: "Sunrise outrigger boat trip to see pods of wild dolphins off the north Bali coast." },
        { type: "highlight", label: "Ulun Danu Bratan Temple", description: "Visit the iconic lake temple on volcanic Lake Bratan." },
        { type: "hotel", label: "Lovina Beach Resort ****" },
      ],
      image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    },
    {
      dayNumber: 9,
      title: "Transfer to Ubud",
      location: "Lovina → Ubud",
      items: [
        { type: "transport", label: "Drive south to Ubud", description: "2h 30m through mountain roads" },
        { type: "highlight", label: "Tegallalang Rice Terraces", description: "Walk through Bali's most famous cascading rice paddies." },
        { type: "hotel", label: "Komaneka at Bisma *****" },
      ],
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    },
    {
      dayNumber: 10,
      title: "Ubud Art & Culture",
      location: "Ubud",
      items: [
        { type: "highlight", label: "Monkey Forest Sanctuary", description: "Morning walk through the Sacred Monkey Forest — moss-covered temples and playful macaques." },
        { type: "highlight", label: "Ubud Art Market", description: "Browse handmade crafts, paintings, and silver jewellery in Ubud's famous market." },
        { type: "hotel", label: "Komaneka at Bisma *****" },
      ],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    },
    {
      dayNumber: 11,
      title: "Ubud Free Day",
      location: "Ubud",
      items: [
        { type: "highlight", label: "Free day", description: "Spa day, cooking class, or cycle through the rice paddies — your choice." },
        { type: "hotel", label: "Komaneka at Bisma *****" },
      ],
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    },
    {
      dayNumber: 12,
      title: "Departure Day",
      location: "Ubud → Denpasar",
      items: [
        { type: "highlight", label: "Check out & farewell", description: "Transfer to Ngurah Rai Airport for onward flights." },
      ],
    },
  ],
  included: [
    "11 nights accommodation (4–5 star)",
    "Daily breakfast + 3 group dinners",
    "Borobudur sunrise guided tour",
    "Prambanan temple entry & guide",
    "Mt Bromo 4x4 jeep sunrise tour",
    "Lovina dolphin boat trip",
    "All overland transfers, train & ferry",
    "English-speaking guide throughout",
    "Airport transfers both ends",
  ],
  excluded: [
    "International flights to/from Indonesia",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional Ijen blue fire trek",
    "Personal expenses & tips",
    "Visa on arrival (if applicable)",
  ],
  stops: [
    {
      destinationName: "Yogyakarta",
      dateRange: "Aug 10 – 13",
      nights: 3,
      description: "Java's cultural capital — ancient temples, sultans' palaces, and the world's largest Buddhist monument.",
      accommodation: {
        hotelName: "The Phoenix Hotel Yogyakarta",
        stars: 5,
        checkIn: "Aug 10", checkOut: "Aug 13",
        checkInISO: "2026-08-10", checkOutISO: "2026-08-13",
        roomType: "Heritage Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -7.7956, lng: 110.3695,
    },
    {
      destinationName: "Mt Bromo",
      dateRange: "Aug 14 – 16",
      nights: 2,
      description: "An active volcanic crater in a vast caldera — sunrise here is one of Indonesia's most iconic experiences.",
      accommodation: {
        hotelName: "Jiwa Jawa Resort Bromo",
        stars: 4,
        checkIn: "Aug 14", checkOut: "Aug 16",
        checkInISO: "2026-08-14", checkOutISO: "2026-08-16",
        roomType: "Mountain View Room", boardType: "Full board",
      },
      activities: [],
      lat: -7.9425, lng: 112.9530,
    },
    {
      destinationName: "Lovina (North Bali)",
      dateRange: "Aug 16 – 18",
      nights: 2,
      description: "Black sand beaches and calm seas on Bali's quiet northern coast — dolphins at dawn.",
      accommodation: {
        hotelName: "Lovina Beach Resort",
        stars: 4,
        checkIn: "Aug 16", checkOut: "Aug 18",
        checkInISO: "2026-08-16", checkOutISO: "2026-08-18",
        roomType: "Beach Bungalow", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.1558, lng: 115.0253,
    },
    {
      destinationName: "Ubud",
      dateRange: "Aug 18 – 21",
      nights: 3,
      description: "Bali's spiritual and artistic heart — rice terraces, temples, and a world-class food scene.",
      accommodation: {
        hotelName: "Komaneka at Bisma",
        stars: 5,
        checkIn: "Aug 18", checkOut: "Aug 21",
        checkInISO: "2026-08-18", checkOutISO: "2026-08-21",
        roomType: "Forest Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.5069, lng: 115.2625,
    },
  ],
  transfers: [
    { from: "Yogyakarta", to: "Surabaya", date: "Aug 13, train", mode: "Scenic train", description: "6h through Javanese countryside" },
    { from: "Surabaya", to: "Mt Bromo", date: "Aug 14, 4x4 jeep", mode: "4x4 Jeep", description: "3h pre-dawn drive" },
    { from: "Mt Bromo", to: "Lovina (Bali)", date: "Aug 16, drive + ferry", mode: "Coach + Ferry", description: "5h drive + 45 min ferry crossing" },
    { from: "Lovina", to: "Ubud", date: "Aug 18, car", mode: "Private car", description: "2h 30m through mountain roads" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Lombok & the Gilis
// Maps to Discovery card id 12
// ─────────────────────────────────────────────────────────────────────────────

export const LOMBOK_GILIS_TOUR: Tour = {
  tourId: "lombok-gili-islands",
  title: "Lombok & the Gili Islands",
  subtitle: "Untouched beaches, turquoise coral reefs, and laid-back island life just east of Bali.",
  tripType: "individual-tour",
  duration: 8,
  locationsLabel: "Lombok · Gili Trawangan · Gili Air",
  highlights: [
    "Gili Trawangan snorkelling",
    "Mt Rinjani viewpoint trek",
    "Gili Air beach cycling",
    "Turtle sanctuary visit",
  ],
  mainImage: "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=800&q=80",
  price: {
    perPerson: 1650,
    total: 3300,
    currency: "USD",
    paidBefore: 870,
    paidAtDestination: 780,
  },
  startDate: "Sep 05, 2026",
  endDate: "Sep 12, 2026",
  adults: 2,
  destinationCodes: ["BALI"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Individual tour" },
    { iconKey: "activity",       title: "Activity",   value: "Easy to moderate" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "12+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=800&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Lombok",
      location: "Lombok",
      items: [
        { type: "highlight", label: "Welcome to Lombok", description: "Arrive at Lombok International Airport. Transfer to Senggigi Beach on the west coast." },
        { type: "hotel", label: "Qunci Villas *****" },
      ],
      image: "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "South Lombok Beaches",
      location: "Lombok",
      items: [
        { type: "highlight", label: "Tanjung Aan & Kuta Lombok", description: "Visit the twin crescent bays of Tanjung Aan — turquoise water and powdery white sand. Then explore Kuta Lombok's surf beaches." },
        { type: "highlight", label: "Selong Belanak sunset", description: "Golden hour at one of Lombok's most beautiful beaches." },
        { type: "hotel", label: "Qunci Villas *****" },
      ],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Rinjani Foothills Trek",
      location: "Lombok",
      items: [
        { type: "highlight", label: "Mt Rinjani viewpoint trek", description: "Half-day guided trek through the foothills of Indonesia's second-highest volcano — waterfalls, monkey sightings, and dramatic volcanic views." },
        { type: "hotel", label: "Qunci Villas *****" },
      ],
      image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Fast Boat to Gili Trawangan",
      location: "Lombok → Gili Trawangan",
      items: [
        { type: "transport", label: "Fast boat to Gili Trawangan", description: "15 min from Bangsal Harbour" },
        { type: "highlight", label: "Sunset swings & beach bars", description: "Settle in and watch the sunset from Gili T's famous ocean swings — Bali's Mt Agung silhouetted on the horizon." },
        { type: "hotel", label: "Pondok Santi Estate ****" },
      ],
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Gili Trawangan Snorkelling",
      location: "Gili Trawangan",
      items: [
        { type: "highlight", label: "Three-island snorkel trip", description: "Boat tour visiting all three Gili Islands — swim with sea turtles, reef sharks, and colourful coral." },
        { type: "highlight", label: "Turtle sanctuary visit", description: "Visit the Gili Trawangan turtle hatchery and release baby turtles into the sea." },
        { type: "hotel", label: "Pondok Santi Estate ****" },
      ],
      image: "https://images.unsplash.com/photo-1570789210967-2cac24ec863d?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Transfer to Gili Air",
      location: "Gili Trawangan → Gili Air",
      items: [
        { type: "transport", label: "Public boat to Gili Air", description: "10 min island-hop by boat" },
        { type: "highlight", label: "Gili Air cycling tour", description: "Cycle the entire island in 90 minutes — no cars, no motorbikes, just bicycles and horse carts." },
        { type: "hotel", label: "Slow Villas & Spa *****" },
      ],
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Gili Air Free Day",
      location: "Gili Air",
      items: [
        { type: "highlight", label: "Free day on Gili Air", description: "Snorkel off the beach, take a freediving lesson, or read a book in a hammock over the water." },
        { type: "hotel", label: "Slow Villas & Spa *****" },
      ],
      image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      location: "Gili Air → Lombok",
      items: [
        { type: "highlight", label: "Farewell & transfer", description: "Fast boat back to Lombok and transfer to the airport for onward flights." },
      ],
    },
  ],
  included: [
    "7 nights accommodation (4–5 star)",
    "Daily breakfast",
    "Mt Rinjani foothills guided trek",
    "Three-island snorkel boat trip",
    "Turtle sanctuary visit",
    "All fast boat & ferry transfers between islands",
    "Private driver on Lombok",
    "Airport transfers",
  ],
  excluded: [
    "International flights to/from Lombok",
    "Travel insurance",
    "Lunches and dinners",
    "Optional PADI dive courses",
    "Personal expenses & tips",
    "Visa on arrival (if applicable)",
  ],
  stops: [
    {
      destinationName: "Lombok",
      dateRange: "Sep 05 – 08",
      nights: 3,
      description: "Bali's quieter neighbour — dramatic beaches, a towering volcano, and authentic Sasak culture.",
      accommodation: {
        hotelName: "Qunci Villas",
        stars: 5,
        checkIn: "Sep 05", checkOut: "Sep 08",
        checkInISO: "2026-09-05", checkOutISO: "2026-09-08",
        roomType: "Pool Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.4875, lng: 116.0750,
    },
    {
      destinationName: "Gili Trawangan",
      dateRange: "Sep 08 – 10",
      nights: 2,
      description: "The party island of the Gilis — famous sunset swings, beach bars, and world-class snorkelling.",
      accommodation: {
        hotelName: "Pondok Santi Estate",
        stars: 4,
        checkIn: "Sep 08", checkOut: "Sep 10",
        checkInISO: "2026-09-08", checkOutISO: "2026-09-10",
        roomType: "Garden Suite", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.3508, lng: 116.0341,
    },
    {
      destinationName: "Gili Air",
      dateRange: "Sep 10 – 12",
      nights: 2,
      description: "The quiet, romantic Gili — crystal water, car-free paths, and a blissful pace of life.",
      accommodation: {
        hotelName: "Slow Villas & Spa",
        stars: 5,
        checkIn: "Sep 10", checkOut: "Sep 12",
        checkInISO: "2026-09-10", checkOutISO: "2026-09-12",
        roomType: "Beachfront Villa", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -8.3570, lng: 116.0810,
    },
  ],
  transfers: [
    { from: "Lombok", to: "Gili Trawangan", date: "Sep 08, fast boat", mode: "Fast boat", description: "15 min from Bangsal Harbour" },
    { from: "Gili Trawangan", to: "Gili Air", date: "Sep 10, boat", mode: "Public boat", description: "10 min island hop" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Peru — "Inca Trail Adventure"
// Maps to Discovery card ids 5 and 14
// ─────────────────────────────────────────────────────────────────────────────

export const PERU_INCA_TRAIL_TOUR: Tour = {
  tourId: "peru-inca-trail",
  title: "Inca Trail Adventure",
  subtitle: "Trek the legendary 4-day Inca Trail through cloud forests and mountain passes to arrive at Machu Picchu at sunrise.",
  tripType: "group-tour",
  duration: 8,
  locationsLabel: "Cusco · Inca Trail · Machu Picchu",
  highlights: [
    "Classic 4-day Inca Trail trek",
    "Dead Woman's Pass (4,215m)",
    "Sun Gate sunrise at Machu Picchu",
    "Cusco acclimatisation walks",
  ],
  mainImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
  price: {
    perPerson: 2450,
    total: 4900,
    currency: "USD",
    paidBefore: 1300,
    paidAtDestination: 1150,
  },
  startDate: "Jun 15, 2026",
  endDate: "Jun 22, 2026",
  adults: 2,
  destinationCodes: ["COSTARICA"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 16 trekkers" },
    { iconKey: "activity",       title: "Activity",   value: "Challenging" },
    { iconKey: "languages",      title: "Language",    value: "English & Spanish" },
    { iconKey: "calendar-check", title: "Min age",     value: "16+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Cusco",
      location: "Cusco",
      items: [
        { type: "highlight", label: "Arrive & acclimatise", description: "Arrive in Cusco at 3,400m. Gentle walking tour and coca tea to help with altitude. Equipment check and trek briefing." },
        { type: "hotel", label: "Palacio del Inca *****" },
      ],
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Cusco & Sacred Valley",
      location: "Cusco → Sacred Valley",
      items: [
        { type: "highlight", label: "Sacsayhuamán Inca fortress", description: "Morning visit to the massive Inca stone walls overlooking Cusco — some stones weigh over 100 tonnes." },
        { type: "transport", label: "Transfer to Ollantaytambo", description: "1h 30m drive to the Sacred Valley" },
        { type: "hotel", label: "Sol y Luna Lodge *****" },
      ],
      image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Inca Trail Day 1: KM 82 to Wayllabamba",
      location: "Inca Trail",
      items: [
        { type: "highlight", label: "Start the Inca Trail at KM 82", description: "Cross the Urubamba River and begin the trek — 12km through eucalyptus groves and Inca ruins at Patallacta." },
        { type: "hotel", label: "Camping at Wayllabamba (3,000m)" },
      ],
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Inca Trail Day 2: Dead Woman's Pass",
      location: "Inca Trail",
      items: [
        { type: "highlight", label: "Climb to Dead Woman's Pass (4,215m)", description: "The highest and hardest day — a long steep climb through cloud forest to the pass, then descend to camp." },
        { type: "hotel", label: "Camping at Pacaymayo (3,600m)" },
      ],
      image: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Inca Trail Day 3: Cloud Forest Ruins",
      location: "Inca Trail",
      items: [
        { type: "highlight", label: "Runkurakay & Sayacmarca ruins", description: "Pass through two more mountain passes with stunning Inca ruins clinging to the ridgeline." },
        { type: "highlight", label: "Wiñay Wayna terraces", description: "Arrive at the beautiful cascading agricultural terraces — the last campsite before Machu Picchu." },
        { type: "hotel", label: "Camping at Wiñay Wayna (2,700m)" },
      ],
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Inca Trail Day 4: Sun Gate & Machu Picchu",
      location: "Inca Trail → Machu Picchu",
      items: [
        { type: "highlight", label: "Sun Gate (Intipunku) at sunrise", description: "4am start for the final push to the Sun Gate — your first unforgettable view of Machu Picchu emerging from the mist below." },
        { type: "highlight", label: "Machu Picchu guided tour", description: "Full guided tour of the citadel — temples, terraces, and the Intihuatana stone." },
        { type: "hotel", label: "Sumaq Machu Picchu Hotel *****" },
      ],
      image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Return to Cusco",
      location: "Machu Picchu → Cusco",
      items: [
        { type: "transport", label: "Peru Rail: Aguas Calientes → Cusco", description: "Scenic train return via Ollantaytambo" },
        { type: "highlight", label: "Farewell dinner in Cusco", description: "Celebrate completing the Inca Trail with a group dinner in Cusco's Plaza de Armas." },
        { type: "hotel", label: "Palacio del Inca *****" },
      ],
      image: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      location: "Cusco",
      items: [
        { type: "highlight", label: "Check out & farewell", description: "Transfer to Cusco Airport for onward flights." },
      ],
    },
  ],
  included: [
    "7 nights (4 camping + 3 hotel, 5-star)",
    "All meals on the Inca Trail (3 lunches, 3 dinners, 4 breakfasts)",
    "Inca Trail permit & Machu Picchu entry",
    "Professional porters & camping equipment",
    "Experienced bilingual trekking guide",
    "Peru Rail scenic train return",
    "Cusco walking tour",
    "Sacred Valley transfer",
    "All airport transfers",
  ],
  excluded: [
    "International flights to/from Peru",
    "Travel insurance (mandatory for trek)",
    "Sleeping bag rental (optional)",
    "Optional Huayna Picchu permit",
    "Personal trekking gear",
    "Tips for porters & guide",
    "Hotel meals in Cusco (except breakfast)",
  ],
  stops: [
    {
      destinationName: "Cusco",
      dateRange: "Jun 15 – 17",
      nights: 2,
      description: "The ancient Inca capital — acclimatise at 3,400m before the trek.",
      accommodation: {
        hotelName: "Palacio del Inca",
        stars: 5,
        checkIn: "Jun 15", checkOut: "Jun 17",
        checkInISO: "2026-06-15", checkOutISO: "2026-06-17",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -13.5319, lng: -71.9675,
    },
    {
      destinationName: "Inca Trail",
      dateRange: "Jun 17 – 20",
      nights: 3,
      description: "The legendary 43km trail through the Andes — cloud forests, mountain passes, and ancient Inca ruins.",
      accommodation: {
        hotelName: "Trek Camping",
        stars: 3,
        checkIn: "Jun 17", checkOut: "Jun 20",
        checkInISO: "2026-06-17", checkOutISO: "2026-06-20",
        roomType: "2-person tent", boardType: "Full board (camp meals)",
      },
      activities: [],
      lat: -13.2263, lng: -72.4973,
    },
    {
      destinationName: "Machu Picchu",
      dateRange: "Jun 20 – 21",
      nights: 1,
      description: "The 15th-century Inca citadel — one of the New Seven Wonders of the World.",
      accommodation: {
        hotelName: "Sumaq Machu Picchu Hotel",
        stars: 5,
        checkIn: "Jun 20", checkOut: "Jun 21",
        checkInISO: "2026-06-20", checkOutISO: "2026-06-21",
        roomType: "Deluxe Andean Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -13.1631, lng: -72.5450,
    },
  ],
  transfers: [
    { from: "Cusco", to: "Sacred Valley (Ollantaytambo)", date: "Jun 16, coach", mode: "Private coach", description: "1h 30m drive to the Sacred Valley" },
    { from: "Machu Picchu", to: "Cusco", date: "Jun 21, train", mode: "Peru Rail", description: "Scenic train via Ollantaytambo" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Peru — "Amazon & Andes"
// Maps to Discovery card ids 6 and 15
// ─────────────────────────────────────────────────────────────────────────────

export const PERU_AMAZON_TOUR: Tour = {
  tourId: "peru-amazon-andes",
  title: "Amazon & Andes",
  subtitle: "From the Amazon rainforest canopy to the shores of Lake Titicaca — Peru's most dramatic natural contrasts in one journey.",
  tripType: "group-tour",
  duration: 10,
  locationsLabel: "Puerto Maldonado · Cusco · Lake Titicaca",
  highlights: [
    "Amazon jungle canopy walk",
    "Uros floating islands",
    "Lake Titicaca boat crossing",
    "Macaw clay lick sunrise",
  ],
  mainImage: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
  price: {
    perPerson: 2180,
    total: 4360,
    currency: "USD",
    paidBefore: 1150,
    paidAtDestination: 1030,
  },
  startDate: "Jul 20, 2026",
  endDate: "Jul 29, 2026",
  adults: 2,
  destinationCodes: ["COSTARICA"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 12 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Moderate" },
    { iconKey: "languages",      title: "Language",    value: "English & Spanish" },
    { iconKey: "calendar-check", title: "Min age",     value: "14+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800&q=80",
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Puerto Maldonado",
      location: "Puerto Maldonado",
      items: [
        { type: "highlight", label: "Fly into the Amazon", description: "Arrive at Puerto Maldonado Airport. Boat ride up the Madre de Dios River to your eco-lodge deep in the rainforest." },
        { type: "hotel", label: "Inkaterra Reserva Amazónica *****" },
      ],
      image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Amazon Canopy Walkway",
      location: "Amazon Rainforest",
      items: [
        { type: "highlight", label: "Canopy walkway at sunrise", description: "Walk 30m above the forest floor on a network of hanging bridges — toucans, monkeys, and sloths at eye level." },
        { type: "highlight", label: "Night jungle walk", description: "Guided torchlight hike through the rainforest after dark — tarantulas, tree frogs, and glowing fungi." },
        { type: "hotel", label: "Inkaterra Reserva Amazónica *****" },
      ],
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Macaw Clay Lick & Oxbow Lake",
      location: "Amazon Rainforest",
      items: [
        { type: "highlight", label: "Macaw clay lick at dawn", description: "Watch hundreds of colourful macaws and parrots descend on the mineral-rich clay riverbank — a wildlife spectacle." },
        { type: "highlight", label: "Oxbow lake canoe trip", description: "Paddle a dugout canoe through a jungle lake looking for giant river otters and caimans." },
        { type: "hotel", label: "Inkaterra Reserva Amazónica *****" },
      ],
      image: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Fly to Cusco",
      location: "Amazon → Cusco",
      items: [
        { type: "transport", label: "Flight to Cusco", description: "1h flight from Puerto Maldonado to Cusco (3,400m)" },
        { type: "highlight", label: "Cusco orientation walk", description: "Gentle afternoon walk through the historic centre — Plaza de Armas and the Cathedral." },
        { type: "hotel", label: "Belmond Hotel Monasterio *****" },
      ],
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Cusco Temples & Markets",
      location: "Cusco",
      items: [
        { type: "highlight", label: "Qorikancha — Temple of the Sun", description: "The Inca empire's most sacred site — its walls were once lined with 700 solid gold sheets." },
        { type: "highlight", label: "San Pedro Market lunch", description: "Taste local produce — alpaca steak, giant corn, and fresh fruit juices." },
        { type: "hotel", label: "Belmond Hotel Monasterio *****" },
      ],
      image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Drive to Puno & Lake Titicaca",
      location: "Cusco → Puno",
      items: [
        { type: "transport", label: "Scenic coach to Puno", description: "6h drive via the La Raya pass (4,335m) with stops at Raqchi temple and Andahuaylillas church" },
        { type: "highlight", label: "Arrive at Lake Titicaca", description: "Check in to your lakefront hotel in Puno — the highest navigable lake in the world at 3,812m." },
        { type: "hotel", label: "Titilaka Lodge *****" },
      ],
      image: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Uros Floating Islands",
      location: "Lake Titicaca",
      items: [
        { type: "highlight", label: "Uros Floating Islands visit", description: "Boat to the extraordinary floating islands built entirely from totora reeds by the Uros people — a way of life unchanged for centuries." },
        { type: "highlight", label: "Taquile Island cultural visit", description: "Visit the island famous for its male knitting tradition (UNESCO Intangible Heritage) and stunning lake views." },
        { type: "hotel", label: "Titilaka Lodge *****" },
      ],
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Lake Titicaca Free Day",
      location: "Lake Titicaca",
      items: [
        { type: "highlight", label: "Free day at the lake", description: "Optional kayaking on the lake, visit to Sillustani pre-Inca tombs, or simply enjoy the spectacular Andean views." },
        { type: "hotel", label: "Titilaka Lodge *****" },
      ],
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    },
    {
      dayNumber: 9,
      title: "Return to Lima",
      location: "Puno → Lima",
      items: [
        { type: "transport", label: "Fly Juliaca → Lima", description: "1h 45m flight from Juliaca Airport" },
        { type: "highlight", label: "Farewell dinner in Miraflores", description: "Final group dinner at a top Lima restaurant overlooking the Pacific." },
        { type: "hotel", label: "JW Marriott Lima *****" },
      ],
      image: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80",
    },
    {
      dayNumber: 10,
      title: "Departure Day",
      location: "Lima",
      items: [
        { type: "highlight", label: "Check out & farewell", description: "Transfer to Jorge Chávez International Airport." },
      ],
    },
  ],
  included: [
    "9 nights accommodation (5-star eco-lodges & hotels)",
    "Daily breakfast + all meals in the Amazon (full board)",
    "All domestic flights (Lima–Puerto Maldonado, PEM–Cusco, Juliaca–Lima)",
    "Amazon canopy walkway & guided jungle treks",
    "Macaw clay lick & oxbow lake excursions",
    "Uros Floating Islands & Taquile Island boat trips",
    "Scenic Cusco–Puno coach with stops",
    "English- & Spanish-speaking expert guide",
    "All transfers & airport pickups",
  ],
  excluded: [
    "International flights to/from Peru",
    "Travel insurance (mandatory)",
    "Lunches & dinners outside the Amazon",
    "Optional Sillustani tombs visit",
    "Personal expenses & tips",
    "Peruvian tourist card",
    "Yellow fever vaccination (recommended for Amazon)",
  ],
  stops: [
    {
      destinationName: "Amazon Rainforest",
      dateRange: "Jul 20 – 23",
      nights: 3,
      description: "The Tambopata National Reserve — one of the most biodiverse places on Earth.",
      accommodation: {
        hotelName: "Inkaterra Reserva Amazónica",
        stars: 5,
        checkIn: "Jul 20", checkOut: "Jul 23",
        checkInISO: "2026-07-20", checkOutISO: "2026-07-23",
        roomType: "Amazónica Suite", boardType: "Full board",
      },
      activities: [],
      lat: -12.5933, lng: -69.1897,
    },
    {
      destinationName: "Cusco",
      dateRange: "Jul 23 – 25",
      nights: 2,
      description: "The ancient Inca capital — cobbled streets, baroque churches, and Inca stonework.",
      accommodation: {
        hotelName: "Belmond Hotel Monasterio",
        stars: 5,
        checkIn: "Jul 23", checkOut: "Jul 25",
        checkInISO: "2026-07-23", checkOutISO: "2026-07-25",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: -13.5319, lng: -71.9675,
    },
    {
      destinationName: "Lake Titicaca (Puno)",
      dateRange: "Jul 25 – 28",
      nights: 3,
      description: "The highest navigable lake in the world at 3,812m — floating islands and ancient cultures.",
      accommodation: {
        hotelName: "Titilaka Lodge",
        stars: 5,
        checkIn: "Jul 25", checkOut: "Jul 28",
        checkInISO: "2026-07-25", checkOutISO: "2026-07-28",
        roomType: "Lake View Suite", boardType: "Full board",
      },
      activities: [],
      lat: -15.8402, lng: -70.0219,
    },
  ],
  transfers: [
    { from: "Puerto Maldonado", to: "Cusco", date: "Jul 23, flight", mode: "Domestic flight", description: "1h flight over the Andes" },
    { from: "Cusco", to: "Puno", date: "Jul 25, coach", mode: "Scenic coach", description: "6h with stops at Raqchi and La Raya pass" },
    { from: "Puno", to: "Lima (via Juliaca)", date: "Jul 28, flight", mode: "Domestic flight", description: "1h 45m flight" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Japan — "Kyoto & Beyond"
// Maps to Discovery card id 17
// ─────────────────────────────────────────────────────────────────────────────

export const JAPAN_KYOTO_TOUR: Tour = {
  tourId: "japan-kyoto-beyond",
  title: "Kyoto & Beyond",
  subtitle: "Go deeper into Japan's ancient heart — Kyoto's hidden temples, Nara's sacred deer, and Hiroshima's powerful peace story.",
  tripType: "group-tour",
  duration: 8,
  locationsLabel: "Kyoto · Nara · Hiroshima",
  highlights: [
    "Fushimi Inari at dawn",
    "Nara deer park & Todai-ji",
    "Hiroshima Peace Memorial",
    "Arashiyama bamboo grove",
  ],
  mainImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  price: {
    perPerson: 2490,
    total: 4980,
    currency: "USD",
    paidBefore: 1290,
    paidAtDestination: 1200,
  },
  startDate: "Apr 10, 2027",
  endDate: "Apr 17, 2027",
  adults: 2,
  destinationCodes: ["HOCHIMINH"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 12 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Easy" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "All ages" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Kyoto",
      location: "Kyoto",
      items: [
        { type: "highlight", label: "Welcome to Kyoto", description: "Arrive at Kansai Airport. Transfer to your ryokan in the Higashiyama district. Evening walk through Gion." },
        { type: "hotel", label: "Sowaka Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Kyoto Temples: East Side",
      location: "Kyoto",
      items: [
        { type: "highlight", label: "Fushimi Inari at dawn", description: "Beat the crowds with an early-morning hike through thousands of vermilion torii gates on Mt Inari." },
        { type: "highlight", label: "Kiyomizu-dera Temple", description: "Kyoto's most celebrated temple — a wooden stage jutting out over a hillside of cherry trees." },
        { type: "highlight", label: "Philosopher's Path", description: "Afternoon walk along the canal-side path lined with cherry and maple trees." },
        { type: "hotel", label: "Sowaka Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Arashiyama & Golden Pavilion",
      location: "Kyoto",
      items: [
        { type: "highlight", label: "Arashiyama Bamboo Grove", description: "Walk through soaring bamboo stalks — one of the world's most surreal natural settings." },
        { type: "highlight", label: "Kinkaku-ji Golden Pavilion", description: "The iconic gold-covered Zen temple reflected perfectly in its mirror pond." },
        { type: "hotel", label: "Sowaka Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Day Trip to Nara",
      location: "Kyoto → Nara → Kyoto",
      items: [
        { type: "transport", label: "Train to Nara", description: "45 min from Kyoto — JR Pass covered" },
        { type: "highlight", label: "Nara Park & friendly deer", description: "Roam with 1,200 semi-tame deer in the park — they'll bow to you for rice crackers." },
        { type: "highlight", label: "Todai-ji Temple & Giant Buddha", description: "The world's largest wooden building housing a 15m bronze Buddha — awe-inspiring." },
        { type: "hotel", label: "Sowaka Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Kyoto Craft & Tea",
      location: "Kyoto",
      items: [
        { type: "highlight", label: "Traditional tea ceremony", description: "Participate in a formal Japanese tea ceremony in a historic Kyoto machiya townhouse." },
        { type: "highlight", label: "Nishiki Market food tour", description: "Taste your way through 'Kyoto's Kitchen' — 130+ vendors selling pickles, wagashi, and Kyoto tofu." },
        { type: "hotel", label: "Sowaka Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Shinkansen to Hiroshima",
      location: "Kyoto → Hiroshima",
      items: [
        { type: "transport", label: "Shinkansen to Hiroshima", description: "1h 40m bullet train — JR Pass covered" },
        { type: "highlight", label: "Peace Memorial Museum", description: "A deeply moving museum and park — the A-Bomb Dome, paper crane memorial, and peace flame." },
        { type: "hotel", label: "Sheraton Grand Hiroshima ****" },
      ],
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Miyajima Island",
      location: "Hiroshima → Miyajima",
      items: [
        { type: "highlight", label: "Itsukushima Shrine floating torii", description: "Ferry to the sacred island and its iconic vermilion torii gate rising from the sea." },
        { type: "highlight", label: "Mt Misen ropeway", description: "Gondola to the island summit for panoramic views over the Seto Inland Sea." },
        { type: "hotel", label: "Sheraton Grand Hiroshima ****" },
      ],
      image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      location: "Hiroshima",
      items: [
        { type: "highlight", label: "Farewell & check out", description: "Transfer to Hiroshima Airport or Shinkansen to Osaka/Tokyo for onward connections." },
      ],
    },
  ],
  included: [
    "7 nights accommodation (4–5 star)",
    "Daily breakfast + 2 group dinners",
    "Japan Rail Pass (7-day) covering Shinkansen",
    "Fushimi Inari, Kinkaku-ji, Kiyomizu-dera entries",
    "Nara day trip with guide",
    "Hiroshima Peace Museum entry",
    "Miyajima ferry & Mt Misen ropeway",
    "Traditional tea ceremony experience",
    "English-speaking guide throughout",
  ],
  excluded: [
    "International flights to/from Japan",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional geisha experience (extra)",
    "Personal expenses & tips",
    "Japan tourist visa (if applicable)",
  ],
  stops: [
    {
      destinationName: "Kyoto",
      dateRange: "Apr 10 – 15",
      nights: 5,
      description: "Japan's ancient imperial capital — 1,600 temples, Zen gardens, and the beating heart of Japanese culture.",
      accommodation: {
        hotelName: "Sowaka Kyoto",
        stars: 5,
        checkIn: "Apr 10", checkOut: "Apr 15",
        checkInISO: "2027-04-10", checkOutISO: "2027-04-15",
        roomType: "Deluxe Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 35.0116, lng: 135.7681,
    },
    {
      destinationName: "Hiroshima",
      dateRange: "Apr 15 – 17",
      nights: 2,
      description: "A city reborn from tragedy — powerful peace memorials, vibrant food culture, and gateway to Miyajima.",
      accommodation: {
        hotelName: "Sheraton Grand Hiroshima",
        stars: 4,
        checkIn: "Apr 15", checkOut: "Apr 17",
        checkInISO: "2027-04-15", checkOutISO: "2027-04-17",
        roomType: "Deluxe King Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 34.3853, lng: 132.4553,
    },
  ],
  transfers: [
    { from: "Kyoto", to: "Hiroshima", date: "Apr 15, Shinkansen", mode: "Bullet train", description: "1h 40m Nozomi Shinkansen" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Japan — "Japan Rail Adventure"
// Maps to Discovery card id 18
// ─────────────────────────────────────────────────────────────────────────────

export const JAPAN_RAIL_TOUR: Tour = {
  tourId: "japan-rail-adventure",
  title: "Japan Rail Adventure",
  subtitle: "The ultimate rail journey — ride every iconic train across Japan, from tropical Kyushu to snowy Hokkaido.",
  tripType: "group-tour",
  duration: 14,
  locationsLabel: "Tokyo · Kanazawa · Kyoto · Osaka · Hiroshima · Fukuoka",
  highlights: [
    "Nozomi Shinkansen at 300 km/h",
    "Kanazawa Kenroku-en Garden",
    "Hiroshima okonomiyaki",
    "Hakone hot-spring ryokan",
  ],
  mainImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  price: {
    perPerson: 3690,
    total: 7380,
    currency: "USD",
    paidBefore: 1890,
    paidAtDestination: 1800,
  },
  startDate: "Mar 25, 2027",
  endDate: "Apr 07, 2027",
  adults: 2,
  destinationCodes: ["HOCHIMINH"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 14 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Easy" },
    { iconKey: "languages",      title: "Language",    value: "English" },
    { iconKey: "calendar-check", title: "Min age",     value: "All ages" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Tokyo",
      location: "Tokyo",
      items: [
        { type: "highlight", label: "Welcome to Japan", description: "Arrive at Narita or Haneda. Transfer to Shinjuku. Evening walk through Golden Gai and Omoide Yokocho." },
        { type: "hotel", label: "Hyatt Regency Tokyo *****" },
      ],
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Tokyo Highlights",
      location: "Tokyo",
      items: [
        { type: "highlight", label: "Tsukiji Market & Shibuya Crossing", description: "Morning at the outer market, then the world's busiest crossing and Hachiko statue." },
        { type: "highlight", label: "Akihabara & Harajuku", description: "Afternoon exploring Tokyo's subcultures — anime shops and Takeshita Street fashion." },
        { type: "hotel", label: "Hyatt Regency Tokyo *****" },
      ],
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Hakone Day Trip",
      location: "Tokyo → Hakone → Tokyo",
      items: [
        { type: "transport", label: "Romancecar to Hakone", description: "85 min scenic mountain express" },
        { type: "highlight", label: "Hakone Ropeway & Lake Ashi cruise", description: "Gondola ride for Mt Fuji views (weather permitting), then pirate ship across the lake." },
        { type: "hotel", label: "Hyatt Regency Tokyo *****" },
      ],
      image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Shinkansen to Kanazawa",
      location: "Tokyo → Kanazawa",
      items: [
        { type: "transport", label: "Hokuriku Shinkansen to Kanazawa", description: "2h 30m through the Japan Alps" },
        { type: "highlight", label: "Kenroku-en Garden", description: "One of Japan's three most beautiful gardens — ponds, bridges, and ancient pines." },
        { type: "hotel", label: "Hotel Nikko Kanazawa ****" },
      ],
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Kanazawa Exploration",
      location: "Kanazawa",
      items: [
        { type: "highlight", label: "Higashi Chaya geisha district", description: "Beautifully preserved wooden teahouses — sample gold-leaf ice cream and matcha in a geisha house." },
        { type: "highlight", label: "21st Century Museum of Contemporary Art", description: "One of Japan's most acclaimed modern art spaces — free areas and rotating exhibitions." },
        { type: "hotel", label: "Hotel Nikko Kanazawa ****" },
      ],
      image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Thunderbird to Kyoto",
      location: "Kanazawa → Kyoto",
      items: [
        { type: "transport", label: "Limited Express Thunderbird to Kyoto", description: "2h 10m through mountain tunnels" },
        { type: "highlight", label: "Gion evening walk", description: "Stroll Kyoto's famous geisha district at dusk — wooden machiya, lanterns, and traditional restaurants." },
        { type: "hotel", label: "Ritz-Carlton Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Kyoto Temples",
      location: "Kyoto",
      items: [
        { type: "highlight", label: "Fushimi Inari Shrine", description: "Thousands of vermilion torii gates winding up the mountain — mesmerising at sunrise." },
        { type: "highlight", label: "Kinkaku-ji & Ryoan-ji", description: "Gold Pavilion and Japan's most famous Zen rock garden." },
        { type: "hotel", label: "Ritz-Carlton Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Kyoto Free Day",
      location: "Kyoto",
      items: [
        { type: "highlight", label: "Free day", description: "Arashiyama Bamboo Grove, Nishiki Market, cooking class, or a kimono rental experience — your choice." },
        { type: "hotel", label: "Ritz-Carlton Kyoto *****" },
      ],
      image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    },
    {
      dayNumber: 9,
      title: "Shinkansen to Osaka",
      location: "Kyoto → Osaka",
      items: [
        { type: "transport", label: "Shinkansen to Osaka", description: "15 min — JR Pass covered" },
        { type: "highlight", label: "Dotonbori & Shinsekai food crawl", description: "Osaka's two legendary eating districts — takoyaki, kushikatsu, and gyoza." },
        { type: "hotel", label: "W Osaka *****" },
      ],
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    },
    {
      dayNumber: 10,
      title: "Osaka Castle & Free Time",
      location: "Osaka",
      items: [
        { type: "highlight", label: "Osaka Castle", description: "The magnificent 16th-century castle surrounded by moats and parkland." },
        { type: "highlight", label: "Kuromon Market", description: "'Osaka's Kitchen' — fresh seafood, Wagyu, and street snacks." },
        { type: "hotel", label: "W Osaka *****" },
      ],
      image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
    },
    {
      dayNumber: 11,
      title: "Shinkansen to Hiroshima",
      location: "Osaka → Hiroshima",
      items: [
        { type: "transport", label: "Shinkansen to Hiroshima", description: "1h 30m — JR Pass covered" },
        { type: "highlight", label: "Hiroshima Peace Memorial", description: "A-Bomb Dome, Peace Museum, and the cenotaph — essential and deeply moving." },
        { type: "hotel", label: "Sheraton Grand Hiroshima ****" },
      ],
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    },
    {
      dayNumber: 12,
      title: "Miyajima & Hiroshima Food",
      location: "Hiroshima",
      items: [
        { type: "highlight", label: "Miyajima Island floating torii", description: "Ferry to the sacred island — the iconic gate, wild deer, and maple leaf pastries." },
        { type: "highlight", label: "Hiroshima-style okonomiyaki dinner", description: "Try the local layered version of Japan's famous savoury pancake — a must-eat." },
        { type: "hotel", label: "Sheraton Grand Hiroshima ****" },
      ],
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    },
    {
      dayNumber: 13,
      title: "Shinkansen to Fukuoka",
      location: "Hiroshima → Fukuoka",
      items: [
        { type: "transport", label: "Shinkansen to Fukuoka", description: "1h — JR Pass covered" },
        { type: "highlight", label: "Yatai ramen stalls by the river", description: "Fukuoka's famous outdoor ramen stands along the Naka River — the best tonkotsu ramen in Japan." },
        { type: "hotel", label: "Hotel Okura Fukuoka ****" },
      ],
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    },
    {
      dayNumber: 14,
      title: "Departure Day",
      location: "Fukuoka",
      items: [
        { type: "highlight", label: "Farewell & check out", description: "Transfer to Fukuoka Airport for onward flights." },
      ],
    },
  ],
  included: [
    "13 nights accommodation (4–5 star)",
    "Daily breakfast + 4 group dinners",
    "Japan Rail Pass (14-day) covering all trains",
    "Romancecar, Thunderbird, Shinkansen rides",
    "All guided tours & temple entries",
    "Miyajima ferry & Mt Misen ropeway",
    "Hiroshima Peace Museum entry",
    "English-speaking guide throughout",
    "All airport transfers",
  ],
  excluded: [
    "International flights to/from Japan",
    "Travel insurance",
    "Lunches and non-group dinners",
    "Optional geisha/kimono experiences",
    "Personal expenses & tips",
    "Japan tourist visa (if applicable)",
  ],
  stops: [
    {
      destinationName: "Tokyo",
      dateRange: "Mar 25 – 28",
      nights: 3,
      description: "The world's largest metropolis — neon, sushi, temples, and cutting-edge technology.",
      accommodation: {
        hotelName: "Hyatt Regency Tokyo",
        stars: 5,
        checkIn: "Mar 25", checkOut: "Mar 28",
        checkInISO: "2027-03-25", checkOutISO: "2027-03-28",
        roomType: "Regency King Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 35.6762, lng: 139.6503,
    },
    {
      destinationName: "Kanazawa",
      dateRange: "Mar 28 – 30",
      nights: 2,
      description: "Japan's best-kept secret — samurai districts, geisha teahouses, and one of the world's finest gardens.",
      accommodation: {
        hotelName: "Hotel Nikko Kanazawa",
        stars: 4,
        checkIn: "Mar 28", checkOut: "Mar 30",
        checkInISO: "2027-03-28", checkOutISO: "2027-03-30",
        roomType: "Superior Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 36.5613, lng: 136.6562,
    },
    {
      destinationName: "Kyoto",
      dateRange: "Mar 30 – Apr 02",
      nights: 3,
      description: "The ancient capital — cherry blossoms in spring, torii gates, and the finest kaiseki cuisine.",
      accommodation: {
        hotelName: "Ritz-Carlton Kyoto",
        stars: 5,
        checkIn: "Mar 30", checkOut: "Apr 02",
        checkInISO: "2027-03-30", checkOutISO: "2027-04-02",
        roomType: "Deluxe Kamogawa Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 35.0116, lng: 135.7681,
    },
    {
      destinationName: "Osaka",
      dateRange: "Apr 02 – 04",
      nights: 2,
      description: "Japan's food capital — Dotonbori neon, Osaka Castle, and the friendliest locals in the country.",
      accommodation: {
        hotelName: "W Osaka",
        stars: 5,
        checkIn: "Apr 02", checkOut: "Apr 04",
        checkInISO: "2027-04-02", checkOutISO: "2027-04-04",
        roomType: "Wonderful King Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 34.6937, lng: 135.5023,
    },
    {
      destinationName: "Hiroshima",
      dateRange: "Apr 04 – 06",
      nights: 2,
      description: "A city of peace and resilience — powerful memorials, Miyajima Island, and incredible okonomiyaki.",
      accommodation: {
        hotelName: "Sheraton Grand Hiroshima",
        stars: 4,
        checkIn: "Apr 04", checkOut: "Apr 06",
        checkInISO: "2027-04-04", checkOutISO: "2027-04-06",
        roomType: "Deluxe King Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 34.3853, lng: 132.4553,
    },
    {
      destinationName: "Fukuoka",
      dateRange: "Apr 06 – 07",
      nights: 1,
      description: "Kyushu's dynamic capital — yatai ramen stalls, canal city, and gateway to southern Japan.",
      accommodation: {
        hotelName: "Hotel Okura Fukuoka",
        stars: 4,
        checkIn: "Apr 06", checkOut: "Apr 07",
        checkInISO: "2027-04-06", checkOutISO: "2027-04-07",
        roomType: "Premium Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 33.5904, lng: 130.4017,
    },
  ],
  transfers: [
    { from: "Tokyo", to: "Kanazawa", date: "Mar 28, Shinkansen", mode: "Hokuriku Shinkansen", description: "2h 30m through the Japan Alps" },
    { from: "Kanazawa", to: "Kyoto", date: "Mar 30, Thunderbird", mode: "Limited Express", description: "2h 10m" },
    { from: "Kyoto", to: "Osaka", date: "Apr 02, Shinkansen", mode: "Bullet train", description: "15 min" },
    { from: "Osaka", to: "Hiroshima", date: "Apr 04, Shinkansen", mode: "Bullet train", description: "1h 30m" },
    { from: "Hiroshima", to: "Fukuoka", date: "Apr 06, Shinkansen", mode: "Bullet train", description: "1h" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Morocco — "Sahara & Kasbahs"
// Maps to Discovery card id 20
// ─────────────────────────────────────────────────────────────────────────────

export const MOROCCO_SAHARA_TOUR: Tour = {
  tourId: "morocco-sahara-kasbahs",
  title: "Sahara & Kasbahs",
  subtitle: "Camel treks under starlit skies, ancient mud-brick fortresses, and dramatic desert gorges in southern Morocco.",
  tripType: "group-tour",
  duration: 7,
  locationsLabel: "Marrakech · Ouarzazate · Merzouga · Todra Gorge",
  highlights: [
    "Erg Chebbi camel sunset trek",
    "Todra Gorge canyon walk",
    "Aït Benhaddou UNESCO kasbah",
    "Berber desert camp stargazing",
  ],
  mainImage: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
  price: {
    perPerson: 1320,
    total: 2640,
    currency: "USD",
    paidBefore: 690,
    paidAtDestination: 630,
  },
  startDate: "Oct 24, 2026",
  endDate: "Oct 30, 2026",
  adults: 2,
  destinationCodes: ["MARRAKECH"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 12 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Easy to moderate" },
    { iconKey: "languages",      title: "Language",    value: "English & French" },
    { iconKey: "calendar-check", title: "Min age",     value: "12+" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
    "https://images.unsplash.com/photo-1548820996-c1e4d0e33aa2?w=800&q=80",
    "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80",
    "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Depart Marrakech",
      location: "Marrakech → Ouarzazate",
      items: [
        { type: "transport", label: "Cross the High Atlas via Tizi n'Tichka pass", description: "4h dramatic mountain pass at 2,260m — Berber villages and panoramic views" },
        { type: "highlight", label: "Aït Benhaddou UNESCO kasbah", description: "Explore the stunning fortified ksar — film location for Gladiator, Game of Thrones, and Lawrence of Arabia." },
        { type: "hotel", label: "Berbère Palace Ouarzazate ****" },
      ],
      image: "https://images.unsplash.com/photo-1548820996-c1e4d0e33aa2?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Valley of Roses & Todra Gorge",
      location: "Ouarzazate → Todra Gorge",
      items: [
        { type: "transport", label: "Drive through the Dadès Valley", description: "4h through the Valley of a Thousand Kasbahs and the Valley of Roses" },
        { type: "highlight", label: "Todra Gorge canyon walk", description: "Walk between 300m-high cliff walls in one of Morocco's most dramatic natural formations — just 10m apart at the narrowest point." },
        { type: "hotel", label: "Riad Lamane Todra ****" },
      ],
      image: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Drive to Merzouga",
      location: "Todra Gorge → Merzouga",
      items: [
        { type: "transport", label: "Drive to Merzouga", description: "4h through the Ziz palm valley" },
        { type: "highlight", label: "First views of Erg Chebbi dunes", description: "Arrive as the great orange dunes glow in the late-afternoon light — up to 150m high." },
        { type: "hotel", label: "Kasbah Mohayut *****" },
      ],
      image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Sahara Camel Trek & Desert Camp",
      location: "Merzouga (Sahara)",
      items: [
        { type: "highlight", label: "Sunset camel trek into the dunes", description: "Ride dromedary camels deep into the Sahara as the sun paints the dunes gold and crimson." },
        { type: "highlight", label: "Berber desert camp night", description: "Traditional music, drum circle, tagine dinner under a canopy of stars with zero light pollution." },
        { type: "hotel", label: "Luxury Berber Desert Camp *****" },
      ],
      image: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Sahara Sunrise & Nomad Visit",
      location: "Merzouga (Sahara)",
      items: [
        { type: "highlight", label: "Dune sunrise hike", description: "Climb a high dune before dawn to watch the sun rise over the endless Sahara — an unforgettable moment." },
        { type: "highlight", label: "Nomad family visit", description: "Meet a semi-nomadic Berber family living on the desert edge — share mint tea and learn about their way of life." },
        { type: "hotel", label: "Kasbah Mohayut *****" },
      ],
      image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Return to Marrakech",
      location: "Merzouga → Marrakech",
      items: [
        { type: "transport", label: "Full-day drive back to Marrakech", description: "10h with lunch stop and scenic breaks along the Draa Valley" },
        { type: "highlight", label: "Djemaa el-Fna arrival evening", description: "Arrive in Marrakech and head straight to the world's greatest open-air stage — food stalls, musicians, and snake charmers." },
        { type: "hotel", label: "La Mamounia *****" },
      ],
      image: "https://images.unsplash.com/photo-1548820996-c1e4d0e33aa2?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Departure Day",
      location: "Marrakech",
      items: [
        { type: "highlight", label: "Morning in the souks & farewell", description: "Final morning exploring the Marrakech souks before transfer to Menara Airport." },
      ],
    },
  ],
  included: [
    "6 nights accommodation (4–5 star kasbahs & desert camp)",
    "Daily breakfast + all meals in the desert",
    "Sahara camel trek & luxury desert camp (1 night)",
    "Todra Gorge guided walk",
    "Aït Benhaddou kasbah visit",
    "All private coach transfers",
    "English- & French-speaking guide",
  ],
  excluded: [
    "International flights to/from Morocco",
    "Travel insurance",
    "Lunches (except desert days)",
    "Optional quad biking in Merzouga",
    "Personal shopping & tips",
  ],
  stops: [
    {
      destinationName: "Ouarzazate",
      dateRange: "Oct 24 – 25",
      nights: 1,
      description: "The 'Hollywood of Africa' — gateway to the Sahara, surrounded by dramatic kasbahs.",
      accommodation: {
        hotelName: "Berbère Palace Ouarzazate",
        stars: 4,
        checkIn: "Oct 24", checkOut: "Oct 25",
        checkInISO: "2026-10-24", checkOutISO: "2026-10-25",
        roomType: "Standard Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 30.9189, lng: -6.8937,
    },
    {
      destinationName: "Todra Gorge",
      dateRange: "Oct 25 – 26",
      nights: 1,
      description: "Towering 300m canyon walls in the eastern High Atlas — one of Morocco's most dramatic natural wonders.",
      accommodation: {
        hotelName: "Riad Lamane Todra",
        stars: 4,
        checkIn: "Oct 25", checkOut: "Oct 26",
        checkInISO: "2026-10-25", checkOutISO: "2026-10-26",
        roomType: "Gorge View Room", boardType: "Half board",
      },
      activities: [],
      lat: 31.5893, lng: -5.5672,
    },
    {
      destinationName: "Merzouga (Sahara)",
      dateRange: "Oct 26 – 29",
      nights: 3,
      description: "The great Erg Chebbi dunes — 150m-high orange sand mountains at the edge of the Sahara.",
      accommodation: {
        hotelName: "Kasbah Mohayut",
        stars: 5,
        checkIn: "Oct 26", checkOut: "Oct 29",
        checkInISO: "2026-10-26", checkOutISO: "2026-10-29",
        roomType: "Desert Suite", boardType: "Full board",
      },
      activities: [],
      lat: 31.1000, lng: -3.9667,
    },
    {
      destinationName: "Marrakech",
      dateRange: "Oct 29 – 30",
      nights: 1,
      description: "The Red City — vibrant souks, Djemaa el-Fna, and the finest riads in the world.",
      accommodation: {
        hotelName: "La Mamounia",
        stars: 5,
        checkIn: "Oct 29", checkOut: "Oct 30",
        checkInISO: "2026-10-29", checkOutISO: "2026-10-30",
        roomType: "Superior Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 31.6295, lng: -7.9811,
    },
  ],
  transfers: [
    { from: "Marrakech", to: "Ouarzazate", date: "Oct 24, coach", mode: "Private coach", description: "4h via Tizi n'Tichka mountain pass" },
    { from: "Ouarzazate", to: "Todra Gorge", date: "Oct 25, coach", mode: "Private coach", description: "4h through Dadès Valley" },
    { from: "Todra Gorge", to: "Merzouga", date: "Oct 26, coach", mode: "Private coach", description: "4h via Ziz valley" },
    { from: "Merzouga", to: "Marrakech", date: "Oct 29, coach", mode: "Private coach", description: "10h full-day drive with stops" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Morocco — "Coastal Morocco"
// Maps to Discovery card id 21
// ─────────────────────────────────────────────────────────────────────────────

export const MOROCCO_COASTAL_TOUR: Tour = {
  tourId: "morocco-coastal",
  title: "Coastal Morocco",
  subtitle: "Wind-swept Atlantic beaches, the blue city, and bohemian Essaouira — Morocco's stunning coastline and mountain towns.",
  tripType: "group-tour",
  duration: 8,
  locationsLabel: "Tangier · Chefchaouen · Essaouira",
  highlights: [
    "Chefchaouen blue medina",
    "Essaouira harbour & ramparts",
    "Tangier Kasbah & Caves of Hercules",
    "Atlantic coast surfing",
  ],
  mainImage: "https://images.unsplash.com/photo-1553899017-7b15c5d3590b?w=800&q=80",
  price: {
    perPerson: 1410,
    total: 2820,
    currency: "USD",
    paidBefore: 740,
    paidAtDestination: 670,
  },
  startDate: "Nov 01, 2026",
  endDate: "Nov 08, 2026",
  adults: 2,
  destinationCodes: ["MARRAKECH"],
  attributes: [
    { iconKey: "users",          title: "Group size", value: "Max 14 travellers" },
    { iconKey: "activity",       title: "Activity",   value: "Easy" },
    { iconKey: "languages",      title: "Language",    value: "English & French" },
    { iconKey: "calendar-check", title: "Min age",     value: "All ages" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1553899017-7b15c5d3590b?w=800&q=80",
    "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80",
    "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80",
    "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrive in Tangier",
      location: "Tangier",
      items: [
        { type: "highlight", label: "Welcome to Tangier", description: "Arrive at Tangier Ibn Battouta Airport. Transfer to your hotel overlooking the Strait of Gibraltar." },
        { type: "hotel", label: "El Minzah Hotel *****" },
      ],
      image: "https://images.unsplash.com/photo-1553899017-7b15c5d3590b?w=800&q=80",
    },
    {
      dayNumber: 2,
      title: "Tangier Kasbah & Caves",
      location: "Tangier",
      items: [
        { type: "highlight", label: "Tangier Kasbah & Medina", description: "Explore the hilltop kasbah with views across to Spain, then wander the labyrinthine medina." },
        { type: "highlight", label: "Caves of Hercules", description: "Visit the legendary sea cave where Hercules supposedly rested — the opening frames the Atlantic like a map of Africa." },
        { type: "hotel", label: "El Minzah Hotel *****" },
      ],
      image: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80",
    },
    {
      dayNumber: 3,
      title: "Drive to Chefchaouen",
      location: "Tangier → Chefchaouen",
      items: [
        { type: "transport", label: "Coach to Chefchaouen", description: "3h through the Rif Mountains" },
        { type: "highlight", label: "Chefchaouen blue medina walk", description: "Wander the labyrinthine alleys of Morocco's famous blue city — every surface washed in vivid shades of blue." },
        { type: "hotel", label: "Lina Ryad & Spa ****" },
      ],
      image: "https://images.unsplash.com/photo-1553899017-7b15c5d3590b?w=800&q=80",
    },
    {
      dayNumber: 4,
      title: "Chefchaouen Exploration",
      location: "Chefchaouen",
      items: [
        { type: "highlight", label: "Ras el-Maa waterfall hike", description: "Short hike from the medina to the waterfall where locals gather to wash clothes and socialise." },
        { type: "highlight", label: "Spanish Mosque sunset", description: "Climb to the abandoned mosque on the hill for the best panoramic sunset view over the blue city." },
        { type: "hotel", label: "Lina Ryad & Spa ****" },
      ],
      image: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80",
    },
    {
      dayNumber: 5,
      title: "Fly to Essaouira",
      location: "Chefchaouen → Essaouira",
      items: [
        { type: "transport", label: "Coach to Fes + flight to Essaouira", description: "3h coach to Fes, then 1h 15m flight to Essaouira" },
        { type: "highlight", label: "Arrive at the Atlantic coast", description: "Check in to your riad within the walled medina. Evening walk along the harbour ramparts." },
        { type: "hotel", label: "Heure Bleue Palais *****" },
      ],
      image: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&q=80",
    },
    {
      dayNumber: 6,
      title: "Essaouira Harbour & Medina",
      location: "Essaouira",
      items: [
        { type: "highlight", label: "Fishing harbour & seafood lunch", description: "Watch fishermen bring in their catch, then choose your fish to be grilled on the spot at the harbour stalls." },
        { type: "highlight", label: "Essaouira medina & galleries", description: "Browse the art galleries, thuya woodworking shops, and the 18th-century fortress ramparts where Orson Welles filmed Othello." },
        { type: "hotel", label: "Heure Bleue Palais *****" },
      ],
      image: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&q=80",
    },
    {
      dayNumber: 7,
      title: "Beach & Surf Day",
      location: "Essaouira",
      items: [
        { type: "highlight", label: "Atlantic beach & surf lesson", description: "Essaouira is Morocco's wind-sport capital — try a beginner surf or windsurf lesson on the wide sandy beach." },
        { type: "highlight", label: "Sunset camel ride on the beach", description: "Ride a camel along the shoreline at golden hour — the Atlantic waves crashing beside you." },
        { type: "hotel", label: "Heure Bleue Palais *****" },
      ],
      image: "https://images.unsplash.com/photo-1553899017-7b15c5d3590b?w=800&q=80",
    },
    {
      dayNumber: 8,
      title: "Departure Day",
      location: "Essaouira",
      items: [
        { type: "highlight", label: "Farewell & transfer", description: "Final morning in the medina before transfer to Essaouira Mogador Airport or coach to Marrakech." },
      ],
    },
  ],
  included: [
    "7 nights accommodation (4–5 star riads & hotels)",
    "Daily breakfast + 2 group dinners",
    "Tangier Kasbah & Caves of Hercules guided tour",
    "Chefchaouen medina walking tour",
    "Essaouira medina & harbour tour",
    "Beginner surf lesson in Essaouira",
    "All coach transfers & domestic flight",
    "English- & French-speaking guide",
  ],
  excluded: [
    "International flights to/from Morocco",
    "Travel insurance",
    "Lunches (except included seafood lunch)",
    "Optional hammam experience",
    "Personal shopping & tips",
    "Moroccan visa (most EU/UK passport holders visa-free)",
    "Beach camel ride (optional extra)",
  ],
  stops: [
    {
      destinationName: "Tangier",
      dateRange: "Nov 01 – 03",
      nights: 2,
      description: "Morocco's gateway city — where the Mediterranean meets the Atlantic, and Africa faces Europe.",
      accommodation: {
        hotelName: "El Minzah Hotel",
        stars: 5,
        checkIn: "Nov 01", checkOut: "Nov 03",
        checkInISO: "2026-11-01", checkOutISO: "2026-11-03",
        roomType: "Sea View Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 35.7595, lng: -5.8340,
    },
    {
      destinationName: "Chefchaouen",
      dateRange: "Nov 03 – 05",
      nights: 2,
      description: "The blue pearl of Morocco — a photogenic mountain town where every surface is painted in vivid blue.",
      accommodation: {
        hotelName: "Lina Ryad & Spa",
        stars: 4,
        checkIn: "Nov 03", checkOut: "Nov 05",
        checkInISO: "2026-11-03", checkOutISO: "2026-11-05",
        roomType: "Superior Room", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 35.1688, lng: -5.2636,
    },
    {
      destinationName: "Essaouira",
      dateRange: "Nov 05 – 08",
      nights: 3,
      description: "Wind-swept Atlantic port town — Jimi Hendrix's retreat, with art galleries, fresh seafood, and world-class surfing.",
      accommodation: {
        hotelName: "Heure Bleue Palais",
        stars: 5,
        checkIn: "Nov 05", checkOut: "Nov 08",
        checkInISO: "2026-11-05", checkOutISO: "2026-11-08",
        roomType: "Deluxe Suite", boardType: "Buffet breakfast",
      },
      activities: [],
      lat: 31.5085, lng: -9.7595,
    },
  ],
  transfers: [
    { from: "Tangier", to: "Chefchaouen", date: "Nov 03, coach", mode: "Private coach", description: "3h through the Rif Mountains" },
    { from: "Chefchaouen", to: "Essaouira (via Fes)", date: "Nov 05, coach + flight", mode: "Coach + Flight", description: "3h coach to Fes + 1h 15m flight" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Master lookup — used by App.tsx to find a Tour by tourId
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_TOURS: Tour[] = [
  SWISS_WINTER_TOUR,
  THAILAND_EXPLORER_TOUR,
  THAILAND_ISLANDS_TOUR,
  THAILAND_BANGKOK_TOUR,
  THAILAND_NORTH_TOUR,
  THAILAND_PHUKET_TOUR,
  BALI_DISCOVERY_TOUR,
  BALI_BLISS_TOUR,
  JAVA_BALI_TOUR,
  LOMBOK_GILIS_TOUR,
  PERU_ADVENTURE_TOUR,
  PERU_INCA_TRAIL_TOUR,
  PERU_AMAZON_TOUR,
  JAPAN_HIGHLIGHTS_TOUR,
  JAPAN_KYOTO_TOUR,
  JAPAN_RAIL_TOUR,
  MOROCCO_IMPERIAL_TOUR,
  MOROCCO_SAHARA_TOUR,
  MOROCCO_COASTAL_TOUR,
  DUBAI_HIGHLIGHTS_TOUR,
  CANCUN_RIVIERA_TOUR,
  MALDIVES_ISLAND_TOUR,
  TENERIFE_TOUR,
];

// Maps a Discovery TourCardData.id to a Tour object.
// Every card now points to its own unique tour (except 13/14/15 which are v2 copies).
export const DISCOVERY_TOUR_MAP: Record<number, Tour> = {
  1:  THAILAND_EXPLORER_TOUR,   // Classic Thailand Explorer
  2:  BALI_DISCOVERY_TOUR,      // Cultural Bali Discovery
  3:  PERU_ADVENTURE_TOUR,      // Classic Peru Adventure
  4:  THAILAND_ISLANDS_TOUR,    // Island Paradise (Thailand)
  5:  PERU_INCA_TRAIL_TOUR,    // Inca Trail Adventure
  6:  PERU_AMAZON_TOUR,        // Amazon & Andes
  7:  THAILAND_BANGKOK_TOUR,   // Bangkok & Beyond
  8:  THAILAND_NORTH_TOUR,     // Northern Thailand Highlights
  9:  THAILAND_PHUKET_TOUR,    // Phuket & the Islands
  10: BALI_BLISS_TOUR,         // Bali Bliss
  11: JAVA_BALI_TOUR,          // Java & Bali Explorer
  12: LOMBOK_GILIS_TOUR,       // Lombok & the Gilis
  13: PERU_ADVENTURE_TOUR,     // Classic Peru Adventure (v2 — same as id 3)
  14: PERU_INCA_TRAIL_TOUR,    // Inca Trail Adventure (v2 — same as id 5)
  15: PERU_AMAZON_TOUR,        // Amazon & Andes (v2 — same as id 6)
  16: JAPAN_HIGHLIGHTS_TOUR,   // Japan Highlights
  17: JAPAN_KYOTO_TOUR,        // Kyoto & Beyond
  18: JAPAN_RAIL_TOUR,         // Japan Rail Adventure
  19: MOROCCO_IMPERIAL_TOUR,   // Imperial Cities of Morocco
  20: MOROCCO_SAHARA_TOUR,     // Sahara & Kasbahs
  21: MOROCCO_COASTAL_TOUR,    // Coastal Morocco
};
