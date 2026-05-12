// ─────────────────────────────────────────────────────────────────────────────
// TourRouteMap — Leaflet map showing numbered day pins connected by a route.
//
// Three exports:
//   • createDayPinIcon — custom round numbered pin used on each marker
//   • TourRouteMap     — full map card with heading + outer card wrapper
//                        (used as a standalone section, e.g. "Route" tab)
//   • TourRouteMapInline — bare map filling its parent container, no heading
//                          (used inside the Overview card alongside the stops list)
//
// Both variants accept `TourStop[]`. Stops without lat/lng are silently filtered
// out so partial mock data doesn't crash the page.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { TourStop } from "../../../types";

// Reads the --primary CSS variable so the route polyline matches the theme.
// We have to resolve it as an actual hex/rgb string because Leaflet props
// don't understand Tailwind/CSS variables.
function getPrimaryColor(): string {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "#2681ff"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// createDayPinIcon — circular numbered pin (e.g. "1", "2") for each stop.
// Blue circle with white number — visually ties back to the day pills.
// ─────────────────────────────────────────────────────────────────────────────
export function createDayPinIcon(dayNumber: number) {
  const html = `
    <div style="
      width: 28px; height: 28px;
      background: var(--primary);
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      font-size: 12px;
      font-weight: 700;
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    ">${dayNumber}</div>
  `;
  return L.divIcon({ html, className: "", iconSize: [28, 28], iconAnchor: [14, 14] });
}

// ─────────────────────────────────────────────────────────────────────────────
// MapFitter — internal helper. Fits the map to the bounds of all stops once
// on mount, then leaves the user free to pan/zoom.
// ─────────────────────────────────────────────────────────────────────────────
function MapFitter({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || positions.length === 0) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    fitted.current = true;
  }, [positions, map]);
  return null;
}

// Filters and orders stops, then returns the bare map nodes. Both public
// variants share this so we don't duplicate the marker/polyline rendering.
function MapBody({ stops }: { stops: TourStop[] }) {
  const stopsWithCoords = stops.filter(
    (s): s is TourStop & { lat: number; lng: number } =>
      s.lat != null && s.lng != null
  );

  if (stopsWithCoords.length === 0) return null;

  const routePositions: [number, number][] = stopsWithCoords.map((s) => [s.lat, s.lng]);
  const center: [number, number] = [stopsWithCoords[0].lat, stopsWithCoords[0].lng];

  return (
    <MapContainer
      center={center}
      zoom={6}
      className="w-full h-full"
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapFitter positions={routePositions} />

      {/* Dashed route line connecting every stop in order */}
      <Polyline
        positions={routePositions}
        pathOptions={{
          color: getPrimaryColor(),
          weight: 3,
          opacity: 0.7,
          dashArray: "8 6",
        }}
      />

      {/* Numbered pin per stop, with a popup showing stop info */}
      {stopsWithCoords.map((stop, i) => (
        <Marker
          key={stop.destinationName}
          position={[stop.lat, stop.lng]}
          icon={createDayPinIcon(i + 1)}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-bold text-foreground">{stop.destinationName}</div>
              <div className="text-muted-foreground text-xs mt-0.5">
                {stop.nights} {stop.nights === 1 ? "night" : "nights"} · {stop.dateRange}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TourRouteMap — standalone variant with section heading and card wrapper.
// Use this when the route map is its own section on the page.
// ─────────────────────────────────────────────────────────────────────────────
export function TourRouteMap({ stops }: { stops: TourStop[] }) {
  // We replicate the MapBody filter here so we can avoid rendering the heading
  // when there's nothing to show on the map.
  const stopsWithCoords = stops.filter((s) => s.lat != null && s.lng != null);
  if (stopsWithCoords.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">Tour route</h3>
      {/* relative z-0 creates a new stacking context so Leaflet's internal
          high z-indexes (tile/marker/popup panes) can't paint on top of
          sticky elements above this map (e.g. the section tab bar). */}
      <div className="relative z-0 bg-card rounded-xl shadow-sm overflow-hidden border border-border">
        <div className="h-[300px]">
          <MapBody stops={stops} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TourRouteMapInline — no heading, no card wrapper. Fills its parent container.
// Used inside the Overview card on TourDetailPage / ActivityDetailPage where
// the map sits next to the stops list inside an outer card.
// ─────────────────────────────────────────────────────────────────────────────
export function TourRouteMapInline({ stops }: { stops: TourStop[] }) {
  return <MapBody stops={stops} />;
}
