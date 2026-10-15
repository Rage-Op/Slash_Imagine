import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User_Model } from "../models/user.model.js";

// Password validation helper (same rules as frontend)
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

// Logic to register a user
export const signup = async (req, res) => {
  try {
    const request_body = req.body;
    const normalizedEmail = request_body.email.toLowerCase().trim();
    
    // Validate password strength
    const passwordError = validatePassword(request_body.password);
    if (passwordError) {
      return res.status(400).send({ message: passwordError });
    }
    
    // Check for existing email (case-insensitive)
    const existingEmail = await User_Model.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    if (existingEmail) {
      return res.status(409).send({ message: "Email already in use" });
    }
    
    // Check for existing username
    const existingUsername = await User_Model.findOne({ userName: request_body.userName });
    if (existingUsername) {
      return res.status(409).send({ message: "Username already taken" });
    }

    const userObj = {
      firstName: request_body.firstName,
      lastName: request_body.lastName,
      userName: request_body.userName,
      dob: request_body.dob,
      contactNumber: request_body.contactNumber,
      country: request_body.country,
      password: bcrypt.hashSync(request_body.password, 8),
      email: normalizedEmail,
    };
    
    const user_created = await User_Model.create(userObj);
    
    const token = jwt.sign(
      { userName: user_created.userName },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    const res_obj = {
      firstName: user_created.firstName,
      lastName: user_created.lastName,
      userName: user_created.userName,
      dob: user_created.dob,
      contactNumber: user_created.contactNumber,
      country: user_created.country,
      email: user_created.email,
      accessToken: token,
    };
    
    res.status(201).send(res_obj);
  } catch (error) {
    console.error("Error creating user:", error.message);
    
    // Handle MongoDB duplicate key error (shouldn't happen with pre-checks, but just in case)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === "email") {
        return res.status(409).send({ message: "Email already in use" });
      }
      if (field === "userName") {
        return res.status(409).send({ message: "Username already taken" });
      }
      return res.status(409).send({ message: "Duplicate entry" });
    }
    
    res.status(500).send({ message: "Error creating user" });
  }
};

// Logic to signin
export const signin = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.body.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName" });
    }
    // check if password is correct
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }
    // generate JWT token
    const token = jwt.sign(
      { userName: user.userName },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    // return user details and token
    res.status(200).send({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      dob: user.dob,
      contactNumber: user.contactNumber,
      email: user.email,
      country: user.country,
      accessToken: token,
    });
  } catch (error) {
    console.error("Error updating dob:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating dob", error });
  }
};

// Logic to change password
export const changePassword = async (req, res) => {
  try {
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName" });
    }
    
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }
    
    if (req.body.newPassword === req.body.password) {
      return res.status(400).send({ message: "New password cannot be same as old password" });
    }
    
    // Validate new password strength
    const passwordError = validatePassword(req.body.newPassword);
    if (passwordError) {
      return res.status(400).send({ message: passwordError });
    }
    
    user.password = bcrypt.hashSync(req.body.newPassword, 8);
    await user.save();
    
    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).send({ message: "Error updating password" });
  }
};

// Logic to change email
export const changeEmail = async (req, res) => {
  try {
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName" });
    }
    
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }
    
    const newEmail = req.body.newEmail.toLowerCase().trim();
    
    if (newEmail === user.email.toLowerCase()) {
      return res.status(400).send({ message: "New email cannot be same as old email" });
    }
    
    if (await User_Model.findOne({ email: { $regex: new RegExp(`^${newEmail}$`, 'i') } })) {
      return res.status(409).send({ message: "Email already in use" });
    }
    
    user.email = newEmail;
    await user.save();
    
    res.status(200).send({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Error updating email:", error.message);
    res.status(500).send({ message: "Error updating email" });
  }
};

// Logic to change contact number
export const changeContactNumber = async (req, res) => {
  try {
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName" });
    }
    
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }
    
    if (req.body.newContactNumber === user.contactNumber) {
      return res.status(400).send({
        message: "New contact number cannot be same as old contact number",
      });
    }
    
    if (await User_Model.findOne({ contactNumber: req.body.newContactNumber })) {
      return res.status(409).send({ message: "Contact number already in use" });
    }
    
    user.contactNumber = req.body.newContactNumber;
    await user.save();
    
    res.status(200).send({ message: "Contact number updated successfully" });
  } catch (error) {
    console.error("Error updating contact number:", error.message);
    res.status(500).send({ message: "Error updating contact number" });
  }
};

// Logic to change first name and last name
export const changeFirstNameAndLastName = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName" });
    }
    // check if password is correct
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }
    // update the first name and last name
    user.firstName = req.body.newFirstName;
    user.lastName = req.body.newLastName;
    await user.save();
    // return success message
    res
      .status(200)
      .send({ message: "First name and last name updated successfully" });
  } catch (error) {
    console.error("Error updating first and last name:", error);
    res.status(500).send({
      message: "Some error occurred while updating first and last name",
      error,
    });
  }
};

// Logic to change dob
export const changeDob = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName" });
    }
    // check if password is correct
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid password" });
    }
    // update the dob
    user.dob = req.body.newDob;
    await user.save();
    // return success message
    res.status(200).send({ message: "Dob updated successfully" });
  } catch (error) {
    console.error("Error updating dob:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating dob", error });
  }
};
