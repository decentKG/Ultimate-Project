interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    console.log('Sending chat message to API:', { messages });
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        responseData
      });
      
      const errorMessage = (responseData as ErrorResponse)?.error || 'Failed to get response from AI';
      throw new Error(errorMessage);
    }

    if (!responseData.content) {
      console.error('Unexpected API response format:', responseData);
      throw new Error('Unexpected response format from AI service');
    }

    return responseData.content;
    
  } catch (error: any) {
    console.error('Error in sendChatMessage:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return a more specific error message if available
    if (error.message.includes('Failed to fetch')) {
      return "I'm having trouble connecting to our servers. Please check your internet connection and try again.";
    }
    
    if (error.message.includes('401')) {
      return "There's an issue with the AI service configuration. Please contact support.";
    }
    
    return error.message || "I'm having trouble connecting to the AI service. Please try again later.";
  }
}
