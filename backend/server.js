import app from "./app.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import cors from "cors";  // Import cors

dotenv.config();

// ✅ Enable CORS Middleware
app.use(cors({ origin: "http://localhost:5174", credentials: true })); 

// ✅ Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// ✅ Start the Server
app.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});
