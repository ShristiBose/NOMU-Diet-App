const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile"); // Ensure the path is correct

// --- MIDDLEWARE ---

/**
 * @function authMiddleware
 * @description Verifies the JWT sent in the 'Authorization' header.
 * Attaches the user's ID to the request object upon successful verification.
 */
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
        console.error("[AUTH ERROR] Token is not valid:", error);
        res.status(401).json({ msg: "Token is not valid" });
    }
}

// --- ROUTES ---

/**
 * @route POST /api/predict
 * @description Runs the Python ML script to get food recommendations based on user profile data.
 * @access Private (Requires authentication)
 */
router.post("/", authMiddleware, async (req, res) => {
    try {
        // 1. Fetch user profile
        const profile = await Profile.findOne({ user: req.userId });

        if (!profile) {
            console.error("[PROFILE ERROR] User profile not found for userId:", req.userId);
            return res.status(404).json({ msg: "User profile not found." });
        }

        const profileData = profile.toObject();
        console.log("[DEBUG] Sending profile data to Python script:", JSON.stringify(profileData));

        // 2. Spawn Python script
        const py = spawn("python", ["ML/model/ml_model.py"]);

        // Send the profile data as a JSON string to Python's stdin
        py.stdin.write(JSON.stringify(profileData));
        py.stdin.end();

        let data = "";
        let errorData = "";

        // 3. Handle Python stdout
        py.stdout.on("data", (chunk) => {
            data += chunk.toString();
            console.log("[PYTHON STDOUT]", chunk.toString());
        });

        // 4. Handle Python stderr
        py.stderr.on("data", (chunk) => {
            errorData += chunk.toString();
            console.error("[PYTHON STDERR]", chunk.toString());
        });

        // 5. Handle Python process closure
        py.on("close", async (code) => {
            if (code !== 0 || errorData) {
                console.error("[ML ERROR] Python script execution failed.");
                return res.status(500).json({
                    msg: "ML script execution failed.",
                    code,
                    stdout: data,
                    stderr: errorData
                });
            }

            let meals;
            try {
                meals = JSON.parse(data.trim());
                if (!Array.isArray(meals) && typeof meals !== 'object') {
                    throw new Error("Parsed data is not in the expected format (Array/Object).");
                }
                console.log("[DEBUG] Parsed Python output successfully:", meals);
            } catch (jsonParseError) {
                console.error("[JSON PARSE ERROR] Failed to parse Python output:", jsonParseError);
                console.log("[DEBUG] Raw Python Output:", data);
                return res.status(500).json({
                    msg: "Failed to parse Python output.",
                    error: jsonParseError.message,
                    rawOutput: data.trim(),
                });
            }

            // 6. Save prediction to profile
            try {
                profile.predictions.push({ meals: meals, createdAt: new Date() });
                await profile.save();
                console.log("[DEBUG] Saved prediction to profile successfully");

                res.json({
                    msg: "Recommendations generated and saved successfully.",
                    meals: meals,
                    predictions: profile.predictions,
                });
            } catch (dbError) {
                console.error("[DB ERROR] Failed to save prediction:", dbError);
                return res.status(500).json({
                    msg: "Failed to save prediction to profile.",
                    error: dbError.message,
                });
            }
        });

        // 7. Handle Python spawn errors
        py.on("error", (err) => {
            console.error("[PYTHON SPAWN ERROR] Failed to start Python process:", err);
            return res.status(500).json({
                msg: "Could not execute the ML script.",
                error: err.message,
            });
        });

    } catch (err) {
        console.error("[SERVER ERROR] Unexpected error during prediction process:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
