import mongoose from "mongoose";
import { User_Model, Post_Model, Comment_Model } from "../models/user.model.js";
import { deleteUploadedFiles, deleteFileByPath, BACKEND_ROOT } from "./multer.controller.js";
import path from "path";

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Logic to add a new post to the user's posts array
export const addPost = async (req, res) => {
  try {
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      deleteUploadedFiles(req.files);
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    
    // Initialize new post data object
    const newPostData = {
      userName: req.user.userName,
      title: req.body.title,
      content: req.body.content,
      medias: [],
      tags: [],
    };
    
    // Add uploaded files as media URLs (using absolute path calculation)
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const relativePath = file.path.replace(path.join(BACKEND_ROOT, "public"), "");
        newPostData.medias.push(relativePath);
      });
    }
    
    // Add external media URLs if provided
    if (req.body.medias) {
      const mediaUrls = Array.isArray(req.body.medias) 
        ? req.body.medias 
        : [req.body.medias];
      mediaUrls.forEach((url) => {
        if (url && url.startsWith("http")) {
          newPostData.medias.push(url);
        }
      });
    }
    
    // Add tags if provided
    if (req.body.tags) {
      const tags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(",").map(t => t.trim());
      newPostData.tags = tags;
    }
    
    const newPost = new Post_Model(newPostData);
    const savedPost = await newPost.save();
    
    user.posts.posts.push(savedPost._id);
    user.posts.numberofPosts += 1;
    await user.save();
    
    res.status(201).send({ 
      message: "Post created successfully",
      post: savedPost
    });
  } catch (error) {
    deleteUploadedFiles(req.files);
    console.error("Error adding post:", error.message);
    res.status(500).send({ message: "Error creating post" });
  }
};

// Logic to add a like to the post
export const addLike = async (req, res) => {
  try {
    if (!isValidObjectId(req.body.postId)) {
      return res.status(400).send({ message: "Invalid postId format" });
    }
    
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(404).send({ message: "Post not found" });
    }
    
    if (post.likedByUsers.includes(req.user.userName)) {
      return res.status(200).send({ message: "Already liked the post" });
    }
    
    post.likedByUsers.push(req.user.userName);
    post.likes += 1;
    await post.save();
    
    res.status(200).send({ message: "Liked the post successfully" });
  } catch (error) {
    if (error.name === "VersionError") {
      console.error("VersionError:", error.message);
      res.status(409).send({ message: "Conflict occurred while updating the post" });
    } else {
      console.error("Error adding like:", error.message);
      res.status(500).send({ message: "Error adding like" });
    }
  }
};

// Logic to remove a like from the post
export const removeLike = async (req, res) => {
  try {
    if (!isValidObjectId(req.body.postId)) {
      return res.status(400).send({ message: "Invalid postId format" });
    }
    
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(404).send({ message: "Post not found" });
    }
    
    if (post.likedByUsers.includes(req.user.userName)) {
      post.likedByUsers = post.likedByUsers.filter(
        (userName) => userName !== req.user.userName
      );
      post.likes -= 1;
      await post.save();
      return res.status(200).send({ message: "Unliked the post successfully" });
    }
    
    return res.status(200).send({ message: "Already unliked the post" });
  } catch (error) {
    if (error.name === "VersionError") {
      console.error("VersionError:", error.message);
      res.status(409).send({ message: "Conflict occurred while updating the post" });
    } else {
      console.error("Error removing like:", error.message);
      res.status(500).send({ message: "Error removing like" });
    }
  }
};

// Logic to add a comment to the post
export const addComment = async (req, res) => {
  try {
    if (!isValidObjectId(req.body.postId)) {
      return res.status(400).send({ message: "Invalid postId format" });
    }
    
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(404).send({ message: "Post not found" });
    }
    
    const newComment = new Comment_Model({
      userName: req.user.userName,
      content: req.body.content,
    });
    
    const savedComment = await newComment.save();
    post.comments.push(newComment);
    post.commentsCount += 1;
    await post.save();
    
    res.status(200).send({ message: "Comment added successfully", savedComment });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).send({ message: "Error adding comment" });
  }
};

