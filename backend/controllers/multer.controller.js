import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.join(__dirname, "..");

// Absolute paths for upload directories
const UPLOAD_DIRS = {
  profilePictures: path.join(BACKEND_ROOT, "public/assets/profile-pictures"),
  postPictures: path.join(BACKEND_ROOT, "public/assets/post-pictures"),
  postVideos: path.join(BACKEND_ROOT, "public/assets/post-videos"),
};

// Ensure upload directories exist on module load
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper function to generate unique filenames
const generateFilename = (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const extension = path.extname(file.originalname).toLowerCase();
  return `${uniqueSuffix}${extension}`;
};

// Helper to delete uploaded files (for cleanup on errors)
export const deleteUploadedFiles = (files) => {
  if (!files) return;
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => {
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting file:", file.path, err.message);
        }
      });
    }
  });
};

// Helper to delete file by path
export const deleteFileByPath = (filePath) => {
  if (!filePath) return;
  
  let fullPath = filePath;
  if (filePath.startsWith("/assets/")) {
    fullPath = path.join(BACKEND_ROOT, "public", filePath);
  } else if (!path.isAbsolute(filePath)) {
    fullPath = path.join(BACKEND_ROOT, "public", filePath);
  }
  
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Error deleting file:", fullPath, err.message);
    }
  });
};

// Profile Picture Upload Configuration
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIRS.profilePictures);
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
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed"));
  },
});

// Post Media Upload Configuration - supports both pictures and videos
const postMediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const imageTypes = /jpeg|jpg|png|gif/;
    const videoTypes = /mp4|avi|mkv|mov/;
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (imageTypes.test(file.mimetype) || imageTypes.test(ext)) {
      cb(null, UPLOAD_DIRS.postPictures);
    } else if (videoTypes.test(file.mimetype) || videoTypes.test(ext)) {
      cb(null, UPLOAD_DIRS.postVideos);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type"));
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
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mkv|mov/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error("Only image and video files are allowed"));
  },
});

// Multer error handling middleware
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: err.message || "Invalid file type" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files" });
    }
    return res.status(400).json({ message: err.message || "File upload error" });
  }
  if (err && err.message) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

export { profilePictureUpload, postMediaUpload, UPLOAD_DIRS, BACKEND_ROOT };
