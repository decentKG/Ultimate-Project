import { NextResponse } from 'next/server';

// Simple test endpoint to verify the API is working
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Chat API is working' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    
    // Get the last user message
    const lastMessage = messages?.slice().reverse().find((m: any) => m.role === 'user');
    const userMessage = lastMessage?.content || 'Hello';
    
    // Simple response logic
    const responses: Record<string, string> = {
      'hello': 'Hello! How can I assist you with your hiring needs today?',
      'hi': 'Hi there! I\'m here to help with your recruitment questions.',
      'help': 'I can help with job descriptions, resume screening, and interview questions. What do you need?',
    };
    
    const defaultResponse = 'I\'m your hiring assistant. How can I help you today?';
    const response = responses[userMessage.toLowerCase()] || defaultResponse;
    
    return NextResponse.json({
      role: 'assistant',
      content: response
    });
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