// Logic to delete a post
export const deletePost = async (req, res) => {
  try {
    if (!isValidObjectId(req.body.postId)) {
      return res.status(400).send({ message: "Invalid postId format" });
    }
    
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    
    const post = await Post_Model.findOne({ _id: req.body.postId }).populate("comments");
    if (post == null) {
      return res.status(404).send({ message: "Post not found" });
    }
    
    if (post.userName !== req.user.userName) {
      return res.status(403).send({ message: "You are unauthorized to delete this post" });
    }
    
    user.posts.deletedPosts.push(post);
    
    // Delete associated media files
    if (post.medias && post.medias.length > 0) {
      post.medias.forEach((mediaPath) => {
        if (mediaPath && !mediaPath.startsWith("http")) {
          deleteFileByPath(mediaPath);
        }
      });
    }
    
    // Delete associated comments from Comment collection
    if (post.comments && post.comments.length > 0) {
      const commentIds = post.comments.map((c) => c._id);
      await Comment_Model.deleteMany({ _id: { $in: commentIds } });
    }
    
    await Post_Model.deleteOne({ _id: req.body.postId });
    
    user.posts.posts = user.posts.posts.filter(
      (p) => p._id.toString() !== req.body.postId
    );
    user.posts.numberofPosts -= 1;
    await user.save();
    
    res.status(200).send({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).send({ message: "Error deleting post" });
  }
};

// Logic to delete a comment
export const deleteComment = async (req, res) => {
  try {
    if (!isValidObjectId(req.body.postId)) {
      return res.status(400).send({ message: "Invalid postId format" });
    }
    if (!isValidObjectId(req.body.commentId)) {
      return res.status(400).send({ message: "Invalid commentId format" });
    }
    
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    
    const post = await Post_Model.findOne({ _id: req.body.postId }).populate("comments");
    if (post == null) {
      return res.status(404).send({ message: "Post not found" });
    }
    
    const comment = post.comments.find(
      (c) => c._id.toString() === req.body.commentId
    );
    
    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }
    
    const isCommentOwner = comment.userName === req.user.userName;
    const isPostOwner = post.userName === req.user.userName;
    
    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).send({ message: "You are not authorized to delete this comment" });
    }
    
    await Comment_Model.findByIdAndDelete(req.body.commentId);
    
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.body.commentId
    );
    post.commentsCount = Math.max(0, post.commentsCount - 1);
    await post.save();
    
    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err.message);
    res.status(500).send({ message: "Error deleting comment" });
  }
};

// Logic to get a post from the database with postId in params
export const getPost = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.postId)) {
      return res.status(400).send({ message: "Invalid postId format" });
    }
    
    const post = await Post_Model.findOne({ _id: req.params.postId })
      .populate("comments")
      .lean();
    
    if (post == null) {
      return res.status(404).send({ message: "Post not found" });
    }
    
    // Fetch author info
    const author = await User_Model.findOne({ userName: post.userName })
      .select("userName firstName lastName avatar")
      .lean();
    
    const postWithAuthor = {
      ...post,
      author: author ? {
        userName: author.userName,
        firstName: author.firstName,
        lastName: author.lastName,
        avatar: author.avatar,
        fullName: `${author.firstName} ${author.lastName}`.trim()
      } : { fullName: post.userName }
    };
    
    res.status(200).send(postWithAuthor);
  } catch (err) {
    console.error("Error getting post:", err.message);
    res.status(500).send({ message: "Error getting post" });
  }
};

// Logic to increment share count
export const incrementShareCount = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.postId)) {
      return res.status(400).send({ message: "Invalid postId format" });
    }
    
    const post = await Post_Model.findOneAndUpdate(
      { _id: req.params.postId },
      { $inc: { shares: 1 } },
      { new: true }
    );
    
    if (post == null) {
      return res.status(404).send({ message: "Post not found" });
    }
    
    res.status(200).send({ message: "Share count incremented", shares: post.shares });
  } catch (err) {
    console.error("Error incrementing share count:", err.message);
    res.status(500).send({ message: "Error incrementing share count" });
  }
};
