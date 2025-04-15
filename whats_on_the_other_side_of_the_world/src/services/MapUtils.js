import { reverseGeocode } from "./GeocodingService";

const countryCache = new Map();

export const calculateAntipode = (lat, lng) => {
  const antipodeLat = -lat;
  let antipodeLng = lng + 180;
  if (antipodeLng > 180) antipodeLng -= 360;

  return { lat: antipodeLat, lng: antipodeLng };
};

export const getCountryFromCoordinates = async (lat, lng) => {
  try {
    const roundedLat = parseFloat(lat.toFixed(4));
    const roundedLng = parseFloat(lng.toFixed(4));

    const cacheKey = `${roundedLat},${roundedLng}`;

    if (countryCache.has(cacheKey)) {
      return countryCache.get(cacheKey);
    }

    const countryName = await reverseGeocode(roundedLat, roundedLng);

    countryCache.set(cacheKey, countryName);

    return countryName;
  } catch (error) {
    return "";
  }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};
