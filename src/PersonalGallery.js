import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./PersonalGallery.css";

const PersonalGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // For infinite scroll
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null); // Keep track of last document
  const [hasMore, setHasMore] = useState(true); // Check if more photos are available

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchInitialPhotos(user);
      } else {
        setPhotos([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchInitialPhotos = async (user) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "photos"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(10) // Fetch only the first 10 photos
      );

      const querySnapshot = await getDocs(q);
      const userPhotos = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          imageUrl: data.imageUrl || "placeholder.jpg", // Fallback for missing imageUrl
        };
      });

      setPhotos(userPhotos);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Track the last doc
      setHasMore(!querySnapshot.empty); // Check if there are more docs
      console.log("Fetched initial photos:", userPhotos); // Debugging log
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError("Failed to fetch photos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePhotos = async (user) => {
    if (!hasMore) return; // No more photos to load
    setLoadingMore(true);
    setError(null);
    try {
      const q = query(
        collection(db, "photos"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible), // Start after the last visible doc
        limit(10) // Fetch the next 10 photos
      );

      const querySnapshot = await getDocs(q);
      const morePhotos = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          imageUrl: data.imageUrl || "placeholder.jpg", // Fallback for missing imageUrl
        };
      });

      setPhotos((prevPhotos) => [...prevPhotos, ...morePhotos]); // Append new photos
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Update last doc
      setHasMore(!querySnapshot.empty); // Check if there are more docs
      console.log("Fetched more photos:", morePhotos); // Debugging log
    } catch (err) {
      console.error("Error loading more photos:", err);
      setError("Failed to load more photos. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll: Detect when user scrolls to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 // Trigger 100px before bottom
      ) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && !loadingMore && hasMore) {
          fetchMorePhotos(user);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMore]);

  if (loading) return <p>Loading your personal photos...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Your Personal Photo Gallery</h2>

      {photos.length === 0 ? (
        <p>No photos uploaded yet.</p>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={photo.imageUrl} alt="Uploaded" width="300" />
            </div>
          ))}
        </div>
      )}

      {loadingMore && <p>Loading more photos...</p>}
      {!hasMore && <p>No more photos to load.</p>}
    </div>
  );
};

export default PersonalGallery;
