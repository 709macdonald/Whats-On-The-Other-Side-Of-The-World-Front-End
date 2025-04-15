import React, { useState, useEffect, useRef } from "react";
import {
  geocodeLocation,
  getSuggestions,
} from "../../services/GeocodingService";

function OpenSearchBar({ onPlaceSelected }) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const suggestionListRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Fetch suggestions when input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setError("");

    // Reset selection
    setSelectedIndex(-1);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search for very short inputs
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Set new timer to debounce API requests
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await getSuggestions(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("Error getting suggestions:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce time
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text);
    setShowSuggestions(false);

    if (onPlaceSelected) {
      onPlaceSelected({
        lat: suggestion.lat,
        lng: suggestion.lng,
      });
    }
  };

  // Handle search button click
  const handleSearch = async () => {
    if (inputValue.trim() === "") {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError("");
    setShowSuggestions(false);

    try {
      const location = await geocodeLocation(inputValue);

      if (location) {
        console.log("Found coordinates:", {
          lat: location.lat,
          lng: location.lng,
        });

        if (onPlaceSelected) {
          onPlaceSelected({ lat: location.lat, lng: location.lng });
        }
      } else {
        setError("Location not found. Please try a different search.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Error searching for location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (
        showSuggestions &&
        selectedIndex >= 0 &&
        selectedIndex < suggestions.length
      ) {
        // If a suggestion is selected, use that
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        // Otherwise perform a search with the current input
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      // Navigate down the suggestion list
      e.preventDefault();
      if (showSuggestions) {
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      // Navigate up the suggestion list
      e.preventDefault();
      if (showSuggestions) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === "Escape") {
      // Close suggestion list
      setShowSuggestions(false);
    }
  };

  // Scroll to selected item
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionListRef.current) {
      const selectedElement = suggestionListRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionListRef.current &&
        !suggestionListRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={() =>
          inputValue.length >= 3 &&
          suggestions.length > 0 &&
          setShowSuggestions(true)
        }
        placeholder="Search for a location..."
        className="search-input"
        disabled={loading}
        autoComplete="off"
      />
      <button
        onClick={handleSearch}
        className="search-button"
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {showSuggestions && suggestions.length > 0 && (
        <ul ref={suggestionListRef} className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`suggestion-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion.text}
            </li>
          ))}
        </ul>
      )}

      {error && <div className="search-error">{error}</div>}
    </div>
  );
}

export default OpenSearchBar;
