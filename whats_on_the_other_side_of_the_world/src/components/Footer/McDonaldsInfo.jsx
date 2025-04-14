import React from "react";

function McdonaldsInfo({ nearestMcDonalds }) {
  return (
    <div className="mcdonalds-info">
      <p>
        Nearest McDonald's: {nearestMcDonalds.name} (
        {nearestMcDonalds.distance.toFixed(2)} km away)
      </p>
    </div>
  );
}

export default McdonaldsInfo;
