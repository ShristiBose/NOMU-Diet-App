const mongoose = require("mongoose");

const nutritionSchema = new mongoose.Schema({
  BMR: Number,
  TDEE: Number,
  energy_kcal: Number,
  protein_g: Number,
  carb_g: Number,
  fat_g: Number,
  fiber_g: Number,
  free_sugar_g: Number,
  cholesterol_mg: Number,
}, { _id: false });

module.exports = nutritionSchema;
