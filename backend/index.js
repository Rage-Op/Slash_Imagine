import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import { User_Model } from "./models/user.model.js";

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: "true" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: "true" }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// MONGOOSE
const PORT = process.env.PORT || 6001;
const HOST = process.env.HOST || "127.0.0.1";
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    init();
    app.listen(PORT, HOST, () => console.log(`Server running at http://${HOST}:${PORT}`));
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });
// MONGOOSE

// INITIALIZE ADMIN USER
async function init() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@slashimagine.local";
  
  try {
    let user = await User_Model.findOne({ userName: adminUsername });

    if (user) {
      console.log("Admin user already exists");
      return;
    }
  } catch (err) {
    console.log("Error while reading the data", err);
  }
  try {
    const user = await User_Model.create({
      firstName: "Admin",
      lastName: "User",
      userName: adminUsername,
      dob: "2000-01-01",
      contactNumber: "+1 0000000000",
      country: "United States",
      password: bcrypt.hashSync(adminPassword, 8),
      email: adminEmail,
      role: "Admin",
      membership: "Premium",
    });
    await user.save();
    console.log("Admin user created");
  } catch (err) {
    console.log("Error creating admin user:", err.message);
  }
}
// INITIALIZE ADMIN USER

// Use the auth routes with a prefix
app.use("/slash_imagine/api/v1/auth", authRoutes);
app.use("/slash_imagine/api/v1/user", userRoutes);
app.use("/slash_imagine/api/v1/posts", postsRoutes);
