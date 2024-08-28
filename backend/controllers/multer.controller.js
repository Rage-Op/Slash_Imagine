import multer from "multer";
import path from "path";

// FILE STORAGE
// Helper function to generate unique filenames
const generateFilename = (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const extension = path.extname(file.originalname);
  // const baseName = path.basename(file.originalname, extension);
  return `${uniqueSuffix}${extension}`;
};

// Common file filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  };
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
  fileFilter: fileFilter(/jpeg|jpg|png|gif/),
});

// Post Picture Upload Configuration
const postPictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/post-pictures");
  },
  filename: function (req, file, cb) {
    cb(null, generateFilename(file));
  },
});

const postPictureUpload = multer({
  storage: postPictureStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter(/jpeg|jpg|png|gif/),
});

// Post Video Upload Configuration
const postVideoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/post-videos");
  },
  filename: function (req, file, cb) {
    cb(null, generateFilename(file));
  },
});

const postVideoUpload = multer({
  storage: postVideoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: fileFilter(/mp4|avi|mkv|mov/),
});
// FILE STORAGE

export { profilePictureUpload, postPictureUpload, postVideoUpload };
