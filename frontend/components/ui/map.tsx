"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix za marker ikone
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map() {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  const position: [number, number] = [44.794507097199535, 20.4757586]; 

  if (!key) return <div>API key missing</div>;

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${key}`}
          attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
        />
        <Marker position={position}>
          <Popup>Via Stella</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
