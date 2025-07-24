import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'success',
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    status: 'success',
    message: 'Received your message!',
    yourMessage: body.message || 'No message provided',
    timestamp: new Date().toISOString()
  });
}
