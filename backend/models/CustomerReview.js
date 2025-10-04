const mongoose = require("mongoose");

const CustomerReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // links to User model
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: true,
  },
  images: [String], // will store image URLs (if uploading to cloud storage later)
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("customerReview", CustomerReviewSchema);
