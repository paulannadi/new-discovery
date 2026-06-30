// ─────────────────────────────────────────────────────────────────────────────
// zipLookup — mock "ZIP code → city" resolver
//
// In production a postal-address service (e.g. Google Places / an internal API)
// turns a ZIP code into the city it belongs to, so the traveller can confirm
// they typed it correctly. For the prototype we fake that with a small lookup
// keyed on the first two digits of a German 5-digit Postleitzahl (PLZ) — that's
// enough to cover the coach tour's German departure regions plus a few more.
//
// Returns the city name when we can resolve it, or null when the ZIP is empty,
// the wrong length, or outside our mock table (so the UI can stay quiet rather
// than guess).
// ─────────────────────────────────────────────────────────────────────────────

// Map of the first two PLZ digits → city. German postal codes run 01xxx–99xxx
// and are roughly geographic, so the leading pair is a decent "region" key for
// a mock. Not exhaustive — just a believable spread of major cities.
const ZIP_PREFIX_TO_CITY: Record<string, string> = {
  "01": "Dresden",
  "04": "Leipzig",
  "10": "Berlin",
  "12": "Berlin",
  "13": "Berlin",
  "14": "Potsdam",
  "20": "Hamburg",
  "22": "Hamburg",
  "28": "Bremen",
  "30": "Hannover",
  "31": "Hildesheim",
  "40": "Düsseldorf",
  "44": "Dortmund",
  "50": "Köln",
  "60": "Frankfurt am Main",
  "70": "Stuttgart",
  "79": "Freiburg",
  "80": "München",
  "81": "München",
  "90": "Nürnberg",
};

export function lookupCityFromZip(zip: string): string | null {
  // Keep only digits, so spaces / stray characters don't break the match.
  const digits = zip.replace(/\D/g, "");
  // German PLZ are exactly 5 digits — wait for a complete code before resolving.
  if (digits.length !== 5) return null;
  return ZIP_PREFIX_TO_CITY[digits.slice(0, 2)] ?? null;
}
