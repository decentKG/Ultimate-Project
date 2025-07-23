import { NextRequest, NextResponse } from 'next/server';

declare global {
  interface Window {
    ENV: {
      OPENROUTER_API_KEY?: string;
      SITE_URL?: string;
      SITE_NAME?: string;
    };
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  role: 'assistant';
  content: string;
}
