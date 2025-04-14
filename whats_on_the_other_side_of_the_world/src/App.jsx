import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import GoogleMapComponent from "./components/GoogleMapComponent";
import Footer from "./components/Footer";

if (typeof window !== "undefined" && !window.googleMapsScriptStartedLoading) {
  window.googleMapsScriptStartedLoading = false;
}

function App() {
  const [apiKey, setApiKey] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [mcDonaldsData, setMcDonaldsData] = useState([]);
  const [nearestMcDonalds, setNearestMcDonalds] = useState(null);

  // Function to get directions between original location and antipode
  const getDirections = async (origin, destination) => {
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
            travelMode: window.google.maps.TravelMode.DRIVING, // Default to driving
          },
          (response, status) => {
            if (status === "OK") {
              resolve(response);
            } else if (status === "ZERO_RESULTS") {
              // Try with TRANSIT if DRIVING fails
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

      // Process and format directions
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

  // Handle show directions
  const handleShowDirections = async () => {
    if (locationDetails.original && locationDetails.antipode) {
      setViewTarget("directions");

      // If we already have directions, don't fetch again
      if (!directions) {
        console.log(
          "Fetching directions between original location and antipode"
        );
        const directionsResult = await getDirections(
          locationDetails.original,
          locationDetails.antipode
        );
        setDirections(directionsResult);
      }
    } else {
      console.log("Cannot show directions: locations not set");
    }
  };
  const [locationDetails, setLocationDetails] = useState({
    original: null,
    antipode: null,
    originalCountry: "",
    antipodeCountry: "",
  });

  // Function to calculate distance between two coordinates (haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

  // Function to find nearest McDonald's
  const findNearestMcDonalds = (latitude, longitude) => {
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
  useEffect(() => {
    // Using dynamic import to load the JSON file
    import("../src/data/McDonalds.json")
      .then((data) => {
        console.log(
          "McDonald's data loaded:",
          data.default.length,
          "locations"
        );
        setMcDonaldsData(data.default);
      })
      .catch((error) => {
        console.error("Error loading McDonald's data:", error);

        // Fallback to fetch if import doesn't work
        fetch("../src/data/McDonalds.json")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch McDonald's data");
            }
            return response.json();
          })
          .then((data) => {
            console.log(
              "McDonald's data loaded via fetch:",
              data.length,
              "locations"
            );
            setMcDonaldsData(data);
          })
          .catch((fallbackError) => {
            console.error("Fallback fetch also failed:", fallbackError);
          });
      });
  }, []);

  useEffect(() => {
    if (
      window.googleMapsScriptStartedLoading ||
      (window.google && window.google.maps)
    ) {
      if (window.google && window.google.maps) {
        setGoogleScriptLoaded(true);
      }
      return;
    }

    window.googleMapsScriptStartedLoading = true;

    fetch("http://localhost:5005/api/get-api-key")
      .then((res) => res.json())
      .then((data) => {
        setApiKey(data.apiKey);

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&callback=googleMapsCallback&libraries=maps,marker,places&v=beta&loading=async`;
        script.async = true;

        window.googleMapsCallback = () => setGoogleScriptLoaded(true);
        script.onerror = () => (window.googleMapsScriptStartedLoading = false);

        document.head.appendChild(script);
      })
      .catch(() => {
        window.googleMapsScriptStartedLoading = false;
      });

    return () => {
      if (window.googleMapsCallback) {
        window.googleMapsCallback = null;
      }
    };
  }, []);

  // Find nearest McDonald's when antipode location changes
  useEffect(() => {
    if (locationDetails.antipode && mcDonaldsData.length > 0) {
      const nearest = findNearestMcDonalds(
        locationDetails.antipode.lat,
        locationDetails.antipode.lng
      );

      if (nearest) {
        console.log(
          "Nearest McDonald's found:",
          nearest.name,
          `(${nearest.distance.toFixed(2)} km away)`
        );
        setNearestMcDonalds(nearest);
      }
    }
  }, [locationDetails.antipode, mcDonaldsData]);

  // Handle when a location is selected from autocomplete
  const handlePlaceSelected = ({ lat, lng }) => {
    console.log("Location selected from autocomplete:", { lat, lng });
    setSearchLocation({ lat, lng });
    setShowSearch(false); // Hide search bar after selection
    // Set view target to antipode by default
    setViewTarget("antipode");
  };

  // Handle text search when autocomplete doesn't provide coordinates
  const handleSearchText = (text) => {
    console.log("Searching for location text:", text);
    setSearchText(text);

    // Use Geocoder to convert text to coordinates
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: text }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          console.log("Geocoded coordinates:", { lat, lng });
          setSearchLocation({ lat, lng });
          setShowSearch(false); // Hide search bar after search
          // Set view target to antipode by default
          setViewTarget("antipode");
        } else {
          console.log("Geocoding failed with status:", status);
        }
      });
    }
  };

  // Handle zoom to original location
  const handleViewOriginal = () => {
    setViewTarget("original");
  };

  // Handle zoom to antipode
  const handleViewAntipode = () => {
    setViewTarget("antipode");
  };

  // Handle zoom to nearest McDonald's
  const handleViewMcDonalds = () => {
    if (nearestMcDonalds) {
      setViewTarget("mcdonalds");
    } else {
      console.log("No nearest McDonald's found yet");
    }
  };

  // Handle location details update
  const handleLocationDetails = (details) => {
    setLocationDetails(details);
  };

  // Handle reset
  const handleReset = () => {
    setSearchLocation(null);
    setSearchText("");
    setShowSearch(true); // Show search bar again
    setViewTarget(null);
    setNearestMcDonalds(null);
    setDirections(null);
    setLocationDetails({
      original: null,
      antipode: null,
      originalCountry: "",
      antipodeCountry: "",
    });
  };

  return (
    <>
      <Header />
      <div className="mainScreen">
        {apiKey && googleScriptLoaded ? (
          <>
            {showSearch && (
              <SearchBar
                onPlaceSelected={handlePlaceSelected}
                onSearchText={handleSearchText}
              />
            )}
            <GoogleMapComponent
              center={searchLocation}
              viewTarget={viewTarget}
              onLocationDetails={handleLocationDetails}
              nearestMcDonalds={nearestMcDonalds}
            />
          </>
        ) : (
          <p>Loading Google Maps...</p>
        )}
      </div>
      <Footer
        onReset={handleReset}
        onViewOriginal={handleViewOriginal}
        onViewAntipode={handleViewAntipode}
        onViewMcDonalds={handleViewMcDonalds}
        searchPerformed={!showSearch && searchLocation !== null}
        originalLocation={locationDetails.original}
        antipodeLocation={locationDetails.antipode}
        nearestCountryToOriginal={locationDetails.originalCountry}
        nearestCountryToAntipode={locationDetails.antipodeCountry}
        nearestMcDonalds={nearestMcDonalds}
        viewTarget={viewTarget}
      />
    </>
  );
}

export default App;
