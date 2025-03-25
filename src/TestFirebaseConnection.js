import React, { useEffect } from "react";
import { auth } from "./firebaseConfig";

const TestFirebaseConnection = () => {
  useEffect(() => {
    // Check if Firebase Authentication is initialized
    if (auth) {
      console.log("Firebase is successfully connected!");
    } else {
      console.error("Firebase connection failed.");
    }
  }, []);

  return <div>Check the browser console for Firebase connection status!</div>;
};

export default TestFirebaseConnection;
