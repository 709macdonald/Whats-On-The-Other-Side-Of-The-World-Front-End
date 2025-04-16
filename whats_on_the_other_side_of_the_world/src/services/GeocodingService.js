const BASE_URL = import.meta.env.VITE_API_URL;

export const geocodeLocation = async (locationText) => {
  try {
    if (geocodeCache.has(locationText)) {
      return geocodeCache.get(locationText);
    }

    const response = await fetch(`${BASE_URL}/api/geocode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationText }),
    });

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

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
    const response = await fetch(
      `${BASE_URL}/api/reverse-geocode?lat=${lat}&lng=${lng}`
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    return data.country;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "";
  }
};

export const getSuggestions = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }

  const cacheKey = query.toLowerCase();
  if (suggestionsCache.has(cacheKey)) {
    return suggestionsCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/api/suggestions?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }

    const formattedSuggestions = await response.json();
    suggestionsCache.set(cacheKey, formattedSuggestions);
    return formattedSuggestions;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};
