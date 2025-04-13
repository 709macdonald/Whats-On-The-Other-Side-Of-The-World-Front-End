import { useRef, useEffect, useState } from "react";

function GoogleMapComponent({ center }) {
  const mapContainerRef = useRef(null);
  const [mapElement, setMapElement] = useState(null);
  const [markers, setMarkers] = useState({
    searchedLocation: null,
    antipode: null,
  });

  // Calculate antipode (opposite point on Earth)
  const calculateAntipode = (lat, lng) => {
    // Convert to opposite side of Earth
    const antipodeLat = -lat;
    // For longitude, add 180 degrees and normalize to [-180, 180]
    let antipodeLng = lng + 180;
    if (antipodeLng > 180) antipodeLng -= 360;

    return { lat: antipodeLat, lng: antipodeLng };
  };

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

  // Update map center and markers on location change
  useEffect(() => {
    if (!mapElement) return;

    // If center is null (reset was clicked), reset the map to default view
    if (!center) {
      console.log("Resetting map to world view");
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
      });

      return;
    }

    // Calculate antipode location
    const antipode = calculateAntipode(center.lat, center.lng);
    console.log("Antipode location:", antipode);

    // Center the map to show both points
    // We'll use the original location as the center, but with a lower zoom
    const centerString = `${center.lat},${center.lng}`;
    mapElement.setAttribute("center", centerString);
    mapElement.setAttribute("zoom", "2"); // Zoom out to potentially see both points

    // Remove old markers if they exist
    Object.values(markers).forEach((marker) => {
      if (marker && marker.parentNode === mapElement) {
        mapElement.removeChild(marker);
      }
    });

    // Create marker for searched location (gray)
    const createSearchedLocationMarker = () => {
      const container = document.createElement("div");
      container.style.position = "relative";

      // Create the gray pointer marker
      const marker = document.createElement("div");
      marker.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z" fill="#888888"/>
        </svg>
      `;
      container.appendChild(marker);

      return container;
    };

    // Create marker for antipode (red and white)
    const createAntipodeMarker = () => {
      const container = document.createElement("div");
      container.style.position = "relative";

      // Create the red and white pointer marker
      const marker = document.createElement("div");
      marker.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z" fill="#FF0000"/>
          <circle cx="20" cy="12.5" r="5" fill="white"/>
        </svg>
      `;
      container.appendChild(marker);

      return container;
    };

    // Create and add searched location marker
    const searchedLocationMarker = document.createElement(
      "gmp-advanced-marker"
    );
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
    const antipodeString = `${antipode.lat},${antipode.lng}`;
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
    });

    console.log("Both markers added to map");
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
