import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Map from "./components/Map";
import Footer from "./components/Footer";

function App() {
  const [count, setCount] = useState(0);
  const [apiKey, setApiKey] = useState(null); // State for storing the API key

  // Fetch API key from backend on component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/get-api-key");
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey); // Store the API key in state
        } else {
          console.error("Failed to fetch API key");
        }
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    fetchApiKey();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <>
      <Header />
      <div className="mainScreen">
        <SearchBar />
        {/* Pass the API key to the Map component */}
        <Map apiKey={apiKey} />
      </div>
      <Footer />
    </>
  );
}

export default App;
