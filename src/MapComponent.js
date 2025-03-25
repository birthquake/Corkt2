import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const MapComponent = ({ markers }) => {
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null); // Store selected marker data

  const isValidMarker = (marker) =>
    typeof marker.latitude === "number" &&
    isFinite(marker.latitude) &&
    typeof marker.longitude === "number" &&
    isFinite(marker.longitude);

  const validMarkers = markers.filter(isValidMarker);

  const onMapLoad = (map) => {
    mapRef.current = map;
    console.log("Map loaded successfully.");
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker); // Set the clicked marker's data
  };

  const closeModal = () => {
    setSelectedMarker(null); // Close the modal by resetting selected marker
  };

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const defaultCenter = { lat: 0, lng: 0 }; // Fallback center
  const defaultZoom = 18; // Broader perspective

  const center =
    validMarkers.length > 0
      ? { lat: validMarkers[0].latitude, lng: validMarkers[0].longitude }
      : defaultCenter;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={defaultZoom}
        onLoad={onMapLoad}
        options={{
          zoomControl: true, // Enable zoom controls
          gestureHandling: "auto", // Allow user interaction
        }}
      >
        {validMarkers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            onClick={() => handleMarkerClick(marker)} // Add click event
            title={`Photo taken here: ${
              marker.description || "No description"
            }`}
          />
        ))}
      </GoogleMap>

      {/* Modal to display photo and description */}
      {selectedMarker && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeModal} // Close modal on outside click
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              maxWidth: "90%",
              maxHeight: "90%",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
          >
            <h3>Photo Details</h3>
            <img
              src={selectedMarker.imageUrl}
              alt="Selected"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                marginBottom: "20px",
              }}
            />
            <p>{selectedMarker.description || "No description available."}</p>
            <button onClick={closeModal} style={{ padding: "10px 20px" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
