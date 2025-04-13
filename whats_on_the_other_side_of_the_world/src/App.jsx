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

  // Handle when a location is selected from autocomplete
  const handlePlaceSelected = ({ lat, lng }) => {
    console.log("Location selected from autocomplete:", { lat, lng });
    setSearchLocation({ lat, lng });
    setShowSearch(false); // Hide search bar after selection
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
        } else {
          console.log("Geocoding failed with status:", status);
        }
      });
    }
  };

  // Handle reset
  const handleReset = () => {
    setSearchLocation(null);
    setSearchText("");
    setShowSearch(true); // Show search bar again
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
            <GoogleMapComponent center={searchLocation} />
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
