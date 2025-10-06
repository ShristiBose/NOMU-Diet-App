// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Profile = require('../models/Profile');
const chatService = require('../services/chatService');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have auth middleware

// POST /api/chat - Process user message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user profile
    const userProfile = await Profile.findOne({ userId });
    
    if (!userProfile) {
      return res.status(404).json({ 
        error: 'Profile not found',
        message: 'Please complete your health profile first to use the diet chatbot.'
      });
    }

    // Extract food items from query
    const foodItems = chatService.extractFoodItems(message);

    // Process the query
    const result = chatService.processMultipleFoods(foodItems, userProfile);

    // Save chat history
    const chatMessage = new ChatMessage({
      userId,
      message,
      response: result.response,
      foodItems: result.foodItems || [],
      isAllowed: result.isAllowed
    });

    await chatMessage.save();

    res.json({
      success: true,
      message: result.response,
      foodItems: result.foodItems || [],
      isAllowed: result.isAllowed,
      timestamp: chatMessage.timestamp
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: 'Something went wrong. Please try again.'
    });
  }
});

// GET /api/chat/history - Get chat history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const total = await ChatMessage.countDocuments({ userId });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat history'
    });
  }
});

// DELETE /api/chat/history - Clear chat history
router.delete('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await ChatMessage.deleteMany({ userId });

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      error: 'Failed to clear chat history'
    });
  }
});

// GET /api/chat/stats - Get chat statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalMessages = await ChatMessage.countDocuments({ userId });
    const allowedFoods = await ChatMessage.countDocuments({ userId, isAllowed: true });
    const restrictedFoods = await ChatMessage.countDocuments({ userId, isAllowed: false });

    // Get most queried foods
    const foodStats = await ChatMessage.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$foodItems' },
      { $group: { _id: '$foodItems', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        totalQueries: totalMessages,
        allowedFoods,
        restrictedFoods,
        topFoods: foodStats.map(item => ({ food: item._id, count: item.count }))
      }
    });

  } catch (error) {
    console.error('Chat stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;