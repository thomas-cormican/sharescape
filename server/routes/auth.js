const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { v4 } = require("uuid");

const User = require("../models/User");
const verify = require("../middleware/verify");

const oAuth2Client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

const { sendEmail } = require("../utils/sendEmail");

const router = express.Router();

// generate access tokens
function createAuthTokens(email, username, id) {
  const token = jwt.sign(
    {
      email: email,
      username: username,
      id: id,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    {
      email: email,
      username: username,
      id: id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );

  return { token, refreshToken };
}

// signup
router.post(
  "/",
  body("username")
    .isLength({ min: 4 })
    .withMessage("must be at least 4 chars long")
    .isLength({ max: 16 })
    .withMessage("must be shorter than 16 chars"),
  body("email").isEmail().withMessage("please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("must be at least 8 chars long"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password, email } = req.body;
    let user;
    let hashedPassword;

    try {
      hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        username,
        usernameLower: username.toLowerCase(),
        email,
        emailLower: email.toLowerCase(),
        password: hashedPassword,
      });
      user = await user.save();
      await user.populate({ path: "notifications", populate: "from" });
      const { token, refreshToken } = createAuthTokens(
        user.email,
        user.username,
        user._id
      );

      // sendEmail(
      //   email,
      //   "Welcome to Twitter Clone",
      //   "Your Account has been created successfully"
      // );

      res
        .cookie("auth", token, {
          path: "/",
          expires: new Date(new Date().getTime() + 168 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .json({ user: user, token, refreshToken })
        .send();
    } catch (err) {
      err.status = 400;
      return next(err);
    }
  }
);

// login
router.post("/login", async (req, res, next) => {
  const { username, email, password } = req.body;
  let foundUser;

  try {
    if (username) {
      foundUser = await User.findOne({
        usernameLower: username.toLowerCase(),
      })
        .select("+password")
        .populate({ path: "notifications", populate: "from" });
    } else {
      foundUser = await User.findOne({
        emailLower: email.toLowerCase(),
      })
        .select("+password")
        .populate({ path: "notifications", populate: "from" });
    }

    const passwordSuccess = await bcrypt.compare(password, foundUser.password);
    if (passwordSuccess) {
      const { token, refreshToken } = createAuthTokens(
        foundUser.email,
        foundUser.username,
        foundUser._id
      );
      res
        .cookie("auth", token, {
          path: "/",
          expires: new Date(new Date().getTime() + 168 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .json({ user: foundUser, token, refreshToken })
        .send();
    } else {
      const error = new Error("Incorrect credentials");
      error.status = 401;
      return next(error);
    }
  } catch (err) {
    const error = new Error("Something went wrong");
    error.status = 400;
    return next(error);
  }
});

// refresh tokens
router.post("/refresh", async (req, res, next) => {
  let verifiedToken;
  try {
    verifiedToken = await jwt.verify(req.body.refreshToken, "refreshSecret");
  } catch (err) {
    const error = new Error("Please provide a valid token");
    error.status = 403;
    return next(error);
  }
  const newToken = jwt.sign(
    {
      username: verifiedToken.username,
      email: verifiedToken.email,
      id: verifiedToken.id,
    },
    "secret",
    { expiresIn: "7d" }
  );
  const newRefreshToken = jwt.sign(
    {
      username: verifiedToken.username,
      email: verifiedToken.email,
      id: verifiedToken.id,
    },
    "refreshSecret",
    { expiresIn: "30d" }
  );
  res.json({ token: newToken, refreshToken: newRefreshToken });
});

// request password reset
router.post("/reset_password_request", async (req, res) => {
  const userEmail = req.body.email;

  if (userEmail) {
    try {
      const user = await User.findOne({
        emailLower: userEmail.toLowerCase(),
      });
      const resetPasswordToken = await jwt.sign(
        {
          username: user.username,
          email: user.email,
        },
        process.env.RESET_PASSWORD_SECRET,
        { expiresIn: "30m" }
      );
      // sendEmail(
      //   userEmail,
      //   "Recover Password",
      //   `Follow this link to create a new password http://localhost:3000/reset_password/${resetPasswordToken}`
      // );
    } catch (err) {
      return next(err);
    }
  } else {
    res.json("Please provide an email");
  }

  res.json("Recovery email sent");
});

// reset password
router.post("/reset_password", async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const verifiedToken = await jwt.verify(token, "resetPasswordSecret");
    const username = verifiedToken.username;
    const newPassword = await bcrypt.hash(password, 10);
    const user = await User.updateOne(
      { username: username },
      { $set: { password: newPassword } }
    ).select("+password");
    res.json("Password changed successfully");
  } catch (err) {
    return next(err);
  }
});

// google login
router.post("/google-login", async (req, res) => {
  try {
    const { payload } = await oAuth2Client.verifyIdToken({
      idToken: req.body.tokenId,
    });
    const user = await User.findOne({ email: payload.email });

    if (user) {
      const { token, refreshToken } = createAuthTokens(
        user.email,
        user.username,
        user._id
      );

      res
        .cookie("auth", token, {
          path: "/",
          expires: new Date(new Date().getTime() + 168 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .json({ user, token, refreshToken })
        .send();
    } else {
      const username = `${payload.given_name}${payload.family_name}${v4()}`
        .substring(0, 16)
        .toLowerCase();

      let newUser = new User({
        username: username,
        usernameLower: username,
        email: payload.email,
        emailLower: payload.email.toLowerCase(),
        password: await bcrypt.hash(v4(), 10),
      });
      newUser = await newUser.save();

      const { token, refreshToken } = createAuthTokens(
        newUser.email,
        newUser.username,
        newUser._id
      );
      res
        .cookie("auth", token, {
          path: "/",
          expires: new Date(new Date().getTime() + 168 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .json({ user: newUser, token, refreshToken })
        .send();
    }
  } catch (err) {
    return next(err);
  }
});

// logout and clear cookies
router.post("/logout", (req, res) => {
  res.clearCookie("auth").json("Logged out").send();
});

router.use(verify);

// auto login
router.post("/autoLogin", async (req, res, next) => {
  try {
    const user = await (
      await User.findById(req.userId)
    ).populate({ path: "notifications", populate: "from" });
    res.json({ user });
  } catch (err) {
    const error = new Error("Unable to login");
    error.status = 403;
    return next(error);
  }
});

module.exports = router;
