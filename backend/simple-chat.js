// Load environment variables from root .env file
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8083'
}));
app.use(express.json());

// Unrestricted Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log('Processing chat request...');
    
    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // System message that mimics ChatGPT's behavior
    const systemMessage = {
      role: 'system',
      content: `You are ChatGPT, a helpful AI assistant created by OpenAI. You are designed to be helpful, harmless, and honest. 
      - You can discuss various topics including programming, science, history, and more
      - You can write and debug code in multiple programming languages
      - You can analyze and explain complex concepts
      - You can help with creative writing, brainstorming, and problem-solving
      - You should be concise when possible, but provide detailed explanations when needed
      - You can admit when you don't know something or if you're unsure`
    };

    // Prepare messages for the model
    const modelMessages = [systemMessage, ...messages];
    
    try {
      // Try Ollama first
      console.log('Sending to Ollama...');
      const response = await axios.post('http://localhost:11434/api/chat', {
        model: 'llama3',
        messages: modelMessages,
        stream: false,
        options: {
          temperature: 0.9,
          num_predict: 4000,
          top_p: 0.95,
          repeat_penalty: 1.1,
          top_k: 40,
          tfs_z: 1.0,
          typical_p: 1.0,
          stop: [],
          numa: false,
          num_ctx: 4096,
          num_batch: 8,
          num_gqa: 1,
          num_gpu: 1,
          main_gpu: 0,
          low_vram: false,
          f16_kv: true,
          vocab_only: false,
          use_mmap: true,
          use_mlock: false,
          embedding_only: false,
          rope_frequency_base: 10000.0,
          rope_frequency_scale: 1.0,
          num_thread: 8
        }
      }, {
        timeout: 300000 // 5 minute timeout
      });

      console.log('Received response from Ollama');
      return res.json({
        role: 'assistant',
        content: response.data.message?.content.trim() || "I didn't get a response from the model."
      });
      
    } catch (ollamaError) {
      console.error('Ollama error:', ollamaError.message);
      
      // Fallback response if Ollama fails
      return res.json({
        role: 'assistant',
        content: `I understand you want information about "${lastUserMessage}". ` +
                 `However, I'm currently experiencing technical difficulties with my primary response system. ` +
                 `Please try again in a few moments.`
      });
    }
    
  } catch (error) {
    console.error('Unexpected error in chat endpoint:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
