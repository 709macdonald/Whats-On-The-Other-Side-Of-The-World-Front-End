import React from "react";

function NavigationButtons({
  searchPerformed,
  onReset,
  onViewOriginal,
  onViewAntipode,
  onViewMcDonalds,
}) {
  if (!searchPerformed) {
    return null;
  }

  return (
    <div className="button-container">
      <button className="btn btn-blue" onClick={onReset}>
        Search Again
      </button>

      <button className="btn btn-green" onClick={onViewOriginal}>
        My Location
      </button>

      <button className="btn btn-red" onClick={onViewAntipode}>
        Other Side Of The World
      </button>

      <button className="btn btn-yellow" onClick={onViewMcDonalds}>
        Nearest McDonalds
      </button>
    </div>
  );
}

export default NavigationButtons;
