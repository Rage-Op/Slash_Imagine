import { User_Model, Post_Model, Comment_Model } from "../models/user.model.js";

// Logic to add a new post to the user's posts array
export const addPost = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // Initialize new post data object
    const newPostData = {
      userName: req.user.userName,
      title: req.body.title,
      content: req.body.content,
    };
    // Add medias if provided and ensure it's an array of strings
    if (req.body.medias.length > 0) {
      newPostData.medias = [];
      // map and push every media links in the newPostData.medias array
      req.body.medias.forEach((media) => {
        newPostData.medias.push(media);
      });
    }
    // Add tags if provided and ensure it's an array of strings
    if (req.body.tags) {
      newPostData.tags = req.body.tags;
    }
    //   create a new post item from the Post_Model schema
    const newPost = new Post_Model(newPostData);
    // Save the post to the Post collection
    const savedPost = await newPost.save();
    // update the posts
    user.posts.posts.push(savedPost);
    user.posts.numberofPosts += 1;
    await user.save();
    // return success message
    res.status(200).send({ message: "Post added successfully" });
  } catch (error) {
    console.error("Error adding post:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while adding post", error });
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
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // check if postId id present in the database
    const post = await Post_Model.findOne({ _id: req.body.postId });
    if (post == null) {
      return res.status(400).send({ message: "Invalid postId in body" });
    }
    // check if the user is the owner of the comment
    if (
      post.comments.find(
        (comment) => comment._id.toString() === req.body.commentId
      ).userName !== req.user.userName
    ) {
      return res
        .status(400)
        .send({ message: "You are unauthorized to delete this comment" });
    }
    // delete the comment
    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== req.body.commentId
    );
    post.commentsCount -= 1;
    // save the post
    await post.save();
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).send({
      message: "Some error occurred while deleting comment",
      error: err,
    });
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
