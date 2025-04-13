import React from "react";

export default function Footer({ onReset, searchPerformed = false }) {
  return (
    <div
      className="footer"
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        padding: "15px",
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #ddd",
      }}
    >
      <button
        className="resetButton"
        onClick={onReset}
        style={{
          padding: "8px 16px",
          backgroundColor: searchPerformed ? "#4285F4" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: searchPerformed ? "pointer" : "default",
          fontSize: "16px",
          fontWeight: searchPerformed ? "bold" : "normal",
          transition: "all 0.3s ease",
        }}
      >
        {searchPerformed ? "Search Again" : "Reset"}
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
    </div>
  );
}
