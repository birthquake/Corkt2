import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [nearbyPhotos, setNearbyPhotos] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) throw new Error("No user is currently logged in.");

        console.log("Authenticated User UID:", currentUser.uid);

        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) throw new Error("User data not found.");

        const userData = userSnapshot.data();
        setUserData(userData);
        setFormData({
          username: userData.username || "",
          bio: userData.bio || "",
        });
        setProfileImage(userData.profilePicture || null);
      } catch (err) {
        console.error("Error fetching user data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected File:", file);
      setProfileImage(URL.createObjectURL(file));
      uploadProfileImage(file);
    }
  };

  const uploadProfileImage = async (file) => {
    setUploading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) throw new Error("No user is currently logged in.");

      const uniqueFileName = `${currentUser.uid}_${Date.now()}_${file.name}`;
      const imageRef = ref(storage, `profilePictures/${uniqueFileName}`);

      await uploadBytes(imageRef, file, { metadata: { uid: currentUser.uid } });

      const downloadURL = await getDownloadURL(imageRef);
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { profilePicture: downloadURL });

      setUserData({ ...userData, profilePicture: downloadURL });
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error uploading profile picture:", err.message);
      setError("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
          },
          (err) => {
            console.error("Error fetching location:", err.message);
            setError("Could not fetch location.");
          }
        );
      } else {
        console.error("Geolocation is not supported by your browser.");
        setError("Geolocation is not supported.");
      }
    };

    fetchUserLocation();
  }, []);

  useEffect(() => {
    const fetchNearbyPhotos = async () => {
      if (!userLocation.latitude || !userLocation.longitude) return;

      try {
        const photosRef = collection(db, "photos");
        const photosQuery = query(photosRef);
        const photoSnapshots = await getDocs(photosQuery);

        const allPhotos = photoSnapshots.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const proximityRadius = 5; // Radius in kilometers

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371; // Radius of Earth in kilometers
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const filteredPhotos = allPhotos.filter((photo) => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            photo.latitude,
            photo.longitude
          );
          return distance <= proximityRadius;
        });

        setNearbyPhotos(filteredPhotos);
      } catch (err) {
        console.error("Error fetching nearby photos:", err.message);
        setError("Failed to fetch nearby photos.");
      }
    };

    if (userLocation.latitude && userLocation.longitude) fetchNearbyPhotos();
  }, [userLocation]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) throw new Error("No user is currently logged in.");

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        username: formData.username,
        bio: formData.bio,
      });

      setUserData({ ...userData, ...formData });
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err.message);
      setError("Failed to update profile.");
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;

  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile Page</h2>
      <div className="profile-header">
        <img
          src={profileImage || "https://via.placeholder.com/150"}
          alt="Profile Avatar"
          className="profile-avatar"
        />
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="profile-input"
          />
        )}
      </div>
      <div className="profile-details">
        {isEditing ? (
          <>
            <label className="profile-item">
              <strong>Username:</strong>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="profile-input"
              />
            </label>
            <label className="profile-item">
              <strong>Bio:</strong>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="profile-input"
              />
            </label>
          </>
        ) : (
          <>
            <p className="profile-item">
              <strong>Username:</strong>{" "}
              {userData.username || "No username provided"}
            </p>
            <p className="profile-item">
              <strong>Bio:</strong> {userData.bio || "No bio provided"}
            </p>
          </>
        )}
      </div>
      <div className="profile-actions">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="profile-button"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save Changes"}
            </button>
            <button onClick={toggleEdit} className="profile-button">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={toggleEdit} className="profile-button">
            Edit Profile
          </button>
        )}
      </div>
      <div className="photo-gallery">
        <h3>Nearby Photos</h3>
        {nearbyPhotos.length > 0 ? (
          nearbyPhotos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img src={photo.url} alt="Nearby" className="photo-image" />
            </div>
          ))
        ) : (
          <p>No nearby photos found.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
