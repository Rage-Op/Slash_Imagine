import express from "express";
import { signup, signin } from "../controllers/auth.controller.js";
import {
  verifySignUpBody,
  verifySignInBody,
  verifyChangePasswordBody,
  verifyChangeEmailBody,
  verifyChangeContactNumberBody,
  verifyChangeFirstNameAndLastNameBody,
  verifyChangeDobBody,
  verifyToken,
} from "../middlewares/auth.mw.js";
import {
  changePassword,
  changeEmail,
  changeContactNumber,
  changeFirstNameAndLastName,
  changeDob,
} from "../controllers/auth.controller.js";

const router = express.Router();

// route to register a user domain/slash_imagine/api/v1/auth/...
router.post("/signup", verifySignUpBody, signup);
// route to signin a user
router.post("/signin", verifySignInBody, signin);
// route to change the password
router.post(
  "/change-password",
  verifyToken,
  verifyChangePasswordBody,
  changePassword
);
// route to change the email
router.post("/change-email", verifyToken, verifyChangeEmailBody, changeEmail);
// route to change the contact number
router.post(
  "/change-contact-number",
  verifyToken,
  verifyChangeContactNumberBody,
  changeContactNumber
);
// route to change the first and last name
router.post(
  "/change-name",
  verifyToken,
  verifyChangeFirstNameAndLastNameBody,
  changeFirstNameAndLastName
);
// route to change the dob
router.post("/change-dob", verifyToken, verifyChangeDobBody, changeDob);

export default router;
