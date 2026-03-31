/**
 * LeafletMap.tsx — Reusable interactive map component
 *
 * This wraps the open-source Leaflet library (via react-leaflet) to give us
 * a real, interactive map instead of the static photo placeholder we had before.
 *
 * How it works at a high level:
 * - We render a `MapContainer` (the map itself) with a tile layer (the actual
 *   map imagery from OpenStreetMap, which is free to use).
 * - We place custom `Marker` pins for each location passed in as props.
 * - Each marker can show a price badge (like "£125/n") instead of a default pin.
 * - Hovering over a marker calls back to the parent so the hotel list can also
 *   highlight the corresponding card.
 */

import React, { useEffect, useRef } from "react";
// react-leaflet gives us React components that wrap the Leaflet JS library
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// Leaflet's own CSS — required for the map to display correctly
import "leaflet/dist/leaflet.css";
// L is the main Leaflet object — we use it to create custom icons
import L from "leaflet";

// ─────────────────────────────────────────────────────────────────────────────
// FIX: Leaflet Default Icon Bug
//
// This is a well-known issue: Leaflet's default marker images are loaded via
// a webpack/vite asset path that breaks in bundlers. The fix is to manually
// tell Leaflet where to find the icon images (from the leaflet npm package).
// You can ignore the TypeScript casting here — it's just how this fix works.
// ─────────────────────────────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MapMarkerData = {
  id: string;
  lat: number;
  lng: number;
  /** The place name shown in the popup when you click a marker */
  label: string;
  /** Optional price shown on the badge, e.g. "£125" */
  price?: string;
  /** When true, the marker badge gets a highlighted (blue) style */
  isHighlighted?: boolean;
};

type LeafletMapProps = {
  markers: MapMarkerData[];
  center: [number, number]; // [latitude, longitude] — fallback when no markers exist
  zoom: number;             // fallback zoom — only used when there are no markers
  /**
   * A string that identifies the current "view context" (e.g. the destination
   * code). The map re-fits to the marker bounds exactly once per unique key.
   * After that, the user can freely pan and zoom without the map resetting.
   */
  centerKey?: string;
  /** Called when hovering a marker — passes the marker id, or null on leave */
  onMarkerHover?: (id: string | null) => void;
  className?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// MapCentreUpdater — internal helper component
//
// Fires fitBounds (or flyTo) exactly ONCE per centerKey. After the initial
// fit the user can freely pan and zoom — nothing will snap the map back.
//
// How it works:
//   - lastKeyRef tracks which centerKey we already positioned for.
//   - When centerKey changes (new destination) we re-fit to the new markers.
//   - If markers aren't loaded yet when the key changes we fall back to the
//     destination's own lat/lng so the map at least moves to the right region.
//   - Subsequent marker updates for the *same* key (e.g. live results arriving)
//     are intentionally ignored — we don't want to jerk the map around.
// ─────────────────────────────────────────────────────────────────────────────
const MapCentreUpdater = ({
  markers,
  center,
  zoom,
  centerKey,
}: {
  markers: MapMarkerData[];
  center: [number, number];
  zoom: number;
  centerKey?: string;
}) => {
  const map = useMap();
  const lastKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only act when the destination (centerKey) actually changes.
    if (centerKey === lastKeyRef.current) return;
    lastKeyRef.current = centerKey;

    if (markers.length > 0) {
      // Fit the map tightly around all hotel pins for this destination.
      // padding keeps the outermost pins away from the map edge.
      // maxZoom prevents zooming in so far that only one hotel fills the screen.
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    } else {
      // No markers yet — at least move to the destination's region.
      map.setView(center, zoom);
    }
  }, [centerKey, markers, center, zoom, map]);

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// createPriceIcon — builds a custom Leaflet icon for price badges
//
// Instead of the default teardrop marker, we create an HTML-based icon that
// looks like a pill badge showing the price (e.g. "£125"). This matches the
// visual style you'll see on Booking.com or Google Hotels.
//
// `isHighlighted` makes the badge blue so it pops when a card is hovered.
// ─────────────────────────────────────────────────────────────────────────────
const createPriceIcon = (price: string, isHighlighted: boolean) => {
  const bg = isHighlighted ? "#2681FF" : "#333743";
  // Estimate the rendered width so we can centre the badge on its lat/lng point.
  // Each character in the 12px bold font is ~7.5px wide; add 16px for left+right padding.
  const estimatedWidth = Math.round(price.length * 7.5 + 16);
  const height = 26;
  const html = `
    <div style="
      background: ${bg};
      color: white;
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      transition: background 0.2s;
      font-family: system-ui, sans-serif;
      display: inline-block;
    ">
      ${price}
    </div>
  `;
  return L.divIcon({
    html,
    className: "", // remove Leaflet's default white background class
    // Centre the badge horizontally and anchor its bottom edge at the marker point
    iconSize: [estimatedWidth, height],
    iconAnchor: [estimatedWidth / 2, height],
  });
};

// Default plain pin icon (used when no price is provided, e.g. destination pins)
const createDestinationIcon = (isHighlighted: boolean) => {
  const bg = isHighlighted ? "#2681FF" : "#2681FF";
  const html = `
    <div style="
      width: 14px;
      height: 14px;
      background: ${bg};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconAnchor: [7, 7],
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LeafletMap — the main exported component
// ─────────────────────────────────────────────────────────────────────────────

const LeafletMap: React.FC<LeafletMapProps> = ({
  markers,
  center,
  zoom,
  centerKey,
  onMarkerHover,
  className = "",
}) => {
  return (
    // MapContainer sets up the Leaflet map. `style` must set a height — Leaflet
    // won't render without an explicit height on its container element.
    <MapContainer
      center={center}
      zoom={zoom}
      // We pass className for the outer container sizing, but we also need
      // inline style because Leaflet requires an explicit height
      className={`w-full h-full ${className}`}
      style={{ height: "100%", width: "100%" }}
      // scrollWheelZoom lets users zoom with the mouse wheel (standard map behaviour)
      scrollWheelZoom={true}
    >
      {/* TileLayer loads the actual map tiles from OpenStreetMap.
          attribution is required by OSM's usage policy. */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* This invisible component fits the map to hotel bounds once per destination.
          After that it stays out of the way so the user can freely pan and zoom. */}
      <MapCentreUpdater markers={markers} center={center} zoom={zoom} centerKey={centerKey} />

      {/* Render a marker for each location */}
      {markers.map((marker) => {
        // Choose the right icon style depending on whether we have a price
        const icon = marker.price
          ? createPriceIcon(marker.price, !!marker.isHighlighted)
          : createDestinationIcon(!!marker.isHighlighted);

        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={icon}
            // eventHandlers lets us respond to Leaflet mouse events on a marker
            eventHandlers={{
              mouseover: () => onMarkerHover?.(marker.id),
              mouseout: () => onMarkerHover?.(null),
            }}
          >
            {/* Popup appears when you click a marker */}
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-[#333743]">{marker.label}</div>
                {marker.price && (
                  <div className="text-[#2681FF] font-bold mt-0.5">{marker.price} / night</div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMap;
