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

// ═══════════════════════════════════════════════════════════════════════════
// ONE-DAY EXPERIENCES — short single-day activities featured on Discovery.
// Each has durationDays: 1 and a minimal but valid type-specific block so
// ActivityDetailPage renders correctly (Route for walks, Ports/Cabins for
// cruises, Itinerary for tours/expeditions).
// ═══════════════════════════════════════════════════════════════════════════

// 8. ROME BY NIGHT — walking tour (1 day)
export const ROME_NIGHT_WALK: Activity = {
  activityId: "rome-night-walk",
  type: "walking-tour",
  title: "Rome by Night Walking Tour",
  subtitle:
    "A three-hour evening stroll past the Colosseum, Trevi Fountain, and Pantheon — every monument glowing against the dark.",
  mainImage: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200&q=80",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=80",
  ],
  location: "Rome, Italy",
  durationDays: 1,
  startDate: "Any evening",
  endDate: "Any evening",
  price: { perPerson: 35, total: 70, currency: "EUR" },
  rating: { score: 4.8, reviewCount: 2147 },
  difficulty: "Easy",
  distanceKm: 4,
  highlights: [
    "Colosseum lit up after dark",
    "Skip-the-crowd Trevi Fountain photo stop",
    "Local guide with hidden-piazza stories",
  ],
  included: [
    "Three-hour licensed local guide",
    "Headsets for clear narration",
    "Aperitivo stop with a glass of Prosecco",
  ],
  excluded: ["Hotel transfers", "Dinner", "Gratuities"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 15 guests" },
    { iconKey: "activity", title: "Activity level", value: "Easy walking" },
    { iconKey: "languages", title: "Language", value: "English, Italian" },
    { iconKey: "calendar-check", title: "Min age", value: "8+" },
  ],
  routeStops: [
    { destinationName: "Piazza del Colosseo", nights: 0, dateRange: "Evening",
      description: "Meet at the Colosseum metro exit for sunset views.", lat: 41.890, lng: 12.492,
      accommodation: { hotelName: "Walking tour — no overnight", stars: 0, checkIn: "—", checkOut: "—", checkInISO: "", checkOutISO: "", roomType: "—", boardType: "—" },
      activities: [] },
    { destinationName: "Trevi Fountain", nights: 0, dateRange: "Evening",
      description: "Toss a coin and hear the legend behind it.", lat: 41.901, lng: 12.483,
      accommodation: { hotelName: "Walking tour — no overnight", stars: 0, checkIn: "—", checkOut: "—", checkInISO: "", checkOutISO: "", roomType: "—", boardType: "—" },
      activities: [] },
    { destinationName: "Pantheon", nights: 0, dateRange: "Evening",
      description: "End at the floodlit portico with an aperitivo.", lat: 41.899, lng: 12.477,
      accommodation: { hotelName: "Walking tour — no overnight", stars: 0, checkIn: "—", checkOut: "—", checkInISO: "", checkOutISO: "", roomType: "—", boardType: "—" },
      activities: [] },
  ],
};

// 9. KYOTO STREET FOOD CRAWL — walking tour (1 day)
export const KYOTO_FOOD_CRAWL: Activity = {
  activityId: "kyoto-food-crawl",
  type: "walking-tour",
  title: "Kyoto Street Food Crawl",
  subtitle:
    "Six tastings through Nishiki Market and the Gion district with a local foodie guide.",
  mainImage: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1200&q=80",
    "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&q=80",
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=1200&q=80",
  ],
  location: "Kyoto, Japan",
  durationDays: 1,
  startDate: "Daily, 11:00",
  endDate: "Daily, 15:00",
  price: { perPerson: 85, total: 170, currency: "EUR" },
  rating: { score: 4.9, reviewCount: 1583 },
  difficulty: "Easy",
  distanceKm: 3,
  highlights: [
    "Six street-food tastings",
    "Nishiki Market — Kyoto's 400-year-old food street",
    "Matcha workshop at a Gion teahouse",
  ],
  included: ["Four-hour licensed foodie guide", "All six tastings", "Bottled water"],
  excluded: ["Hotel transfers", "Drinks beyond water"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 8 guests" },
    { iconKey: "activity", title: "Activity level", value: "Easy walking" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "12+" },
  ],
  routeStops: [
    { destinationName: "Nishiki Market", nights: 0, dateRange: "Late morning",
      description: "Tastings of pickles, tamagoyaki, and yuba.", lat: 35.005, lng: 135.764,
      accommodation: { hotelName: "Walking tour — no overnight", stars: 0, checkIn: "—", checkOut: "—", checkInISO: "", checkOutISO: "", roomType: "—", boardType: "—" },
      activities: [] },
    { destinationName: "Gion district", nights: 0, dateRange: "Afternoon",
      description: "Matcha workshop in a 200-year-old teahouse.", lat: 35.003, lng: 135.775,
      accommodation: { hotelName: "Walking tour — no overnight", stars: 0, checkIn: "—", checkOut: "—", checkInISO: "", checkOutISO: "", roomType: "—", boardType: "—" },
      activities: [] },
  ],
};

