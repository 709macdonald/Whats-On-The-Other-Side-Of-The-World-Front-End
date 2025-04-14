import React, { useRef, useEffect, useState } from "react";
import {
  calculateAntipode,
  getCountryFromCoordinates,
} from "../../services/MapUtils";
import {
  createSearchedLocationMarker,
  createAntipodeMarker,
  createMcDonaldsMarker,
} from "./MapMarkers";

function GoogleMapComponent({
  center,
  viewTarget,
  onLocationDetails,
  nearestMcDonalds,
}) {
  const mapContainerRef = useRef(null);
  const [mapElement, setMapElement] = useState(null);
  const [markers, setMarkers] = useState({
    searchedLocation: null,
    antipode: null,
    mcdonalds: null,
  });

  const [currentLocations, setCurrentLocations] = useState({
    original: null,
    antipode: null,
    mcdonalds: null,
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (
      !mapElement &&
      window.customElements &&
      window.customElements.get("gmp-map")
    ) {
      mapContainerRef.current.innerHTML = "";

      const newMapElement = document.createElement("gmp-map");
      newMapElement.setAttribute("zoom", "2");
      newMapElement.setAttribute("map-id", "DEMO_MAP_ID");
      newMapElement.setAttribute("center", "0,0");

      mapContainerRef.current.appendChild(newMapElement);
      setMapElement(newMapElement);
    }
  }, [mapElement]);

  useEffect(() => {
    if (!mapElement || !viewTarget) {
      return;
    }

    let centerPoint;
    let zoomLevel;

    if (
      viewTarget !== "mcdonalds" &&
      markers.mcdonalds &&
      markers.mcdonalds.parentNode === mapElement
    ) {
      mapElement.removeChild(markers.mcdonalds);
      setMarkers((prev) => ({
        ...prev,
        mcdonalds: null,
      }));
    }

    if (viewTarget === "original" && currentLocations.original) {
      centerPoint = `${currentLocations.original.lat},${currentLocations.original.lng}`;
      zoomLevel = "8";
    } else if (viewTarget === "antipode" && currentLocations.antipode) {
      centerPoint = `${currentLocations.antipode.lat},${currentLocations.antipode.lng}`;
      zoomLevel = "8";
    } else if (viewTarget === "mcdonalds" && currentLocations.mcdonalds) {
      centerPoint = `${currentLocations.mcdonalds.latitude},${currentLocations.mcdonalds.longitude}`;
      zoomLevel = "12";
    } else if (viewTarget === "both") {
      centerPoint = "0,0";
      zoomLevel = "2";
    }

    if (centerPoint && zoomLevel) {
      mapElement.setAttribute("center", centerPoint);
      mapElement.setAttribute("zoom", zoomLevel);
    }
  }, [viewTarget, mapElement, currentLocations, markers]);

  useEffect(() => {
    if (!mapElement || !nearestMcDonalds || viewTarget !== "mcdonalds") return;

    setCurrentLocations((prev) => ({
      ...prev,
      mcdonalds: nearestMcDonalds,
    }));

    if (markers.mcdonalds && markers.mcdonalds.parentNode === mapElement) {
      mapElement.removeChild(markers.mcdonalds);
    }

    const mcdonaldsMarker = document.createElement("gmp-advanced-marker");
    const mcdonaldsPosition = `${nearestMcDonalds.latitude},${nearestMcDonalds.longitude}`;
    mcdonaldsMarker.setAttribute("position", mcdonaldsPosition);
    mcdonaldsMarker.setAttribute(
      "title",
      `McDonald's: ${nearestMcDonalds.name}`
    );

    try {
      const mcdonaldsMarkerElement = createMcDonaldsMarker();
      mcdonaldsMarker.appendChild(mcdonaldsMarkerElement);
    } catch (error) {
      console.error("Error creating custom McDonald's marker:", error);
    }

    mapElement.appendChild(mcdonaldsMarker);

    setMarkers((prev) => ({
      ...prev,
      mcdonalds: mcdonaldsMarker,
    }));

    mapElement.setAttribute("center", mcdonaldsPosition);
    mapElement.setAttribute("zoom", "12");
  }, [nearestMcDonalds, mapElement, viewTarget]);

  useEffect(() => {
    if (!mapElement) return;

    if (!center) {
      mapElement.setAttribute("center", "0,0");
      mapElement.setAttribute("zoom", "2");

      Object.values(markers).forEach((marker) => {
        if (marker && marker.parentNode === mapElement) {
          mapElement.removeChild(marker);
        }
      });

      setMarkers({
        searchedLocation: null,
        antipode: null,
        mcdonalds: null,
      });

      setCurrentLocations({
        original: null,
        antipode: null,
        mcdonalds: null,
      });

      return;
    }

    const antipode = calculateAntipode(center.lat, center.lng);

    setCurrentLocations((prev) => ({
      ...prev,
      original: center,
      antipode: antipode,
    }));

    const antipodeString = `${antipode.lat},${antipode.lng}`;
    mapElement.setAttribute("center", antipodeString);
    mapElement.setAttribute("zoom", "8");

    Object.values(markers).forEach((marker) => {
      if (marker && marker.parentNode === mapElement) {
        mapElement.removeChild(marker);
      }
    });

    const searchedLocationMarker = document.createElement(
      "gmp-advanced-marker"
    );
    const centerString = `${center.lat},${center.lng}`;
    searchedLocationMarker.setAttribute("position", centerString);
    searchedLocationMarker.setAttribute("title", "Searched Location");

    try {
      const searchMarkerElement = createSearchedLocationMarker();
      searchedLocationMarker.appendChild(searchMarkerElement);
    } catch (error) {
      console.error("Error creating custom searched location marker:", error);
    }

    mapElement.appendChild(searchedLocationMarker);

    const antipodeMarker = document.createElement("gmp-advanced-marker");
    antipodeMarker.setAttribute("position", antipodeString);
    antipodeMarker.setAttribute("title", "Antipode (Opposite Point)");

    try {
      const antipodeMarkerElement = createAntipodeMarker();
      antipodeMarker.appendChild(antipodeMarkerElement);
    } catch (error) {
      console.error("Error creating custom antipode marker:", error);
    }

    mapElement.appendChild(antipodeMarker);

    setMarkers({
      searchedLocation: searchedLocationMarker,
      antipode: antipodeMarker,
      mcdonalds: markers.mcdonalds,
    });

    setTimeout(() => {
      mapElement.setAttribute("center", antipodeString);
      mapElement.setAttribute("zoom", "8");
    }, 300);

    const fetchLocationDetails = async () => {
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
    };

    fetchLocationDetails();
  }, [center, mapElement]);

  return <div ref={mapContainerRef} className="map-container" />;
}

export default GoogleMapComponent;
