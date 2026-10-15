import { User_Model, Post_Model, Comment_Model } from "../models/user.model.js";

// Logic to add a new post to the user's posts array
export const addPost = async (req, res) => {
  try {
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
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
    
    // Add uploaded files as media URLs
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const relativePath = file.path.replace("public/", "/");
        const mediaUrl = `/assets${relativePath.replace("/assets", "")}`;
        newPostData.medias.push(mediaUrl);
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
    console.error("Error adding post:", error.message);
    res.status(500).send({ message: "Error creating post" });
  }
};

// Logic to add a like to the post
export const addLike = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // check if postId id present in the database
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(400).send({ message: "Invalid postId" });
    }
    // check if the user has already liked the post
    if (post.likedByUsers.includes(req.user.userName)) {
      // if post is already liked then, return already liked the post message
      return res.status(201).send({ message: "Already liked the post" });
    }
    // add the user's userName to the post's likes array
    post.likedByUsers.push(req.user.userName);
    // increase the number of likes by 1
    post.likes += 1;
    // save the post
    await post.save();
    // return success message
    res.status(200).send({ message: "Liked the post successfully" });
  } catch (error) {
    if (error.name === "VersionError") {
      console.error("VersionError:", error.message);
      res
        .status(409)
        .send({ message: "Conflict occurred while updating the post" });
    } else {
      console.error("Error adding like:", error);
      res.status(500).send({
        message: "Some error occurred while adding like",
        error: error.message,
      });
    }
  }
};

// Logic to add a like to the post
export const removeLike = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // check if postId id present in the database
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(400).send({ message: "Invalid postId" });
    }
    // check if the user has already liked the post
    if (post.likedByUsers.includes(req.user.userName)) {
      // if post is already liked then, unlike the post
      post.likedByUsers = post.likedByUsers.filter(
        (userName) => userName !== req.user.userName
      );
      //   decrease the number of likes by 1
      post.likes -= 1;
      // save the post
      await post.save();
      return res.status(200).send({ message: "Unliked the post successfully" });
    }
    // return already unliked message
    return res.status(201).send({ message: "Already unliked the post" });
  } catch (error) {
    if (error.name === "VersionError") {
      console.error("VersionError:", error.message);
      res
        .status(409)
        .send({ message: "Conflict occurred while updating the post" });
    } else {
      console.error("Error adding like:", error);
      res.status(500).send({
        message: "Some error occurred while adding like",
        error: error.message,
      });
    }
  }
};

// Logic to add a comment to the post
export const addComment = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // check if postId id present in the database
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(400).send({ message: "Invalid postId" });
    }
    // create a new comment model
    const newComment = new Comment_Model({
      userName: req.user.userName,
      content: req.body.content,
    });
    // save the comment
    const savedComment = await newComment.save();
    // add a new comment to the post
    post.comments.push(newComment);
    post.commentsCount += 1;
    // save the post
    await post.save();
    // return success message and saved comment
    res
      .status(200)
      .send({ message: "Comment added successfully", savedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while adding comment", error });
  }
};

// Logic to delete a post
export const deletePost = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // check if postId id present in the database
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(400).send({ message: "Invalid postId" });
    }
    // check if the user is the owner of the post
    if (post.userName !== req.user.userName) {
      return res
        .status(400)
        .send({ message: "You are unauthorized to delete this post" });
    }
    // before deleting the post, push it to the user's deletedPosts array
    user.posts.deletedPosts.push(post);

    // delete the post
    await Post_Model.deleteOne({ _id: req.body.postId });
    // update the posts
    user.posts.posts = user.posts.posts.filter(
      (post) => post._id.toString() !== req.body.postId
    );
    user.posts.numberofPosts -= 1;
    // save the user
    await user.save();
    // return success message
    res.status(200).send({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res
      .status(500)
      .send({ message: "Some error occurred while deleting post", error: err });
  }
};

// Logic to delete a comment
export const deleteComment = async (req, res) => {
  try {
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
    
    // Allow deletion if user owns the comment OR owns the post
    const isCommentOwner = comment.userName === req.user.userName;
    const isPostOwner = post.userName === req.user.userName;
    
    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).send({ message: "You are not authorized to delete this comment" });
    }
    
    // Also delete from the Comment collection
    await Comment_Model.findByIdAndDelete(req.body.commentId);
    
    // Remove from post's comments array
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
    // check if postId id present in the database
    const post = await Post_Model.findOne({ _id: req.params.postId }).populate(
      "comments"
    );
    if (post == null) {
      return res.status(400).send({ message: "Post not found" });
    }
    // return the post
    res.status(200).send(post);
  } catch (err) {
    console.error("Error getting post:", err);
    res
      .status(500)
      .send({ message: "Some error occurred while getting post", error: err });
  }
};
