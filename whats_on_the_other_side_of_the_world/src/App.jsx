import { useState, useEffect, useRef } from "react";
import Header from "./components/Header/Header";
import OpenSearchBar from "./components/SearchBar/OpenSearchBar";
import LeafletMapComponent from "./components/Map/LeafletMapComponent";
import Footer from "./components/Footer/Footer";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import {
  findNearestMcDonalds,
  loadMcDonaldsData,
} from "./services/McdonaldsService";
import "./index.css";

function App() {
  const [appStarted, setAppStarted] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [showSearch, setShowSearch] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [mcDonaldsData, setMcDonaldsData] = useState([]);
  const [nearestMcDonalds, setNearestMcDonalds] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    original: null,
    antipode: null,
    originalCountry: "",
    antipodeCountry: "",
  });

  // Add a ref to track if we've already found the nearest McDonald's
  const hasFoundNearestRef = useRef(false);

  // Load McDonald's data when app starts
  useEffect(() => {
    if (!appStarted) return;

    const fetchMcDonaldsData = async () => {
      const data = await loadMcDonaldsData();
      setMcDonaldsData(data);
    };

    fetchMcDonaldsData();
  }, [appStarted]);

  // Find nearest McDonald's when antipode location changes
  useEffect(() => {
    if (
      locationDetails.antipode &&
      mcDonaldsData.length > 0 &&
      !hasFoundNearestRef.current
    ) {
      // Set the ref to true so we don't run this again
      hasFoundNearestRef.current = true;

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

  // Handle when a location is selected from search
  const handlePlaceSelected = (location) => {
    console.log("Location selected:", location);
    setSearchLocation(location);
    setShowSearch(false); // Hide search bar after selection
    // Set view target to antipode by default
    setViewTarget("antipode");
    // Reset the flag when a new location is selected
    hasFoundNearestRef.current = false;
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
    setShowSearch(true); // Show search bar again
    setViewTarget(null);
    setNearestMcDonalds(null);
    // Reset the flag when resetting the app
    hasFoundNearestRef.current = false;
    setLocationDetails({
      original: null,
      antipode: null,
      originalCountry: "",
      antipodeCountry: "",
    });
  };

  // Handle start app button click
  const handleStartApp = () => {
    setAppStarted(true);
  };

  // Show welcome screen if app not started
  if (!appStarted) {
    return <WelcomeScreen onStart={handleStartApp} />;
  }

  return (
    <>
      <Header />
      <div className="mainScreen">
        {showSearch && <OpenSearchBar onPlaceSelected={handlePlaceSelected} />}
        <LeafletMapComponent
          center={searchLocation}
          viewTarget={viewTarget}
          onLocationDetails={handleLocationDetails}
          nearestMcDonalds={nearestMcDonalds}
        />
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
