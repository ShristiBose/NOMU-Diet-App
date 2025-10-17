const mongoose = require("mongoose");

const nutritionSchema = require("./Nutrition");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links profile to a user
      required: true,
    },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    age: { type: Number }, // auto-calculated in frontend
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    weight: { type: Number, required: true }, // in kg
    height: { type: Number, required: true }, // in cm
    conditions: { type: [String], default: ["None"] },
    dietPreference: {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian", "Vegan"],
      default: "Vegetarian",
    },
    allergies: { type: String, default: "" },
    activityLevel: {
      type: String,
      enum: ["Sedentary", "Light", "Moderate", "Active", "Very Active"],
      default: "Moderate",
    },
    goals: { type: String, default: "" },
    nutrition: nutritionSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
