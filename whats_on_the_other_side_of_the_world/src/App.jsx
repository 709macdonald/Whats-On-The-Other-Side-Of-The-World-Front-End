import { useState, useEffect, useRef } from "react";
import Header from "./components/Header/Header";
import OpenSearchBar from "./components/SearchBar/OpenSearchBar";
import LeafletMapComponent from "./components/Map/LeafletMapComponent";
import Footer from "./components/Footer/Footer";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import {
  findNearestMcDonalds,
  loadMcDonaldsData,
} from "./services/McDonaldsService";
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

  const hasFoundNearestRef = useRef(false);

  useEffect(() => {
    if (!appStarted) return;

    const fetchMcDonaldsData = async () => {
      const data = await loadMcDonaldsData();
      setMcDonaldsData(data);
    };

    fetchMcDonaldsData();
  }, [appStarted]);

  useEffect(() => {
    if (
      locationDetails.antipode &&
      mcDonaldsData.length > 0 &&
      !hasFoundNearestRef.current
    ) {
      hasFoundNearestRef.current = true;

      const nearest = findNearestMcDonalds(
        locationDetails.antipode.lat,
        locationDetails.antipode.lng,
        mcDonaldsData
      );

      if (nearest) {
        setNearestMcDonalds(nearest);
      }
    }
  }, [locationDetails.antipode, mcDonaldsData]);

  const handlePlaceSelected = (location) => {
    setSearchLocation(location);
    setShowSearch(false);
    setViewTarget("antipode");
    hasFoundNearestRef.current = false;
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
    }
  };

  const handleLocationDetails = (details) => {
    setLocationDetails(details);
  };

  const handleReset = () => {
    setSearchLocation(null);
    setShowSearch(true);
    setViewTarget(null);
    setNearestMcDonalds(null);
    hasFoundNearestRef.current = false;
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
