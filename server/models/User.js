const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      maxLength: 16,
      minLength: 4,
    },
    usernameLower: {
      type: String,
      unique: true,
      maxLength: 16,
      minLength: 4,
    },
    email: {
      type: String,
      unique: true,
    },
    emailLower: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
      minLength: 8,
    },
    bio: {
      type: String,
      maxLength: 160,
    },
    location: {
      type: String,
      maxLength: 30,
    },
    profilePic: {
      type: String,
    },
    profileCoverPic: {
      type: String,
    },
    posts: {
      type: Array,
    },
    following: {
      type: Array,
    },
    followers: {
      type: Array,
    },
    likes: {
      type: Array,
    },
    messages: {
      type: Array,
    },
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    conversations: {
      type: Array,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
