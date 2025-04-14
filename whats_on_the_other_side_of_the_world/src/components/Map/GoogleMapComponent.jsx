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

  // Store the current locations for zoom controls
  const [currentLocations, setCurrentLocations] = useState({
    original: null,
    antipode: null,
    mcdonalds: null,
  });

  // Initialize map
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
      newMapElement.setAttribute("center", "0,0"); // Default center

      mapContainerRef.current.appendChild(newMapElement);
      setMapElement(newMapElement);
    }
  }, [mapElement]);

  // Handle view target changes (for zoom buttons)
  useEffect(() => {
    if (!mapElement || !viewTarget) {
      return;
    }

    let centerPoint;
    let zoomLevel;

    // Remove McDonald's marker if we're not viewing it anymore
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

  // Update map with McDonald's marker
  useEffect(() => {
    if (!mapElement || !nearestMcDonalds || viewTarget !== "mcdonalds") return;

    // Update current locations with McDonalds
    setCurrentLocations((prev) => ({
      ...prev,
      mcdonalds: nearestMcDonalds,
    }));

    // Remove old McDonald's marker if it exists
    if (markers.mcdonalds && markers.mcdonalds.parentNode === mapElement) {
      mapElement.removeChild(markers.mcdonalds);
    }

    // Create and add McDonald's marker
    const mcdonaldsMarker = document.createElement("gmp-advanced-marker");
    const mcdonaldsPosition = `${nearestMcDonalds.latitude},${nearestMcDonalds.longitude}`;
    mcdonaldsMarker.setAttribute("position", mcdonaldsPosition);
    mcdonaldsMarker.setAttribute(
      "title",
      `McDonald's: ${nearestMcDonalds.name}`
    );

    // Try to set a custom element for the McDonald's marker
    try {
      const mcdonaldsMarkerElement = createMcDonaldsMarker();
      mcdonaldsMarker.appendChild(mcdonaldsMarkerElement);
    } catch (error) {
      console.error("Error creating custom McDonald's marker:", error);
    }

    mapElement.appendChild(mcdonaldsMarker);

    // Update markers state
    setMarkers((prev) => ({
      ...prev,
      mcdonalds: mcdonaldsMarker,
    }));

    // Update map center
    mapElement.setAttribute("center", mcdonaldsPosition);
    mapElement.setAttribute("zoom", "12");
  }, [nearestMcDonalds, mapElement, viewTarget]);

  // Update map center and markers on location change
  useEffect(() => {
    if (!mapElement) return;

    // If center is null (reset was clicked), reset the map to default view
    if (!center) {
      mapElement.setAttribute("center", "0,0");
      mapElement.setAttribute("zoom", "2");

      // Remove markers if they exist
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

      // Clear locations
      setCurrentLocations({
        original: null,
        antipode: null,
        mcdonalds: null,
      });

      return;
    }

    // Calculate antipode location
    const antipode = calculateAntipode(center.lat, center.lng);

    // Store the locations for zoom controls
    setCurrentLocations((prev) => ({
      ...prev,
      original: center,
      antipode: antipode,
    }));

    // Center the map on the antipode with a higher zoom level
    const antipodeString = `${antipode.lat},${antipode.lng}`;
    mapElement.setAttribute("center", antipodeString);
    mapElement.setAttribute("zoom", "8");

    // Remove old markers if they exist
    Object.values(markers).forEach((marker) => {
      if (marker && marker.parentNode === mapElement) {
        mapElement.removeChild(marker);
      }
    });

    // Create and add searched location marker
    const searchedLocationMarker = document.createElement(
      "gmp-advanced-marker"
    );
    const centerString = `${center.lat},${center.lng}`;
    searchedLocationMarker.setAttribute("position", centerString);
    searchedLocationMarker.setAttribute("title", "Searched Location");

    // Try to set a custom element for the marker
    try {
      const searchMarkerElement = createSearchedLocationMarker();
      searchedLocationMarker.appendChild(searchMarkerElement);
    } catch (error) {
      console.error("Error creating custom searched location marker:", error);
    }

    mapElement.appendChild(searchedLocationMarker);

    // Create and add antipode marker
    const antipodeMarker = document.createElement("gmp-advanced-marker");
    antipodeMarker.setAttribute("position", antipodeString);
    antipodeMarker.setAttribute("title", "Antipode (Opposite Point)");

    // Try to set a custom element for the antipode marker
    try {
      const antipodeMarkerElement = createAntipodeMarker();
      antipodeMarker.appendChild(antipodeMarkerElement);
    } catch (error) {
      console.error("Error creating custom antipode marker:", error);
    }

    mapElement.appendChild(antipodeMarker);

    // Update markers state
    setMarkers({
      searchedLocation: searchedLocationMarker,
      antipode: antipodeMarker,
      mcdonalds: markers.mcdonalds,
    });

    // Add a small delay before zooming in to ensure the map has updated properly
    setTimeout(() => {
      mapElement.setAttribute("center", antipodeString);
      mapElement.setAttribute("zoom", "8");
    }, 300);

    // Get country information for both locations
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
