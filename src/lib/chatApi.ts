interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Base URL for the Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Fallback responses when the API is unavailable
const FALLBACK_RESPONSES = [
  "I'm here to help with your hiring needs. Could you tell me more about what you're looking for?",
  "I can assist with job descriptions, resume screening, and interview questions. What would you like to know?",
  "Let me help you with your hiring process. What specific information do you need?",
  "I'm your hiring assistant. How can I help you today?"
];

// Get a random fallback response
const getFallbackResponse = () => {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
};

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find(m => m.role === 'user');
  
  try {
    console.log('Sending chat message to API');
    
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    // If the response is not OK, use fallback
    if (!response.ok) {
      console.warn('API responded with status:', response.status);
      return getFallbackResponse();
    }

    const responseData = await response.json().catch(() => null);
    
    // If we got a valid response with content, return it
    if (responseData?.content) {
      return responseData.content;
    }
    
    // If response format is unexpected, use fallback
    console.warn('Unexpected API response format:', responseData);
    return getFallbackResponse();
    
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    return getFallbackResponse();
  }
}
