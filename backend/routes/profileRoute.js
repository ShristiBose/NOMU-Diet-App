const express = require("express");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const { spawn } = require("child_process");
const router = express.Router();

//Middleware to verify token
function authMiddleware(req, res, next){
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.user.id; // <-- fix here
        next();
    } catch (error) {
        res.status(401).json({ msg: "Token is not valid" });
    }
}

// Helper to run Python nutrition calculation
function calculateNutrition(profile) {
    return new Promise((resolve, reject) => {
        const py = spawn('python', ['ML/model/nutrition_requirement_calculation.py']);
        py.stdin.write(JSON.stringify({
            age: Number(profile.age),
            gender: profile.gender,
            height_cm: Number(profile.height),
            weight_kg: Number(profile.weight),
            activity_level: profile.activityLevel,
            goal_type: profile.goals || "maintain",
            disease: profile.conditions[0] || "None"
        }));
        py.stdin.end();

        let data = '';
        py.stdout.on('data', chunk => data += chunk.toString());
        py.stderr.on('data', err => console.error(err.toString()));

        py.on('close', () => {
            try {
                resolve(JSON.parse(data));
            } catch (err) {
                reject(err);
            }
        });
    });
}

//Create or Update profile

router.post("/", authMiddleware, async(req, res) => {
    try{
        const profileData = { ...req.body, user: req.userId };
        let profile = await Profile.findOne({ user: req.userId });
        if (profile){
            //Update
            profile = await Profile.findOneAndUpdate(
                { user: req.userId },
                { $set: profileData },
                { new: true }
            );

            const nutrition = await calculateNutrition(profileData);
            profile.nutrition = nutrition;
            await profile.save();
            return res.json(profile);
        }

        //Create
        profile = new Profile(profileData);
        const nutrition = await calculateNutrition(profileData);
        profile.nutrition = nutrition;
        await profile.save();
        res.json(profile);
    } catch (error){
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

//Get Profile
router.get("/", authMiddleware, async(req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.userId });
        if (!profile) return res.status(404).json({ msg: "Profile not found" });
        res.json(profile);
    } catch (error){
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;