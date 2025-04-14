import { useRef, useEffect, useState } from "react";

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

  // Handle view target changes (for the zoom buttons)
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
      zoomLevel = "8"; // Adjust zoom level as desired for original location
      console.log("Zooming to original location");
    } else if (viewTarget === "antipode" && currentLocations.antipode) {
      centerPoint = `${currentLocations.antipode.lat},${currentLocations.antipode.lng}`;
      zoomLevel = "8"; // Adjust zoom level as desired for antipode
      console.log("Zooming to antipode location");
    } else if (viewTarget === "mcdonalds" && currentLocations.mcdonalds) {
      centerPoint = `${currentLocations.mcdonalds.latitude},${currentLocations.mcdonalds.longitude}`;
      zoomLevel = "12"; // Zoom in closer for McDonalds location
      console.log("Zooming to nearest McDonald's location");
    } else if (viewTarget === "both") {
      // Use a zoomed out view to see both points
      centerPoint = "0,0"; // World center
      zoomLevel = "2";
      console.log("Zooming out to show both locations");
    }

    if (centerPoint && zoomLevel) {
      mapElement.setAttribute("center", centerPoint);
      mapElement.setAttribute("zoom", zoomLevel);
    }
  }, [viewTarget, mapElement, currentLocations, markers]);

  // Fetch country information for a location
  const getCountryFromCoordinates = async (lat, lng) => {
    try {
      if (!window.google || !window.google.maps) {
        return "";
      }

      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK") {
            resolve(results);
          } else {
            reject(status);
          }
        });
      });

      // Look for the country in the address components
      let countryName = "";
      if (response && response.length > 0) {
        for (let i = 0; i < response.length; i++) {
          const result = response[i];

          // First try to find a country component
          const countryComponent = result.address_components.find((component) =>
            component.types.includes("country")
          );

          if (countryComponent) {
            countryName = countryComponent.long_name;
            break;
          }

          // If no country found, try to get the most relevant location name
          if (i === 0 && result.formatted_address) {
            countryName = result.formatted_address;
          }
        }
      }

      return countryName;
    } catch (error) {
      console.error("Error getting country information:", error);
      return "";
    }
  };

  // Update map with McDonald's marker when it changes
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

    // Create marker for McDonald's (yellow and red)
    const createMcDonaldsMarker = () => {
      const container = document.createElement("div");
      container.style.position = "relative";

      // Create the McDonald's marker with branded colors
      const marker = document.createElement("div");
      marker.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z" fill="#FFBC0D"/>
          <circle cx="20" cy="12.5" r="5" fill="#DA291C"/>
        </svg>
      `;
      container.appendChild(marker);

      return container;
    };

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

    console.log("McDonald's marker added to map");

    // If current view target is mcdonalds, update map center
    mapElement.setAttribute("center", mcdonaldsPosition);
    mapElement.setAttribute("zoom", "12");
  }, [nearestMcDonalds, mapElement, viewTarget]);

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
    console.log("Antipode location:", antipode);

    // Store the locations for zoom controls
    setCurrentLocations((prev) => ({
      ...prev,
      original: center,
      antipode: antipode,
    }));

    // CHANGE: Center the map on the antipode with a higher zoom level
    const antipodeString = `${antipode.lat},${antipode.lng}`;
    mapElement.setAttribute("center", antipodeString);
    mapElement.setAttribute("zoom", "8"); // Zoom in to show the antipode area in detail

    // Remove old markers if they exist
    Object.values(markers).forEach((marker) => {
      if (marker && marker.parentNode === mapElement) {
        mapElement.removeChild(marker);
      }
    });

    // Create marker for searched location (green to match button)
    const createSearchedLocationMarker = () => {
      const container = document.createElement("div");
      container.style.position = "relative";

      // Create the green pointer marker (matching the button color #4CAF50)
      const marker = document.createElement("div");
      marker.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z" fill="#4CAF50"/>
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
          <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z" fill="#FF5252"/>
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

    console.log("Both markers added to map");

    // Add a small delay before zooming in to ensure the map has updated properly
    setTimeout(() => {
      console.log("Zooming in to antipode location");
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
