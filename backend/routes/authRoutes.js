const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("phone").isMobilePhone().withMessage("Invalid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, phone, password } = req.body;

    try {
      // check if user exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // create user
      user = new User({ email, phone, password: hashedPassword });
      await user.save();

      // create JWT payload
      const payload = {
        user: {
          id: user._id,
        },
      };

      // sign token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token, userId: user._id });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      // check user
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

      // check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

      // create JWT payload
      const payload = {
        user: {
          id: user._id,
        },
      };

      // sign token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token, userId: user._id });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// ---------------------- FORGOT PASSWORD ----------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "No account found with that email" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set token + expiry (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hr
    await user.save();

    // 💡 Create a test Ethereal account
    const testAccount = await nodemailer.createTestAccount();

    // Create transporter using Ethereal
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

const mailOptions = {
  to: user.email,
  from: 'Diet App Support <no-reply@dietapp.com>',
  subject: "Password Reset Request - Diet App",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${resetURL}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p><a href="${resetURL}">${resetURL}</a></p>
        <p>This link will expire in 1 hour.</p>
      </body>
    </html>
  `,
};


    const info = await transporter.sendMail(mailOptions);

    const previewURL = nodemailer.getTestMessageUrl(info);
    console.log("Preview URL:", previewURL);
    res.json({
        msg: "Password reset email sent successfully",
        previewURL, // 👈 send the Ethereal link to frontend
    });
} catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// ---------------------- RESET PASSWORD ----------------------
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // check expiry
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: "Password reset successful! Please login again." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;

