require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1/chat/completions',
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
    'X-Title': 'Hiring Platform',
  },
  defaultQuery: { 'api-version': '2023-05-15' },
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend server is working!',
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENROUTER_API_KEY
  });
});

// Chat endpoint with OpenRouter AI
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not configured');
      return res.json({
        role: 'assistant',
        content: "I'm currently in maintenance mode. Please try again later."
      });
    }

    console.log('Sending to OpenRouter:', { 
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messageCount: messages.length 
    });

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'system',
          content: `You are a helpful hiring assistant. Provide concise, professional responses focused on recruitment, hiring, and HR-related topics. 
          If asked about anything outside this scope, politely redirect the conversation back to hiring-related topics.`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0]?.message;
    
    if (assistantMessage?.content) {
      return res.json({
        role: 'assistant',
        content: assistantMessage.content
      });
    }
    
    throw new Error('No content in AI response');
    
  } catch (error) {
    console.error('Error in chat endpoint:', error.response?.data || error.message);
    
    // Fallback responses
    const fallbackResponses = [
      "I'm having trouble connecting to the AI service. Could you try rephrasing your question?",
      "I apologize, but I'm experiencing some technical difficulties. Could you ask me something else?",
      "I'm still learning! Could you try asking me about hiring, recruitment, or HR-related topics?"
    ];
    
    res.json({
      role: 'assistant',
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
