const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: { type: String },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
