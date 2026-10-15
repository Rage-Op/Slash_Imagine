import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const ensureDir = (dirPath) => {
  const fullPath = path.join(__dirname, "..", dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
};

ensureDir("public/assets/profile-pictures");
ensureDir("public/assets/post-pictures");
ensureDir("public/assets/post-videos");

// Helper function to generate unique filenames
const generateFilename = (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const extension = path.extname(file.originalname);
  return `${uniqueSuffix}${extension}`;
};

// Profile Picture Upload Configuration
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/profile-pictures");
  },
  filename: function (req, file, cb) {
    const filename = generateFilename(file);
    req.body.avatarFilename = filename;
    cb(null, filename);
  },
});

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only images are allowed."));
  },
});

// Post Media Upload Configuration - supports both pictures and videos
const postMediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const imageTypes = /jpeg|jpg|png|gif/;
    const videoTypes = /mp4|avi|mkv|mov|video/;
    
    if (imageTypes.test(file.mimetype) || imageTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, "public/assets/post-pictures");
    } else if (videoTypes.test(file.mimetype) || videoTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, "public/assets/post-videos");
    } else {
      cb(new Error("Invalid file type"), null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, generateFilename(file));
  },
});

const postMediaUpload = multer({
  storage: postMediaStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mkv|mov|video/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only images and videos are allowed."));
  },
});

export { profilePictureUpload, postMediaUpload };
