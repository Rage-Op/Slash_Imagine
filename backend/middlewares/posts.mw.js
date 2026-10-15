import { User_Model } from "../models/user.model.js";

// create a middleware to validate add post request body
export const verifyAddPostBody = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.content) {
      return res.status(400).send({
        message: "Title and content are required",
      });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate add like request body
export const verifyAddLikeBody = async (req, res, next) => {
  try {
    // Check for the postId
    if (!req.body.postId) {
      return res.status(400).send({ message: "PostId is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate add comment request body
export const verifyAddCommentBody = async (req, res, next) => {
  try {
    // Check for the postId and comment
    if (!req.body.postId) {
      return res.status(400).send({
        message: "PostId is required",
      });
    }
    if (!req.body.content) {
      return res.status(400).send({
        message: "Content is required",
      });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate delete post request body
export const verifyDeletePostBody = async (req, res, next) => {
  try {
    // Check for the postId
    if (!req.body.postId) {
      return res.status(400).send({ message: "PostId is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};

// create a middleware to validate delete comment request body
export const verifyDeleteCommentBody = async (req, res, next) => {
  try {
    // Check for the postId and commentId
    if (!req.body.postId) {
      return res.status(400).send({ message: "PostId is required" });
    }
    if (!req.body.commentId) {
      return res.status(400).send({ message: "CommentId is required" });
    }
    next();
  } catch (err) {
    console.log("error while validating the request object", err);
    res.status(500).send({ message: "Error validating the request body" });
  }
};
