const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.auth) {
      token = req.cookies.auth;
    } else {
      token = req.headers.authorization.split(" ")[1];
    }
    const verifiedToken = await jwt.verify(token, "secret");

    req.user = verifiedToken.username;
    req.userId = verifiedToken.id;
    next();
  } catch (err) {
    const error = new Error("Cannot verify token");
    error.status = 401;
    return next(error);
  }
};
