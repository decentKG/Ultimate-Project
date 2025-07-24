require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Predefined responses
const RESPONSES = {
  'hello': 'Hello! How can I assist you with your hiring needs today?',
  'hi': 'Hi there! I\'m here to help with your recruitment questions.',
  'help': 'I can help with job descriptions, resume screening, and interview questions. What do you need?',
  'job': 'I can help you create job descriptions or review existing ones. What position are you hiring for?',
  'resume': 'I can help analyze resumes and provide insights. You can share the key details.',
  'interview': 'I can suggest interview questions and evaluation criteria. What role are you interviewing for?',
  'default': 'I\'m your hiring assistant. I can help with job descriptions, resume screening, and interview preparation. What would you like to know?'
};

// Simple chat endpoint that always responds
app.post('/api/chat', (req, res) => {
  try {
    const messages = req.body.messages || [];
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(m => m.role === 'user');
    
    const userInput = (lastUserMessage?.content || '').toLowerCase();
    
    // Find a matching response or use default
    let response = RESPONSES.default;
    for (const [key, value] of Object.entries(RESPONSES)) {
      if (userInput.includes(key)) {
        response = value;
        break;
      }
    }

    res.json({
      role: 'assistant',
      content: response
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(200).json({
      role: 'assistant',
      content: 'I encountered an error. Please try asking me something else about hiring or recruitment.'
    });
  }
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chat server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple chat server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/health`);
});
