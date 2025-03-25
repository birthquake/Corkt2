import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

const PhotoUpload = ({ capturedPhoto, onUploadComplete, location }) => {
  const [photoURL, setPhotoURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const base64ToFile = (base64Data, fileName) => {
    try {
      console.log("Processing Base64 data:", base64Data?.substring(0, 100)); // Debug log

      if (!base64Data || !base64Data.startsWith("data:image/")) {
        throw new Error("Invalid Base64 string: Must start with 'data:image/'");
      }

      const base64Parts = base64Data.split(",");
      if (base64Parts.length !== 2) {
        throw new Error("Base64 string is malformed.");
      }

      const byteString = atob(base64Parts[1]);

      // Log ByteString length
      console.log("ByteString length:", byteString.length);

      // Convert to Uint8Array using Array.from for better performance
      const arrayBuffer = Uint8Array.from(byteString, (char) =>
        char.charCodeAt(0)
      );
      return new File([arrayBuffer], fileName, {
        type: base64Parts[0].split(":")[1].split(";")[0],
      });
    } catch (error) {
      console.error("Error in base64ToFile:", error.message);
      return null; // Ensure graceful failure
    }
  };

  useEffect(() => {
    if (capturedPhoto) {
      console.log("Captured photo received:", capturedPhoto?.substring(0, 100)); // Debugging log
      const file = base64ToFile(capturedPhoto, "captured_photo.png");
      if (!file) {
        setError("Failed to process the captured photo.");
        return;
      }
      uploadPhoto(file, location);
    }
  }, [capturedPhoto, location]);

  const uploadPhoto = async (file, location) => {
    setUploading(true);
    setError(null);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser)
        throw new Error("You must be logged in to upload photos.");

      const photoRef = ref(storage, `photos/${currentUser.uid}/${file.name}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);
      setPhotoURL(photoURL);

      await addDoc(collection(db, "photos"), {
        uid: currentUser.uid,
        imageUrl: photoURL,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        timestamp: serverTimestamp(),
      });
      alert("Photo uploaded successfully!");
      if (onUploadComplete) onUploadComplete(); // Notify parent component
    } catch (error) {
      console.error("Error uploading photo:", error);
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Photo Upload</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {uploading && <p>Uploading...</p>}
      {photoURL && (
        <div>
          <p>Uploaded Photo:</p>
          <img src={photoURL} alt="Uploaded" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
