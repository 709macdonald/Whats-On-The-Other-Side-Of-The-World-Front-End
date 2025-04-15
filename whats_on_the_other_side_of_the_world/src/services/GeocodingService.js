// No more API key needed in the frontend!
// Remove: const OPENCAGE_API_KEY = "***";

const geocodeCache = new Map();
const suggestionsCache = new Map();

export const geocodeLocation = async (locationText) => {
  try {
    if (geocodeCache.has(locationText)) {
      console.log("Using cached geocode for:", locationText);
      return geocodeCache.get(locationText);
    }

    // Call your backend endpoint instead of OpenCage directly
    const response = await fetch("/api/geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationText }),
    });

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    // Your backend already returns the formatted location data
    const locationData = await response.json();
    geocodeCache.set(locationText, locationData);
    return locationData;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    // Call your backend endpoint
    const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    // Your backend returns { country: "..." }
    return data.country;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "";
  }
};

// Function to get location suggestions as user types
export const getSuggestions = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }

  // Check cache first
  const cacheKey = query.toLowerCase();
  if (suggestionsCache.has(cacheKey)) {
    console.log("Using cached suggestions for:", cacheKey);
    return suggestionsCache.get(cacheKey);
  }

  try {
    // Call your backend endpoint
    const response = await fetch(
      `/api/suggestions?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }

    // Your backend already returns the formatted suggestions
    const formattedSuggestions = await response.json();
    suggestionsCache.set(cacheKey, formattedSuggestions);
    return formattedSuggestions;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};
