import mongoose from "mongoose";
import validator from "validator";

// Define the Reply schema
const replySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 250,
    },
    likes: {
      type: Number,
      default: 0,
    },
    replies: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Reply",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
// Define the Reply schema

// Define the Comment schema
const commentSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 250,
    },
    likes: {
      type: Number,
      default: 0,
    },
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true }
);
// Define the Comment schema

// Define an individual post schema
const postSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedByUsers: {
      type: [
        {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
      ],
    },
    medias: {
      type: [String],
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      default: [],
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
// Define an individual post schema

// Define the Post schema
const postMenuSchema = new mongoose.Schema(
  {
    numberofPosts: {
      type: Number,
      default: 0,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    deletedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },
  { _id: false }
);
// Define the Post schema

// Define the request schema
const requestSchema = new mongoose.Schema({
  requestFrom: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Define the request schema

// Define the friend schema
const friendSchema = new mongoose.Schema(
  {
    numberofFriends: {
      type: Number,
      default: 0,
    },
    numberofBlocked: {
      type: Number,
      default: 0,
    },
    friendsList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    blockedList: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    requests: {
      type: [requestSchema],
      default: [],
    },
  },
  { _id: false }
);
// Define the friend schema

// Define the User schema
// FIRST NAME*
// LAST NAME*
// USERNAME*
// DOB*
// EMAIL*
// CONTACT NUMBER*
// COUNTRY
// AVATAR
// INTEREST
// PASSWORD
// ROLE
// MEMBERSHIP
// POSTS
// FRIENDS
//
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 6,
      maxLength: 20,
      match: /^[a-zA-Z0-9_]+$/,
    },
    dob: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 10,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Invalid email format.",
      },
    },
    contactNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          // return validator.isMobilePhone(value, "any");
          return true;
        },
        message: "Invalid contact number.",
      },
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: "",
    },
    interests: {
      type: [String],
      default: ["General"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ["User", "Admin", "Moderator"],
      default: "User",
    },
    membership: {
      type: String,
      enum: ["Free", "Premium"],
      default: "Free",
    },
    posts: {
      type: postMenuSchema,
      default: {},
    },
    friends: {
      type: friendSchema,
      default: {},
    },
  },
  { timestamps: true }
);
// Define the User schema

// Exporting models
const User_Model = mongoose.model("User", userSchema);
const Post_Model = mongoose.model("Post", postSchema);
const PostMenu_Model = mongoose.model("PostMenu", postMenuSchema);
const Comment_Model = mongoose.model("Comment", commentSchema);
const Reply_Model = mongoose.model("Reply", replySchema);
const Friend_Model = mongoose.model("Friend", friendSchema);
const Request_Model = mongoose.model("Request", requestSchema);

export {
  User_Model,
  PostMenu_Model,
  Post_Model,
  Comment_Model,
  Reply_Model,
  Friend_Model,
  Request_Model,
};
