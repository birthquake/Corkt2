import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./PhotoGallery.css"; // Ensure styling is in place

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]); // For filtered results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // For search input
  const [startDate, setStartDate] = useState(""); // For start date filter
  const [endDate, setEndDate] = useState(""); // For end date filter

  useEffect(() => {
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
          setPhotos([]);
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
          setFilteredPhotos(fetchedPhotos); // Initialize filtered photos
          console.log("Fetched photos:", fetchedPhotos); // Debugging log
        }
      } catch (err) {
        console.error("Error while fetching photos:", err);
        setError("Failed to fetch photos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Handle search term changes
  useEffect(() => {
    let results = photos;

    if (searchTerm) {
      results = results.filter(
        (photo) =>
          (photo.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (photo.tags || []).some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (startDate) {
      results = results.filter((photo) => {
        const photoTimestamp = photo.timestamp.toDate
          ? photo.timestamp.toDate() // Firestore Timestamp
          : new Date(photo.timestamp); // ISO string fallback
        return photoTimestamp >= new Date(startDate);
      });
    }

    if (endDate) {
      results = results.filter((photo) => {
        const photoTimestamp = photo.timestamp.toDate
          ? photo.timestamp.toDate() // Firestore Timestamp
          : new Date(photo.timestamp); // ISO string fallback
        return photoTimestamp <= new Date(endDate);
      });
    }

    setFilteredPhotos(results);
  }, [searchTerm, startDate, endDate, photos]);

  if (loading) return <p>Loading photos...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Photo Gallery</h2>

      {/* Search and filter controls */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {filteredPhotos.length === 0 ? (
        <p>No photos match your search criteria.</p>
      ) : (
        <div className="gallery-grid">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={photo.imageUrl} alt="Uploaded" width="300" />
              <p>{photo.description || "No description available."}</p>
              {photo.tags && photo.tags.length > 0 && (
                <p>Tags: {photo.tags.join(", ")}</p>
              )}
              {photo.timestamp && (
                <p>
                  Uploaded on:{" "}
                  {
                    photo.timestamp.toDate
                      ? photo.timestamp.toDate().toLocaleString() // Firestore Timestamp
                      : new Date(photo.timestamp).toLocaleString() // ISO string fallback
                  }
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
