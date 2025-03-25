import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";
import Signup from "./Signup";
import Login from "./Login";
import Geolocation from "./Geolocation";
import UploadPage from "./UploadPage";
import PhotoGallery from "./PhotoGallery";
import MapComponent from "./MapComponent";
import PersonalGallery from "./PersonalGallery";
import ProfilePage from "./ProfilePage";
import SignOut from "./SignOut";
import { LoadScript } from "@react-google-maps/api";
import CameraComponent from "./CameraComponent";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        setUser(currentUser);
      } else {
        console.log("No user logged in.");
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMarkers = () => {
      const photosRef = collection(db, "photos");
      onSnapshot(photosRef, (snapshot) => {
        const newMarkers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Real-time markers update:", newMarkers);
        setMarkers(newMarkers);
      });
    };

    fetchMarkers();

    // Add a temporary debug marker to test rendering
    const debugMarker = {
      latitude: 37.7749,
      longitude: -122.4194,
      imageUrl: "https://debug-photo-url.com/photo.jpg",
    };
    setMarkers((prevMarkers) => [...prevMarkers, debugMarker]);
  }, []);

  const handleLocationUpdate = (location) => {
    console.log("Location updated:", location);
    setUserLocation(location);
  };

  if (authLoading) {
    return <p>Loading authentication...</p>;
  }

  return (
    <LoadScript googleMapsApiKey="AIzaSyCAE5FDEOiXe5dJwHjxlcIJwjFT9QwmAo8">
      <Router>
        <div className="App">
          <h1>Corkt</h1>

          {user ? (
            <div>
              <p>Welcome, {user.email}!</p>
              <SignOut />
              <nav>
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/gallery">Gallery</Link>
                  </li>
                  <li>
                    <Link to="/upload">Upload</Link>
                  </li>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <Link to="/camera">Camera</Link>
                  </li>
                </ul>
              </nav>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Geolocation onLocationUpdate={handleLocationUpdate} />
                  }
                />
                <Route path="/gallery" element={<PersonalGallery />} />
                <Route path="/upload" element={<UploadPage user={user} />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/camera" element={<CameraComponent />} />
              </Routes>
              <MapComponent markers={markers} />
              <PhotoGallery />
              {userLocation && (
                <p>
                  Current Location: Latitude {userLocation.latitude}, Longitude{" "}
                  {userLocation.longitude}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h2>Please Sign Up or Log In</h2>
              <Signup />
              <Login />
            </div>
          )}
        </div>
      </Router>
    </LoadScript>
  );
}
