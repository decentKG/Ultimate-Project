import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, User, Sparkles, BrainCircuit, BotMessageSquare, FileText, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'resume';
  file?: {
    name: string;
    size: number;
    url?: string;
    analysis?: {
      score?: number;
      strengths?: string[];
      suggestions?: string[];
      missingKeywords?: string[];
    };
  };
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(message),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File Too Large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    // Create a temporary URL for preview
    const fileUrl = URL.createObjectURL(file);
    
    // Add file message to chat
    const fileMessage: Message = {
      id: `file-${Date.now()}`,
      text: `Uploaded resume: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'resume',
      file: {
        name: file.name,
        size: file.size,
        url: fileUrl
      }
    };
    
    setMessages(prev => [...prev, fileMessage]);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      // Show upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          if (newProgress >= 90) clearInterval(progressInterval);
          return newProgress;
        });
      }, 200);
      
      // Call the backend API
      // The base URL already includes /api, so we just need /resumes/analyze
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resumes/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }
      
      const result = await response.json();
      
      if (result.success && result.analysis) {
        const analysisResponse: Message = {
          id: `analysis-${Date.now()}`,
          text: 'I\'ve analyzed your resume. Here are my observations:',
          sender: 'bot',
          timestamp: new Date(),
          type: 'resume',
          file: {
            name: file.name,
            size: file.size,
            url: fileUrl,
            analysis: result.analysis
          }
        };
        
        setMessages(prev => [...prev, analysisResponse]);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'There was an error analyzing your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

  const renderMessage = (msg: Message) => {
    const isBot = msg.sender === 'bot';
    const timeString = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div key={msg.id} className={cn(
        'flex mb-4',
        isBot ? 'justify-start' : 'justify-end'
      )}>
        <div className={cn(
          'max-w-[90%] rounded-lg p-3 text-sm',
          isBot 
            ? 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200' 
            : 'bg-blue-600 text-white rounded-tr-none'
        )}>
          <div className="flex items-center gap-2 mb-1">
            {isBot ? (
              <BrainCircuit className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
            <span className="text-xs opacity-80">
              {isBot ? 'Resume Assistant' : 'You'}
            </span>
          </div>
          
          {msg.type === 'resume' && msg.file ? (
            <div className="mt-1">
              <div className="flex items-center p-2 bg-white/10 rounded">
                <FileText className="h-4 w-4 mr-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{msg.file.name}</p>
                  <p className="text-xs opacity-80">
                    {(msg.file.size / 1024).toFixed(1)} KB • PDF
                  </p>
                </div>
                {msg.file.url && (
                  <a 
                    href={msg.file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-300 hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileCheck className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              {isUploading && msg.id.startsWith('file-') && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Analyzing resume...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5 bg-gray-200 dark:bg-gray-700" />
                </div>
              )}
              
              {msg.file.analysis && (
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center">
                    <div className="text-lg font-bold mr-2">
                      {msg.file.analysis.score}/100
                    </div>
                    <div className="text-sm">Resume Score</div>
                  </div>
                  
                  {msg.file.analysis.strengths && msg.file.analysis.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">✅ Strengths:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {msg.file.analysis.strengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {msg.file.analysis.suggestions && msg.file.analysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">💡 Suggestions:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {msg.file.analysis.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {msg.file.analysis.missingKeywords && msg.file.analysis.missingKeywords.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Consider adding these keywords:
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.file.analysis.missingKeywords.map((keyword, i) => (
                          <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="whitespace-pre-line">{msg.text}</p>
          )}
          
          <div className="text-xs opacity-80 text-right mt-1">
            {timeString}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {isOpen ? (
          <div className="w-96 h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between rounded-t-lg">
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
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex items-center mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="mr-2 bg-white dark:bg-gray-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resume
                </Button>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, max 5MB
                </div>
              </div>
              
              <div className="flex items-center">
                <Input
                  placeholder="Ask about resumes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-white dark:bg-gray-800"
                  disabled={isUploading}
                />
                <Button 
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="ml-2"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isUploading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Upload your resume or ask about resume tips, formatting, or ATS optimization
              </p>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setIsOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            size="icon"
          >
            <FileText className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplicantChatBot;
