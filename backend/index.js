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
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: "true" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: "true" }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
// CONFIGUARTIONS

// MONGOOSE
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    init();
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
// MONGOOSE

// INITIALIZE ADMIN USER
async function init() {
  try {
    let user = await User_Model.findOne({ userName: "rage_op" });

    if (user) {
      console.log("Admin user already exists");
      return;
    }
  } catch (err) {
    console.log("Error while reading the data", err);
  }
  try {
    const user = await User_Model.create({
      firstName: "pravin",
      lastName: "maurya",
      userName: "rage_op",
      dob: "2006-11-18",
      contactNumber: "+977 9800000000",
      country: "Nepal",
      password: bcrypt.hashSync("Pravin@11223344", 8),
      email: "pravinyt1122334455@gmail.com",
      role: "Admin",
      membership: "Premium",
    });
    // save the user to the database
    await user.save();
    console.log("Admin created");
  } catch (err) {
    console.log("error creating admin user", err);
  }
}
// INITIALIZE ADMIN USER

// Use the auth routes with a prefix
app.use("/slash_imagine/api/v1/auth", authRoutes);
app.use("/slash_imagine/api/v1/user", userRoutes);
app.use("/slash_imagine/api/v1/posts", postsRoutes);