// 10. LAKE GENEVA SUNSET CRUISE — river cruise (1 day)
export const LAKE_GENEVA_CRUISE: Activity = {
  activityId: "lake-geneva-sunset-cruise",
  type: "river-cruise",
  title: "Lake Geneva Sunset Cruise",
  subtitle:
    "A two-hour catamaran sail past the Château de Chillon with a glass of Lavaux wine.",
  mainImage: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=80",
    "https://images.unsplash.com/photo-1527142879-95b61a0b8226?w=1200&q=80",
  ],
  location: "Montreux → Chillon → Montreux",
  durationDays: 1,
  startDate: "Daily, 18:00",
  endDate: "Daily, 20:00",
  price: { perPerson: 60, total: 120, currency: "CHF" },
  rating: { score: 4.7, reviewCount: 894 },
  highlights: [
    "Sunset over the Alps from the deck",
    "Pass the Château de Chillon castle",
    "Glass of Lavaux Chasselas included",
  ],
  included: ["Two-hour catamaran cruise", "Welcome glass of Lavaux wine", "Light cheese platter"],
  excluded: ["Additional drinks", "Hotel transfers"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 40 guests" },
    { iconKey: "activity", title: "Activity level", value: "Relaxed" },
    { iconKey: "languages", title: "Language", value: "English, French, German" },
    { iconKey: "calendar-check", title: "Min age", value: "0+" },
  ],
  cruise: {
    ship: "MS Lavaux",
    ports: [
      { name: "Montreux pier", day: 1, departs: "18:00",
        description: "Board on the Quai du Casino at sunset." },
      { name: "Château de Chillon", day: 1, arrives: "19:00", departs: "19:15",
        description: "Slow pass past the medieval lakeside castle." },
      { name: "Montreux pier", day: 1, arrives: "20:00",
        description: "Disembark with the Alps still glowing pink." },
    ],
    cabinTypes: [
      { name: "Open Deck Seat", pricePerPerson: 60, capacity: 1,
        description: "Standard seating on the upper deck with full panoramic views.",
        image: "https://images.unsplash.com/photo-1527142879-95b61a0b8226?w=900&q=80" },
      { name: "Captain's Lounge", pricePerPerson: 95, capacity: 1,
        description: "Reserved table in the glass-walled lounge with table service.",
        image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=900&q=80" },
    ],
  },
};

// 11. GRAND CANYON HELICOPTER — expedition (1 day)
export const GRAND_CANYON_HELI: Activity = {
  activityId: "grand-canyon-helicopter",
  type: "expedition",
  title: "Grand Canyon Helicopter Tour",
  subtitle:
    "A 45-minute helicopter ride from Vegas over the West Rim with a Champagne landing.",
  mainImage: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80",
    "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=1200&q=80",
  ],
  location: "Las Vegas → Grand Canyon West Rim",
  durationDays: 1,
  startDate: "Daily departures",
  endDate: "Daily departures",
  price: { perPerson: 399, total: 798, currency: "USD" },
  rating: { score: 4.8, reviewCount: 3056 },
  highlights: [
    "45-minute helicopter flight",
    "Landing on the canyon floor",
    "Champagne toast at landing site",
  ],
  included: ["Round-trip Vegas Strip hotel pickup", "Helicopter flight", "Champagne picnic"],
  excluded: ["Park entry fees outside the West Rim", "Gratuities", "Travel insurance"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 6 guests per heli" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "2+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Vegas to West Rim and back", location: "Grand Canyon West",
      items: [
        { type: "highlight", label: "Hotel pickup", description: "Limousine transfer from Vegas Strip to helipad." },
        { type: "highlight", label: "Scenic flight", description: "45-minute flight over Hoover Dam, Lake Mead, and the canyon rim." },
        { type: "highlight", label: "Canyon-floor landing", description: "Champagne picnic 4,000ft below the rim." },
      ],
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=80" },
  ],
};

