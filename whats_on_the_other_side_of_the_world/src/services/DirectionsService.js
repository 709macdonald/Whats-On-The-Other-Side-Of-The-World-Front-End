export const getDirections = async (origin, destination) => {
  if (!window.google || !window.google.maps || !origin || !destination) {
    return {
      status: "ERROR",
      errorMessage: "Directions service not available",
    };
  }

  try {
    const directionsService = new window.google.maps.DirectionsService();

    const result = await new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(origin.lat, origin.lng),
          destination: new window.google.maps.LatLng(
            destination.lat,
            destination.lng
          ),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            resolve(response);
          } else if (status === "ZERO_RESULTS") {
            directionsService.route(
              {
                origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                destination: new window.google.maps.LatLng(
                  destination.lat,
                  destination.lng
                ),
                travelMode: window.google.maps.TravelMode.TRANSIT,
              },
              (transitResponse, transitStatus) => {
                if (transitStatus === "OK") {
                  resolve(transitResponse);
                } else {
                  reject(transitStatus);
                }
              }
            );
          } else {
            reject(status);
          }
        }
      );
    });

    const route = result.routes[0];
    const leg = route.legs[0];

    const processedDirections = {
      status: "OK",
      distance: leg.distance.text,
      duration: leg.duration.text,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map((step) => ({
        distance: step.distance.text,
        duration: step.duration.text,
        instruction: step.instructions,
        travelMode: step.travel_mode,
      })),
    };

    return processedDirections;
  } catch (error) {
    console.error("Error getting directions:", error);
    return {
      status: "ERROR",
      errorMessage:
        "Could not calculate directions. The antipode might be in an inaccessible location.",
    };
  }
};
