import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const useFetchPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null); // Reset any previous errors
    try {
      const q = query(
        collection(db, "photos"),
        orderBy("timestamp", "desc") // Sort by most recent
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setPhotos([]); // Show empty gallery
      } else {
        const fetchedPhotos = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            imageUrl: data.imageUrl || "placeholder.jpg", // Fallback for missing imageUrl
          };
        });

        setPhotos(fetchedPhotos);
        console.log("Fetched photos:", fetchedPhotos); // Debugging log
      }
    } catch (err) {
      console.error("Error while fetching photos:", err);
      setError("Failed to fetch photos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return { photos, loading, error };
};
