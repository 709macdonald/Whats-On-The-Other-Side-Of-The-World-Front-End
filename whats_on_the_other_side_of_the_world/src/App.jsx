import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import SearchBar from "./components/SearchBar/SearchBar";
import GoogleMapComponent from "./components/Map/GoogleMapComponent";
import Footer from "./components/Footer/Footer";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import { getDirections } from "./services/DirectionsService";
import {
  findNearestMcDonalds,
  loadMcDonaldsData,
} from "./services/McdonaldsService";
import "./index.css";

if (typeof window !== "undefined" && !window.googleMapsScriptStartedLoading) {
  window.googleMapsScriptStartedLoading = false;
}

function App() {
  const [appStarted, setAppStarted] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [mcDonaldsData, setMcDonaldsData] = useState([]);
  const [nearestMcDonalds, setNearestMcDonalds] = useState(null);
  const [directions, setDirections] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    original: null,
    antipode: null,
    originalCountry: "",
    antipodeCountry: "",
  });

  const handleShowDirections = async () => {
    if (locationDetails.original && locationDetails.antipode) {
      setViewTarget("directions");

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

  useEffect(() => {
    if (!appStarted) return;

    const fetchMcDonaldsData = async () => {
      const data = await loadMcDonaldsData();
      setMcDonaldsData(data);
    };

    fetchMcDonaldsData();
  }, [appStarted]);

  useEffect(() => {
    if (!appStarted) return;

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
  }, [appStarted]);

  useEffect(() => {
    if (locationDetails.antipode && mcDonaldsData.length > 0) {
      const nearest = findNearestMcDonalds(
        locationDetails.antipode.lat,
        locationDetails.antipode.lng,
        mcDonaldsData
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

  const handlePlaceSelected = ({ lat, lng }) => {
    console.log("Location selected from autocomplete:", { lat, lng });
    setSearchLocation({ lat, lng });
    setShowSearch(false);
    setViewTarget("antipode");
  };

  const handleSearchText = (text) => {
    console.log("Searching for location text:", text);
    setSearchText(text);

    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: text }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          console.log("Geocoded coordinates:", { lat, lng });
          setSearchLocation({ lat, lng });
          setShowSearch(false);
          setViewTarget("antipode");
        } else {
          console.log("Geocoding failed with status:", status);
        }
      });
    }
  };

  const handleViewOriginal = () => {
    setViewTarget("original");
  };

  const handleViewAntipode = () => {
    setViewTarget("antipode");
  };

  const handleViewMcDonalds = () => {
    if (nearestMcDonalds) {
      setViewTarget("mcdonalds");
    } else {
      console.log("No nearest McDonald's found yet");
    }
  };

  const handleLocationDetails = (details) => {
    setLocationDetails(details);
  };

  const handleReset = () => {
    setSearchLocation(null);
    setSearchText("");
    setShowSearch(true);
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

  const handleStartApp = () => {
    setAppStarted(true);
  };

  if (!appStarted) {
    return <WelcomeScreen onStart={handleStartApp} />;
  }

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
