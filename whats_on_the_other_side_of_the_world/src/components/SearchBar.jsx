import { useRef, useEffect, useState } from "react";

export default function SearchBar({ onPlaceSelected }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (
      !inputRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    ) {
      return;
    }

    // Create the autocomplete object using the standard Google Maps JavaScript API
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["geometry", "name", "formatted_address"],
      }
    );

    // Store the autocomplete object in a ref
    autocompleteRef.current = autocomplete;

    // Listen for place selection
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      console.log("Place selected:", place);

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        console.log("Place coordinates:", { lat, lng });

        // Update the input value with the selected place name
        setInputValue(place.name || place.formatted_address || "");

        // Pass coordinates to parent component
        if (onPlaceSelected) {
          onPlaceSelected({ lat, lng });
        }
      }
    });

    return () => {
      // Clean up listener when component unmounts
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [onPlaceSelected]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    console.log("Search text:", inputValue);

    // Use Google's Geocoder to convert text to coordinates
    if (window.google && window.google.maps && inputValue.trim() !== "") {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: inputValue }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          console.log("Found coordinates:", { lat, lng });

          if (onPlaceSelected) {
            onPlaceSelected({ lat, lng });
          }
        } else {
          console.log("Geocoding failed:", status);
        }
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className="searchDiv"
      style={{
        display: "flex",
        gap: "8px",
        maxWidth: "500px",
        margin: "20px auto",
        padding: "0 20px",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Search for a location..."
        style={{
          flex: "1",
          padding: "8px 12px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "8px 16px",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Search
      </button>
    </div>
  );
}
