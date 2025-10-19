const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meals: { type: Object, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = predictionSchema;