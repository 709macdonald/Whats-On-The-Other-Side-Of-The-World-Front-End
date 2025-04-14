import { calculateDistance } from "./MapUtils";

export const findNearestMcDonalds = (latitude, longitude, mcDonaldsData) => {
  if (!mcDonaldsData || mcDonaldsData.length === 0) {
    console.log("No McDonald's data available");
    return null;
  }

  let nearestLocation = null;
  let minDistance = Infinity;

  mcDonaldsData.forEach((location) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = {
        ...location,
        distance: distance,
      };
    }
  });

  return nearestLocation;
};

export const loadMcDonaldsData = async () => {
  try {
    const data = await import("../data/McDonalds.json");
    console.log("McDonald's data loaded:", data.default.length, "locations");
    return data.default;
  } catch (importError) {
    console.error("Error loading McDonald's data:", importError);

    try {
      const response = await fetch("../data/McDonalds.json");
      if (!response.ok) {
        throw new Error("Failed to fetch McDonald's data");
      }
      const data = await response.json();
      console.log(
        "McDonald's data loaded via fetch:",
        data.length,
        "locations"
      );
      return data;
    } catch (fetchError) {
      console.error("Fallback fetch also failed:", fetchError);
      return [];
    }
  }
};