// 12. CHAMPAGNE VINEYARD DAY TRIP — multi-day tour (1 day)
export const CHAMPAGNE_DAY_TRIP: Activity = {
  activityId: "champagne-day-trip",
  type: "multi-day-tour",
  title: "Champagne Vineyard Day Trip",
  subtitle:
    "Reims and Épernay cellar visits with three tastings — round-trip from Paris by minibus.",
  mainImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80",
    "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=1200&q=80",
  ],
  location: "Paris → Reims → Épernay → Paris",
  durationDays: 1,
  startDate: "Daily, 07:30",
  endDate: "Daily, 19:30",
  price: { perPerson: 189, total: 378, currency: "EUR" },
  rating: { score: 4.7, reviewCount: 1284 },
  highlights: [
    "Visit a Grand Cru house in Reims",
    "Small-producer cellar in Épernay",
    "Three tastings with vineyard lunch",
  ],
  included: ["Round-trip minibus from Paris", "Two cellar visits", "Three tastings", "Vineyard lunch"],
  excluded: ["Hotel transfers in Paris", "Additional bottle purchases"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 8 guests" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English, French" },
    { iconKey: "calendar-check", title: "Min age", value: "18+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Paris → Reims → Épernay → Paris", location: "Champagne region",
      items: [
        { type: "highlight", label: "Morning pickup in Paris", description: "Meet your guide at Place de la Concorde at 07:30." },
        { type: "highlight", label: "Reims Grand Cru visit", description: "Tour the chalk cellars of a famous champagne house." },
        { type: "highlight", label: "Vineyard lunch in Épernay", description: "Three-course lunch paired with two cuvées." },
        { type: "highlight", label: "Small-producer tasting", description: "Family-owned vineyard with three further pours." },
      ],
      image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80" },
  ],
};

