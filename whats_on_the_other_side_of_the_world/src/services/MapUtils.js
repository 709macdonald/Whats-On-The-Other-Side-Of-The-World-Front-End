import { reverseGeocode } from "./GeocodingService";

// Cache for country information to avoid repeated API calls
const countryCache = new Map();

// Calculate antipode (opposite point on Earth)
export const calculateAntipode = (lat, lng) => {
  // Convert to opposite side of Earth
  const antipodeLat = -lat;
  // For longitude, add 180 degrees and normalize to [-180, 180]
  let antipodeLng = lng + 180;
  if (antipodeLng > 180) antipodeLng -= 360;

  return { lat: antipodeLat, lng: antipodeLng };
};

// Get country information for a location using OpenCage with caching
export const getCountryFromCoordinates = async (lat, lng) => {
  try {
    // Round coordinates to reduce cache storage and handle minor differences
    const roundedLat = parseFloat(lat.toFixed(4));
    const roundedLng = parseFloat(lng.toFixed(4));

    // Create a cache key based on rounded coordinates
    const cacheKey = `${roundedLat},${roundedLng}`;

    // Check if we have this location in cache
    if (countryCache.has(cacheKey)) {
      console.log("Using cached country data for", cacheKey);
      return countryCache.get(cacheKey);
    }

    // If not in cache, make the API call
    console.log("Fetching country data for", cacheKey);
    const countryName = await reverseGeocode(roundedLat, roundedLng);

    // Store in cache for future use
    countryCache.set(cacheKey, countryName);

    return countryName;
  } catch (error) {
    console.error("Error getting country information:", error);
    return "";
  }
};

// Calculate distance between two coordinates (haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};
