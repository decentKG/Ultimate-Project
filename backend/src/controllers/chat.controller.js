const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');

// In-memory storage for demo purposes (replace with a database in production)
const conversations = new Map();

// Initialize OpenAI client with OpenRouter
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.VITE_OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.VITE_OPENROUTER_APP_NAME || 'Hiring Platform',
    "X-Title": process.env.VITE_OPENROUTER_APP_NAME || 'Hiring Platform',
  }
});

const chatController = {
  // Get AI response from OpenRouter API
  async getAIResponse(messages) {
    try {
      if (!process.env.VITE_OPENROUTER_API_KEY) {
        logger.error('OpenRouter API key is not configured');
        return 'I apologize, but the AI service is currently unavailable.';
      }

      const completion = await client.chat.completions.create({
        model: "mistralai/mistral-nemo:free",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      logger.error('Error getting AI response:', error.response?.data || error.message);
      return 'I apologize, but I encountered an error processing your request.';
    }
  },

  // Send a message in a conversation and get AI response
  async sendMessage(req, res) {
    try {
      const { conversationId, content } = req.body;
      const senderId = req.user?.id || 'anonymous';

      if (!conversationId || !content) {
        return res.status(400).json({ error: 'Conversation ID and content are required' });
      }

      // Initialize conversation if it doesn't exist
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, []);
      }

      // Create user message
      const userMessage = {
        id: uuidv4(),
        conversationId,
        senderId,
        content,
        role: 'user',
        timestamp: new Date().toISOString()
      };

      // Add user message to conversation
      const conversation = conversations.get(conversationId);
      conversation.push(userMessage);

      logger.info(`Message received in conversation ${conversationId} from user ${senderId}`);

      // Prepare conversation history for AI context
      const messages = conversation.map(msg => ({
        role: msg.role || 'user',
        content: msg.content
      }));

      // Get AI response from DeepSeek API
      const aiResponse = await this.getAIResponse(messages);

      // Create AI message
      const aiMessage = {
        id: uuidv4(),
        conversationId,
        senderId: 'assistant',
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      // Add AI response to conversation
      conversation.push(aiMessage);

      // Return both messages
      res.status(201).json({
        userMessage,
        aiMessage
      });
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
