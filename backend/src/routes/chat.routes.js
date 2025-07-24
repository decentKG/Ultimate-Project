const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Chat endpoints
router.post('/messages', authenticate, chatController.sendMessage);
router.get('/messages', authenticate, chatController.getMessages);
router.get('/conversations', authenticate, chatController.getConversations);
router.post('/conversations', authenticate, chatController.createConversation);

module.exports = router;
