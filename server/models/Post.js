const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    authorId: {
      type: String,
    },
    message: {
      type: String,
      maxLength: 280,
    },
    media: {
      type: String,
    },
    likes: {
      type: Array,
    },
    isReply: {
      type: Boolean,
      default: false,
      immutable: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      immutable: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
