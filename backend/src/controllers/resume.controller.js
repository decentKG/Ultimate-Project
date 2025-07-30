const axios = require('axios');
const pdf = require('pdf-parse');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const analyzeResumeWithOpenRouter = async (textContent) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume reviewer. Analyze the following resume and provide detailed feedback in JSON format with the following structure:
            {
              "score": number (0-100),
              "strengths": string[],
              "suggestions": string[],
              "missingKeywords": string[]
            }`
          },
          {
            role: 'user',
            content: `Please analyze this resume and provide feedback:\n\n${textContent.substring(0, 15000)}` // Limit to first 15k chars
          }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Hiring Platform'
        }
      }
    );

    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    logger.error('Error analyzing resume with OpenRouter:', error);
    throw new Error('Failed to analyze resume with AI');
  }
};

const resumeController = {
  async analyzeResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = path.join(UPLOAD_DIR, req.file.filename);
      
      // Read and parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      // Get AI analysis
      const analysis = await analyzeResumeWithOpenRouter(data.text);
      
      // Clean up the file
      fs.unlinkSync(filePath);
      
      res.json({
        success: true,
        analysis,
        text: data.text.substring(0, 1000) + '...' // Return first 1000 chars as preview
      });
      
    } catch (error) {
      logger.error('Error in resume analysis:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to analyze resume' 
      });
    }
  }
};

module.exports = resumeController;
