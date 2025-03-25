require("dotenv").config(); // Load environment variables
const { Storage } = require("@google-cloud/storage");

// Initialize Google Cloud Storage with credentials from .env file
const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // Correctly formats private key
  },
});

async function setCORSConfiguration() {
  const bucketName = "corkt-47808.appspot.com"; // Your Firebase Storage bucket name
  const corsConfig = [
    {
      origin: ["*"], // Replace "*" with your app's domain(s) for production
      method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      maxAgeSeconds: 3600,
      responseHeader: ["Content-Type", "Authorization"],
    },
  ];

  try {
    // Apply the CORS configuration to your bucket
    await storage.bucket(bucketName).setCorsConfiguration(corsConfig);
    console.log(
      `CORS configuration applied successfully to bucket: ${bucketName}`
    );
  } catch (error) {
    console.error("Failed to set CORS configuration:", error);
  }
}

setCORSConfiguration(); // Run the function
