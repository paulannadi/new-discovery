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

import React, { useEffect } from "react";
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
  center: [number, number]; // [latitude, longitude]
  zoom: number;
  /** Called when hovering a marker — passes the marker id, or null on leave */
  onMarkerHover?: (id: string | null) => void;
  className?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// MapCentreUpdater — internal helper component
//
// react-leaflet's MapContainer doesn't re-render when `center` or `zoom` props
// change (it only reads them once on mount). This internal component uses the
// `useMap()` hook to access the live map instance and imperatively move it
// when the `center` prop changes — for example, when the user switches from
// one destination to another.
// ─────────────────────────────────────────────────────────────────────────────
const MapCentreUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
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
    ">
      ${price}
    </div>
  `;
  return L.divIcon({
    html,
    className: "", // remove Leaflet's default white background class
    iconAnchor: [30, 16], // centre the badge horizontally, anchor at bottom
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

      {/* This invisible component keeps the map centred when props change */}
      <MapCentreUpdater center={center} zoom={zoom} />

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
