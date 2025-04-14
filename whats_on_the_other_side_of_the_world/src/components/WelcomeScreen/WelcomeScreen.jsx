import React from "react";

function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1>What's On The Other Side Of The World?</h1>
          <p>Discover what's directly below your feet...</p>
        </div>

        <div className="welcome-globe">
          <div className="globe-icon large-globe">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.6 9H20.4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.6 15H20.4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 3C14.4853 3 16.5 7.02944 16.5 12C16.5 16.9706 14.4853 21 12 21C9.51472 21 7.5 16.9706 7.5 12C7.5 7.02944 9.51472 3 12 3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <button className="welcome-button" onClick={onStart}>
          Start Exploring
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
