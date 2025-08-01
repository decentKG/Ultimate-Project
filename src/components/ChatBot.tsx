import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageCircle, HelpCircle, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import OpenAI from 'openai';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'error';
  timestamp: Date;
}

// Mock responses for when API is unavailable
const MOCK_RESPONSES = [
  "I'm here to help! How can I assist you today?",
  "That's a great question! Let me think about that...",
  "I can help with job search tips, resume advice, and interview preparation.",
  "I'm currently in demo mode. In a production environment, I could help more effectively!",
  "Thanks for your message! I'm a demo AI assistant for this hiring platform."
];

const getMockResponse = () => {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callOpenRouterAPI = async (userInput: string): Promise<string> => {
    const apiKey = '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';
    const siteUrl = window.location.origin;
    const siteName = 'Hiring Platform';
    
    try {
      const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
          'HTTP-Referer': siteUrl,
          'X-Title': siteName,
        },
        dangerouslyAllowBrowser: true,
      });

      const completion = await openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for a hiring platform. Help users with job applications, resume tips, and interview preparation.'
          },
          ...messages
            .filter(m => m.role !== 'error')
            .map(({ role, content }) => ({
              role: role === 'assistant' ? 'assistant' : 'user',
              content
            })),
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        extra_headers: {
          'HTTP-Referer': siteUrl,
          'X-Title': siteName,
        },
        extra_body: {}
      });

      return completion.choices[0]?.message?.content || 'I\'m not sure how to respond to that.';
      
    } catch (error) {
      console.error('API call failed:', error);
      // Return mock response when API fails
      return getMockResponse();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callOpenRouterAPI(input);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'An unexpected error occurred',
        role: 'error',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get response from AI. Using demo responses.');
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      {isOpen ? (
        <div className="w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-[600px] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-white" />
              <div>
                <h2 className="font-semibold text-lg">Recruitment Assistant</h2>
                <p className="text-xs opacity-80">How can I help you today?</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-primary/90"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                  'transition-all duration-200'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg p-3 shadow-sm',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : message.role === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none',
                    'hover:shadow-md transition-shadow duration-200'
                  )}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    )}
                    {message.role === 'error' && (
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs mt-2 text-right opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 rounded-tl-none max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="pr-10 border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  disabled={isLoading}
                />
                {!input && (
                  <HelpCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                )}
              </div>
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask me about candidates, job postings, or hiring tips
            </p>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300 hover:shadow-xl hover:scale-105"
          size="icon"
          aria-label="Open chat with Recruitment Assistant"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
              <span className="h-2 w-2 bg-white rounded-full"></span>
            </span>
          </span>
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
