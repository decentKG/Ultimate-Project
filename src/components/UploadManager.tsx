import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Zap,
  Clock,
  Target,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

interface ParseSettings {
  extractSkills: boolean;
  extractExperience: boolean;
  extractEducation: boolean;
  extractCertifications: boolean;
  matchJobDescription: boolean;
  jobDescription: string;
  aiEnhancement: boolean;
  confidenceThreshold: number;
}

export default function UploadManager() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [parseSettings, setParseSettings] = useState<ParseSettings>({
    extractSkills: true,
    extractExperience: true,
    extractEducation: true,
    extractCertifications: true,
    matchJobDescription: false,
    jobDescription: "",
    aiEnhancement: true,
    confidenceThreshold: 85
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only PDF, DOC, DOCX, and TXT files under 10MB are supported",
        variant: "destructive"
      });
    }

    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const simulateProcessing = async (uploadFile: UploadFile) => {
    // Simulate upload
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
    ));

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, progress: i } : f
      ));
    }

    // Simulate processing
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'processing', progress: 0 } : f
    ));

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, progress: i } : f
      ));
    }

    // Simulate completion with mock results
    const mockResult = {
      name: uploadFile.file.name.replace(/\.[^/.]+$/, ""),
      email: "candidate@email.com",
      phone: "+1 (555) 123-4567",
      position: "Software Engineer",
      experience: "5 years",
      skills: ["React", "Node.js", "Python", "AWS"],
      education: "Bachelor's in Computer Science",
      certifications: ["AWS Solutions Architect"],
      matchScore: Math.floor(Math.random() * 20) + 80,
      confidence: parseSettings.confidenceThreshold + Math.floor(Math.random() * 10)
    };

    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { 
        ...f, 
        status: 'completed', 
        progress: 100,
        result: mockResult
      } : f
    ));

    toast({
      title: "Resume processed successfully",
      description: `${uploadFile.file.name} has been parsed with ${mockResult.confidence}% confidence`
    });
  };

  const processAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await simulateProcessing(file);
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'uploading':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'processing':
      case 'uploading':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Upload & Process Resumes</h2>
          <p className="text-muted-foreground">
            Upload resumes for AI-powered parsing and analysis
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={processAllFiles} 
            disabled={!uploadFiles.some(f => f.status === 'pending')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Process All
          </Button>
          <Button variant="outline" onClick={clearCompleted}>
            Clear Completed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drag & Drop Area */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Drop your resume files here</h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse your computer
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports PDF, DOC, DOCX, TXT files up to 10MB each
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Queue ({uploadFiles.length} files)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadFiles.map((uploadFile) => (
                    <div key={uploadFile.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(uploadFile.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium truncate">
                            {uploadFile.file.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {uploadFile.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadFile.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                          <span>{(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{uploadFile.file.type}</span>
                        </div>

                        {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>
                                {uploadFile.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                              </span>
                              <span>{uploadFile.progress}%</span>
                            </div>
                            <Progress value={uploadFile.progress} className="h-2" />
                          </div>
                        )}

                        {uploadFile.status === 'completed' && uploadFile.result && (
                          <div className="mt-2 p-3 bg-green-50 rounded border">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div><strong>Name:</strong> {uploadFile.result.name}</div>
                              <div><strong>Position:</strong> {uploadFile.result.position}</div>
                              <div><strong>Experience:</strong> {uploadFile.result.experience}</div>
                              <div><strong>Match Score:</strong> {uploadFile.result.matchScore}%</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Parsing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Data Extraction</Label>
                <div className="space-y-2">
                  {[
                    { key: 'extractSkills', label: 'Extract Skills' },
                    { key: 'extractExperience', label: 'Extract Experience' },
                    { key: 'extractEducation', label: 'Extract Education' },
                    { key: 'extractCertifications', label: 'Extract Certifications' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={parseSettings[key as keyof ParseSettings] as boolean}
                        onChange={(e) => setParseSettings(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor={key} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">AI Enhancement</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aiEnhancement"
                    checked={parseSettings.aiEnhancement}
                    onChange={(e) => setParseSettings(prev => ({
                      ...prev,
                      aiEnhancement: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="aiEnhancement" className="text-sm">
                    Enable AI Enhancement
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Confidence Threshold: {parseSettings.confidenceThreshold}%
                </Label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={parseSettings.confidenceThreshold}
                  onChange={(e) => setParseSettings(prev => ({
                    ...prev,
                    confidenceThreshold: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="matchJobDescription"
                    checked={parseSettings.matchJobDescription}
                    onChange={(e) => setParseSettings(prev => ({
                      ...prev,
                      matchJobDescription: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="matchJobDescription" className="text-sm">
                    Match Job Description
                  </Label>
                </div>
                {parseSettings.matchJobDescription && (
                  <Textarea
                    placeholder="Enter job description for matching..."
                    value={parseSettings.jobDescription}
                    onChange={(e) => setParseSettings(prev => ({
                      ...prev,
                      jobDescription: e.target.value
                    }))}
                    className="min-h-[100px]"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Processing Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Processing Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Files</span>
                  <Badge variant="outline">{uploadFiles.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <Badge variant="default">
                    {uploadFiles.filter(f => f.status === 'completed').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processing</span>
                  <Badge variant="secondary">
                    {uploadFiles.filter(f => f.status === 'processing' || f.status === 'uploading').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending</span>
                  <Badge variant="outline">
                    {uploadFiles.filter(f => f.status === 'pending').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}