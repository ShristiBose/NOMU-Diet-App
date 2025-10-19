const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const jwt = require("jsonwebtoken");
const path = require("path");
const Profile = require("../models/Profile"); // ensure correct path

// -------------------- AUTH MIDDLEWARE --------------------
function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[AUTH ERROR] No token provided.");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.user.id;
    console.log("[AUTH SUCCESS] User ID:", req.userId);
    next();
  } catch (error) {
    console.error("[AUTH ERROR] Invalid token:", error);
    res.status(401).json({ msg: "Token is not valid" });
  }
}

// -------------------- MAIN PREDICTION ROUTE --------------------
router.post("/", authMiddleware, async (req, res) => {
  try {
    // 1️⃣ Fetch user profile
    const profile = await Profile.findOne({ user: req.userId });

    if (!profile) {
      console.error("[PROFILE ERROR] No profile found for user:", req.userId);
      return res.status(404).json({ msg: "User profile not found." });
    }

    // 2️⃣ Clean the profile data
    const profileData = profile.toObject();
    const cleanedProfile = {
      user_id: profileData.user?.toString() || "unknown_user",
      TDEE: profileData.TDEE || 2000,
      protein_g: profileData.protein_g || 50,
      carb_g: profileData.carb_g || 250,
      fat_g: profileData.fat_g || 70,
      allergies: profileData.allergies || [],
      age: profileData.age || null,
      gender: profileData.gender || null,
      height: profileData.height || null,
      weight: profileData.weight || null,
      goals: profileData.goals || null,
    };

    console.log("[DEBUG] Cleaned profile data to send to Python:", cleanedProfile);

    // 3️⃣ Prepare Python script path
    const scriptPath = path.join(__dirname, "../ML/model/ml_model.py");
    console.log("[DEBUG] Python script path:", scriptPath);

    // 4️⃣ Spawn Python process
    const py = spawn("python", [scriptPath]);

    let pythonOutput = "";
    let pythonError = "";

    // ✅ Capture stdout and stderr
    py.stdout.on("data", (data) => {
      pythonOutput += data.toString();
      console.log("[PYTHON STDOUT]", data.toString());
    });

    py.stderr.on("data", (data) => {
      pythonError += data.toString();
      console.error("[PYTHON STDERR]", data.toString());
    });

    // ✅ Handle Python exit correctly
    py.on("close", async (code) => {
      console.log(`[PYTHON EXIT] Code: ${code}`);

      if (code === 0 && pythonOutput) {
        try {
          const parsedOutput = JSON.parse(pythonOutput.trim());
          console.log("[DEBUG] Parsed Python output:", parsedOutput);

          const meals = parsedOutput.meals || {};
          const history = parsedOutput.history || {};

          // ✅ Save prediction to MongoDB
          profile.predictions.push({
            user: profile.user,
            meals,
            date: new Date(),
          });
          await profile.save();
          console.log("[DEBUG] Saved new prediction to profile");

          return res.status(200).json({
            success: true,
            message: "Prediction successful",
            meals,
            history,
            predictions: profile.predictions,
          });
        } catch (parseErr) {
          console.error("[PARSE ERROR] Could not parse Python output:", parseErr);
          return res.status(500).json({
            success: false,
            msg: "Failed to parse Python output.",
            error: parseErr.message,
            rawOutput: pythonOutput.trim(),
          });
        }
      } else {
        console.error("[ML ERROR]", pythonError || "Python execution failed");
        return res.status(500).json({
          success: false,
          msg: "Python execution failed.",
          stderr: pythonError,
          stdout: pythonOutput,
        });
      }
    });

    // ✅ Send data to Python script
    py.stdin.write(JSON.stringify(cleanedProfile));
    py.stdin.end();

    // ✅ Handle spawn errors
    py.on("error", (err) => {
      console.error("[PYTHON SPAWN ERROR]", err);
      return res.status(500).json({
        success: false,
        msg: "Could not execute the ML script.",
        error: err.message,
      });
    });
  } catch (err) {
    console.error("[SERVER ERROR]", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
