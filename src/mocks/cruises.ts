// ─────────────────────────────────────────────────────────────────────────────
// Cruise Mock Data
//
// Six cruises spanning the major regions and cruise lines:
//   1. Western Mediterranean — MSC Cruises (Mediterranean)
//   2. Caribbean Island Hopping — Royal Caribbean (Caribbean)
//   3. Disney Magic at Sea — Disney Cruise Line (Caribbean)
//   4. Norwegian Fjords — Norwegian Cruise Line (Northern Europe)
//   5. Greek Islands & Turkey — Celebrity Cruises (Mediterranean)
//   6. Alaska Inside Passage — Royal Caribbean (Alaska)
//
// All images come from Unsplash's free CDN, with the same query-param pattern
// used elsewhere in the prototype (?w=...&fit=crop&auto=format).
// ─────────────────────────────────────────────────────────────────────────────

import type { Cruise, CruiseCabin } from "../types";

// ── Reusable cabin generator ───────────────────────────────────────────────
// All cruises share the same four-tier cabin structure (Interior, Ocean View,
// Balcony, Suite). The prices vary per cruise but the shape stays consistent.
// We pass in the four prices and the cruise slug so each cabin image gets a
// unique seed (Unsplash can return the same photo twice otherwise).
function makeCabins(
  prices: [number, number, number, number],
  slug: string,
): CruiseCabin[] {
  return [
    {
      id: `${slug}-interior`,
      name: "Interior Stateroom",
      category: "Interior",
      pricePerPerson: prices[0],
      capacity: 2,
      sqMeters: 14,
      description:
        "Comfortable 14m² cabin with twin beds, ensuite bathroom, and modern amenities.",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&h=600&fit=crop&auto=format",
    },
    {
      id: `${slug}-oceanview`,
      name: "Ocean View Stateroom",
      category: "Ocean View",
      pricePerPerson: prices[1],
      capacity: 2,
      sqMeters: 17,
      description:
        "17m² cabin with a picture window facing the sea, queen bed, and lounge area.",
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&h=600&fit=crop&auto=format",
    },
    {
      id: `${slug}-balcony`,
      name: "Balcony Stateroom",
      category: "Balcony",
      pricePerPerson: prices[2],
      capacity: 3,
      sqMeters: 22,
      description:
        "Private balcony, sitting area, and floor-to-ceiling glass doors for outdoor views.",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop&auto=format",
    },
    {
      id: `${slug}-suite`,
      name: "Owner's Suite",
      category: "Suite",
      pricePerPerson: prices[3],
      capacity: 4,
      sqMeters: 45,
      description:
        "Two-room suite with butler service, complimentary speciality dining, and premium drinks.",
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop&auto=format",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. WESTERN MEDITERRANEAN — MSC Cruises
// ─────────────────────────────────────────────────────────────────────────────
export const WESTERN_MED_CRUISE: Cruise = {
  cruiseId: "western-mediterranean-explorer",
  cruiseLine: "MSC Cruises",
  shipName: "MSC Virtuosa",
  title: "Western Mediterranean Explorer",
  subtitle:
    "Seven days sailing from Barcelona along the French and Italian rivieras — sun, ancient ports, and modern luxury at sea.",
  region: "Mediterranean",
  route: "Barcelona → Marseille → Genoa → Rome → Palma → Barcelona",

  // Hero: Amalfi-style Mediterranean coast town with painted houses on cliffs
  mainImage:
    "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=1600&q=80",
  gallery: [
    // Barcelona (Park Güell / Catalan architecture)
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80",
    // Italian coastal village (Cinque Terre / Liguria)
    "https://images.unsplash.com/photo-1543248939-ff40856f65d4?w=1200&q=80",
    // Rome — Colosseum
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    // Palma / Mediterranean harbour
    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=80",
  ],
  // Ship photo — large cruise liner at sea
  shipImage:
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1600&q=80",

  durationNights: 7,
  departurePort: "Barcelona, Spain",
  nextDeparture: "Jul 12, 2026",
  departures: [
    { date: "2026-07-12", pricePerPerson: 899,  available: true },
    { date: "2026-07-26", pricePerPerson: 949,  available: true },
    { date: "2026-08-09", pricePerPerson: 1049, available: true },
    { date: "2026-08-23", pricePerPerson: 1099, available: true },
    { date: "2026-09-06", pricePerPerson: 949,  available: true },
    { date: "2026-09-20", pricePerPerson: 899,  available: true },
  ],

  price: { fromPerPerson: 899, currency: "USD" },
  rating: { score: 4.6, reviewCount: 2147 },

  ports: [
    { name: "Barcelona, Spain", day: 1, departs: "17:00", lat: 41.38, lng: 2.18,
      description: "Embark in the heart of Catalonia — final tapas in the Gothic Quarter before sailing." },
    { name: "Marseille, France", day: 2, arrives: "08:00", departs: "18:00", lat: 43.30, lng: 5.37,
      description: "France's oldest city — visit the Notre-Dame de la Garde basilica and the Vieux-Port." },
    { name: "Genoa, Italy", day: 3, arrives: "08:00", departs: "18:00", lat: 44.41, lng: 8.93,
      description: "Birthplace of pesto and Columbus — wander the medieval caruggi laneways." },
    { name: "At Sea", day: 4, isSeaDay: true,
      description: "Pool deck day with shows, cooking demos, and an afternoon at the spa." },
    { name: "Rome (Civitavecchia), Italy", day: 5, arrives: "06:00", departs: "20:00", lat: 42.10, lng: 11.80,
      description: "Optional all-day excursion to the Colosseum, Pantheon, and St Peter's." },
    { name: "Palma de Mallorca, Spain", day: 6, arrives: "09:00", departs: "17:00", lat: 39.57, lng: 2.65,
      description: "Stroll the cathedral seafront, then beach time at Cala Major." },
    { name: "Barcelona, Spain", day: 7, arrives: "07:00", lat: 41.38, lng: 2.18,
      description: "Disembark after breakfast." },
  ],

  cabinTypes: makeCabins([899, 1149, 1599, 2899], "western-med"),

  highlights: [
    "All meals onboard included",
    "Six diverse Mediterranean ports",
    "Award-winning theatre productions",
    "Mediterranean-themed enrichment lectures",
  ],
  included: [
    "Seven nights full-board accommodation",
    "All shipboard meals across 12 restaurants",
    "Daily entertainment and Broadway-style shows",
    "Kids' clubs for ages 3–17",
    "Port taxes and gratuities",
  ],
  excluded: [
    "International flights to Barcelona",
    "Shore excursions",
    "Premium drinks package",
    "Spa treatments and salon services",
    "Travel insurance",
  ],

  shipAmenities: [
    "Three swimming pools",
    "Aurea Spa & wellness",
    "Theatre shows",
    "Specialty dining",
    "Kids' club",
    "Sports court",
    "Casino",
    "Cinema",
  ],

  lat: 41.38,
  lng: 2.18,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CARIBBEAN ISLAND HOPPING — Royal Caribbean
// ─────────────────────────────────────────────────────────────────────────────
export const CARIBBEAN_CRUISE: Cruise = {
  cruiseId: "caribbean-island-hopping",
  cruiseLine: "Royal Caribbean",
  shipName: "Wonder of the Seas",
  title: "Caribbean Island Hopping",
  subtitle:
    "Seven nights aboard the world's largest cruise ship — turquoise waters, white-sand islands, and adrenaline at sea.",
  region: "Caribbean",
  route: "Miami → CocoCay → St. Thomas → St. Maarten → Miami",

  // Hero: classic Caribbean turquoise water with white sand
  mainImage:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
  gallery: [
    // Miami skyline / South Beach
    "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1200&q=80",
    // Bahamas — palm trees & turquoise water
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
    // St. Thomas / St. Maarten — tropical Caribbean cove
    "https://images.unsplash.com/photo-1473221326025-9183b464bb7e?w=1200&q=80",
    // Cruise ship at Caribbean port
    "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80",
  ],
  // Ship — large cruise liner from above
  shipImage:
    "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80",

  durationNights: 7,
  departurePort: "Miami, USA",
  nextDeparture: "Aug 02, 2026",
  departures: [
    { date: "2026-08-02", pricePerPerson: 1099, available: true },
    { date: "2026-08-16", pricePerPerson: 1199, available: true },
    { date: "2026-08-30", pricePerPerson: 1149, available: true },
    { date: "2026-09-13", pricePerPerson: 1049, available: true },
    { date: "2026-09-27", pricePerPerson: 999,  available: true },
  ],

  price: { fromPerPerson: 999, currency: "USD" },
  rating: { score: 4.8, reviewCount: 3892 },

  ports: [
    { name: "Miami, USA", day: 1, departs: "17:00", lat: 25.77, lng: -80.19,
      description: "Set sail from the busiest cruise port in the world after lunch in Little Havana." },
    { name: "CocoCay, Bahamas", day: 2, arrives: "08:00", departs: "17:00", lat: 25.82, lng: -77.94,
      description: "Royal Caribbean's private island — water park, zip lines, and overwater cabanas." },
    { name: "At Sea", day: 3, isSeaDay: true,
      description: "Surf simulator, ice skating, and Broadway-quality shows in the Royal Theatre." },
    { name: "St. Thomas, USVI", day: 4, arrives: "08:00", departs: "17:00", lat: 18.34, lng: -64.93,
      description: "Snorkel at Magens Bay or browse duty-free shopping in Charlotte Amalie." },
    { name: "St. Maarten", day: 5, arrives: "08:00", departs: "17:00", lat: 18.04, lng: -63.06,
      description: "Two-nations island — French croissants in the morning, Dutch beach bars by afternoon." },
    { name: "At Sea", day: 6, isSeaDay: true,
      description: "Final pool day, farewell dinner, and the captain's gala." },
    { name: "Miami, USA", day: 7, arrives: "06:00", lat: 25.77, lng: -80.19,
      description: "Disembark by 09:00 after breakfast." },
  ],

  cabinTypes: makeCabins([999, 1299, 1799, 3199], "caribbean"),

  highlights: [
    "Largest cruise ship in the world",
    "Private island day at CocoCay",
    "Surf simulator and zip line onboard",
    "Award-winning Broadway shows",
  ],
  included: [
    "Seven nights accommodation",
    "All meals in 20+ dining venues",
    "Surf simulator, rock wall, and ice skating",
    "Adventure Ocean kids' programmes",
    "Port taxes and gratuities",
  ],
  excluded: [
    "International flights to Miami",
    "Shore excursions",
    "Drinks packages (alcoholic and non-alcoholic)",
    "Specialty restaurant cover charges",
    "Wi-Fi and spa treatments",
  ],

  shipAmenities: [
    "Pool deck with FlowRider",
    "Rock climbing wall",
    "Ice skating rink",
    "Zip line across the ship",
    "Casino royale",
    "Adventure Ocean kids' club",
    "Vitality Spa",
    "Broadway theatre",
  ],

  lat: 25.77,
  lng: -80.19,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. DISNEY MAGIC AT SEA — Disney Cruise Line
// ─────────────────────────────────────────────────────────────────────────────
export const DISNEY_CRUISE: Cruise = {
  cruiseId: "disney-magic-at-sea",
  cruiseLine: "Disney Cruise Line",
  shipName: "Disney Wish",
  title: "Disney Magic at Sea",
  subtitle:
    "Four nights of Disney magic — character meet-and-greets, deck-top fireworks, and a private day on Castaway Cay.",
  region: "Caribbean",
  route: "Port Canaveral → Nassau → Castaway Cay → Port Canaveral",

  // Hero: cruise pool deck with family-friendly slides / water park vibe
  mainImage:
    "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1600&q=80",
  gallery: [
    // Bahamas turquoise water — Castaway-style private island
    "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&q=80",
    // Nassau pastel colonial houses
    "https://images.unsplash.com/photo-1546484959-f9a381d1330d?w=1200&q=80",
    // White-sand beach with palm
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
    // Big cruise ship at sea
    "https://images.unsplash.com/photo-1556881286-fc6915169721?w=1200&q=80",
  ],

  durationNights: 4,
  departurePort: "Port Canaveral, USA",
  nextDeparture: "Jun 22, 2026",
  departures: [
    { date: "2026-06-22", pricePerPerson: 1299, available: true },
    { date: "2026-07-06", pricePerPerson: 1399, available: true },
    { date: "2026-07-20", pricePerPerson: 1499, available: true },
    { date: "2026-08-03", pricePerPerson: 1449, available: true },
  ],

  price: { fromPerPerson: 1299, currency: "USD" },
  rating: { score: 4.9, reviewCount: 2456 },

  ports: [
    { name: "Port Canaveral, USA", day: 1, departs: "16:00", lat: 28.41, lng: -80.62,
      description: "Embark with character welcome on the atrium staircase." },
    { name: "Nassau, Bahamas", day: 2, arrives: "08:00", departs: "17:00", lat: 25.06, lng: -77.34,
      description: "Optional excursion to Atlantis Aquaventure or the colourful Straw Market." },
    { name: "Castaway Cay, Bahamas", day: 3, arrives: "09:00", departs: "16:00", lat: 25.78, lng: -77.97,
      description: "Disney's private island — character beach parties, snorkelling, and barbeque lunch." },
    { name: "Port Canaveral, USA", day: 4, arrives: "07:00", lat: 28.41, lng: -80.62,
      description: "Disembark by 10:00 with breakfast served in the main dining rooms." },
  ],

  cabinTypes: makeCabins([1299, 1599, 2099, 3899], "disney"),

  highlights: [
    "Two visits with Disney characters daily",
    "Private island day on Castaway Cay",
    "Deck-top pirate party with fireworks",
    "Broadway-style original Disney shows",
  ],
  included: [
    "Four nights accommodation",
    "All meals and rotational dining",
    "Character meet-and-greets",
    "Oceaneer Club kids' programmes",
    "Soft drinks at meals and bars",
  ],
  excluded: [
    "International flights to Orlando",
    "Shore excursions and Aquaventure tickets",
    "Alcoholic drinks and specialty coffee",
    "Adult-exclusive Palo restaurant",
    "Spa, salon, and Wi-Fi",
  ],

  shipAmenities: [
    "AquaMouse water coaster",
    "Three family pools",
    "Oceaneer Club kids' club",
    "Edge tween club",
    "Vibe teen lounge",
    "Senses Spa",
    "Walt Disney Theatre",
    "Marvel Super Hero Academy",
  ],

  lat: 28.41,
  lng: -80.62,
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. NORWEGIAN FJORDS — Norwegian Cruise Line
// ─────────────────────────────────────────────────────────────────────────────
export const NORWEGIAN_FJORDS_CRUISE: Cruise = {
  cruiseId: "norwegian-fjords",
  cruiseLine: "Norwegian Cruise Line",
  shipName: "Norwegian Star",
  title: "Norwegian Fjords Voyage",
  subtitle:
    "Ten nights sailing past glaciers, waterfalls, and Viking-era ports — including a stop at the UNESCO-listed Geirangerfjord.",
  region: "Northern Europe",
  route: "Southampton → Bergen → Geiranger → Ålesund → Stavanger → Southampton",

  mainImage:
    "https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=1600&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=1200&q=80",
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1200&q=80",
    "https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
  ],

  durationNights: 10,
  departurePort: "Southampton, UK",
  nextDeparture: "Jul 05, 2026",
  departures: [
    { date: "2026-07-05", pricePerPerson: 1799, available: true },
    { date: "2026-07-25", pricePerPerson: 1899, available: true },
    { date: "2026-08-14", pricePerPerson: 1949, available: true },
    { date: "2026-09-03", pricePerPerson: 1699, available: true },
  ],

  price: { fromPerPerson: 1699, currency: "GBP" },
  rating: { score: 4.7, reviewCount: 1683 },

  ports: [
    { name: "Southampton, UK", day: 1, departs: "17:00", lat: 50.91, lng: -1.40,
      description: "Set sail from England's south coast after a final pub lunch." },
    { name: "At Sea", day: 2, isSeaDay: true,
      description: "Across the North Sea — spa day, observation lounge, and afternoon tea." },
    { name: "Bergen, Norway", day: 3, arrives: "08:00", departs: "18:00", lat: 60.39, lng: 5.32,
      description: "Colourful Bryggen harbour, funicular up Mount Fløyen, and fresh fish market." },
    { name: "Geiranger, Norway", day: 4, arrives: "07:00", departs: "20:00", lat: 62.10, lng: 7.21,
      description: "Anchor in the heart of UNESCO-listed Geirangerfjord — kayak past Seven Sisters waterfall." },
    { name: "Ålesund, Norway", day: 5, arrives: "08:00", departs: "18:00", lat: 62.47, lng: 6.15,
      description: "Wander the art-nouveau old town and climb Mount Aksla for sweeping views." },
    { name: "At Sea", day: 6, isSeaDay: true,
      description: "Cruising fjord country — onboard cooking class with Norwegian chef." },
    { name: "Stavanger, Norway", day: 7, arrives: "09:00", departs: "18:00", lat: 58.97, lng: 5.73,
      description: "Hike to Pulpit Rock or stroll the cobbled lanes of Gamle Stavanger." },
    { name: "At Sea", day: 8, isSeaDay: true,
      description: "Final spa day, captain's gala, and farewell dinner." },
    { name: "At Sea", day: 9, isSeaDay: true,
      description: "Return crossing to England — packing day with afternoon entertainment." },
    { name: "Southampton, UK", day: 10, arrives: "07:00", lat: 50.91, lng: -1.40,
      description: "Disembark by 10:00." },
  ],

  cabinTypes: makeCabins([1699, 1999, 2599, 3899], "norwegian-fjords"),

  highlights: [
    "UNESCO Geirangerfjord scenic cruising",
    "Five spectacular Norwegian ports",
    "Freestyle dining across 12+ venues",
    "Onboard Norwegian-themed enrichment",
  ],
  included: [
    "Ten nights accommodation",
    "Freestyle dining in main restaurants",
    "Entertainment, theatre, and activities",
    "Kids' Splash Academy programmes",
    "Port taxes and gratuities",
  ],
  excluded: [
    "Flights to Southampton",
    "Shore excursions",
    "Premium beverage and dining packages",
    "Spa treatments",
    "Travel insurance",
  ],

  shipAmenities: [
    "Indoor and outdoor pools",
    "Mandara Spa",
    "Stardust Theatre",
    "Specialty dining",
    "Splash Academy kids' club",
    "Casino",
    "Sports court",
    "Atrium piano bar",
  ],

  lat: 60.39,
  lng: 5.32,
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. GREEK ISLANDS & TURKEY — Celebrity Cruises
// ─────────────────────────────────────────────────────────────────────────────
export const GREEK_ISLANDS_CRUISE: Cruise = {
  cruiseId: "greek-islands-turkey",
  cruiseLine: "Celebrity Cruises",
  shipName: "Celebrity Beyond",
  title: "Greek Islands & Turkey",
  subtitle:
    "Seven nights island-hopping through the Aegean — white-washed villages, ancient ruins, and crystal-clear waters.",
  region: "Mediterranean",
  route: "Piraeus → Mykonos → Kusadasi → Santorini → Rhodes → Piraeus",

  // Hero: iconic Santorini blue domes & whitewashed Oia
  mainImage:
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80",
  gallery: [
    // Athens — Acropolis & Parthenon
    "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80",
    // Mykonos — windmills & white village
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80",
    // Ephesus / Roman ruins (Kusadasi excursion)
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    // Santorini cliffside houses at sunset
    "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=1200&q=80",
  ],

  durationNights: 7,
  departurePort: "Athens (Piraeus), Greece",
  nextDeparture: "Jun 28, 2026",
  departures: [
    { date: "2026-06-28", pricePerPerson: 1399, available: true },
    { date: "2026-07-12", pricePerPerson: 1499, available: true },
    { date: "2026-07-26", pricePerPerson: 1599, available: true },
    { date: "2026-08-09", pricePerPerson: 1599, available: true },
    { date: "2026-08-23", pricePerPerson: 1499, available: true },
    { date: "2026-09-06", pricePerPerson: 1349, available: true },
  ],

  price: { fromPerPerson: 1349, currency: "USD" },
  rating: { score: 4.8, reviewCount: 2014 },

  ports: [
    { name: "Athens (Piraeus), Greece", day: 1, departs: "17:00", lat: 37.94, lng: 23.65,
      description: "Optional pre-cruise visit to the Acropolis before embarking at Greece's largest port." },
    { name: "Mykonos, Greece", day: 2, arrives: "10:00", departs: "22:00", lat: 37.45, lng: 25.33,
      description: "White-washed cubes, windmills, and Little Venice cocktails at sunset." },
    { name: "Kusadasi, Turkey", day: 3, arrives: "07:00", departs: "17:00", lat: 37.86, lng: 27.26,
      description: "Optional excursion to the ancient ruins of Ephesus and the House of the Virgin Mary." },
    { name: "Santorini, Greece", day: 4, arrives: "08:00", departs: "22:00", lat: 36.39, lng: 25.46,
      description: "Cable car up to Fira, sunset in Oia, and volcanic wine tasting." },
    { name: "Rhodes, Greece", day: 5, arrives: "07:00", departs: "17:00", lat: 36.43, lng: 28.22,
      description: "UNESCO medieval old town and the seven natural springs at Kallithea." },
    { name: "At Sea", day: 6, isSeaDay: true,
      description: "Spa day, world-class Le Petit Chef dining experience, and farewell gala." },
    { name: "Athens (Piraeus), Greece", day: 7, arrives: "07:00", lat: 37.94, lng: 23.65,
      description: "Disembark after Greek-style breakfast." },
  ],

  cabinTypes: makeCabins([1349, 1649, 2199, 4199], "greek-islands"),

  highlights: [
    "Four iconic Greek islands",
    "Optional Ephesus archaeological tour",
    "Sunset in Oia, Santorini",
    "Award-winning Le Petit Chef dining",
  ],
  included: [
    "Seven nights accommodation",
    "Classic drinks package",
    "Basic Wi-Fi",
    "Gratuities included",
    "Premium dining in main restaurants",
  ],
  excluded: [
    "International flights to Athens",
    "Shore excursions",
    "Premium beverage upgrade",
    "Spa and salon services",
    "Specialty restaurant supplements",
  ],

  shipAmenities: [
    "Magic Carpet floating venue",
    "The Retreat suite-class lounge",
    "Resort Deck pool",
    "Eden lounge",
    "World-class spa",
    "Eight specialty restaurants",
    "Casino",
    "Theatre productions",
  ],

  lat: 37.94,
  lng: 23.65,
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. ALASKA INSIDE PASSAGE — Royal Caribbean
// ─────────────────────────────────────────────────────────────────────────────
export const ALASKA_CRUISE: Cruise = {
  cruiseId: "alaska-inside-passage",
  cruiseLine: "Royal Caribbean",
  shipName: "Quantum of the Seas",
  title: "Alaska Inside Passage",
  subtitle:
    "Seven nights through glacier country — gold-rush towns, whale-watching, and dramatic Glacier Bay scenic cruising.",
  region: "Alaska",
  route: "Seattle → Juneau → Skagway → Glacier Bay → Ketchikan → Seattle",

  // Hero: dramatic glacier-and-mountain landscape (Glacier Bay vibe)
  mainImage:
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80",
  gallery: [
    // Seattle skyline / Space Needle — embarkation port
    "https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?w=1200&q=80",
    // Alaska mountains & forest — Inside Passage scenery
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&q=80",
    // Whale breaching — Juneau whale-watching highlight
    "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=1200&q=80",
    // Glacier & icebergs — Glacier Bay scenic cruising
    "https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=1200&q=80",
  ],

  durationNights: 7,
  departurePort: "Seattle, USA",
  nextDeparture: "Jul 19, 2026",
  departures: [
    { date: "2026-07-19", pricePerPerson: 1549, available: true },
    { date: "2026-08-02", pricePerPerson: 1599, available: true },
    { date: "2026-08-16", pricePerPerson: 1649, available: true },
    { date: "2026-08-30", pricePerPerson: 1549, available: true },
    { date: "2026-09-13", pricePerPerson: 1299, available: true },
  ],

  price: { fromPerPerson: 1299, currency: "USD" },
  rating: { score: 4.7, reviewCount: 1827 },

  ports: [
    { name: "Seattle, USA", day: 1, departs: "16:00", lat: 47.61, lng: -122.33,
      description: "Final coffee at Pike Place Market before sailing through Puget Sound." },
    { name: "At Sea", day: 2, isSeaDay: true,
      description: "Inside Passage cruising — keep eyes peeled for orcas and humpback whales." },
    { name: "Juneau, Alaska", day: 3, arrives: "10:00", departs: "21:00", lat: 58.30, lng: -134.42,
      description: "Helicopter tour to Mendenhall Glacier or whale-watching in Auke Bay." },
    { name: "Skagway, Alaska", day: 4, arrives: "07:00", departs: "20:00", lat: 59.46, lng: -135.31,
      description: "Ride the historic White Pass & Yukon Route railway through gold-rush country." },
    { name: "Glacier Bay (Scenic Cruising)", day: 5, isSeaDay: false, arrives: "07:00", departs: "16:00", lat: 58.66, lng: -136.90,
      description: "Day-long scenic cruising in the UNESCO Glacier Bay National Park." },
    { name: "Ketchikan, Alaska", day: 6, arrives: "07:00", departs: "13:00", lat: 55.34, lng: -131.65,
      description: "Salmon-fishing capital — visit Creek Street and the Totem Heritage Center." },
    { name: "Seattle, USA", day: 7, arrives: "07:00", lat: 47.61, lng: -122.33,
      description: "Disembark by 10:00." },
  ],

  cabinTypes: makeCabins([1299, 1599, 2099, 3699], "alaska"),

  highlights: [
    "Glacier Bay scenic cruising",
    "White Pass historic railway",
    "Whale-watching in Juneau",
    "North Star observation pod",
  ],
  included: [
    "Seven nights accommodation",
    "All meals in main dining venues",
    "Onboard entertainment and shows",
    "Adventure Ocean kids' programmes",
    "Port taxes and gratuities",
  ],
  excluded: [
    "Flights to Seattle",
    "Shore excursions (helicopter, train, whale-watching)",
    "Drinks packages",
    "Specialty dining",
    "Wi-Fi and spa",
  ],

  shipAmenities: [
    "North Star observation pod",
    "FlowRider surf simulator",
    "Two70 lounge",
    "Indoor SeaPlex sports court",
    "Vitality Spa",
    "Specialty dining",
    "Adventure Ocean kids' club",
    "Bionic Bar",
  ],

  lat: 47.61,
  lng: -122.33,
};

// ─────────────────────────────────────────────────────────────────────────────
// Combined dataset — ALL_CRUISES is what CruiseListPage filters/sorts from.
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_CRUISES: Cruise[] = [
  WESTERN_MED_CRUISE,
  CARIBBEAN_CRUISE,
  DISNEY_CRUISE,
  NORWEGIAN_FJORDS_CRUISE,
  GREEK_ISLANDS_CRUISE,
  ALASKA_CRUISE,
];

// Quick lookup by id — used by routing/handlers if we ever resolve by id.
export const CRUISE_BY_ID: Record<string, Cruise> = ALL_CRUISES.reduce(
  (acc, c) => {
    acc[c.cruiseId] = c;
    return acc;
  },
  {} as Record<string, Cruise>,
);

// ─────────────────────────────────────────────────────────────────────────────
// Region cards shown on the Discovery tab hero (browse-by-region row).
// Each card links to a region-filtered CruiseListPage.
// ─────────────────────────────────────────────────────────────────────────────
export const CRUISE_REGIONS = [
  // Caribbean — palm-fringed white-sand beach (was a generic ship before)
  { id: "caribbean",       label: "Caribbean" as const,       emoji: "🌴", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop", cruiseCount: 24 },
  // Mediterranean — Amalfi-style cliffside village
  { id: "mediterranean",   label: "Mediterranean" as const,   emoji: "🏛️", image: "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=800&h=500&fit=crop", cruiseCount: 31 },
  // Northern Europe — Norwegian fjord
  { id: "northern-europe", label: "Northern Europe" as const, emoji: "🏔️", image: "https://images.unsplash.com/photo-1516496636080-14fb876e029d?w=800&h=500&fit=crop", cruiseCount: 18 },
  // Alaska — glacier-and-mountains landscape
  { id: "alaska",          label: "Alaska" as const,          emoji: "🐻", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=500&fit=crop", cruiseCount: 12 },
  // Asia — temple silhouette (Tokyo/Kyoto vibe)
  { id: "asia",            label: "Asia" as const,            emoji: "⛩️", image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=500&fit=crop", cruiseCount: 15 },
  // South Pacific — overwater bungalow / Bora Bora turquoise
  { id: "south-pacific",   label: "South Pacific" as const,   emoji: "🌺", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=500&fit=crop", cruiseCount: 9 },
];

// Featured cruises shown on the Discovery tab "Popular cruises" carousel.
export const FEATURED_CRUISES = ALL_CRUISES.slice(0, 4);

// All cruise lines that appear in our dataset — used in the
// "Browse by cruise line" pill row on the Discovery tab.
export const CRUISE_LINES: { id: string; label: string }[] = [
  { id: "MSC Cruises",           label: "MSC Cruises" },
  { id: "Royal Caribbean",       label: "Royal Caribbean" },
  { id: "Disney Cruise Line",    label: "Disney Cruise Line" },
  { id: "Norwegian Cruise Line", label: "Norwegian Cruise Line" },
  { id: "Celebrity Cruises",     label: "Celebrity Cruises" },
];
