const express = require("express");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");

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
            return res.json(profile);
        }

        //Create
        profile = new Profile(profileData);
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