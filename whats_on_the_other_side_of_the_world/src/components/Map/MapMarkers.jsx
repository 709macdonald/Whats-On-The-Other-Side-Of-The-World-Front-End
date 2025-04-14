import React from "react";

export const createSearchedLocationMarker = () => {
  const container = document.createElement("div");
  container.style.position = "relative";

  const marker = document.createElement("div");
  marker.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="dropShadowGreen" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000066"/>
      </filter>
      <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z"
           fill="#4CAF50" filter="url(#dropShadowGreen)"/>
      <circle cx="20" cy="12.5" r="5" fill="#2E7D32"/>
    </svg>
  `;
  container.appendChild(marker);

  return container;
};

export const createAntipodeMarker = () => {
  const container = document.createElement("div");
  container.style.position = "relative";

  const marker = document.createElement("div");
  marker.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="dropShadowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000066"/>
      </filter>
      <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z"
           fill="#FF5252" filter="url(#dropShadowRed)"/>
      <circle cx="20" cy="12.5" r="5" fill="white"/>
    </svg>
  `;
  container.appendChild(marker);

  return container;
};

export const createMcDonaldsMarker = () => {
  const container = document.createElement("div");
  container.style.position = "relative";

  const marker = document.createElement("div");
  marker.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="dropShadowMcD" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000066"/>
      </filter>
      <path d="M20 0C12.8 0 7 5.8 7 13C7 20.2 20 40 20 40S33 20.2 33 13C33 5.8 27.2 0 20 0ZM20 17.5C17.25 17.5 15 15.25 15 12.5C15 9.75 17.25 7.5 20 7.5C22.75 7.5 25 9.75 25 12.5C25 15.25 22.75 17.5 20 17.5Z"
           fill="#FFBC0D" filter="url(#dropShadowMcD)"/>
      <circle cx="20" cy="12.5" r="5" fill="#DA291C"/>
    </svg>
  `;
  container.appendChild(marker);

  return container;
};
