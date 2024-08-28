import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User_Model } from "../models/user.model.js";

// Logic to register a user
export const signup = async (req, res) => {
  try {
    // read the request body
    const request_body = req.body;

    // insert the data in the users collection
    const userObj = {
      firstName: request_body.firstName,
      lastName: request_body.lastName,
      userName: request_body.userName,
      dob: request_body.dob,
      contactNumber: request_body.contactNumber,
      country: request_body.country,
      password: bcrypt.hashSync(request_body.password, 8),
      email: request_body.email,
    };
    try {
      const user_created = await User_Model.create(userObj);
      // generate JWT token
      const token = jwt.sign(
        { userName: user_created.userName },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );
      // return the user
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
    } catch (err) {
      // handle the error and send the response back to the user along with the err object
      console.log("error while registerng the user", err);
      res
        .status(500)
        .send({ message: "Some error occurred while registering", error: err });
    }
    // return response back to the user
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Some error occurred while error", error });
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
    // check if new password is same as old password
    if (req.body.newPassword === req.body.password) {
      return res
        .status(400)
        .send({ message: "New password cannot be same as old password" });
    }
    // update the password
    user.password = bcrypt.hashSync(req.body.newPassword, 8);
    await user.save();
    // return success message
    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating password", error });
  }
};

// Logic to change email
export const changeEmail = async (req, res) => {
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
    // check if new email is same as old email
    if (req.body.newEmail === user.email) {
      return res
        .status(400)
        .send({ message: "New email cannot be same as old email" });
    }
    // check if new email is already present in the database
    if (await User_Model.findOne({ email: req.body.newEmail })) {
      return res.status(400).send({ message: "Email already in use" });
    }
    // update the email
    user.email = req.body.newEmail;
    await user.save();
    // return success message
    res.status(200).send({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Error updating email:", error);
    res
      .status(500)
      .send({ message: "Some error occurred while updating email", error });
  }
};

// Logic to change contact number
export const changeContactNumber = async (req, res) => {
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
    // check if new contact number is same as old contact number
    if (req.body.newContactNumber === user.contactNumber) {
      return res.status(400).send({
        message: "New contact number cannot be same as old contact number",
      });
    }
    // check if new contact number is already present in the database
    if (
      await User_Model.findOne({ contactNumber: req.body.newContactNumber })
    ) {
      return res.status(400).send({ message: "Contact number already in use" });
    }
    // update the contact number
    user.contactNumber = req.body.newContactNumber;
    await user.save();
    // return success message
    res.status(200).send({ message: "Contact number updated successfully" });
  } catch (error) {
    console.error("Error updating contact number:", error);
    res.status(500).send({
      message: "Some error occurred while updating contact number",
      error,
    });
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
