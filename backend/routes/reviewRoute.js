const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // middleware for JWT
const CustomerReview = require("../models/CustomerReview");

// @route   POST api/reviews
// @desc    Create a new review
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { rating, reviewText, images } = req.body;

    if (!rating || !reviewText) {
      return res.status(400).json({ msg: "Rating and review text are required" });
    }

    const newReview = new CustomerReview({
      user: req.user.id,
      rating,
      reviewText,
      images,
    });

    const review = await newReview.save();
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/reviews
// @desc    Get all reviews
// @access  Public
router.get("/", async (req, res) => {
  try {
    const reviews = await CustomerReview.find().populate("user", ["name", "email"]);
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
