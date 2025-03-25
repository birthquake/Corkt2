import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2T8lzdL0NnISm5P0maF8KOiGkeIqRKfg",
  authDomain: "corkt-47808.firebaseapp.com",
  projectId: "corkt-47808",
  storageBucket: "corkt-47808.firebasestorage.app", // This is confirmed as correct
  messagingSenderId: "377879639553",
  appId: "1:377879639553:web:cdb70454f99ef5d1083200",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services with logging to confirm proper initialization
export const auth = getAuth(app); // Auth service
export const db = getFirestore(app); // Firestore database
export const storage = getStorage(app); // Storage service

// Debugging logs to validate initialization
console.log("Firebase initialized successfully:");
console.log("Auth service:", auth);
console.log("Firestore database:", db);
console.log("Storage service:", storage);
