const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["followed you", "commented on your post", "liked your post"],
    },
    post: { type: String },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    to: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
