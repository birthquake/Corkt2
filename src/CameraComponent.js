import React, { useRef, useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage, db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [caption, setCaption] = useState(""); // State to store the caption

  // Automatically start the camera when the component is mounted
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        setError(`Unable to access the camera. Error: ${err.message}`);
      }
    };

    startCamera();

    return () => stopCamera(); // Cleanup: Stop the camera when the component is unmounted
  }, []);

  // Stop the camera by stopping the video stream
  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Video feed is not ready. Please try again.");
      return;
    }

    if (canvas) {
      const maxWidth = 800; // Resize width
      const scale = maxWidth / video.videoWidth;

      canvas.width = maxWidth;
      canvas.height = video.videoHeight * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/png", 0.3);

      // Obtain user's location and then upload the photo
      getUserLocation()
        .then((location) => {
          uploadPhoto(imageData, location);
        })
        .catch((error) => {
          console.error("Error fetching location:", error);
          setError(
            "Failed to retrieve location. Uploading photo without location data."
          );
          uploadPhoto(imageData, null); // Proceed without location if error occurs
        });
    }
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({
            latitude: parseFloat(latitude.toFixed(2)), // Round to 3 decimal places
            longitude: parseFloat(longitude.toFixed(2)), // Round to 3 decimal places
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const uploadPhoto = async (photo, location) => {
    setUploading(true);
    setError(null);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("You must be logged in to upload photos.");
      }

      console.log("Uploading photo for user ID:", currentUser.uid);

      // Generate file name with UID and timestamp
      const photoRef = ref(storage, `photos/${currentUser.uid}_${Date.now()}`);

      // Upload photo with metadata
      await uploadString(photoRef, photo, "data_url", {
        customMetadata: { uid: currentUser.uid },
      });

      const downloadURL = await getDownloadURL(photoRef);

      // Save metadata to Firestore, including caption, location, and timestamp
      await addDoc(collection(db, "photos"), {
        uid: currentUser.uid,
        imageUrl: downloadURL,
        caption: caption || null, // Save caption if available
        timestamp: serverTimestamp(), // Firestore's server-side timestamp
        latitude: location?.latitude || null, // Add latitude if available
        longitude: location?.longitude || null, // Add longitude if available
      });

      console.log("Photo successfully uploaded with metadata:", {
        caption,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      alert("Photo uploaded successfully!");
      setCaption(""); // Clear caption after upload
    } catch (error) {
      console.error("Error uploading photo:", error.message || error);
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Camera and Photo Upload</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {uploading && <p>Uploading...</p>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: "500px", border: "1px solid black" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {/* Caption Input */}
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Enter a caption for your photo"
        style={{
          display: "block",
          margin: "20px 0",
          width: "100%",
          padding: "10px",
        }}
      />

      <button onClick={capturePhoto} disabled={uploading}>
        {uploading ? "Uploading..." : "Capture Photo"}
      </button>

      <button onClick={stopCamera} style={{ marginTop: "10px" }}>
        Stop Camera
      </button>
    </div>
  );
};

export default CameraComponent;
