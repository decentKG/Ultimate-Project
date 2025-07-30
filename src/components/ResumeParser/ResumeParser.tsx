import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, Upload as UploadIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ResumeParser() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type (PDF, DOC, DOCX, TXT)
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setParsedData(null);
    }
  };

  const parseResume = async () => {
    if (!file) return;
    
    setIsParsing(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 20);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // In a real app, you would send the file to your backend for parsing
      // const formData = new FormData();
      // formData.append('resume', file);
      // const response = await fetch('/api/parse-resume', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Mock parsed data - in a real app, this would come from the API
      const mockParsedData = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "(123) 456-7890",
        location: "New York, NY",
        summary: "Experienced software engineer with 5+ years of experience in web development...",
        experience: [
          {
            title: "Senior Software Engineer",
            company: "Tech Corp",
            duration: "2020 - Present",
            description: "Led a team of developers in building scalable web applications..."
          },
          {
            title: "Software Engineer",
            company: "Web Solutions Inc.",
            duration: "2018 - 2020",
            description: "Developed and maintained client websites and web applications..."
          }
        ],
        education: [
          {
            degree: "B.S. in Computer Science",
            institution: "State University",
            year: 2018
          }
        ],
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "Python", "Docker"],
        certifications: ["AWS Certified Developer", "Google Cloud Professional"]
      };
      
      setParsedData(mockParsedData);
      
      toast({
        title: "Success",
        description: "Resume parsed successfully!",
      });
      
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast({
        title: "Error",
        description: "Failed to parse resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <UploadIcon className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your resume here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, TXT (max 5MB)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {file.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={isParsing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isParsing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Parsing resume...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {!isParsing && progress === 0 && (
                <Button 
                  onClick={parseResume}
                  className="w-full"
                >
                  Parse Resume
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div>
                  <p className="font-medium">{parsedData.name}</p>
                  <p className="text-sm text-muted-foreground">{parsedData.email}</p>
                </div>
                <div>
                  <p>{parsedData.phone}</p>
                  <p className="text-sm text-muted-foreground">{parsedData.location}</p>
                </div>
              </div>
            </div>

            {parsedData.summary && (
              <div>
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-muted-foreground">{parsedData.summary}</p>
              </div>
            )}

            {parsedData.experience?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Experience</h3>
                <div className="space-y-4">
                  {parsedData.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4 py-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{exp.title}</h4>
                        <span className="text-sm text-muted-foreground">{exp.duration}</span>
                      </div>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="text-sm mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedData.education?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Education</h3>
                <div className="space-y-2">
                  {parsedData.education.map((edu: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-muted-foreground">{edu.institution}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedData.skills?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {parsedData.certifications?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Certifications</h3>
                <ul className="list-disc list-inside space-y-1">
                  {parsedData.certifications.map((cert: string, index: number) => (
                    <li key={index} className="text-muted-foreground">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
