import { User_Model, Request_Model, Post_Model } from "../models/user.model.js";

// Logic to change avatar
export const changeAvatar = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // update the avatar
    const newAvatar = `/profile-pictures/${req.body.avatarFilename}`;
    user.avatar = newAvatar;
    await user.save();
    // return success message
    res.status(200).send({ message: "Avatar updated successfully" });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating avatar", error });
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

// Logic to change the role
export const changeRole = async (req, res) => {
  try {
    // check if userId id present in the database
    const user = await User_Model.findOne({ userName: req.user.userName });
    if (user == null) {
      return res.status(400).send({ message: "Invalid userName in token" });
    }
    // update the role
    user.role = req.body.newRole;
    await user.save();
    // return success message
    res.status(200).send({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating role", error });
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
    // get all posts from the Post collection
    const posts = await Post_Model.find().populate("comments");
    // return the posts
    res.status(200).send(posts);
  } catch (error) {
    console.error("Error getting home feed:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while getting home feed", error });
  }
};

// Logic to send the user profile data
export const getUser = async (req, res) => {
  try {
    // if the body contains a userName then send that user's information
    if (req.body.userName) {
      const anotherUser = await User_Model.findOne({
        userName: req.body.userName,
      });
      if (anotherUser == null) {
        return res.status(400).send({ message: "Unable to the user" });
      }
      // return the user without the password
      res.status(200).send({
        userName: anotherUser.userName,
        firstName: anotherUser.firstName,
        lastName: anotherUser.lastName,
        dob: anotherUser.dob,
        contactNumber: anotherUser.contactNumber,
        email: anotherUser.email,
        avatar: anotherUser.avatar,
        country: anotherUser.country,
        interests: anotherUser.interests,
        role: anotherUser.role,
        posts: anotherUser.posts,
        friends: anotherUser.friends,
        membership: anotherUser.membership,
      });
    } else {
      // check if userId id present in the database
      const user = await User_Model.findOne({ userName: req.user.userName });
      if (user == null) {
        return res.status(400).send({ message: "Invalid userName in token" });
      }
      // return the user without the password
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
    console.error("Error getting user profile:", error);
    res.status(500).send({
      message: "Some error occurred while getting user profile",
      error,
    });
  }
};
