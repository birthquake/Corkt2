import React from "react";
import PhotoUpload from "./PhotoUpload";

const UploadPage = ({ user }) => {
  return (
    <div>
      <h1>Upload Your Photos</h1>
      <PhotoUpload user={user} /> {/* Pass the current user as a prop */}
    </div>
  );
};

export default UploadPage;
