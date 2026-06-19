// ── Stopover airline configuration ───────────────────────────────────────────
// The Stopover tab can be presented as one of several airlines. Everything that
// is airline-specific — the carrier name, its 2-letter code, the stopover hub,
// and which routes (origins × destinations) it sells — lives HERE, in one place.
//
// Why one file? The same three facts are needed by several screens at once:
//   • the search form  (which airports to allow in the pickers),
//   • the results page (which carrier's flat fares to show),
//   • the UI labels    ("Explore Nadi" vs "Explore Port of Spain").
// Keeping them in a single config object means switching the airline in Settings
// updates every screen consistently — there's only one thing to change.

// The set of airlines the Stopover tab can represent. Add a new id here (and a
// matching entry in STOPOVER_AIRLINES below) to offer another airline later.
export type StopoverAirlineId = "fiji" | "caribbean";

export type StopoverAirlineConfig = {
  id: StopoverAirlineId;
  name: string; // Display name, e.g. "Fiji Airways"
  airlineCode: string; // 2-letter IATA code — used to filter flat flights ("FJ", "BW")
  hubCity: string; // The stopover city, e.g. "Nadi" — shown in labels
  hubCode: string; // The hub airport code, e.g. "NAN"
  originCodes: string[]; // Airports the traveller can depart FROM (restricts the picker)
  destinationCodes: string[]; // Airports the traveller can fly TO (restricts the picker)
};

// The actual airline definitions. Keyed by id so a screen can look up the
// currently-selected airline with STOPOVER_AIRLINES[settings.stopoverAirline].
export const STOPOVER_AIRLINES: Record<StopoverAirlineId, StopoverAirlineConfig> = {
  // Fiji Airways — the original stopover story. Flights from the US West Coast
  // to Australia/New Zealand break for a few nights in Nadi (NAN).
  fiji: {
    id: "fiji",
    name: "Fiji Airways",
    airlineCode: "FJ",
    hubCity: "Nadi",
    hubCode: "NAN",
    originCodes: ["LAX", "SFO"],
    destinationCodes: ["SYD", "MEL", "BNE", "AKL", "CHC"],
  },
  // Caribbean Airlines — flights from North American gateways to the smaller
  // Caribbean islands break for a few nights in Port of Spain (POS), Trinidad.
  caribbean: {
    id: "caribbean",
    name: "Caribbean Airlines",
    airlineCode: "BW",
    hubCity: "Port of Spain",
    hubCode: "POS",
    originCodes: ["JFK", "YYZ"],
    destinationCodes: ["GND", "BGI", "KIN", "GEO", "ANU"],
  },
};
