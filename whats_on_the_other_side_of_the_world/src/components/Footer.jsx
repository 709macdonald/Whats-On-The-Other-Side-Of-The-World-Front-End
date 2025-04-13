import React from "react";

export default function Footer({
  onReset,
  searchPerformed = false,
  onViewOriginal,
  onViewAntipode,
  originalLocation = null,
  antipodeLocation = null,
  nearestCountryToOriginal = "",
  nearestCountryToAntipode = "",
}) {
  return (
    <div
      className="footer"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "15px",
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #ddd",
      }}
    >
      {/* Coordinates display */}
      {searchPerformed && originalLocation && antipodeLocation && (
        <div
          className="coordinates-display"
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "800px",
            marginBottom: "15px",
            fontSize: "14px",
            padding: "0 10px",
          }}
        >
          <div className="original-location">
            <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
              Your Location:
            </p>
            <p style={{ margin: "0" }}>
              {originalLocation.lat.toFixed(4)}°,{" "}
              {originalLocation.lng.toFixed(4)}°
              {nearestCountryToOriginal && ` - ${nearestCountryToOriginal}`}
            </p>
          </div>
          <div className="antipode-location">
            <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
              Antipode Location:
            </p>
            <p style={{ margin: "0" }}>
              {antipodeLocation.lat.toFixed(4)}°,{" "}
              {antipodeLocation.lng.toFixed(4)}°
              {nearestCountryToAntipode && ` - ${nearestCountryToAntipode}`}
            </p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div
        className="button-container"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          width: "100%",
        }}
      >
        {searchPerformed && (
          <>
            <button
              className="resetButton"
              onClick={onReset}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4285F4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
            >
              Search Again
            </button>

            <button
              className="myLocationButton"
              onClick={onViewOriginal}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              My Location
            </button>

            <button
              className="antipodeButton"
              onClick={onViewAntipode}
              style={{
                padding: "8px 16px",
                backgroundColor: "#FF5252",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Other Side Of The World
            </button>

            <button
              className="McDonaldsButton"
              style={{
                padding: "8px 16px",
                backgroundColor: "#FFBC0D",
                color: "#DA291C",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Nearest McDonalds
            </button>
          </>
        )}
      </div>
    </div>
  );
}
