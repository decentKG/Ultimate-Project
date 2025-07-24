const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo purposes (replace with a database in production)
const conversations = new Map();

const chatController = {
  // Send a message in a conversation
  async sendMessage(req, res) {
    try {
      const { conversationId, content } = req.body;
      const senderId = req.user.id;

      if (!conversationId || !content) {
        return res.status(400).json({ error: 'Conversation ID and content are required' });
      }

      // In a real app, you would save this to a database
      const message = {
        id: uuidv4(),
        conversationId,
        senderId,
        content,
        timestamp: new Date().toISOString()
      };

      // Add message to conversation
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, []);
      }
      conversations.get(conversationId).push(message);

      logger.info(`Message sent in conversation ${conversationId} by user ${senderId}`);
      
      res.status(201).json(message);
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Get messages in a conversation
  async getMessages(req, res) {
    try {
      const { conversationId } = req.query;
      
      if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID is required' });
      }

      const messages = conversations.get(conversationId) || [];
      res.json(messages);
    } catch (error) {
      logger.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  },

  // Get user's conversations
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      // In a real app, you would query the database for the user's conversations
      const userConversations = [];
      
      // This is a simplified example - in a real app, you'd have a proper data model
      for (const [conversationId, messages] of conversations.entries()) {
        if (messages.some(msg => msg.senderId === userId)) {
          userConversations.push({
            id: conversationId,
            lastMessage: messages[messages.length - 1],
            participants: [...new Set(messages.map(msg => msg.senderId))]
          });
        }
      }

      res.json(userConversations);
    } catch (error) {
      logger.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  },

  // Create a new conversation
  async createConversation(req, res) {
    try {
      const { participantIds } = req.body;
      const userId = req.user.id;

      if (!participantIds || !Array.isArray(participantIds)) {
        return res.status(400).json({ error: 'Participant IDs are required' });
      }

      const conversationId = uuidv4();
      const participants = [...new Set([...participantIds, userId])];
      
      // In a real app, you would save this to a database
      conversations.set(conversationId, []);

      logger.info(`Created new conversation ${conversationId} with participants: ${participants.join(', ')}`);
      
      res.status(201).json({
        id: conversationId,
        participants,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }
};

module.exports = chatController;
