const express = require("express");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const verify = require("../middleware/verify");

const router = express.Router();

router.use(verify);

// create a conversation
router.post("/", async (req, res, next) => {
  try {
    let conversation = new Conversation({
      user1: req.userId,
      user2: req.body.user2,
    });
    conversation = await conversation.save();
    res.json({ conversation });
  } catch (err) {
    return next(err);
  }
});

// get a conversation
router.get("/:conversationId", async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate({
        path: "messages",
        populate: {
          path: "from",
        },
      })
      .populate("user1")
      .populate("user2");

    res.json({ conversation });
  } catch (err) {
    return next(err);
  }
});

// update a conversation
router.put("/:conversationId", async (req, res, next) => {
  try {
    let message = new Message({
      content: req.body.message,
      from: req.userId,
    });
    message = await message.save();
    await message.populate("from");
    let conversation = await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { $push: { messages: message } },
      { new: true }
    );
    res.json({ conversation, message });
  } catch (err) {
    return next(err);
  }
});

// get all conversatons by a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    let conversations = await Conversation.find({
      $or: [{ user1: req.params.userId }, { user2: req.params.userId }],
    })
      .sort("-updatedAt")
      .populate({
        path: "messages",
        populate: {
          path: "from",
        },
      })
      .populate("user1")
      .populate("user2");
    res.json({ conversations });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
