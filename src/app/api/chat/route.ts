import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export async function POST(req: Request) {
  console.log('Chat API endpoint hit');
  
  try {
    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format in request body:', body);
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    console.log('Received messages:', JSON.stringify(messages, null, 2));
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OpenRouter API key is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Sending request to OpenRouter API...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.SITE_NAME || 'Hiring Platform',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json().catch(e => {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid response from AI service');
    });

    console.log('OpenRouter API response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      let errorMessage = 'Failed to get response from AI';
      if (response.status === 401) errorMessage = 'Invalid API key';
      if (response.status === 429) errorMessage = 'Rate limit exceeded';
      
      throw new Error(errorMessage);
    }

    const message = data.choices?.[0]?.message;
    if (!message) {
      console.error('Unexpected response format from OpenRouter:', data);
      throw new Error('Unexpected response format from AI service');
    }

    return NextResponse.json({
      role: 'assistant',
      content: message.content || "I'm sorry, I couldn't process that request."
    });
    
  } catch (error: any) {
    console.error('Error in chat API:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.response ? { response: error.response } : {})
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process your request',
        ...(process.env.NODE_ENV === 'development' ? { details: error.stack } : {})
      },
      { status: 500 }
    );
  }
}
