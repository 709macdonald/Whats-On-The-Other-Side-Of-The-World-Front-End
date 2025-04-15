import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  calculateAntipode,
  getCountryFromCoordinates,
} from "../../services/MapUtils";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const createGreenIcon = () => {
  return L.divIcon({
    className: "custom-marker green-marker",
    html: `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="dropShadowGreen" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000066"/>
        </filter>
        <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z"
            fill="#4CAF50" filter="url(#dropShadowGreen)"/>
        <circle cx="20" cy="12.5" r="5" fill="#2E7D32"/>
      </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createRedIcon = () => {
  return L.divIcon({
    className: "custom-marker red-marker",
    html: `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="dropShadowRed" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000066"/>
        </filter>
        <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z"
            fill="#FF5252" filter="url(#dropShadowRed)"/>
        <circle cx="20" cy="12.5" r="5" fill="white"/>
      </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createMcDonaldsIcon = () => {
  return L.divIcon({
    className: "custom-marker mcdonalds-marker",
    html: `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="dropShadowMcD" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000066"/>
        </filter>
        <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z"
            fill="#FFBC0D" filter="url(#dropShadowMcD)"/>
        <circle cx="20" cy="12.5" r="5" fill="#DA291C"/>
      </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

function MapView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

function MapBoundsController() {
  const map = useMap();

  useEffect(() => {
    map.setMinZoom(2);

    const worldBounds = [
      [-90, -180],
      [90, 180],
    ];
    map.setMaxBounds(worldBounds);

    map.on("drag", function () {
      map.panInsideBounds(worldBounds, { animate: false });
    });

    return () => {
      map.off("drag");
    };
  }, [map]);

  return null;
}

function LeafletMapComponent({
  center,
  viewTarget,
  onLocationDetails,
  nearestMcDonalds,
}) {
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [markers, setMarkers] = useState({
    original: null,
    antipode: null,
    mcdonalds: null,
  });

  const hasGeocodedOriginalRef = useRef(false);
  const hasGeocodedAntipodeRef = useRef(false);
  const lastCenterRef = useRef(null);

  useEffect(() => {
    if (nearestMcDonalds) {
      setMarkers((prevMarkers) => ({
        ...prevMarkers,
        mcdonalds: {
          lat: nearestMcDonalds.latitude,
          lng: nearestMcDonalds.longitude,
        },
      }));
    }
  }, [nearestMcDonalds]);

  useEffect(() => {
    if (!viewTarget || !center) {
      return;
    }

    if (viewTarget === "original" && markers.original) {
      setMapCenter([markers.original.lat, markers.original.lng]);
      setMapZoom(8);
    } else if (viewTarget === "antipode" && markers.antipode) {
      setMapCenter([markers.antipode.lat, markers.antipode.lng]);
      setMapZoom(8);
    } else if (viewTarget === "mcdonalds" && nearestMcDonalds) {
      setMapCenter([nearestMcDonalds.latitude, nearestMcDonalds.longitude]);
      setMapZoom(12);
    }
  }, [viewTarget, markers, nearestMcDonalds, center]);

  useEffect(() => {
    if (!center) {
      setMapCenter([0, 0]);
      setMapZoom(2);
      setMarkers({
        original: null,
        antipode: null,
        mcdonalds: null,
      });
      hasGeocodedOriginalRef.current = false;
      hasGeocodedAntipodeRef.current = false;
      lastCenterRef.current = null;
      return;
    }

    const isSameLocation =
      lastCenterRef.current &&
      lastCenterRef.current.lat === center.lat &&
      lastCenterRef.current.lng === center.lng;

    if (isSameLocation) {
      return;
    }

    lastCenterRef.current = { ...center };

    hasGeocodedOriginalRef.current = false;
    hasGeocodedAntipodeRef.current = false;

    const antipode = calculateAntipode(center.lat, center.lng);

    setMarkers((prevMarkers) => ({
      original: center,
      antipode: antipode,
      mcdonalds: nearestMcDonalds
        ? {
            lat: nearestMcDonalds.latitude,
            lng: nearestMcDonalds.longitude,
          }
        : prevMarkers.mcdonalds,
    }));

    setMapCenter([antipode.lat, antipode.lng]);
    setMapZoom(8);

    const fetchLocationDetails = async () => {
      try {
        if (
          !hasGeocodedOriginalRef.current ||
          !hasGeocodedAntipodeRef.current
        ) {
          hasGeocodedOriginalRef.current = true;
          hasGeocodedAntipodeRef.current = true;

          const originalCountry = await getCountryFromCoordinates(
            center.lat,
            center.lng
          );
          const antipodeCountry = await getCountryFromCoordinates(
            antipode.lat,
            antipode.lng
          );

          if (onLocationDetails) {
            onLocationDetails({
              original: center,
              antipode: antipode,
              originalCountry,
              antipodeCountry,
            });
          }
        }
      } catch (error) {
        console.error("Error getting location details:", error);
      }
    };

    fetchLocationDetails();
  }, [center, nearestMcDonalds, onLocationDetails]);

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={true}
        minZoom={2}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapView center={mapCenter} zoom={mapZoom} />
        <MapBoundsController />

        {markers.original && (
          <Marker
            position={[markers.original.lat, markers.original.lng]}
            icon={createGreenIcon()}
          >
            <Popup>
              Your Location
              <br />
              {markers.original.lat.toFixed(4)}°,{" "}
              {markers.original.lng.toFixed(4)}°
            </Popup>
          </Marker>
        )}

        {markers.antipode && (
          <Marker
            position={[markers.antipode.lat, markers.antipode.lng]}
            icon={createRedIcon()}
          >
            <Popup>
              Antipode Location
              <br />
              {markers.antipode.lat.toFixed(4)}°,{" "}
              {markers.antipode.lng.toFixed(4)}°
            </Popup>
          </Marker>
        )}

        {markers.mcdonalds &&
          viewTarget === "mcdonalds" &&
          nearestMcDonalds && (
            <Marker
              position={[markers.mcdonalds.lat, markers.mcdonalds.lng]}
              icon={createMcDonaldsIcon()}
            >
              <Popup>
                Nearest McDonald's
                <br />
                {nearestMcDonalds?.name || "McDonald's"}
                <br />({nearestMcDonalds?.distance.toFixed(2)} km away)
              </Popup>
            </Marker>
          )}
      </MapContainer>
    </div>
  );
}

export default LeafletMapComponent;
