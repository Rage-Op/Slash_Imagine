import { User_Model, Request_Model, Post_Model } from "../models/user.model.js";

// Logic to list all users (admin only)
export const listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const users = await User_Model.find({})
      .select("userName firstName lastName email role avatar membership createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User_Model.countDocuments();
    
    res.status(200).send({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error listing users:", error.message);
    res.status(500).send({ message: "Error listing users" });
  }
};

// Logic to change avatar
export const changeAvatar = async (req, res) => {
  try {
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    
    if (!req.body.avatarFilename) {
      return res.status(400).send({ message: "No avatar file uploaded" });
    }
    
    // Fixed: Include /assets prefix in the path
    const newAvatar = `/assets/profile-pictures/${req.body.avatarFilename}`;
    user.avatar = newAvatar;
    await user.save();
    
    res.status(200).send({ 
      message: "Avatar updated successfully",
      avatar: newAvatar
    });
  } catch (error) {
    console.error("Error updating avatar:", error.message);
    res.status(500).send({ message: "Error updating avatar" });
  }
};

// Logic to change country
export const changeCountry = async (req, res) => {
  try {
    // check if userName id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // update the country
    user.country = req.body.newCountry;
    await user.save();
    // return success message
    res.status(200).send({ message: "Country updated successfully" });
  } catch (error) {
    console.error("Error updating country:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating country", error });
  }
};

// Logic to change interests by adding more interests
export const addInterests = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // update the interests
    req.body.newInterests.forEach((interest) => {
      user.interests.push(interest);
    });
    await user.save();
    // return success message
    res.status(200).send({ message: "Interests updated successfully" });
  } catch (error) {
    console.error("Error updating interests:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating interests", error });
  }
};

// Logic to change another user's role (admin only)
export const changeRole = async (req, res) => {
  try {
    const targetUserName = req.body.userName;
    const newRole = req.body.newRole;
    
    if (!targetUserName) {
      return res.status(400).send({ message: "Target userName is required" });
    }
    
    if (!["User", "Admin", "Moderator"].includes(newRole)) {
      return res.status(400).send({ message: "Invalid role. Must be User, Admin, or Moderator" });
    }
    
    // Prevent admin from changing their own role
    if (targetUserName === req.user.userName) {
      return res.status(400).send({ message: "You cannot change your own role" });
    }
    
    const targetUser = await User_Model.findOne({ userName: targetUserName });
    if (targetUser == null) {
      return res.status(404).send({ message: "Target user not found" });
    }
    
    // Check if this is the last admin and we're demoting them
    if (targetUser.role === "Admin" && newRole !== "Admin") {
      const adminCount = await User_Model.countDocuments({ role: "Admin" });
      if (adminCount <= 1) {
        return res.status(400).send({ message: "Cannot demote the last admin" });
      }
    }
    
    targetUser.role = newRole;
    await targetUser.save();
    
    res.status(200).send({ 
      message: "Role updated successfully",
      userName: targetUserName,
      newRole: newRole
    });
  } catch (error) {
    console.error("Error updating role:", error.message);
    res.status(500).send({ message: "Error updating role" });
  }
};

// Logic to create a new request item from the Request_Model schema and add it to the user's requests array and then save the user
export const addRequest = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.body.requestTo });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // create a new request item from the Request_Model schema
    const newRequest = new Request_Model({
      requestFrom: req.user.userName,
    });
    // add the new request item to the user's requests array
    user.friends.requests.push(newRequest);
    // save the user
    await user.save();
    // return success message
    res.status(200).send({ message: "Request added successfully" });
  } catch (error) {
    console.error("Error adding request:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while adding request", error });
  }
};

// Logic to send user an array of posts from post model to show on the home page
export const getHomeFeed = async (req, res) => {
  try {
    // Validate and cap pagination parameters
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    
    // Validate page
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    
    // Validate and cap limit (max 100)
    if (isNaN(limit) || limit < 1) {
      limit = 20;
    } else if (limit > 100) {
      limit = 100;
    }
    
    const skip = (page - 1) * limit;
    
    // Get posts sorted by newest first with pagination
    const posts = await Post_Model.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("comments")
      .lean();
    
    // Get unique usernames from posts
    const userNames = [...new Set(posts.map(post => post.userName))];
    
    // Fetch all authors in a single query (avoiding N+1)
    const authors = await User_Model.find({ userName: { $in: userNames } })
      .select("userName firstName lastName avatar")
      .lean();
    
    // Create a map for quick lookup
    const authorMap = {};
    authors.forEach(author => {
      authorMap[author.userName] = {
        firstName: author.firstName,
        lastName: author.lastName,
        avatar: author.avatar,
        fullName: `${author.firstName} ${author.lastName}`
      };
    });
    
    // Attach author info to each post
    const postsWithAuthors = posts.map(post => ({
      ...post,
      author: authorMap[post.userName] || { fullName: post.userName }
    }));
    
    const total = await Post_Model.countDocuments();
    
    res.status(200).send({
      posts: postsWithAuthors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error getting home feed:", error.message);
    res.status(500).send({ message: "Error getting home feed" });
  }
};

// Logic to send the user profile data
export const getUser = async (req, res) => {
  try {
    // if the body contains a userName then send that user's information (public profile)
    if (req.body.userName && req.body.userName !== req.user.userName) {
      const anotherUser = await User_Model.findOne({
        userName: req.body.userName,
      });
      if (anotherUser == null) {
        return res.status(404).send({ message: "User not found" });
      }
      // return only public profile data (no email, phone, DOB)
      res.status(200).send({
        userName: anotherUser.userName,
        firstName: anotherUser.firstName,
        lastName: anotherUser.lastName,
        avatar: anotherUser.avatar,
        country: anotherUser.country,
        interests: anotherUser.interests,
        role: anotherUser.role,
        posts: anotherUser.posts,
        membership: anotherUser.membership,
      });
    } else {
      // return own profile with all data
      const user = await User_Model.findOne({ userName: req.user.userName });
      if (user == null) {
        return res.status(400).send({ message: "Invalid userName in token" });
      }
      res.status(200).send({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob,
        contactNumber: user.contactNumber,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
        interests: user.interests,
        role: user.role,
        posts: user.posts,
        friends: user.friends,
        membership: user.membership,
      });
    }
  } catch (error) {
    console.error("Error getting user profile:", error.message);
    res.status(500).send({ message: "Error retrieving user profile" });
  }
};
