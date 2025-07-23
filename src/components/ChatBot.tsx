import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, User, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/chatApi";
import type { ChatMessage } from "@/types/chat";

interface UIMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI hiring assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (message.trim() === '' || isLoading) return;
    
    // Add user message
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Prepare messages for the API
      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful hiring assistant. Provide concise, professional responses.'
        },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        })),
        { role: 'user', content: message }
      ];
      
      // Get response from the API
      const response = await sendChatMessage(apiMessages);
      
      // Add bot response
      const botResponse: UIMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: UIMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the AI service. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [message, messages, isLoading]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage, isLoading]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5" />
              <h3 className="font-medium">Hiring Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex",
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted text-foreground rounded-tl-none'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender === 'bot' ? (
                      <BrainCircuit className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span className="text-xs opacity-70">
                      {msg.sender === 'bot' ? 'Assistant' : 'You'}
                    </span>
                  </div>
                  <p>{msg.text}</p>
                  <div className="text-xs opacity-50 text-right mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="border-t p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={message.trim() === '' || isLoading}
                className={isLoading ? 'opacity-50' : ''}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Button 
            onClick={() => setIsOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-primary to-blue-700 hover:from-blue-700 hover:to-blue-900"
            size="icon"
          >
            <BrainCircuit className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
