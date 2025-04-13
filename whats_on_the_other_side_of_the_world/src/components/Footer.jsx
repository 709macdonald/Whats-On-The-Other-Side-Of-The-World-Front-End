import React from "react";

export default function Footer({ onReset }) {
  return (
    <div className="footer">
      <button className="resetButton" onClick={onReset}>
        Reset
      </button>
      <button className="McDonaldsButton">Nearest McDonalds</button>
    </div>
  );
}
