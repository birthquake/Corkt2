import React from "react";
import { getAuth, signOut } from "firebase/auth";

const SignOut = () => {
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User successfully signed out.");
        alert("You have been signed out.");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
      });
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        margin: "10px",
        padding: "10px 20px",
        backgroundColor: "#f44336",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Sign Out
    </button>
  );
};

export default SignOut;
