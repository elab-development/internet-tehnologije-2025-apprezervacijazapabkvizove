"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useMemo, useState } from "react";
import {
  Circle,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LatLngTuple = [number, number];

function ClickToAddMarker({
  onPick,
}: {
  onPick: (pos: LatLngTuple) => void;
}) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

export default function Map() {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;


  const position: LatLngTuple = [44.794507097199535, 20.4757586];


  const [pickedPos, setPickedPos] = useState<LatLngTuple | null>(null);



  if (!key) {
    return (
      <div style={{ padding: 12 }}>
        Mapa trenutno nije dostupna (nedostaje MapTiler API ključ).
      </div>
    );
  }

  const { BaseLayer } = LayersControl;

  return (
    <div style={{ height: "420px", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        {}
        <LayersControl position="topright">
          <BaseLayer checked name="Streets">
            <TileLayer
              url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${key}`}
              attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
            />
          </BaseLayer>

          <BaseLayer name="Satellite">
            <TileLayer
              url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${key}`}
              attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
            />
          </BaseLayer>
        </LayersControl>

        {}
        <Marker position={position}>
          <Popup>
            <div style={{ lineHeight: 1.4 }}>
              <b>Egzibicija Pab Kviz</b>
              <br />
              Via Stella
              <br />
            </div>
          </Popup>
        </Marker>

        <Circle
          center={position}
          radius={300} // metara
          pathOptions={{ weight: 2 }}
        >
          <Popup>Zona ~300m (oko 5 min peške)</Popup>
        </Circle>

        <ClickToAddMarker onPick={setPickedPos} />

        {pickedPos && (
          <Marker position={pickedPos}>
            <Popup>
              Tvoja tačka: <br />
              {pickedPos[0].toFixed(6)}, {pickedPos[1].toFixed(6)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}