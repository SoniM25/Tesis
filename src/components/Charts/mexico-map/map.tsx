"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Coordenadas de Apizaco, Tlaxcala
const APIZACO_COORDS: [number, number] = [19.4167, -98.1333];

// Crear icono personalizado para el marcador
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">☀</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Componente para ajustar la vista del mapa
function MapController() {
  const map = useMap();

  useEffect(() => {
    map.setView(APIZACO_COORDS, 6);
  }, [map]);

  return null;
}

export default function MexicoMapComponent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-[422px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="text-gray-500 dark:text-gray-400">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="h-[422px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={APIZACO_COORDS}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={APIZACO_COORDS} icon={createCustomIcon()}>
          <Popup>
            <div className="p-2 text-center">
              <h3 className="text-lg font-bold text-amber-600">
                Apizaco, Tlaxcala
              </h3>
              <p className="mt-1 text-sm text-gray-600">México</p>
              <div className="mt-2 text-xs text-gray-500">
                <p>Latitud: 19.4167°N</p>
                <p>Longitud: 98.1333°W</p>
              </div>
              <div className="mt-2 border-t border-gray-200 pt-2">
                <p className="text-xs font-medium text-amber-600">
                  📊 Estación de monitoreo solar
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
        <MapController />
      </MapContainer>
    </div>
  );
}
