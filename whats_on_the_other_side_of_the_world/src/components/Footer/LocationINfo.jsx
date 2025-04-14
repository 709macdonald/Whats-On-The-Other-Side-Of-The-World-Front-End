import React from "react";

function LocationInfo({
  originalLocation,
  antipodeLocation,
  nearestCountryToOriginal,
  nearestCountryToAntipode,
}) {
  return (
    <div className="coordinates-display">
      <div className="location-box">
        <p className="location-title">Your Location:</p>
        <p className="location-coords">
          {originalLocation.lat.toFixed(4)}°, {originalLocation.lng.toFixed(4)}°
          {nearestCountryToOriginal && ` - ${nearestCountryToOriginal}`}
        </p>
      </div>
      <div className="location-box">
        <p className="location-title">Antipode Location:</p>
        <p className="location-coords">
          {antipodeLocation.lat.toFixed(4)}°, {antipodeLocation.lng.toFixed(4)}°
          {nearestCountryToAntipode && ` - ${nearestCountryToAntipode}`}
        </p>
      </div>
    </div>
  );
}

export default LocationInfo;
