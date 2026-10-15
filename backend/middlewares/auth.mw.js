import { User_Model } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// create a middleware to validate signup request body
export const verifySignUpBody = async (req, res, next) => {
  try {
    // Check for the name
    if (!req.body.firstName) {
      return res.status(400).send({ message: "First name is required" });
    }
    if (!req.body.lastName) {
      return res.status(400).send({ message: "Last name is required" });
    }
    // Check for the email
    if (!req.body.email) {
      return res.status(400).send({ message: "Email is required" });
    }
    // Check for the userName
    if (!req.body.userName) {
      return res.status(400).send({ message: "UserName is required" });
    }
    // Check for the dob
    if (!req.body.dob) {
      return res.status(400).send({ message: "DOB is required" });
    }
    // Check for the contact number
    if (!req.body.contactNumber) {
      return res.status(400).send({ message: "Contact number is required" });
    }
    // Check for the country
    if (!req.body.country) {
      return res.status(400).send({ message: "Country is required" });
    }
    // Check for the password
    if (!req.body.password) {
      return res.status(400).send({ message: "Password is required" });
    }
    // Check for the unique userName or not
    const user = await User_Model.findOne({ userName: req.body.userName });
    if (user) {
      return res.status(400).send({ message: "UserName already exists" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate signin request body
export const verifySignInBody = async (req, res, next) => {
  try {
    // Check for the userName
    if (!req.body.userName) {
      return res.status(400).send({ message: "Username is required" });
    }
    // Check for the password
    if (!req.body.password) {
      return res.status(400).send({ message: "Password is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate the request body for change password
export const verifyChangePasswordBody = async (req, res, next) => {
  try {
    // Check for the old password
    if (!req.body.password) {
      return res.status(400).send({ message: "current password is required" });
    }
    // Check for the new password
    if (!req.body.newPassword) {
      return res.status(400).send({ message: "New password is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate the request body for change email
export const verifyChangeEmailBody = async (req, res, next) => {
  try {
    // Check for the new email
    if (!req.body.newEmail) {
      return res.status(400).send({ message: "New email is required" });
    }
    // Check for password
    if (!req.body.password) {
      return res.status(400).send({ message: "Password is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate the request body for change contact number
export const verifyChangeContactNumberBody = async (req, res, next) => {
  try {
    // Check for the new contact number
    if (!req.body.newContactNumber) {
      return res
        .status(400)
        .send({ message: "New contact number is required" });
    }
    // Check for password
    if (!req.body.password) {
      return res.status(400).send({ message: "Password is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate the request body for change fist and last name
export const verifyChangeFirstNameAndLastNameBody = async (req, res, next) => {
  try {
    // Check for the new first name
    if (!req.body.newFirstName) {
      return res.status(400).send({ message: "New first name is required" });
    }
    // Check for the new last name
    if (!req.body.newLastName) {
      return res.status(400).send({ message: "New last name is required" });
    }
    // Check for password
    if (!req.body.password) {
      return res.status(400).send({ message: "Password is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate the request body for dob
export const verifyChangeDobBody = async (req, res, next) => {
  try {
    // Check for the new dob
    if (!req.body.newDob) {
      return res.status(400).send({ message: "New dob is required" });
    }
    // Check for password
    if (!req.body.password) {
      return res.status(400).send({ message: "Password is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate the token
export const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers["x-access-token"];
    
    if (!token) {
      return res
        .status(401)
        .send({ message: "Access Denied! No token provided" });
    }
    
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).send({ message: "Token expired" });
      }
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).send({ message: "Invalid token" });
      }
      return res.status(401).send({ message: "Token validation failed" });
    }
    
    const user = await User_Model.findOne({ userName: decoded.userName });
    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

// create a middleware to check is the user is admin or not
export const isAdmin = async (req, res, next) => {
  try {
    // read the user from the request object
    const user = req.user;
    // check if the user is admin
    if (user.role !== "Admin") {
      return res.status(403).send({ message: "Access Denied! Not an Admin" });
    }
    next();
  } catch (err) {
    console.log("error while validating the user role", err);
    res.status(500).send({ message: "Error validating the user role" });
  }
};

// create a middleware to check is the user is moderator or not
export const isModerator = async (req, res, next) => {
  try {
    // read the user from the request object
    const user = req.user;
    // check if the user is moderator
    if (user.role !== "Moderator") {
      return res
        .status(403)
        .send({ message: "Access Denied! Not a Moderator" });
    }
    next();
  } catch (err) {
    console.log("error while validating the user role", err);
    res.status(500).send({ message: "Error validating the user role" });
  }
};
