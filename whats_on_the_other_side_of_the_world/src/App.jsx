// App.jsx - Updated version
import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import GoogleMapComponent from "./components/GoogleMapComponent";
import Footer from "./components/Footer";

// Create a global flag to track if we've started loading the script
if (typeof window !== "undefined" && !window.googleMapsScriptStartedLoading) {
  window.googleMapsScriptStartedLoading = false;
}

function App() {
  const [apiKey, setApiKey] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Load Google Maps script only once per page load
  useEffect(() => {
    // Skip if we've already started loading or Google Maps is already loaded
    if (
      window.googleMapsScriptStartedLoading ||
      (window.google && window.google.maps)
    ) {
      if (window.google && window.google.maps) {
        setGoogleScriptLoaded(true);
      }
      return;
    }

    // Mark that we've started loading the script
    window.googleMapsScriptStartedLoading = true;

    // Fetch API key
    fetch("http://localhost:5005/api/get-api-key")
      .then((res) => res.json())
      .then((data) => {
        setApiKey(data.apiKey);

        // Create script with correct parameters for the new Maps API
        const script = document.createElement("script");
        script.id = "google-maps-script";
        // Use loading=async in the URL for better performance
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&callback=googleMapsCallback&libraries=maps,marker,places&v=beta&loading=async`;
        script.async = true;

        // Create a global callback
        window.googleMapsCallback = () => {
          console.log("Google Maps API fully loaded");
          setGoogleScriptLoaded(true);
        };

        // Handle errors
        script.onerror = (error) => {
          console.error("Error loading Google Maps script:", error);
          window.googleMapsScriptStartedLoading = false; // Reset the flag so we can try again
        };

        document.head.appendChild(script);
      })
      .catch((error) => {
        console.error("Error fetching API key:", error);
        window.googleMapsScriptStartedLoading = false; // Reset the flag so we can try again
      });

    // Cleanup function
    return () => {
      // Don't remove the script as it needs to persist across component remounts
      // Just clean up the callback
      if (window.googleMapsCallback) {
        window.googleMapsCallback = null;
      }
    };
  }, []);

  // Updated function to handle selected place
  const handlePlaceSelected = ({ lat, lng }) => {
    console.log("App received selected location coordinates:", { lat, lng });
    setSearchLocation({ lat, lng });
  };

  const handleReset = () => {
    console.log("Resetting search location");
    setSearchLocation(null);
  };

  return (
    <>
      <Header />
      <div className="mainScreen">
        {apiKey && googleScriptLoaded ? (
          <>
            <SearchBar onPlaceSelected={handlePlaceSelected} />
            <GoogleMapComponent center={searchLocation} />
            {searchLocation && (
              <div className="coordinates-display">
                <p>
                  Selected Location: {searchLocation.lat.toFixed(6)},{" "}
                  {searchLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </>
        ) : (
          <p>Loading Google Maps...</p>
        )}
      </div>
      <Footer onReset={handleReset} />
    </>
  );
}

export default App;
