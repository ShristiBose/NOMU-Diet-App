// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes.js'); // Add this line
const profileRoutes = require('./routes/profileRoute.js');
const reviewRoutes = require('./routes/reviewRoute.js');
const predictRoutes = require('./routes/predictRoute.js');
const chatbotRoute = require("./routes/chatbotRoute");

console.log('Mongo URI:', process.env.MONGO_URI); // debug

const app = express(); 

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/profile/predict', predictRoutes);
app.use("/api", chatbotRoute);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));


