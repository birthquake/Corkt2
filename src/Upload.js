import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

const Upload = ({ capturedPhoto }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [photoURL, setPhotoURL] = useState("");

  const base64ToFile = (base64Data, fileName) => {
    try {
      if (!base64Data.startsWith("data:image/")) {
        throw new Error("Invalid image format. Ensure it is Base64 encoded.");
      }

      const base64Parts = base64Data.split(",");
      if (base64Parts.length !== 2) {
        throw new Error("Invalid Base64 format");
      }

      const byteString = atob(base64Parts[1]);
      const mimeString = base64Parts[0].split(":")[1].split(";")[0];

      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }

      return new File([arrayBuffer], fileName, { type: mimeString });
    } catch (error) {
      console.error("Error in base64ToFile:", error.message);
      return null;
    }
  };

  useEffect(() => {
    if (capturedPhoto) {
      console.log("Captured photo received:", capturedPhoto);

      const file = base64ToFile(capturedPhoto, "captured_photo.png");
      if (!file) {
        setError("Failed to process the captured photo.");
        return;
      }

      handleUpload(file);
    }
  }, [capturedPhoto]);

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);

    try {
      console.log("Starting upload...");

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("You must be logged in to upload photos.");
      }
      console.log("User authenticated:", user.uid);

      // Create a storage reference
      const photoRef = ref(storage, `photos/${user.uid}/${file.name}`);
      console.log("Storage reference created:", photoRef);

      // Upload the photo
      await uploadBytes(photoRef, file);
      console.log("Photo uploaded to storage");

      // Get the photo's download URL
      const photoURL = await getDownloadURL(photoRef);
      console.log("Photo download URL generated:", photoURL);

      // Save metadata to Firestore
      await addDoc(collection(db, "photos"), {
        uid: user.uid,
        imageUrl: photoURL,
        timestamp: serverTimestamp(),
      });
      console.log("Photo metadata saved to Firestore");

      setPhotoURL(photoURL);
      alert("Photo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error.message || error);
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

export default Upload;
