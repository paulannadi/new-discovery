// ─────────────────────────────────────────────────────────────────────────────
// Activity Mock Data
//
// Each entry covers one of the supported ActivityType values so we can verify
// every variant of ActivityDetailPage end-to-end:
//   • cruise-ship    → Norwegian fjords ocean cruise (Ports + Cabins)
//   • river-cruise   → Rhine river cruise (Ports + Cabins)
//   • multi-day-tour → Tuscany road trip (Day-by-day itinerary)
//   • walking-tour   → Cinque Terre coastal hike (Route map + difficulty)
//   • bicycle-tour   → Loire Valley cycle tour (Route map + difficulty)
//   • safari         → Kenya safari (Day-by-day itinerary)
//   • expedition     → Antarctica expedition cruise (Day-by-day + ports)
//
// Mock data is keyboard-friendly fake content; image URLs come from Unsplash
// (free CDN previously used elsewhere in this prototype).
// ─────────────────────────────────────────────────────────────────────────────

import type { Activity } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// 1. CRUISE SHIP — Norwegian Fjords
// ─────────────────────────────────────────────────────────────────────────────
export const NORWEGIAN_FJORDS_CRUISE: Activity = {
  activityId: "norwegian-fjords-cruise",
  type: "cruise-ship",
  title: "Norwegian Fjords Ocean Cruise",
  subtitle:
    "Seven nights aboard a luxury liner sailing past glaciers, waterfalls, and pastel-painted coastal villages.",
  mainImage:
    "https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=1200&q=80",
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1200&q=80",
    "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
  ],
  location: "Bergen → Geiranger → Ålesund → Bergen",
  durationDays: 7,
  startDate: "Jun 12, 2026",
  endDate: "Jun 19, 2026",
  price: { perPerson: 1899, total: 3798, currency: "GBP" },
  rating: { score: 4.7, reviewCount: 1284 },

  highlights: [
    "Sail through UNESCO-listed Geirangerfjord",
    "Midnight sun cruising in the Arctic Circle",
    "Onboard Michelin-trained dining",
    "Whale-watching excursions in Ålesund",
  ],
  included: [
    "Seven nights full-board accommodation",
    "All shipboard meals and afternoon tea",
    "Captain's gala dinner",
    "Port taxes and tips",
    "24/7 medical centre on board",
  ],
  excluded: [
    "International flights to Bergen",
    "Shore excursions",
    "Premium drinks package",
    "Spa treatments",
    "Travel insurance",
  ],

  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 1,200 guests" },
    { iconKey: "activity", title: "Activity level", value: "Relaxed" },
    { iconKey: "languages", title: "Language", value: "English, German" },
    { iconKey: "calendar-check", title: "Min age", value: "0+" },
  ],

  cruise: {
    ship: "MS Nordstjernen",
    ports: [
      { name: "Bergen, Norway", day: 1, departs: "16:00",
        description: "Embark in the colourful Bryggen harbour after a final stroll through the fish market." },
      { name: "Eidfjord, Norway", day: 2, arrives: "08:00", departs: "16:00",
        description: "Day in the Hardangerfjord — optional excursion to Vøringsfossen waterfall." },
      { name: "Geiranger, Norway", day: 3, arrives: "07:00", departs: "20:00",
        description: "Ship anchors in the heart of the UNESCO-listed Geirangerfjord." },
      { name: "Ålesund, Norway", day: 4, arrives: "08:00", departs: "18:00",
        description: "Wander the art-nouveau old town and climb Mount Aksla for sweeping views." },
      { name: "Molde, Norway", day: 5, arrives: "08:00", departs: "17:00",
        description: "The 'City of Roses' — famed jazz festival and panoramic Atlantic Road excursions." },
      { name: "Stavanger, Norway", day: 6, arrives: "09:00", departs: "18:00",
        description: "Hike to Pulpit Rock or stroll the cobbled lanes of Gamle Stavanger." },
      { name: "Bergen, Norway", day: 7, arrives: "08:00",
        description: "Disembark after breakfast." },
    ],
    cabinTypes: [
      { name: "Inside Stateroom", pricePerPerson: 1899, capacity: 2,
        description: "Cosy 14m² cabin with twin beds and a private bathroom — perfect for solo or budget travellers.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80" },
      { name: "Sea-View Stateroom", pricePerPerson: 2299, capacity: 2,
        description: "16m² cabin with picture window, queen bed, and lounge area facing the open sea.",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80" },
      { name: "Balcony Stateroom", pricePerPerson: 2799, capacity: 3,
        description: "Private balcony, sitting area, and floor-to-ceiling glass doors. Great for fjord viewing in slippers.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80" },
      { name: "Owner's Suite", pricePerPerson: 4499, capacity: 4,
        description: "Two-room suite, butler service, complimentary speciality dining and premium drinks.",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80" },
    ],
  },

  routeStops: [
    { destinationName: "Bergen",    nights: 0, dateRange: "Jun 12",
      description: "Embarkation port", lat: 60.39, lng: 5.32,
      accommodation: { hotelName: "MS Nordstjernen", stars: 5, checkIn: "Jun 12", checkOut: "Jun 19", checkInISO: "2026-06-12", checkOutISO: "2026-06-19", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
    { destinationName: "Geiranger", nights: 1, dateRange: "Jun 14",
      description: "UNESCO fjord", lat: 62.10, lng: 7.21,
      accommodation: { hotelName: "MS Nordstjernen", stars: 5, checkIn: "—", checkOut: "—", checkInISO: "2026-06-14", checkOutISO: "2026-06-15", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
    { destinationName: "Ålesund",   nights: 1, dateRange: "Jun 15",
      description: "Art-nouveau port town", lat: 62.47, lng: 6.15,
      accommodation: { hotelName: "MS Nordstjernen", stars: 5, checkIn: "—", checkOut: "—", checkInISO: "2026-06-15", checkOutISO: "2026-06-16", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
    { destinationName: "Stavanger", nights: 1, dateRange: "Jun 17",
      description: "Pulpit Rock gateway", lat: 58.97, lng: 5.73,
      accommodation: { hotelName: "MS Nordstjernen", stars: 5, checkIn: "—", checkOut: "—", checkInISO: "2026-06-17", checkOutISO: "2026-06-18", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. RIVER CRUISE — Rhine River
// ─────────────────────────────────────────────────────────────────────────────
export const RHINE_RIVER_CRUISE: Activity = {
  activityId: "rhine-river-cruise",
  type: "river-cruise",
  title: "Rhine River Cruise — Amsterdam to Basel",
  subtitle:
    "Castles, vineyards, and storybook villages on a relaxed eight-day cruise through the heart of Europe.",
  mainImage: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80",
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80",
  ],
  location: "Amsterdam → Cologne → Strasbourg → Basel",
  durationDays: 8,
  startDate: "Sep 04, 2026",
  endDate: "Sep 11, 2026",
  price: { perPerson: 2299, total: 4598, currency: "GBP" },
  rating: { score: 4.8, reviewCount: 612 },

  highlights: [
    "Sail past 40+ castles in the Middle Rhine UNESCO valley",
    "Guided walking tour of Cologne's old town",
    "Wine tasting in the Alsace vineyards",
    "All-inclusive drinks throughout the cruise",
  ],
  included: [
    "Seven nights luxury river cruise accommodation",
    "All meals onboard with regional wine pairings",
    "Daily guided shore excursions",
    "Onboard entertainment and lectures",
    "Port charges and gratuities",
  ],
  excluded: [
    "Flights to Amsterdam / from Basel",
    "Premium spa services",
    "Optional excursions (e.g. Heidelberg Castle add-on)",
    "Personal travel insurance",
  ],

  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 156 guests" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "12+" },
  ],

  cruise: {
    ship: "Viking Embla",
    ports: [
      { name: "Amsterdam, Netherlands", day: 1, departs: "17:00",
        description: "Board in the morning, optional canal-boat tour before sail-away." },
      { name: "Kinderdijk, Netherlands", day: 2, arrives: "09:00", departs: "13:00",
        description: "UNESCO-listed windmills — guided photo walk along the dykes." },
      { name: "Cologne, Germany", day: 3, arrives: "08:00", departs: "22:00",
        description: "Half-day walking tour past the cathedral; afternoon at leisure." },
      { name: "Koblenz, Germany", day: 4, arrives: "08:00", departs: "13:00",
        description: "Cable car up to Ehrenbreitstein Fortress and the Deutsches Eck." },
      { name: "Rüdesheim, Germany", day: 5, arrives: "13:00", departs: "23:00",
        description: "Wine-themed evening, with optional Drosselgasse music hall visit." },
      { name: "Strasbourg, France", day: 6, arrives: "13:00", departs: "23:00",
        description: "Half-timbered Petite France quarter and Notre-Dame Cathedral." },
      { name: "Breisach, Germany", day: 7, arrives: "08:00", departs: "23:00",
        description: "Optional Black Forest or Colmar excursion." },
      { name: "Basel, Switzerland", day: 8, arrives: "08:00",
        description: "Disembark after breakfast." },
    ],
    cabinTypes: [
      { name: "Standard Stateroom", pricePerPerson: 2299, capacity: 2,
        description: "Lower deck, fixed window, twin or queen beds.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80" },
      { name: "French Balcony", pricePerPerson: 2799, capacity: 2,
        description: "Floor-to-ceiling sliding doors with railing — bring the river inside.",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80" },
      { name: "Veranda Suite", pricePerPerson: 3499, capacity: 3,
        description: "Step-out balcony, separate sitting area, premium amenities.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80" },
    ],
  },

  routeStops: [
    { destinationName: "Amsterdam",  nights: 1, dateRange: "Sep 04",
      description: "Embarkation", lat: 52.37, lng: 4.90,
      accommodation: { hotelName: "Viking Embla", stars: 5, checkIn: "Sep 04", checkOut: "—", checkInISO: "2026-09-04", checkOutISO: "2026-09-05", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
    { destinationName: "Cologne",    nights: 1, dateRange: "Sep 06",
      description: "Cathedral city", lat: 50.94, lng: 6.96,
      accommodation: { hotelName: "Viking Embla", stars: 5, checkIn: "—", checkOut: "—", checkInISO: "2026-09-06", checkOutISO: "2026-09-07", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
    { destinationName: "Rüdesheim",  nights: 1, dateRange: "Sep 08",
      description: "Wine village", lat: 49.98, lng: 7.92,
      accommodation: { hotelName: "Viking Embla", stars: 5, checkIn: "—", checkOut: "—", checkInISO: "2026-09-08", checkOutISO: "2026-09-09", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
    { destinationName: "Strasbourg", nights: 1, dateRange: "Sep 09",
      description: "Petite France", lat: 48.58, lng: 7.75,
      accommodation: { hotelName: "Viking Embla", stars: 5, checkIn: "—", checkOut: "—", checkInISO: "2026-09-09", checkOutISO: "2026-09-10", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
    { destinationName: "Basel",      nights: 0, dateRange: "Sep 11",
      description: "Disembark", lat: 47.56, lng: 7.59,
      accommodation: { hotelName: "Viking Embla", stars: 5, checkIn: "—", checkOut: "Sep 11", checkInISO: "2026-09-10", checkOutISO: "2026-09-11", roomType: "Stateroom", boardType: "Full board" },
      activities: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MULTI-DAY TOUR — Tuscany Road Trip
// ─────────────────────────────────────────────────────────────────────────────
export const TUSCANY_TOUR: Activity = {
  activityId: "tuscany-road-trip",
  type: "multi-day-tour",
  title: "Tuscany Road Trip — Florence, Siena & the Val d'Orcia",
  subtitle:
    "Six days exploring Renaissance cities, hilltop villages, and family-run vineyards in the heart of Italy.",
  mainImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200&q=80",
    "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1200&q=80",
    "https://images.unsplash.com/photo-1503152394-c571994fd383?w=1200&q=80",
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80",
  ],
  location: "Florence · Siena · Val d'Orcia",
  durationDays: 6,
  startDate: "May 18, 2026",
  endDate: "May 23, 2026",
  price: { perPerson: 1499, total: 2998, currency: "GBP" },
  rating: { score: 4.9, reviewCount: 487 },

  highlights: [
    "Skip-the-line Uffizi Gallery entry",
    "Private cooking class in a Chianti farmhouse",
    "Hot-air balloon ride over Val d'Orcia (weather permitting)",
    "Sunset wine tasting in Montepulciano",
  ],
  included: [
    "Five nights boutique accommodation",
    "Daily breakfast and three farmhouse dinners",
    "Private guide for two days",
    "Wine tasting at three estates",
    "Airport transfers",
  ],
  excluded: [
    "International flights",
    "Lunches",
    "Optional excursions",
    "Personal travel insurance",
  ],

  attributes: [
    { iconKey: "users", title: "Group size", value: "Private tour" },
    { iconKey: "activity", title: "Activity level", value: "Moderate walking" },
    { iconKey: "languages", title: "Language", value: "English, Italian" },
    { iconKey: "calendar-check", title: "Min age", value: "10+" },
  ],

  itineraryDays: [
    { dayNumber: 1, title: "Arrival in Florence", location: "Florence",
      items: [
        { type: "highlight", label: "Welcome stroll over Ponte Vecchio",
          description: "Settle in to your hotel near Piazza Santa Croce, then a guided sunset walk along the Arno." },
        { type: "hotel", label: "Hotel Brunelleschi **** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=900&q=80" },
    { dayNumber: 2, title: "Renaissance Florence", location: "Florence",
      items: [
        { type: "highlight", label: "Skip-the-line Uffizi & Accademia",
          description: "Private guide takes you through Michelangelo's David and the Botticelli Hall." },
        { type: "hotel", label: "Hotel Brunelleschi **** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=900&q=80" },
    { dayNumber: 3, title: "Chianti country", location: "Florence → Siena",
      items: [
        { type: "transport", label: "Drive south through Chianti",
          description: "Pick up your hire car and meander through Greve, Panzano, and Castellina." },
        { type: "highlight", label: "Cooking class at a working farmhouse" },
        { type: "hotel", label: "Grand Hotel Continental ***** or similar (Siena)" },
      ],
      image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=80" },
    { dayNumber: 4, title: "Siena & San Gimignano", location: "Siena",
      items: [
        { type: "highlight", label: "Piazza del Campo & Duomo",
          description: "Climb the Torre del Mangia for a 360° view of Siena's terracotta rooftops." },
        { type: "highlight", label: "Afternoon in San Gimignano",
          description: "Towers, gelato, and Vernaccia wine in the 'medieval Manhattan'." },
        { type: "hotel", label: "Grand Hotel Continental ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1503152394-c571994fd383?w=900&q=80" },
    { dayNumber: 5, title: "Val d'Orcia hill towns", location: "Pienza · Montepulciano",
      items: [
        { type: "transport", label: "Scenic drive through cypress-lined roads" },
        { type: "highlight", label: "Pecorino tasting in Pienza" },
        { type: "highlight", label: "Wine tasting at a Vino Nobile cantina" },
        { type: "hotel", label: "Castello di Velona ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=900&q=80" },
    { dayNumber: 6, title: "Departure", location: "Florence",
      items: [
        { type: "transport", label: "Return drive to Florence",
          description: "Drop the hire car at Florence airport — your guide will assist with check-in." },
      ],
      image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=900&q=80" },
  ],

  routeStops: [
    { destinationName: "Florence",      nights: 2, dateRange: "May 18 – May 19",
      description: "Renaissance capital", lat: 43.77, lng: 11.25,
      accommodation: { hotelName: "Hotel Brunelleschi", stars: 4, checkIn: "May 18", checkOut: "May 20", checkInISO: "2026-05-18", checkOutISO: "2026-05-20", roomType: "Deluxe Double", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Siena",         nights: 2, dateRange: "May 20 – May 21",
      description: "Medieval hill town", lat: 43.32, lng: 11.33,
      accommodation: { hotelName: "Grand Hotel Continental", stars: 5, checkIn: "May 20", checkOut: "May 22", checkInISO: "2026-05-20", checkOutISO: "2026-05-22", roomType: "Junior Suite", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Montalcino",    nights: 1, dateRange: "May 22",
      description: "Brunello vineyards", lat: 43.06, lng: 11.49,
      accommodation: { hotelName: "Castello di Velona", stars: 5, checkIn: "May 22", checkOut: "May 23", checkInISO: "2026-05-22", checkOutISO: "2026-05-23", roomType: "Spa Suite", boardType: "Half Board" },
      activities: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. WALKING TOUR — Cinque Terre Coastal Hike
// ─────────────────────────────────────────────────────────────────────────────
export const CINQUE_TERRE_WALK: Activity = {
  activityId: "cinque-terre-walk",
  type: "walking-tour",
  title: "Cinque Terre Coastal Walking Tour",
  subtitle:
    "Walk between five jewel-like fishing villages along the Ligurian coast, with hilltop terraces, olive groves, and turquoise sea views every step of the way.",
  mainImage: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1200&q=80",
    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=80",
    "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=1200&q=80",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80",
  ],
  location: "Monterosso → Vernazza → Corniglia → Manarola → Riomaggiore",
  durationDays: 5,
  startDate: "Apr 22, 2026",
  endDate: "Apr 26, 2026",
  price: { perPerson: 899, total: 1798, currency: "GBP" },
  rating: { score: 4.6, reviewCount: 312 },
  difficulty: "Moderate",
  distanceKm: 38,

  highlights: [
    "Self-guided coastal hiking with luggage transfers",
    "Pesto-making workshop in Monterosso",
    "Boat trip to Portovenere on the final day",
    "All five villages of the UNESCO national park",
  ],
  included: [
    "Four nights village accommodation",
    "Daily breakfast and a welcome dinner",
    "Detailed walking notes and trail map",
    "Daily luggage transfers between villages",
    "Cinque Terre national park pass",
  ],
  excluded: [
    "Flights",
    "Lunches and most dinners",
    "Train tickets between villages (≈ €5/day if you want to skip a stage)",
    "Personal travel insurance",
  ],

  attributes: [
    { iconKey: "users", title: "Group size", value: "Self-guided" },
    { iconKey: "activity", title: "Activity level", value: "Moderate" },
    { iconKey: "languages", title: "Language", value: "English notes" },
    { iconKey: "calendar-check", title: "Min age", value: "14+" },
  ],

  routeStops: [
    { destinationName: "Monterosso al Mare", nights: 1, dateRange: "Apr 22",
      description: "Sandy beaches and the largest of the five villages", lat: 44.146, lng: 9.654,
      accommodation: { hotelName: "Hotel Porto Roca", stars: 4, checkIn: "Apr 22", checkOut: "Apr 23", checkInISO: "2026-04-22", checkOutISO: "2026-04-23", roomType: "Sea-View Double", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Vernazza",            nights: 1, dateRange: "Apr 23",
      description: "Most photographed harbour in Italy", lat: 44.136, lng: 9.684,
      accommodation: { hotelName: "Albergo Barbara", stars: 3, checkIn: "Apr 23", checkOut: "Apr 24", checkInISO: "2026-04-23", checkOutISO: "2026-04-24", roomType: "Harbour Double", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Corniglia",           nights: 1, dateRange: "Apr 24",
      description: "Cliff-top village with terraced vineyards", lat: 44.119, lng: 9.708,
      accommodation: { hotelName: "Cà dei Duxi", stars: 3, checkIn: "Apr 24", checkOut: "Apr 25", checkInISO: "2026-04-24", checkOutISO: "2026-04-25", roomType: "Standard Double", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Manarola",            nights: 1, dateRange: "Apr 25",
      description: "Iconic pastel houses on the cliffs", lat: 44.107, lng: 9.728,
      accommodation: { hotelName: "La Torretta", stars: 4, checkIn: "Apr 25", checkOut: "Apr 26", checkInISO: "2026-04-25", checkOutISO: "2026-04-26", roomType: "Boutique Suite", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Riomaggiore",         nights: 0, dateRange: "Apr 26",
      description: "Final village — boat trip to Portovenere", lat: 44.099, lng: 9.738,
      accommodation: { hotelName: "—", stars: 0, checkIn: "—", checkOut: "Apr 26", checkInISO: "2026-04-26", checkOutISO: "2026-04-26", roomType: "—", boardType: "—" },
      activities: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. BICYCLE TOUR — Loire Valley
// ─────────────────────────────────────────────────────────────────────────────
export const LOIRE_BICYCLE_TOUR: Activity = {
  activityId: "loire-bicycle-tour",
  type: "bicycle-tour",
  title: "Loire Valley Châteaux Bike Tour",
  subtitle:
    "Pedal between fairytale châteaux on the world-famous Loire à Vélo cycle route — traffic-free paths, riverside picnics, and four-course dinners every night.",
  mainImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80",
    "https://images.unsplash.com/photo-1551893665-f843f600794e?w=1200&q=80",
    "https://images.unsplash.com/photo-1485870698773-15580fe18b6d?w=1200&q=80",
    "https://images.unsplash.com/photo-1471331580036-fd17a8c0ce85?w=1200&q=80",
  ],
  location: "Tours → Amboise → Chenonceau → Blois",
  durationDays: 7,
  startDate: "Jun 02, 2026",
  endDate: "Jun 08, 2026",
  price: { perPerson: 1349, total: 2698, currency: "GBP" },
  rating: { score: 4.8, reviewCount: 246 },
  difficulty: "Easy",
  distanceKm: 220,

  highlights: [
    "Mostly flat, traffic-free Loire à Vélo route",
    "Skip-the-line entry to Chambord, Chenonceau, and Amboise",
    "Riverside picnic lunches",
    "Wine tasting in the Vouvray cellars",
  ],
  included: [
    "Six nights boutique hotel accommodation",
    "Daily breakfast and four three-course dinners",
    "Hybrid bike with panniers (E-bike upgrade available)",
    "Helmet, route notes, and GPS device",
    "Daily luggage transfers between hotels",
    "Château entry tickets",
  ],
  excluded: [
    "Flights to/from Paris",
    "TGV from Paris to Tours",
    "Lunches and two dinners",
    "E-bike upgrade (+£120 per person)",
  ],

  attributes: [
    { iconKey: "users", title: "Group size", value: "Self-guided" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English / French notes" },
    { iconKey: "calendar-check", title: "Min age", value: "12+" },
  ],

  routeStops: [
    { destinationName: "Tours",       nights: 1, dateRange: "Jun 02",
      description: "Start of the route", lat: 47.39, lng: 0.69,
      accommodation: { hotelName: "Hôtel de l'Univers", stars: 4, checkIn: "Jun 02", checkOut: "Jun 03", checkInISO: "2026-06-02", checkOutISO: "2026-06-03", roomType: "Classic Double", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Villandry",   nights: 1, dateRange: "Jun 03",
      description: "Renaissance gardens", lat: 47.34, lng: 0.51,
      accommodation: { hotelName: "Le Cheval Rouge", stars: 3, checkIn: "Jun 03", checkOut: "Jun 04", checkInISO: "2026-06-03", checkOutISO: "2026-06-04", roomType: "Garden Double", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Amboise",     nights: 2, dateRange: "Jun 04 – Jun 05",
      description: "Da Vinci's final home", lat: 47.41, lng: 0.98,
      accommodation: { hotelName: "Le Choiseul", stars: 4, checkIn: "Jun 04", checkOut: "Jun 06", checkInISO: "2026-06-04", checkOutISO: "2026-06-06", roomType: "Riverside Double", boardType: "Half Board" },
      activities: [] },
    { destinationName: "Chenonceaux", nights: 1, dateRange: "Jun 06",
      description: "Château over the Cher", lat: 47.33, lng: 1.07,
      accommodation: { hotelName: "Auberge du Bon Laboureur", stars: 4, checkIn: "Jun 06", checkOut: "Jun 07", checkInISO: "2026-06-06", checkOutISO: "2026-06-07", roomType: "Classic Double", boardType: "Half Board" },
      activities: [] },
    { destinationName: "Blois",       nights: 1, dateRange: "Jun 07",
      description: "Royal château finish", lat: 47.59, lng: 1.33,
      accommodation: { hotelName: "Mercure Blois Centre", stars: 4, checkIn: "Jun 07", checkOut: "Jun 08", checkInISO: "2026-06-07", checkOutISO: "2026-06-08", roomType: "Standard Double", boardType: "Breakfast" },
      activities: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SAFARI — Kenya
// ─────────────────────────────────────────────────────────────────────────────
export const KENYA_SAFARI: Activity = {
  activityId: "kenya-safari",
  type: "safari",
  title: "Kenya Big Five Safari",
  subtitle:
    "Eight days of game drives across the Maasai Mara, Lake Nakuru, and Amboseli — with luxury tented camps and a Maasai cultural visit.",
  mainImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80",
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80",
    "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&q=80",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80",
  ],
  location: "Maasai Mara · Lake Nakuru · Amboseli",
  durationDays: 8,
  startDate: "Aug 04, 2026",
  endDate: "Aug 11, 2026",
  price: { perPerson: 3299, total: 6598, currency: "GBP" },
  rating: { score: 4.9, reviewCount: 198 },

  highlights: [
    "Daily game drives with expert local guides",
    "Hot-air balloon ride over the Maasai Mara at sunrise",
    "Maasai village cultural visit",
    "Spotting all 'Big Five' across three reserves",
  ],
  included: [
    "Seven nights luxury tented accommodation",
    "All meals and drinks (incl. premium spirits)",
    "All game drives in 4×4 vehicles",
    "Park fees and conservancy charges",
    "Internal flights between parks",
  ],
  excluded: [
    "International flights to Nairobi",
    "Kenyan e-visa",
    "Hot-air balloon supplement (£450 per person)",
    "Tips for guides and camp staff",
  ],

  attributes: [
    { iconKey: "users", title: "Group size", value: "Max 6 guests" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "8+" },
  ],

  itineraryDays: [
    { dayNumber: 1, title: "Arrival in Nairobi", location: "Nairobi",
      items: [
        { type: "highlight", label: "Welcome dinner at Tamarind Tree" },
        { type: "hotel", label: "Hemingways Nairobi ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900&q=80" },
    { dayNumber: 2, title: "Fly to Maasai Mara", location: "Maasai Mara",
      items: [
        { type: "transport", label: "Bush flight to the Mara" },
        { type: "highlight", label: "Afternoon game drive" },
        { type: "hotel", label: "Mara Plains Camp ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900&q=80" },
    { dayNumber: 3, title: "Mara game drives", location: "Maasai Mara",
      items: [
        { type: "highlight", label: "Sunrise hot-air balloon (optional)" },
        { type: "highlight", label: "Full-day game drive with bush lunch" },
        { type: "hotel", label: "Mara Plains Camp ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=900&q=80" },
    { dayNumber: 4, title: "Maasai village & migration crossing", location: "Maasai Mara",
      items: [
        { type: "highlight", label: "Visit a working Maasai village" },
        { type: "highlight", label: "Afternoon at the Mara River" },
        { type: "hotel", label: "Mara Plains Camp ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900&q=80" },
    { dayNumber: 5, title: "Fly to Lake Nakuru", location: "Lake Nakuru",
      items: [
        { type: "transport", label: "Light aircraft transfer" },
        { type: "highlight", label: "Flamingo viewing & rhino tracking" },
        { type: "hotel", label: "Mbweha Camp **** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=900&q=80" },
    { dayNumber: 6, title: "Drive to Amboseli", location: "Amboseli",
      items: [
        { type: "transport", label: "Scenic drive south" },
        { type: "highlight", label: "Sunset game drive with Kilimanjaro views" },
        { type: "hotel", label: "Tortilis Camp ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=900&q=80" },
    { dayNumber: 7, title: "Amboseli elephants", location: "Amboseli",
      items: [
        { type: "highlight", label: "Morning and afternoon game drives" },
        { type: "highlight", label: "Sundowners on Observation Hill" },
        { type: "hotel", label: "Tortilis Camp ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900&q=80" },
    { dayNumber: 8, title: "Return to Nairobi", location: "Nairobi",
      items: [
        { type: "transport", label: "Bush flight back to Nairobi" },
        { type: "highlight", label: "Onward connections" },
      ],
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900&q=80" },
  ],

  routeStops: [
    { destinationName: "Nairobi",      nights: 1, dateRange: "Aug 04",
      description: "Arrival hub", lat: -1.286, lng: 36.817,
      accommodation: { hotelName: "Hemingways", stars: 5, checkIn: "Aug 04", checkOut: "Aug 05", checkInISO: "2026-08-04", checkOutISO: "2026-08-05", roomType: "Junior Suite", boardType: "Breakfast" },
      activities: [] },
    { destinationName: "Maasai Mara",  nights: 3, dateRange: "Aug 05 – Aug 07",
      description: "Wildlife reserve", lat: -1.402, lng: 35.143,
      accommodation: { hotelName: "Mara Plains Camp", stars: 5, checkIn: "Aug 05", checkOut: "Aug 08", checkInISO: "2026-08-05", checkOutISO: "2026-08-08", roomType: "Tented Suite", boardType: "All Inclusive" },
      activities: [] },
    { destinationName: "Lake Nakuru",  nights: 1, dateRange: "Aug 08",
      description: "Flamingo lake", lat: -0.367, lng: 36.083,
      accommodation: { hotelName: "Mbweha Camp", stars: 4, checkIn: "Aug 08", checkOut: "Aug 09", checkInISO: "2026-08-08", checkOutISO: "2026-08-09", roomType: "Bush Cottage", boardType: "Full Board" },
      activities: [] },
    { destinationName: "Amboseli",     nights: 2, dateRange: "Aug 09 – Aug 10",
      description: "Kilimanjaro views", lat: -2.652, lng: 37.260,
      accommodation: { hotelName: "Tortilis Camp", stars: 5, checkIn: "Aug 09", checkOut: "Aug 11", checkInISO: "2026-08-09", checkOutISO: "2026-08-11", roomType: "Tented Suite", boardType: "All Inclusive" },
      activities: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXPEDITION — Antarctica
// ─────────────────────────────────────────────────────────────────────────────
export const ANTARCTICA_EXPEDITION: Activity = {
  activityId: "antarctica-expedition",
  type: "expedition",
  title: "Antarctica Classic Expedition",
  subtitle:
    "Eleven days of Zodiac landings, penguin rookeries, and ice-cap kayaking aboard a small expedition ship.",
  mainImage: "https://images.unsplash.com/photo-1551845041-63e8e76836ea?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1551845041-63e8e76836ea?w=1200&q=80",
    "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1200&q=80",
  ],
  location: "Ushuaia → Antarctic Peninsula → Ushuaia",
  durationDays: 11,
  startDate: "Dec 03, 2026",
  endDate: "Dec 13, 2026",
  price: { perPerson: 7499, total: 14998, currency: "GBP" },
  rating: { score: 4.9, reviewCount: 142 },

  highlights: [
    "Up to two Zodiac landings per day",
    "Optional kayaking and camping on the ice",
    "Onboard naturalist and photography lectures",
    "Polar plunge for the brave",
  ],
  included: [
    "Ten nights cabin accommodation onboard",
    "All meals, snacks, and house wines/beers",
    "All expedition landings and Zodiac excursions",
    "Insulated parka to keep",
    "Pre-cruise hotel night in Ushuaia",
  ],
  excluded: [
    "International flights to Ushuaia",
    "Kayaking package (£800 per person)",
    "Camping on the ice (£250 per person)",
    "Mandatory medical / evacuation insurance",
  ],

  attributes: [
    { iconKey: "users", title: "Group size", value: "Max 100 guests" },
    { iconKey: "activity", title: "Activity level", value: "Active" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "8+" },
  ],

  itineraryDays: [
    { dayNumber: 1, title: "Arrival in Ushuaia", location: "Ushuaia",
      items: [
        { type: "highlight", label: "Pre-cruise hotel night & welcome briefing" },
        { type: "hotel", label: "Las Hayas Resort or similar" },
      ],
      image: "https://images.unsplash.com/photo-1551845041-63e8e76836ea?w=900&q=80" },
    { dayNumber: 2, title: "Embarkation", location: "Ushuaia",
      items: [
        { type: "transport", label: "Board the expedition ship in the late afternoon" },
        { type: "highlight", label: "Sail down the Beagle Channel" },
      ],
      image: "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=900&q=80" },
    { dayNumber: 3, title: "Drake Passage crossing", location: "Drake Passage",
      items: [
        { type: "highlight", label: "Lectures on Antarctic wildlife and history" },
      ],
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80" },
    { dayNumber: 4, title: "First landing", location: "South Shetland Islands",
      items: [
        { type: "highlight", label: "Zodiac landing among Gentoo penguins" },
        { type: "highlight", label: "Optional kayak excursion" },
      ],
      image: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=900&q=80" },
    { dayNumber: 5, title: "Antarctic Peninsula", location: "Antarctic Peninsula",
      items: [
        { type: "highlight", label: "Two Zodiac landings — weather dependent" },
        { type: "highlight", label: "Whale-spotting from the bridge" },
      ],
      image: "https://images.unsplash.com/photo-1551845041-63e8e76836ea?w=900&q=80" },
    { dayNumber: 6, title: "Lemaire Channel", location: "Lemaire Channel",
      items: [
        { type: "transport", label: "Sail through the 'Kodak Gap' — sheer ice cliffs on both sides" },
        { type: "highlight", label: "Polar plunge for those brave enough" },
      ],
      image: "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=900&q=80" },
    { dayNumber: 7, title: "Paradise Bay", location: "Paradise Bay",
      items: [
        { type: "highlight", label: "Continental landing" },
        { type: "highlight", label: "Optional ice camping" },
      ],
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80" },
    { dayNumber: 8, title: "Deception Island", location: "Deception Island",
      items: [
        { type: "highlight", label: "Sail into the volcanic caldera" },
        { type: "highlight", label: "Visit a former whaling station" },
      ],
      image: "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=900&q=80" },
    { dayNumber: 9, title: "Drake Passage return", location: "Drake Passage",
      items: [
        { type: "highlight", label: "Naturalist lectures and photo workshops" },
      ],
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80" },
    { dayNumber: 10, title: "At sea", location: "Drake Passage",
      items: [
        { type: "highlight", label: "Captain's farewell dinner" },
      ],
      image: "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=900&q=80" },
    { dayNumber: 11, title: "Disembark in Ushuaia", location: "Ushuaia",
      items: [
        { type: "transport", label: "Disembark after breakfast for onward flights" },
      ],
      image: "https://images.unsplash.com/photo-1551845041-63e8e76836ea?w=900&q=80" },
  ],

  routeStops: [
    { destinationName: "Ushuaia",          nights: 2, dateRange: "Dec 03 – Dec 04",
      description: "Embarkation port",  lat: -54.81, lng: -68.30,
      accommodation: { hotelName: "Las Hayas Resort", stars: 4, checkIn: "Dec 03", checkOut: "Dec 13", checkInISO: "2026-12-03", checkOutISO: "2026-12-13", roomType: "Standard Cabin", boardType: "Full Board" },
      activities: [] },
    { destinationName: "South Shetlands",  nights: 1, dateRange: "Dec 06",
      description: "First landings",    lat: -62.00, lng: -58.00,
      accommodation: { hotelName: "Onboard", stars: 0, checkIn: "—", checkOut: "—", checkInISO: "2026-12-06", checkOutISO: "2026-12-07", roomType: "Cabin", boardType: "Full Board" },
      activities: [] },
    { destinationName: "Antarctic Peninsula", nights: 4, dateRange: "Dec 07 – Dec 10",
      description: "Continent landings", lat: -64.50, lng: -62.50,
      accommodation: { hotelName: "Onboard", stars: 0, checkIn: "—", checkOut: "—", checkInISO: "2026-12-07", checkOutISO: "2026-12-11", roomType: "Cabin", boardType: "Full Board" },
      activities: [] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Combined dataset — everything ActivityListPage shows by default.
// Add/remove from this list to change what shows up in search results.
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_ACTIVITIES: Activity[] = [
  NORWEGIAN_FJORDS_CRUISE,
  RHINE_RIVER_CRUISE,
  TUSCANY_TOUR,
  CINQUE_TERRE_WALK,
  LOIRE_BICYCLE_TOUR,
  KENYA_SAFARI,
  ANTARCTICA_EXPEDITION,
];

// Quick lookup — ActivityListPage / DiscoveryPage can resolve clicks by id.
export const ACTIVITY_BY_ID: Record<string, Activity> = ALL_ACTIVITIES.reduce(
  (acc, a) => {
    acc[a.activityId] = a;
    return acc;
  },
  {} as Record<string, Activity>
);
