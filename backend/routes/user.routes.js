import express from "express";
import {
  changeAvatar,
  changeCountry,
  addInterests,
  changeRole,
  addRequest,
  getHomeFeed,
  getUser,
  listUsers,
} from "../controllers/user.controller.js";
import { profilePictureUpload } from "../controllers/multer.controller.js";
import { isAdmin, verifyToken } from "../middlewares/auth.mw.js";
import {
  verifyChangeCountryBody,
  verifyChangeAvatarBody,
  verifyAddInterestsBody,
  verifyChangeRoleBody,
  verifyAddRequestBody,
} from "../middlewares/user.mw.js";
const router = express.Router();

// route to get user home feed domain/slash_imagine/api/v1/user/...
router.get("/get-home-feed", verifyToken, getHomeFeed);
router.post("/get-user", verifyToken, getUser);
router.post(
  "/change-avatar",
  verifyToken,
  profilePictureUpload.single("avatar"),
  verifyChangeAvatarBody,
  changeAvatar
);
router.post(
  "/change-country",
  verifyToken,
  verifyChangeCountryBody,
  changeCountry
);
router.post("/add-Interest", verifyToken, verifyAddInterestsBody, addInterests);
router.post(
  "/change-role",
  verifyToken,
  isAdmin,
  verifyChangeRoleBody,
  changeRole
);
router.post("/add-request", verifyToken, verifyAddRequestBody, addRequest);

// Admin routes
router.get("/list-users", verifyToken, isAdmin, listUsers);

export default router;
