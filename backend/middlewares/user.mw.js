import { User_Model } from "../models/user.model.js";

// create a middleware to validate change avatar request body
export const verifyChangeAvatarBody = async (req, res, next) => {
  try {
    // Check for the newAvatar
    if (!req.body.avatarFilename) {
      return res.status(400).send({ message: "Avatar file name is required." });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate change country request body
export const verifyChangeCountryBody = async (req, res, next) => {
  try {
    // Check for the newCountry
    if (!req.body.newCountry) {
      return res.status(400).send({ message: "New country is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate add interests request body
export const verifyAddInterestsBody = async (req, res, next) => {
  try {
    // Check for the interests
    if (!req.body.newInterests) {
      return res.status(400).send({ message: "New interests are required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate change role request body
export const verifyChangeRoleBody = async (req, res, next) => {
  try {
    // Check for the newRole
    if (!req.body.newRole) {
      return res.status(400).send({ message: "New role is required" });
    }
    // Check for the userName of ther user whose role is to be changed
    if (!req.body.userName) {
      return res
        .status(400)
        .send({ message: "Username of whom to change is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate add new friend request body
export const verifyAddRequestBody = async (req, res, next) => {
  try {
    // Check for the request
    if (!req.body.requestTo) {
      return res.status(400).send({ message: "New request is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};
