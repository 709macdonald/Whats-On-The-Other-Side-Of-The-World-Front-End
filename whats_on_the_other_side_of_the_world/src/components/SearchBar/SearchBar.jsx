import React, { useRef, useEffect, useState } from "react";

function SearchBar({ onPlaceSelected, onSearchText }) {
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

    // Create the autocomplete object
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

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

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
    if (inputValue.trim() === "") return;

    // If onSearchText is provided, pass the text
    if (onSearchText) {
      onSearchText(inputValue);
      return;
    }

    // Otherwise use Google's Geocoder to convert text to coordinates
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: inputValue }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          if (onPlaceSelected) {
            onPlaceSelected({ lat, lng });
          }
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
    <div className="search-container">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Search for a location..."
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">
        Search
      </button>
    </div>
  );
}

export default SearchBar;
