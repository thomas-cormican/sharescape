const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/news", async (req, res, next) => {
  try {
    let response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );
    const stories = response.data.articles.slice(0, 4);
    res.json({ stories });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
