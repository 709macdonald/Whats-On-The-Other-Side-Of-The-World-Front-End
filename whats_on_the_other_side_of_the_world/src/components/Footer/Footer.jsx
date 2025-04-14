import React from "react";
import LocationInfo from "./LocationInfo";
import McdonaldsInfo from "./McdonaldsInfo";
import NavigationButtons from "./NavigationButtons";

function Footer({
  onReset,
  searchPerformed = false,
  onViewOriginal,
  onViewAntipode,
  onViewMcDonalds,
  originalLocation = null,
  antipodeLocation = null,
  nearestCountryToOriginal = "",
  nearestCountryToAntipode = "",
  nearestMcDonalds = null,
  viewTarget = null,
}) {
  return (
    <div className="footer">
      {/* Coordinates display */}
      {searchPerformed && originalLocation && antipodeLocation && (
        <LocationInfo
          originalLocation={originalLocation}
          antipodeLocation={antipodeLocation}
          nearestCountryToOriginal={nearestCountryToOriginal}
          nearestCountryToAntipode={nearestCountryToAntipode}
        />
      )}

      {/* McDonald's information display */}
      {searchPerformed && nearestMcDonalds && viewTarget === "mcdonalds" && (
        <McdonaldsInfo nearestMcDonalds={nearestMcDonalds} />
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        searchPerformed={searchPerformed}
        onReset={onReset}
        onViewOriginal={onViewOriginal}
        onViewAntipode={onViewAntipode}
        onViewMcDonalds={onViewMcDonalds}
      />
    </div>
  );
}

export default Footer;
