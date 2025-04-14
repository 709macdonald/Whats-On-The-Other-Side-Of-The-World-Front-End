import { calculateDistance } from "./MapUtils";

// Function to find nearest McDonald's
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

// Load McDonald's data
export const loadMcDonaldsData = async () => {
  try {
    // Using dynamic import to load the JSON file
    const data = await import("../data/McDonalds.json");
    console.log("McDonald's data loaded:", data.default.length, "locations");
    return data.default;
  } catch (importError) {
    console.error("Error loading McDonald's data:", importError);

    // Fallback to fetch if import doesn't work
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
