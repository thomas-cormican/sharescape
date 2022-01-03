const express = require("express");
const fs = require("fs");

const verify = require("../middleware/verify");
const Post = require("../models/Post");
const User = require("../models/User");
const { upload, checkFileType } = require("../middleware/mediaUpload");

const router = express.Router();

router.use(verify);

// get all posts
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort("-createdAt")
      .populate("author")
      .populate({ path: "replyTo", populate: "author" });
    res.json({ posts });
  } catch (err) {
    const error = new Error("Unable to fetch posts");
    error.status = 400;
    return next(error);
  }
});

// get all posts by a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const userPosts = await Post.find({ authorId: req.params.userId })
      .sort("-createdAt")
      .populate("author")
      .populate({ path: "replyTo", populate: "author" });
    res.json({ userPosts });
  } catch (err) {
    return next(err);
  }
});

// create a post
router.post("/", upload.single("media"), async (req, res, next) => {
  const { message } = req.body;
  let media;
  if (req.file) {
    media = req.file.filename;
    const isValidFile = checkFileType(req.file);

    if (!isValidFile) {
      fs.unlink(
        `server/public/uploadedMedia/${req.file.filename}`,
        function (err) {
          if (err) throw err;
          console.log("File deleted!");
        }
      );
      return res.status(400).json("Please upload an image file");
    }
  }

  if (!message && !media) {
    const error = new Error("Please enter text or media");
    error.status = 400;
    return next(error);
  }

  try {
    let post = new Post({
      author: req.userId,
      authorId: req.userId,
      message,
      media,
    });
    post = await post.save();
    await post.populate("author");
    await User.findByIdAndUpdate(req.userId, { $push: { posts: post.id } });
    res.json({ createdPost: post });
  } catch (err) {
    const error = new Error("Unable to create post");
    error.status = 400;
    return next(err);
  }
});

// get all posts by people you follow
router.get("/timeline", async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId);
    let timelinePosts = await Promise.all(
      currentUser.following.map((user) => {
        return Post.find({ authorId: user })
          .populate("author")
          .populate({ path: "replyTo", populate: "author" });
      })
    );
    const currentUserPosts = await Post.find({
      authorId: currentUser._id,
    })
      .populate("author")
      .populate({ path: "replyTo", populate: "author" });
    timelinePosts = [...timelinePosts.flat(), ...currentUserPosts];
    timelinePosts.sort((a, b) => b.createdAt - a.createdAt);
    res.json({ timelinePosts });
  } catch (err) {
    const error = new Error("Unable to get timeline posts");
    return next(error);
  }
});

// get a post
router.get("/:postId", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author")
      .populate({ path: "replyTo", populate: "author" });
    res.json({ post });
  } catch (err) {
    const error = new Error("Unable to get post");
    error.status = 400;
    return next(error);
  }
});

// update a post
router.put("/:postId", async (req, res, next) => {
  const updates = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (post.authorId == req.userId) {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.postId,
        { $set: updates },
        { new: true }
      );
      res.json({ updatedPost: updatedPost });
    } else {
      const error = new Error("You are not authorized to update this post");
      error.status = 403;
      return next(error);
    }
  } catch (err) {
    return next(err);
  }
});

// delete a post
router.delete("/:postId", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (post.authorId == req.userId) {
      await User.findByIdAndUpdate(req.userId, { $pull: { posts: post.id } });
      const deletedPost = await Post.findByIdAndDelete(req.params.postId);
      res.json({ deletedPost: deletedPost });
    } else {
      const error = new Error("You are not authorized to delete this post");
      error.status = 403;
      return next(error);
    }
  } catch (err) {
    return next(err);
  }
});

// like a post
router.post("/:postId/like", async (req, res, next) => {
  try {
    let postl = await Post.findById(req.params.postId);
    if (postl.likes.includes(req.userId)) {
      await postl.updateOne({ $pull: { likes: req.userId } });
      res.json("Post unliked");
    } else {
      await postl.updateOne({ $push: { likes: req.userId } });
      res.json("Post liked");
    }
  } catch (err) {
    const error = new Error("something went wrong");
    error.status = 400;
    return next(error);
  }
});

// comment on a post
router.post(
  "/:postId/comment",
  upload.single("media"),
  async (req, res, next) => {
    const { message } = req.body;
    let media;
    if (req.file) {
      media = req.file.filename;
      const isValidFile = checkFileType(req.file);

      if (!isValidFile) {
        fs.unlink(
          `server/public/uploadedMedia/${req.file.filename}`,
          function (err) {
            if (err) throw err;
            console.log("File deleted!");
          }
        );
        return res.status(400).json("Please upload an image file");
      }
    }

    if (!message && !media) {
      const error = new Error("Please enter text or media");
      error.status = 400;
      return next(error);
    }

    try {
      let post = new Post({
        author: req.userId,
        authorId: req.userId,
        message,
        media,
        isReply: true,
        replyTo: req.params.postId,
      });

      post = await post.save();
      await post.populate("author");
      await post.populate({ path: "replyTo", populate: "author" });
      await User.findByIdAndUpdate(req.userId, { $push: { posts: post.id } });

      res.json({ createdPost: post });
    } catch (err) {
      const error = new Error("Unable to create post");
      error.status = 400;

      return next(error);
    }
  }
);

// get post comments
router.get("/:postId/comments", async (req, res, next) => {
  try {
    const comments = await Post.find({ replyTo: req.params.postId })
      .sort("-createdAt")
      .populate("author")
      .populate({ path: "replyTo", populate: "author" });
    res.json({ comments });
  } catch (err) {
    const error = new Error("Unable to get comments");
    error.status = 400;
    return next(error);
  }
});
module.exports = router;