// 13. CAPPADOCIA HOT-AIR BALLOON — expedition (1 day)
export const CAPPADOCIA_BALLOON: Activity = {
  activityId: "cappadocia-hot-air-balloon",
  type: "expedition",
  title: "Cappadocia Hot-Air Balloon",
  subtitle:
    "Sunrise float over fairy chimneys and ancient cave villages — toast with a glass of fizz.",
  mainImage: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=1200&q=80",
    "https://images.unsplash.com/photo-1600190083125-95a4d27e23da?w=1200&q=80",
  ],
  location: "Göreme, Cappadocia",
  durationDays: 1,
  startDate: "Sunrise, daily",
  endDate: "Sunrise, daily",
  price: { perPerson: 230, total: 460, currency: "EUR" },
  rating: { score: 4.9, reviewCount: 5421 },
  highlights: [
    "Sunrise launch with 100+ balloons",
    "Views over Göreme valley",
    "Champagne toast on landing",
  ],
  included: ["Hotel pickup at 04:30", "1-hour balloon flight", "Champagne toast", "Flight certificate"],
  excluded: ["Travel insurance", "Gratuities"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 20 per balloon" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English, Turkish" },
    { iconKey: "calendar-check", title: "Min age", value: "6+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Pre-dawn flight over Cappadocia", location: "Göreme",
      items: [
        { type: "highlight", label: "Hotel pickup", description: "04:30 — minibus transfer to the launch site." },
        { type: "highlight", label: "Sunrise inflation", description: "Watch the burner light as 100 balloons rise together." },
        { type: "highlight", label: "1-hour flight", description: "Drift over fairy chimneys and cave-cut churches." },
        { type: "highlight", label: "Champagne landing", description: "Traditional toast and certificate on touchdown." },
      ],
      image: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=1200&q=80" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// ICONIC EVENTS — bookable trips built around world-famous occasions.
// All use type "multi-day-tour" because that's the closest existing shape
// (hotel + itinerary + tickets-included package). If/when "Events" becomes
// a first-class ActivityType, swap the type field and update the search-form
// filter pills accordingly — no other changes needed here.
// ═══════════════════════════════════════════════════════════════════════════

// 14. WIMBLEDON CHAMPIONSHIPS
export const WIMBLEDON_PACKAGE: Activity = {
  activityId: "wimbledon-package",
  type: "multi-day-tour",
  title: "Wimbledon Championships — Match Day Package",
  subtitle:
    "Centre Court grass-court tennis with strawberries and cream — the world's oldest tennis tournament.",
  mainImage: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80",
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80",
  ],
  location: "London, United Kingdom",
  durationDays: 2,
  startDate: "Jul 04, 2026",
  endDate: "Jul 05, 2026",
  price: { perPerson: 180, total: 360, currency: "GBP" },
  rating: { score: 4.9, reviewCount: 612 },
  highlights: [
    "Centre Court or Court 1 ticket",
    "Strawberries and cream tradition",
    "Welcome reception in a Wimbledon hospitality marquee",
  ],
  included: ["One match-day ticket", "One night at a 4-star Wimbledon Village hotel", "Hospitality reception", "Underground travelcard"],
  excluded: ["International flights to London", "Additional Wimbledon merchandise"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Individual booking" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "8+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Match day", location: "All England Club, Wimbledon",
      items: [
        { type: "highlight", label: "Centre Court / Court 1 entry", description: "Reserved seating for one full session of play." },
        { type: "highlight", label: "Strawberries and cream", description: "The signature tournament treat — included." },
        { type: "hotel", label: "Cannizaro House Hotel **** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80" },
    { dayNumber: 2, title: "Departure", location: "London",
      items: [
        { type: "highlight", label: "Late check-out", description: "Time for shopping or a Thames walk before flying home." },
      ],
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80" },
  ],
};

// 15. MONACO GRAND PRIX
export const MONACO_GP_PACKAGE: Activity = {
  activityId: "monaco-gp-package",
  type: "multi-day-tour",
  title: "Monaco Grand Prix — Race Weekend",
  subtitle:
    "Formula 1 racing through the streets of Monte-Carlo — the crown jewel of the F1 calendar.",
  mainImage: "https://images.unsplash.com/photo-1518542698050-a3041b27d5b2?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1518542698050-a3041b27d5b2?w=1200&q=80",
    "https://images.unsplash.com/photo-1483721310020-03333e577078?w=1200&q=80",
  ],
  location: "Monte-Carlo, Monaco",
  durationDays: 3,
  startDate: "May 22, 2026",
  endDate: "May 24, 2026",
  price: { perPerson: 1250, total: 2500, currency: "EUR" },
  rating: { score: 4.8, reviewCount: 348 },
  highlights: [
    "Grandstand seat for Saturday qualifying + Sunday race",
    "Yacht-side viewing optional",
    "Pre-race paddock walk",
  ],
  included: ["3-day grandstand pass", "Two nights at a Monte-Carlo 5-star", "Paddock walk", "Welcome cocktail at Casino Square"],
  excluded: ["International flights to Nice", "Additional pit-lane access"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Individual booking" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English, French" },
    { iconKey: "calendar-check", title: "Min age", value: "12+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Free practice", location: "Monte-Carlo",
      items: [
        { type: "highlight", label: "Friday practice sessions", description: "Watch the world's fastest cars on the most demanding street circuit." },
        { type: "hotel", label: "Hôtel de Paris Monte-Carlo ***** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=1200&q=80" },
    { dayNumber: 2, title: "Qualifying day", location: "Monte-Carlo",
      items: [
        { type: "highlight", label: "Qualifying session", description: "The session that defines the race — pole at Monaco is everything." },
        { type: "highlight", label: "Casino Square cocktail reception", description: "Evening reception with fellow race fans." },
      ],
      image: "https://images.unsplash.com/photo-1518542698050-a3041b27d5b2?w=1200&q=80" },
    { dayNumber: 3, title: "Race day", location: "Monte-Carlo",
      items: [
        { type: "highlight", label: "Grand Prix race", description: "78 laps of the most iconic circuit in motorsport." },
      ],
      image: "https://images.unsplash.com/photo-1518542698050-a3041b27d5b2?w=1200&q=80" },
  ],
};

// 16. TCS NEW YORK CITY MARATHON
export const NYC_MARATHON_PACKAGE: Activity = {
  activityId: "nyc-marathon-package",
  type: "multi-day-tour",
  title: "TCS New York City Marathon",
  subtitle:
    "26.2 miles through all five boroughs on the first Sunday of November — 50,000 runners, two million spectators.",
  mainImage: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80",
  ],
  location: "New York City, USA",
  durationDays: 4,
  startDate: "Oct 30, 2026",
  endDate: "Nov 02, 2026",
  price: { perPerson: 349, total: 698, currency: "USD" },
  rating: { score: 4.9, reviewCount: 1842 },
  highlights: [
    "Guaranteed marathon entry",
    "Race-day finish-line spectator pass for one guest",
    "Pre-race pasta dinner",
  ],
  included: ["Marathon bib + chip", "Three nights at a Midtown 4-star", "Pre-race pasta dinner", "Race-morning Staten Island ferry transfer"],
  excluded: ["International flights to JFK", "Recovery massage", "Travel insurance"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Solo runner package" },
    { iconKey: "activity", title: "Activity level", value: "Endurance" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "18+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Arrival + race expo", location: "Manhattan",
      items: [
        { type: "highlight", label: "Race-pack collection", description: "Pick up your bib + finisher's tee at the Javits Center expo." },
        { type: "hotel", label: "The Bryant Park Hotel **** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80" },
    { dayNumber: 2, title: "Carb-load + course recce", location: "Central Park",
      items: [
        { type: "highlight", label: "Easy 3km shake-out run", description: "Optional group jog through Central Park." },
        { type: "highlight", label: "Pre-race pasta dinner", description: "Together with your fellow runners." },
      ],
      image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80" },
    { dayNumber: 3, title: "Race day", location: "All five boroughs",
      items: [
        { type: "highlight", label: "26.2 miles", description: "Staten Island to Central Park via Brooklyn, Queens, the Bronx, and Manhattan." },
        { type: "highlight", label: "Finish-line celebration", description: "Recovery food and medal at the finisher's village." },
      ],
      image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80" },
    { dayNumber: 4, title: "Departure", location: "JFK",
      items: [
        { type: "highlight", label: "Recovery breakfast", description: "Easy morning before your flight home." },
      ],
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80" },
  ],
};

// 17. MUNICH OKTOBERFEST
export const OKTOBERFEST_PACKAGE: Activity = {
  activityId: "oktoberfest-package",
  type: "multi-day-tour",
  title: "Munich Oktoberfest — Beer Tent Package",
  subtitle:
    "The world's biggest beer festival — 14 vast tents, lederhosen and brass bands.",
  mainImage: "https://images.unsplash.com/photo-1601057344679-2d2f1c0e9bf8?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1601057344679-2d2f1c0e9bf8?w=1200&q=80",
    "https://images.unsplash.com/photo-1568274656915-5d83d29f5cdb?w=1200&q=80",
  ],
  location: "Munich, Germany",
  durationDays: 3,
  startDate: "Sep 26, 2026",
  endDate: "Sep 28, 2026",
  price: { perPerson: 690, total: 1380, currency: "EUR" },
  rating: { score: 4.7, reviewCount: 982 },
  highlights: [
    "Reserved table in a Hofbräu tent",
    "Two-litre stein and pretzel welcome",
    "Theresienwiese fairground tickets",
  ],
  included: ["Three-day tent reservation", "Two nights at a Munich 4-star", "Welcome stein + pretzel", "Optional traditional lederhosen rental"],
  excluded: ["International flights to Munich", "Additional drinks beyond welcome stein"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Tables of 8" },
    { iconKey: "activity", title: "Activity level", value: "Easy" },
    { iconKey: "languages", title: "Language", value: "English, German" },
    { iconKey: "calendar-check", title: "Min age", value: "18+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Arrival + welcome stein", location: "Munich",
      items: [
        { type: "highlight", label: "Hotel check-in", description: "Drop bags in the Altstadt." },
        { type: "highlight", label: "Welcome reception", description: "Stein and pretzel at the Hofbräuhaus." },
        { type: "hotel", label: "Platzl Hotel **** or similar" },
      ],
      image: "https://images.unsplash.com/photo-1601057344679-2d2f1c0e9bf8?w=1200&q=80" },
    { dayNumber: 2, title: "Festival day", location: "Theresienwiese",
      items: [
        { type: "highlight", label: "Tent reservation", description: "Reserved table in a Hofbräu Festzelt — brass bands and a litre of Oktoberfestbier." },
        { type: "highlight", label: "Fairground rides", description: "Wooden rollercoasters, Ferris wheel, and traditional games." },
      ],
      image: "https://images.unsplash.com/photo-1568274656915-5d83d29f5cdb?w=1200&q=80" },
    { dayNumber: 3, title: "Departure", location: "Munich",
      items: [
        { type: "highlight", label: "Slow morning + Viktualienmarkt", description: "Bavarian breakfast before flying home." },
      ],
      image: "https://images.unsplash.com/photo-1601057344679-2d2f1c0e9bf8?w=1200&q=80" },
  ],
};

// 18. RIO DE JANEIRO CARNIVAL
export const RIO_CARNIVAL_PACKAGE: Activity = {
  activityId: "rio-carnival-package",
  type: "multi-day-tour",
  title: "Rio de Janeiro Carnival",
  subtitle:
    "Samba parades at the Sambódromo and city-wide street blocos — the week before Lent.",
  mainImage: "https://images.unsplash.com/photo-1518963272958-29c5e2dafde6?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1518963272958-29c5e2dafde6?w=1200&q=80",
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80",
  ],
  location: "Rio de Janeiro, Brazil",
  durationDays: 4,
  startDate: "Feb 14, 2026",
  endDate: "Feb 17, 2026",
  price: { perPerson: 1290, total: 2580, currency: "USD" },
  rating: { score: 4.8, reviewCount: 526 },
  highlights: [
    "Sambódromo grandstand for the main parade night",
    "Street bloco passes",
    "Sugarloaf Mountain cable car",
  ],
  included: ["Sambódromo ticket", "Three nights at a Copacabana beachfront 4-star", "Street bloco guide", "Sugarloaf cable car"],
  excluded: ["International flights to GIG", "Costume rental for parading"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 12 guests" },
    { iconKey: "activity", title: "Activity level", value: "Moderate (lots of dancing)" },
    { iconKey: "languages", title: "Language", value: "English, Portuguese" },
    { iconKey: "calendar-check", title: "Min age", value: "16+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Arrival on Copacabana", location: "Rio",
      items: [
        { type: "hotel", label: "Sofitel Rio Copacabana ***** or similar" },
        { type: "highlight", label: "Beach welcome", description: "Caipirinha at sunset on Copacabana." },
      ],
      image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80" },
    { dayNumber: 2, title: "Street blocos", location: "Centro + Lapa",
      items: [
        { type: "highlight", label: "Daytime bloco crawl", description: "Three of Rio's most loved street parties with a local guide." },
        { type: "highlight", label: "Sugarloaf at dusk", description: "Two-stage cable car for sunset views." },
      ],
      image: "https://images.unsplash.com/photo-1518963272958-29c5e2dafde6?w=1200&q=80" },
    { dayNumber: 3, title: "Sambódromo parade night", location: "Sambódromo",
      items: [
        { type: "highlight", label: "Grandstand seats", description: "Watch the top samba schools parade — show runs until dawn." },
      ],
      image: "https://images.unsplash.com/photo-1518963272958-29c5e2dafde6?w=1200&q=80" },
    { dayNumber: 4, title: "Slow day + departure", location: "Rio",
      items: [
        { type: "highlight", label: "Beach recovery", description: "Lazy morning on Ipanema before flying home." },
      ],
      image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80" },
  ],
};

// 19. EDINBURGH FESTIVAL FRINGE
export const EDINBURGH_FRINGE_PACKAGE: Activity = {
  activityId: "edinburgh-fringe-package",
  type: "multi-day-tour",
  title: "Edinburgh Festival Fringe",
  subtitle:
    "The world's largest arts festival — comedy, theatre, and street performers take over the city every August.",
  mainImage: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1200&q=80",
    "https://images.unsplash.com/photo-1543393470-b2f8d5c166b1?w=1200&q=80",
  ],
  location: "Edinburgh, United Kingdom",
  durationDays: 5,
  startDate: "Aug 10, 2026",
  endDate: "Aug 14, 2026",
  price: { perPerson: 540, total: 1080, currency: "GBP" },
  rating: { score: 4.8, reviewCount: 743 },
  highlights: [
    "Tickets to four headline Fringe shows",
    "Free Royal Mile street performances",
    "Edinburgh Castle skip-the-line entry",
  ],
  included: ["Four show tickets (curated mix)", "Four nights at an Old Town 4-star", "Castle entry", "Welcome whisky tasting"],
  excluded: ["Additional show tickets", "Travel to/from Edinburgh"],
  attributes: [
    { iconKey: "users", title: "Group size", value: "Up to 10 guests" },
    { iconKey: "activity", title: "Activity level", value: "Easy walking" },
    { iconKey: "languages", title: "Language", value: "English" },
    { iconKey: "calendar-check", title: "Min age", value: "12+" },
  ],
  itineraryDays: [
    { dayNumber: 1, title: "Arrival + welcome whisky", location: "Edinburgh Old Town",
      items: [
        { type: "hotel", label: "The Witchery by the Castle **** or similar" },
        { type: "highlight", label: "Whisky tasting", description: "Five-dram tasting in a tucked-away Old Town cellar." },
      ],
      image: "https://images.unsplash.com/photo-1543393470-b2f8d5c166b1?w=1200&q=80" },
    { dayNumber: 2, title: "Royal Mile + headline show", location: "Edinburgh",
      items: [
        { type: "highlight", label: "Royal Mile street performers", description: "Free outdoor performances all day." },
        { type: "highlight", label: "Headline comedy show", description: "Reserved seat at the Pleasance Courtyard." },
      ],
      image: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1200&q=80" },
    { dayNumber: 3, title: "Castle + theatre night", location: "Edinburgh",
      items: [
        { type: "highlight", label: "Edinburgh Castle entry", description: "Skip-the-line entry to the castle and crown jewels." },
        { type: "highlight", label: "Theatre show", description: "Underground stage at a Fringe favourite venue." },
      ],
      image: "https://images.unsplash.com/photo-1543393470-b2f8d5c166b1?w=1200&q=80" },
    { dayNumber: 4, title: "Two more shows + cabaret", location: "Edinburgh",
      items: [
        { type: "highlight", label: "Afternoon show", description: "Curated pick from this year's hottest tickets." },
        { type: "highlight", label: "Late-night cabaret", description: "Spiegeltent under the stars." },
      ],
      image: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1200&q=80" },
    { dayNumber: 5, title: "Departure", location: "Edinburgh",
      items: [
        { type: "highlight", label: "Slow morning + brunch", description: "Easy departure after a final Edinburgh breakfast." },
      ],
      image: "https://images.unsplash.com/photo-1543393470-b2f8d5c166b1?w=1200&q=80" },
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
  // One-day experiences featured on Discovery
  ROME_NIGHT_WALK,
  KYOTO_FOOD_CRAWL,
  LAKE_GENEVA_CRUISE,
  GRAND_CANYON_HELI,
  CHAMPAGNE_DAY_TRIP,
  CAPPADOCIA_BALLOON,
  // Iconic events featured on Discovery
  WIMBLEDON_PACKAGE,
  MONACO_GP_PACKAGE,
  NYC_MARATHON_PACKAGE,
  OKTOBERFEST_PACKAGE,
  RIO_CARNIVAL_PACKAGE,
  EDINBURGH_FRINGE_PACKAGE,
];

// Quick lookup — ActivityListPage / DiscoveryPage can resolve clicks by id.
export const ACTIVITY_BY_ID: Record<string, Activity> = ALL_ACTIVITIES.reduce(
  (acc, a) => {
    acc[a.activityId] = a;
    return acc;
  },
  {} as Record<string, Activity>
);
