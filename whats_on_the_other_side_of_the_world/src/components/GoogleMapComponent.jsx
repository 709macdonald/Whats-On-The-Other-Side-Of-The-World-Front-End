import { useRef, useEffect, useState } from "react";

function GoogleMapComponent({ center }) {
  const mapContainerRef = useRef(null);
  const [mapElement, setMapElement] = useState(null);
  const [markerElement, setMarkerElement] = useState(null);

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
      newMapElement.setAttribute("center", "0,0"); // Original default center showing the whole world

      mapContainerRef.current.appendChild(newMapElement);
      setMapElement(newMapElement);

      console.log("Map element created and added to DOM");
    }
  }, [mapElement]);

  // Update map center and marker on location change
  useEffect(() => {
    // Log current state to help debug
    console.log("Center changed:", center);
    console.log("Map element exists:", !!mapElement);

    if (!mapElement) return;

    // If center is null (reset was clicked), reset the map to default view
    if (!center) {
      console.log("Resetting map to world view");
      mapElement.setAttribute("center", "0,0");
      mapElement.setAttribute("zoom", "2");

      // Remove marker if it exists
      if (markerElement && markerElement.parentNode === mapElement) {
        console.log("Removing marker on reset");
        mapElement.removeChild(markerElement);
        setMarkerElement(null);
      }
      return;
    }

    // Center the map on the selected location
    const centerString = `${center.lat},${center.lng}`;
    console.log("Setting map center to:", centerString);
    mapElement.setAttribute("center", centerString);
    mapElement.setAttribute("zoom", "12"); // Zoom in a bit more

    // Handle marker
    // Remove old marker if it exists
    if (markerElement && markerElement.parentNode === mapElement) {
      console.log("Removing old marker");
      mapElement.removeChild(markerElement);
      setMarkerElement(null);
    }

    // Create a new marker
    console.log("Creating new marker at:", centerString);
    const newMarker = document.createElement("gmp-advanced-marker");
    newMarker.setAttribute("position", centerString);
    newMarker.setAttribute("title", "Searched Location");

    // Add the marker to the map
    mapElement.appendChild(newMarker);
    setMarkerElement(newMarker);

    console.log("Marker added to map");
  }, [center, mapElement]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        minHeight: "400px",
      }}
    />
  );
}

export default GoogleMapComponent;
