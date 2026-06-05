// Airline code → logo URL map.
//
// Resolution order in getAirlineLogo():
//   1. Local SVGs in /public/airline-logos/{code}.svg — these are curated,
//      load fastest, and keep working offline. Use for any airline we
//      surface a lot.
//   2. Daisycon public image CDN — predictable URL per IATA code, free to
//      hot-link, CORS open. Covers most major carriers. Note that Daisycon
//      returns a generic placeholder PNG for unknown codes (not a 404), so
//      the onError handler in FlightResultCard won't catch them — but every
//      airline in our catalogues is a real one, so this is fine in practice.
//
// The fallback chain means we can add a new carrier (e.g. "BW" / "FJ") to a
// flight catalogue and get a real-looking logo for free, without touching
// this file.
//
// Local SVGs are served under the Vite `base` (this project uses
// `base: '/new-discovery/'`), resolved via `import.meta.env.BASE_URL` so
// the same map works at `/`, `/new-discovery/`, or any future deploy path.

const BASE = import.meta.env.BASE_URL; // ends with "/"

// Daisycon hosts logos at:
//   https://images.daisycon.io/airline?iata={IATA}&width={w}&height={h}
// We request 300×150 — bigger than our 24px display height so it stays
// crisp on retina displays without being wasteful. CORS is open, so the
// browser can render these directly without a proxy.
const DAISYCON_BASE = "https://images.daisycon.io/airline";

export const AIRLINE_LOGOS: Record<string, string> = {
  BA:  `${BASE}airline-logos/BA.svg`,   // British Airways
  EZY: `${BASE}airline-logos/EZY.svg`,  // easyJet
  EK:  `${BASE}airline-logos/EK.svg`,   // Emirates
  KL:  `${BASE}airline-logos/KL.svg`,   // KLM
  TG:  `${BASE}airline-logos/TG.svg`,   // Thai Airways
  LH:  `${BASE}airline-logos/LH.svg`,   // Lufthansa
  SQ:  `${BASE}airline-logos/SQ.svg`,   // Singapore Airlines
  TK:  `${BASE}airline-logos/TK.svg`,   // Turkish Airlines
};

export function getAirlineLogo(code: string): string | undefined {
  if (!code) return undefined;
  // 1. Local SVG override (curated)
  if (AIRLINE_LOGOS[code]) return AIRLINE_LOGOS[code];
  // 2. Daisycon CDN fallback — uppercased IATA in the query
  return `${DAISYCON_BASE}?iata=${code.toUpperCase()}&width=300&height=150`;
}
