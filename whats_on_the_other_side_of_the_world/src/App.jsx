import { useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Map from "./components/Map";
import Footer from "./components/Footer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <div className="mainScreen">
        <SearchBar />
        <Map />
      </div>
      <Footer />
    </>
  );
}

export default App;
