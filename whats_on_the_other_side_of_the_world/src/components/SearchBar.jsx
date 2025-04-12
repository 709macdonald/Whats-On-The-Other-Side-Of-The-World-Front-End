import React, { useRef, useEffect, useState } from "react";

export default function SearchBar({ onPlaceSelected }) {
  const searchContainerRef = useRef(null);
  const [autocompleteElement, setAutocompleteElement] = useState(null);
  const [searchStatus, setSearchStatus] = useState("Waiting for search...");

  // Create and append the autocomplete element
  useEffect(() => {
    if (!searchContainerRef.current) return;

    // Check if Google Maps is loaded
    if (!window.google || !window.customElements) {
      console.error("Google Maps or customElements not available");
      setSearchStatus("Google Maps not loaded yet");
      return;
    }

    // Check if the gmp-place-autocomplete custom element is registered
    if (!customElements.get("gmp-place-autocomplete")) {
      console.error("gmp-place-autocomplete is not registered");
      setSearchStatus("Place autocomplete not available");
      return;
    }

    if (!autocompleteElement) {
      // Clear any existing content
      searchContainerRef.current.innerHTML = "";

      // Create the autocomplete element
      const newAutocompleteElement = document.createElement(
        "gmp-place-autocomplete"
      );
      newAutocompleteElement.setAttribute(
        "placeholder",
        "What's on the other side of..."
      );

      // Set any additional options that might be needed
      // This helps with getting more complete place data
      newAutocompleteElement.setAttribute(
        "fields",
        "geometry,name,formatted_address"
      );

      // Add to the DOM
      searchContainerRef.current.appendChild(newAutocompleteElement);
      setAutocompleteElement(newAutocompleteElement);
      setSearchStatus("Search ready");

      console.log("Autocomplete element created");
    }
  }, [autocompleteElement]);

  // Set up the place change event listener
  useEffect(() => {
    if (!autocompleteElement) return;

    console.log("Setting up placechange listener");

    const handlePlaceChange = () => {
      console.log("📣 placechange event triggered!");
      setSearchStatus("Place selected!");

      const place = autocompleteElement.value;
      console.log("📍 Selected place full data:", place);

      // Try all possible structures to get coordinates
      let lat, lng;

      try {
        if (place && place.geometry && place.geometry.location) {
          // Check if location uses methods (classic API)
          if (typeof place.geometry.location.lat === "function") {
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            console.log("Extracted coordinates using function methods");
          }
          // Check if location has direct properties (beta API)
          else if (place.geometry.location.lat !== undefined) {
            lat = place.geometry.location.lat;
            lng = place.geometry.location.lng;
            console.log("Extracted coordinates using direct properties");
          }
        }
        // Try alternative structure
        else if (place && place.position) {
          lat = place.position.lat;
          lng = place.position.lng;
          console.log("Extracted coordinates from position property");
        }

        // Manual attempt to access place details if all else fails
        else if (place) {
          // Look for any properties that might contain coordinates
          console.log(
            "Failed to find standard location properties. Exploring place object:"
          );
          Object.keys(place).forEach((key) => {
            console.log(`- Property: ${key}`, place[key]);
          });
        }

        if (lat !== undefined && lng !== undefined) {
          console.log("📌 Coordinates found:", { lat, lng });
          setSearchStatus(
            `Found coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );

          // Directly call the provided callback with coordinates
          if (onPlaceSelected) {
            onPlaceSelected({ lat, lng });
          } else {
            console.error("onPlaceSelected callback is not available");
            setSearchStatus("Error: Can't pass coordinates to parent");
          }
        } else {
          console.warn("⚠️ Could not extract coordinates from place");
          setSearchStatus("Error: No coordinates found in the selected place");
        }
      } catch (error) {
        console.error("Error processing place data:", error);
        setSearchStatus(`Error: ${error.message}`);
      }
    };

    // Add event listener
    autocompleteElement.addEventListener("placechange", handlePlaceChange);

    // Manual test - click on the autocomplete element to check for issues
    const testClick = (e) => {
      console.log("Autocomplete element clicked:", e);
    };
    autocompleteElement.addEventListener("click", testClick);

    // Cleanup
    return () => {
      autocompleteElement.removeEventListener("placechange", handlePlaceChange);
      autocompleteElement.removeEventListener("click", testClick);
    };
  }, [autocompleteElement, onPlaceSelected]);

  return (
    <div className="searchDiv">
      <h3>Enter Your Current Location</h3>
      <div
        ref={searchContainerRef}
        style={{ width: "100%", minHeight: "40px", marginBottom: "10px" }}
      ></div>
      <div
        className="search-status"
        style={{ fontSize: "0.8rem", color: "#666" }}
      >
        {searchStatus}
      </div>
    </div>
  );
}
