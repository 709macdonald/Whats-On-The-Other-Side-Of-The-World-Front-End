import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Map from "./components/Map";
import Footer from "./components/Footer";

function App() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/get-api-key");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched API Key:", data.apiKey);
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  return (
    <>
      <Header />
      <div className="mainScreen">
        <SearchBar />
        <Map apiKey={apiKey} />
      </div>
      <Footer />
    </>
  );
}

export default App;
