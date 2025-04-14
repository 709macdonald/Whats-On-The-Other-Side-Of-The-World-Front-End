export const calculateAntipode = (lat, lng) => {
  const antipodeLat = -lat;
  let antipodeLng = lng + 180;
  if (antipodeLng > 180) antipodeLng -= 360;

  return { lat: antipodeLat, lng: antipodeLng };
};

export const getCountryFromCoordinates = async (lat, lng) => {
  try {
    if (!window.google || !window.google.maps) {
      return "";
    }

    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK") {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });

    let countryName = "";
    if (response && response.length > 0) {
      for (let i = 0; i < response.length; i++) {
        const result = response[i];

        const countryComponent = result.address_components.find((component) =>
          component.types.includes("country")
        );

        if (countryComponent) {
          countryName = countryComponent.long_name;
          break;
        }

        if (i === 0 && result.formatted_address) {
          countryName = result.formatted_address;
        }
      }
    }

    return countryName;
  } catch (error) {
    console.error("Error getting country information:", error);
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
