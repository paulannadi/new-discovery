// Airport catalogue used by the Flights tab's From/To pickers.
//
// We deliberately keep this small (~25 cities) so the dropdown stays
// browsable. Codes match what `mockFlights.ts` expects for route detection —
// pick a preset there, you'll find the airport listed here.
//
// `region` is used purely to group the picker — we show one heading per
// region so a long flat list doesn't feel daunting.

export type AirportRegion =
  | "Europe"
  | "Middle East"
  | "Asia"
  | "North America"
  | "Caribbean"
  | "Oceania"
  | "South America"
  | "Africa";

export type Airport = {
  code: string;       // 3-letter IATA code, e.g. "LHR" — this is what we store in FlightLeg.from / .to
  city: string;       // City name shown as the primary label, e.g. "London"
  airport?: string;   // Optional airport name shown as a subtitle, e.g. "Heathrow"
  country: string;
  region: AirportRegion;
};

export const AIRPORTS: Airport[] = [
  // ── Europe ─────────────────────────────────────────────────────────────
  { code: "LHR", city: "London",     airport: "Heathrow",            country: "United Kingdom", region: "Europe" },
  { code: "CDG", city: "Paris",      airport: "Charles de Gaulle",   country: "France",         region: "Europe" },
  { code: "ZRH", city: "Zurich",     airport: "Kloten",              country: "Switzerland",    region: "Europe" },
  { code: "AMS", city: "Amsterdam",  airport: "Schiphol",            country: "Netherlands",    region: "Europe" },
  { code: "FRA", city: "Frankfurt",  airport: "Frankfurt am Main",   country: "Germany",        region: "Europe" },
  { code: "MAD", city: "Madrid",     airport: "Barajas",             country: "Spain",          region: "Europe" },
  { code: "BCN", city: "Barcelona",  airport: "El Prat",             country: "Spain",          region: "Europe" },
  { code: "BER", city: "Berlin",     airport: "Brandenburg",         country: "Germany",        region: "Europe" },
  { code: "FCO", city: "Rome",       airport: "Fiumicino",           country: "Italy",          region: "Europe" },
  { code: "IST", city: "Istanbul",   airport: "Istanbul Airport",    country: "Türkiye",        region: "Europe" },

  // ── Middle East ────────────────────────────────────────────────────────
  { code: "DXB", city: "Dubai",      airport: "Dubai International", country: "UAE",            region: "Middle East" },
  { code: "DOH", city: "Doha",       airport: "Hamad International", country: "Qatar",          region: "Middle East" },

  // ── Asia ───────────────────────────────────────────────────────────────
  { code: "SIN", city: "Singapore",  airport: "Changi",              country: "Singapore",      region: "Asia" },
  { code: "BKK", city: "Bangkok",    airport: "Suvarnabhumi",        country: "Thailand",       region: "Asia" },
  { code: "HKG", city: "Hong Kong",  airport: "Hong Kong Int'l",     country: "Hong Kong SAR",  region: "Asia" },
  { code: "NRT", city: "Tokyo",      airport: "Narita",              country: "Japan",          region: "Asia" },
  { code: "ICN", city: "Seoul",      airport: "Incheon",             country: "South Korea",    region: "Asia" },

  // ── North America ──────────────────────────────────────────────────────
  { code: "JFK", city: "New York",   airport: "John F. Kennedy",     country: "United States",  region: "North America" },
  { code: "LAX", city: "Los Angeles",airport: "LAX",                 country: "United States",  region: "North America" },
  { code: "SFO", city: "San Francisco", airport: "SFO",              country: "United States",  region: "North America" },
  { code: "ORD", city: "Chicago",    airport: "O'Hare",              country: "United States",  region: "North America" },
  { code: "YYZ", city: "Toronto",    airport: "Pearson",             country: "Canada",         region: "North America" },

  // ── Caribbean ──────────────────────────────────────────────────────────
  { code: "POS", city: "Port of Spain", airport: "Piarco",           country: "Trinidad & Tobago", region: "Caribbean" },
  { code: "BGI", city: "Bridgetown", airport: "Grantley Adams",      country: "Barbados",       region: "Caribbean" },
  { code: "GND", city: "Grenada",    airport: "Maurice Bishop",      country: "Grenada",        region: "Caribbean" },

  // ── Oceania ────────────────────────────────────────────────────────────
  { code: "SYD", city: "Sydney",     airport: "Kingsford Smith",     country: "Australia",      region: "Oceania" },
  { code: "MEL", city: "Melbourne",  airport: "Tullamarine",         country: "Australia",      region: "Oceania" },
  { code: "BNE", city: "Brisbane",   airport: "Brisbane Airport",    country: "Australia",      region: "Oceania" },
  { code: "AKL", city: "Auckland",   airport: "Auckland Int'l",      country: "New Zealand",    region: "Oceania" },
  { code: "CHC", city: "Christchurch", airport: "Christchurch Int'l",country: "New Zealand",    region: "Oceania" },
  { code: "NAN", city: "Nadi",       airport: "Nadi International",  country: "Fiji",           region: "Oceania" },

  // ── South America ──────────────────────────────────────────────────────
  { code: "EZE", city: "Buenos Aires", airport: "Ezeiza",            country: "Argentina",      region: "South America" },
  { code: "GRU", city: "São Paulo",  airport: "Guarulhos",           country: "Brazil",         region: "South America" },

  // ── Africa ─────────────────────────────────────────────────────────────
  { code: "JNB", city: "Johannesburg", airport: "O. R. Tambo",       country: "South Africa",   region: "Africa" },
  { code: "CPT", city: "Cape Town",  airport: "Cape Town Int'l",     country: "South Africa",   region: "Africa" },
];

// Region order in the dropdown — we hand-pick this rather than alphabetical
// so the most-used hubs (Europe, then Middle East gateways) come first.
export const REGION_ORDER: AirportRegion[] = [
  "Europe",
  "Middle East",
  "Asia",
  "North America",
  "Caribbean",
  "Oceania",
  "South America",
  "Africa",
];

// Look up an airport by its IATA code. We normalise to upper-case + trim so a
// stray space or lowercase entry still matches ("lhr " → "LHR").
export function findAirportByCode(code: string): Airport | undefined {
  const normalised = code.trim().toUpperCase();
  return AIRPORTS.find((a) => a.code === normalised);
}

// Human label shown inside the picker trigger after the user has chosen a
// city — e.g. "London (LHR)". Falls back to the raw value if the code isn't
// in our catalogue, so manual typing still renders something readable.
export function airportDisplayLabel(value: string): string {
  if (!value) return "";
  const a = findAirportByCode(value);
  return a ? `${a.city} (${a.code})` : value;
}
