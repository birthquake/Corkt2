import React, { useState } from "react";

const Geolocation = ({ onLocationUpdate }) => {
  const [location, setLocation] = useState(null);

  const getLocation = () => {
    try {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log("Retrieved location:", newLocation);
          setLocation(newLocation);

          // Safely call onLocationUpdate if it exists
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          } else {
            console.warn("onLocationUpdate function not provided.");
          }
        },
        (error) => {
          console.error("Error retrieving location:", error.message); // Log error safely
        }
      );
    } catch (err) {
      console.error("Unexpected error occurred in getLocation:", err.message); // Handle unexpected errors
    }
  };

  return (
    <div>
      <button onClick={getLocation}>Get Location</button>
      {location && (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      )}
    </div>
  );
};

export default Geolocation;
