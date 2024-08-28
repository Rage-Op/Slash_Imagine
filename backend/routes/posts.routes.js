import express from "express";
import {
  addPost,
  addLike,
  removeLike,
  addComment,
  getPost,
  deletePost,
  deleteComment,
} from "./../controllers/post.controller.js";
import {
  verifyAddPostBody,
  verifyAddLikeBody,
  verifyAddCommentBody,
  verifyDeletePostBody,
  verifyDeleteCommentBody,
} from "./../middlewares/posts.mw.js";
import { verifyToken } from "./../middlewares/auth.mw.js";
import {
  postPictureUpload,
  postVideoUpload,
} from "../controllers/multer.controller.js";

const router = express.Router();

// route to add a post
router.post(
  "/add-post",
  verifyToken,
  postPictureUpload.array("postPictures", 12),
  postVideoUpload.array("postVideos", 2),
  verifyAddPostBody,
  addPost
);

// route to add like to a post
router.post("/add-like", verifyToken, verifyAddLikeBody, addLike);

// route to add like to a post
router.post("/remove-like", verifyToken, verifyAddLikeBody, removeLike);

// route to add a comment to a post
router.post("/add-comment", verifyToken, verifyAddCommentBody, addComment);

// route to get a post with postId in params
router.get("/get-post/:postId", verifyToken, getPost);

// route to delete a post with postId in req.body
router.delete("/delete-post", verifyToken, verifyDeletePostBody, deletePost);

// route to delete a comment with commentId in req.body
router.delete(
  "/delete-comment",
  verifyToken,
  verifyDeleteCommentBody,
  deleteComment
);

// export the router
export default router;
