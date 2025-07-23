import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, User, Sparkles, BrainCircuit, BotMessageSquare, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ApplicantChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your resume assistant. I can help you with resume tips, parsing, and what employers are looking for. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(message),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Resume parsing help
    if (lowerMessage.includes('parse') || lowerMessage.includes('parsing') || lowerMessage.includes('scanned')) {
      return 'For best parsing results, make sure your resume includes clear section headings (like "Experience", "Education"), proper dates, and consistent formatting. Avoid using tables or complex layouts that might confuse the parser.';
    }
    
    // Resume sections
    if (lowerMessage.includes('section') || lowerMessage.includes('include') || lowerMessage.includes('need')) {
      return 'A strong resume should include these key sections:\n\n' +
             '✓ Contact Information\n' +
             '✓ Professional Summary\n' +
             '✓ Work Experience (with achievements, not just duties)\n' +
             '✓ Education\n' +
             '✓ Skills (tailored to the job)\n' +
             '✓ Optional: Certifications, Projects, or Volunteer Work';
    }
    
    // Resume tips
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('improve')) {
      return 'Here are some resume tips:\n\n' +
             '• Use action verbs (e.g., "Developed", "Managed", "Increased")\n' +
             '• Quantify achievements with numbers (e.g., "Increased sales by 30%")\n' +
             '• Keep it to 1-2 pages maximum\n' +
             '• Use a clean, professional font\n' +
             '• Save as PDF to preserve formatting\n' +
             '• Tailor your resume for each job application';
    }
    
    // ATS (Applicant Tracking System)
    if (lowerMessage.includes('ats') || lowerMessage.includes('tracking') || lowerMessage.includes('system')) {
      return 'To make your resume ATS-friendly:\n\n' +
             '• Use standard section headings (like "Work Experience" instead of "Where I\'ve Been")\n' +
             '• Include keywords from the job description\n' +
             '• Avoid headers/footers, tables, or images\n' +
             '• Use standard fonts (Arial, Calibri, Times New Roman)\n' +
             '• Don\'t use graphics or special characters';
    }
    
    // Common resume mistakes
    if (lowerMessage.includes('mistake') || lowerMessage.includes('avoid') || lowerMessage.includes('wrong')) {
      return 'Common resume mistakes to avoid:\n\n' +
             '✗ Spelling or grammar errors\n' +
             '✗ Including personal information like age or photo\n' +
             '✗ Using an unprofessional email address\n' +
             '✗ Listing every job you\'ve ever had (stick to relevant experience)\n' +
             '✗ Using a generic objective statement\n' +
             '✗ Not including relevant keywords from the job description';
    }
    
    // Resume length
    if (lowerMessage.includes('long') || lowerMessage.includes('length') || lowerMessage.includes('page')) {
      return 'Ideal resume length depends on your experience level:\n\n' +
             '• Entry-level: 1 page\n' +
             '• Mid-career: 1-2 pages\n' +
             '• Senior/Executive: 2 pages maximum\n\n' +
             'Remember, quality over quantity! Only include relevant information.';
    }
    
    // Resume format
    if (lowerMessage.includes('format') || lowerMessage.includes('template') || lowerMessage.includes('design')) {
      return 'For best results, use a clean, professional format:\n\n' +
             '• Use a simple, readable font (size 10-12pt)\n' +
             '• Include sufficient white space\n' +
             '• Use consistent formatting for dates and job titles\n' +
             '• Save as a PDF to preserve formatting\n' +
             '• Avoid using templates with excessive graphics or colors';
    }
    
    // Keywords
    if (lowerMessage.includes('keyword') || lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return 'To optimize your resume with keywords:\n\n' +
             '1. Review the job description carefully\n' +
             '2. Identify important skills and qualifications\n' +
             '3. Incorporate these naturally into your resume\n' +
             '4. Include both acronyms and full terms (e.g., "SEO (Search Engine Optimization)")\n' +
             '5. Focus on hard skills and technical terms relevant to the position';
    }
    
    // Greeting
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return 'Hello! I\'m here to help you create the perfect resume. You can ask me about:\n\n' +
             '• Resume formatting and sections\n' +
             '• ATS optimization\n' +
             '• Resume writing tips\n' +
             '• Common mistakes to avoid\n' +
             '• How to tailor your resume for specific jobs';
    }
    
    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You\'re welcome! Feel free to ask if you have any other questions about resumes or the application process.';
    }
    
    // Default response
    return 'I\'m here to help with your resume! You can ask me about:\n\n' +
           '• What sections to include in your resume\n' +
           '• How to format your resume for best results\n' +
           '• Tips for getting past ATS systems\n' +
           '• How to highlight your skills and experience\n' +
           '• Common resume mistakes to avoid';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <h3 className="font-medium">Resume Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-blue-700"
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
                    "max-w-[90%] rounded-lg p-3 text-sm",
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender === 'bot' ? (
                      <BrainCircuit className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span className="text-xs opacity-80">
                      {msg.sender === 'bot' ? 'Resume Assistant' : 'You'}
                    </span>
                  </div>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div className="text-xs opacity-70 text-right mt-1">
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
                placeholder="Ask about resume tips..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={message.trim() === ''}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask about resume tips, formatting, or ATS optimization
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Button 
            onClick={() => setIsOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
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

export default ApplicantChatBot;
