const express = require("express");

const User = require("../models/User");
const Notification = require("../models/Notification");
const verify = require("../middleware/verify");
const { profileUpload } = require("../middleware/mediaUpload");
const { checkFileType } = require("../middleware/mediaUpload");

const router = express.Router();

router.use(verify);

// get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    return next(err);
  }
});

// get user
router.get("/:userId", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json({ user });
  } catch (err) {
    const error = new Error("Unable to get user");
    error.status = 400;
    return next(err);
  }
});

// update user
router.put(
  "/:userId",
  verify,
  profileUpload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
    {
      name: "profileCoverPic",
      maxCount: 1,
    },
  ]),
  async (req, res, next) => {
    try {
      const { username, bio, location, profilePic, profileCoverPic } = req.body;
      let updates = {};

      username &&
        ((updates.username = username),
        (updates.usernameLower = username.toLowerCase()));

      bio && (updates.bio = bio);

      location && (updates.location = location);

      req.files.profilePic &&
        checkFileType(req.files.profilePic[0]) &&
        (updates.profilePic = req.files.profilePic[0].filename);

      req.files.profileCoverPic &&
        checkFileType(req.files.profileCoverPic[0]) &&
        (updates.profileCoverPic = req.files.profileCoverPic[0].filename);

      if (req.userId === req.params.userId) {
        try {
          const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {
              $set: updates,
            },
            { new: true }
          );
          res.json({ updatedUser });
        } catch (err) {
          const error = new Error("Something went wrong");
          error.status = 400;
          return next(error);
        }
      } else {
        const error = new Error("You are not authorized to update this user");
        error.status = 403;
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
  }
);

// delete user
router.delete("/:userId", async (req, res, next) => {
  if (req.userId === req.params.userId) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.userId);
      res.json({ deletedUser });
    } catch (err) {
      const error = new Error("Something went wrong");
      return next(error);
    }
  } else {
    const error = new Error("You are not authorized to delete this user");
    error.status = 403;
    return next(error);
  }
});

// get user following list
router.get("/:userId/following", async (req, res, next) => {
  try {
    const followedUsers = await User.find({ followers: req.params.userId });
    res.json({ followedUsers });
  } catch (err) {
    return next(err);
  }
});

// get user followers list
router.get("/:userId/followers", async (req, res, next) => {
  try {
    const followers = await User.find({ following: req.params.userId });
    res.json({ followers });
  } catch (err) {
    return next(err);
  }
});

// follow a user
router.post("/:userId/follow", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);
    if (user.followers.includes(req.userId)) {
      await user.update({ $pull: { followers: req.userId } });
      await currentUser.update({ $pull: { following: req.params.userId } });
      res.json("User Unfollowed");
    } else {
      await user.update({ $push: { followers: req.userId } });
      await currentUser.update({ $push: { following: req.params.userId } });
      res.json("User Followed");
    }
  } catch (err) {
    console.log(err);
    const error = new Error("Something went wrong");
    return next(error);
  }
});

// read notifications
router.put("/notifications/read", async (req, res, next) => {
  try {
    let user = await User.findById(req.userId);
    await Notification.updateMany(
      { _id: { $in: user.notifications } },
      { read: true },
      { new: true }
    );
    let notifications = await Notification.find({
      _id: { $in: user.notifications },
    }).populate("from");

    res.json({ notifications });
  } catch (err) {
    return next(err);
  }
});

// create a notification
router.post("/notifications/:userId", async (req, res, next) => {
  try {
    let newNotification = new Notification({
      type: req.body.type,
      post: req.body.post || null,
      from: req.userId,
      read: false,
    });
    newNotification = await newNotification.save();

    await newNotification.populate("from");
    console.log(newNotification);
    await User.findByIdAndUpdate(req.params.userId, {
      $push: { notifications: newNotification._id },
    });
    res.json({ notification: newNotification });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
