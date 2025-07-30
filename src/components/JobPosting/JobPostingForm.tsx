import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, Loader2, Upload as UploadIcon, FileText } from "lucide-react";
import jobService, { JobPostingData, JobCategory } from "@/services/jobService";
import { supabase } from "@/lib/supabase";

export interface JobPostingFormData extends Omit<JobPostingData, 'id' | 'status' | 'applications' | 'posted'> {
  id?: string;
  status?: 'draft' | 'published' | 'closed';
  applications?: number;
  posted?: string;
}

interface JobPostingFormProps {
  initialData?: Partial<JobPostingFormData>;
  onSuccess?: (job: JobPostingData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function JobPostingForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  isSubmitting: externalIsSubmitting 
}: JobPostingFormProps) {
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?.id;
  
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(
    initialData?.pdfUrl ? initialData.pdfUrl.split('/').pop() || 'Uploaded file' : null
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setPdfFile(file);
    setFileName(file.name);
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear the pdfUrl from form data when removing file
    setFormData(prev => ({ ...prev, pdfUrl: '' }));
  };

  const [formData, setFormData] = useState<Omit<JobPostingFormData, 'requirements'>>({
    title: initialData?.title || '',
    department: initialData?.department || '',
    location: initialData?.location || '',
    type: initialData?.type || 'full-time',
    status: initialData?.status || 'draft',
    description: initialData?.description || '',
    salary: initialData?.salary || '',
    experience: initialData?.experience || '',
    category: initialData?.category || 'other',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Initialize requirements from initialData if editing
  useEffect(() => {
    if (initialData?.requirements && initialData.requirements.length > 0) {
      setRequirements(initialData.requirements);
    } else {
      setRequirements(['']);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleRemoveRequirement = (index: number) => {
    if (requirements.length > 1) {
      const newRequirements = requirements.filter((_, i) => i !== index);
      setRequirements(newRequirements);
    }
  };

  const uploadPdf = async (jobId: string): Promise<string> => {
    if (!pdfFile) throw new Error('No file to upload');
    
    const fileExt = pdfFile.name.split('.').pop();
    const fileName = `job-${jobId}-${Date.now()}.${fileExt}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('job-postings')
        .upload(`job-${jobId}/${fileName}`, pdfFile);
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('job-postings')
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create/update the job to get an ID
      const jobData = {
        ...formData,
        requirements: requirements.filter(req => req.trim() !== '')
      };

      let result;
      if (isEditing && initialData?.id) {
        result = await jobService.updateJob(initialData.id, jobData);
      } else {
        result = await jobService.createJob(jobData);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save job');
      }

      const jobId = result.data.id;
      
      // If there's a new PDF file, upload it and update the job with the URL
      if (pdfFile) {
        try {
          const pdfUrl = await uploadPdfToStorage(pdfFile, jobId);
          if (pdfUrl) {
            await jobService.updateJob(jobId, { ...jobData, pdfUrl });
            result.data.pdfUrl = pdfUrl; // Update the result with the new URL
          }
        } catch (uploadError) {
          console.error('Error uploading PDF:', uploadError);
          toast({
            title: 'Job saved, but PDF upload failed',
            description: 'The job was saved, but there was an error uploading the PDF. You can try uploading it again later.',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: isEditing ? 'Job updated' : 'Job created',
        description: isEditing ? 'The job posting has been updated.' : 'A new job posting has been created.',
      });
      
      onSuccess?.(result.data);
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save job',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleRemoveRequirement = (index: number) => {
    if (requirements.length > 1) {
      const newRequirements = requirements.filter((_, i) => i !== index);
      setRequirements(newRequirements);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 py-4">
        {/* PDF Upload Section */}
        <div className="space-y-2">
          <Label>Job Description PDF</Label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
              id="pdf-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start"
              disabled={isUploading}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : fileName || 'Upload PDF (Max 10MB)'}
            </Button>
            {fileName && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {formData.pdfUrl && !pdfFile && (
            <div className="flex items-center text-sm text-muted-foreground">
              <a
                href={formData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                View current PDF
              </a>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Upload a PDF with the full job description (max 10MB)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Senior Frontend Developer"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            placeholder="e.g., Engineering"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Remote, New York, etc."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Job Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: JobCategory) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="customer-service">Customer Service</SelectItem>
              <SelectItem value="human-resources">Human Resources</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Employment Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as JobPostingData['type'] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="salary">Salary Range</Label>
          <Input
            id="salary"
            name="salary"
            value={formData.salary || ''}
            onChange={handleInputChange}
            placeholder="e.g., $80,000 - $120,000"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experience">Experience Level</Label>
          <Input
            id="experience"
            name="experience"
            value={formData.experience || ''}
            onChange={handleInputChange}
            placeholder="e.g., 3+ years"
          />
        </div>

        {initialData?.id && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'published' | 'closed') => 
                setFormData({...formData, status: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Detailed job description, responsibilities, etc."
          className="min-h-[150px]"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Job Description PDF (Optional)</Label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
            id="job-pdf"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
            disabled={isUploading}
          >
            <UploadIcon className="h-4 w-4" />
            {fileName ? 'Change File' : 'Upload PDF'}
          </Button>
          
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span className="truncate max-w-xs">{fileName}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 hover:text-destructive"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">Upload a PDF with detailed job description (max 5MB)</p>
        
        {initialData?.pdfUrl && !fileName && (
          <div className="mt-2">
            <a 
              href={initialData.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              View current PDF
            </a>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Requirements *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRequirement}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Requirement
          </Button>
        </div>
        
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={req}
                onChange={(e) => handleRequirementChange(index, e.target.value)}
                placeholder={`Requirement ${index + 1}`}
                required={index === 0}
              />
              {requirements.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRequirement(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRequirement}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Requirement
            </Button>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || externalIsSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || externalIsSubmitting}
                className="min-w-[150px]"
              >
                {(isSubmitting || externalIsSubmitting) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `${isEditing ? 'Update' : 'Create'} Job Posting`
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
