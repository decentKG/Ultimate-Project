import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { JobPostingForm } from "./JobPostingForm";
import { Plus, Pencil, Trash2, Eye, Loader2, FileText } from "lucide-react";
import jobService, { JobPostingData } from "@/services/jobService";

interface JobPosting extends JobPostingData {
  id: string;
  applications: number;
  posted: string;
  status: 'draft' | 'published' | 'closed';
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
}

export function JobPostingList() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load job postings from API
  const fetchJobPostings = async () => {
    try {
      setIsLoading(true);
      const response = await jobService.getJobs({ 
        status: 'all',
        limit: 100 // Get all jobs for now, implement pagination later
      });
      
      if (response.success && response.data) {
        const jobs = Array.isArray(response.data) ? response.data : [];
        setJobPostings(jobs.map(job => ({
          ...job,
          posted: job.createdAt || new Date().toISOString(),
          applications: job.applications || 0,
          status: job.status || 'draft'
        })));
      }
    } catch (error: any) {
      console.error('Error fetching job postings:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to load job postings',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const handleJobSaved = async (jobData: JobPosting) => {
    try {
      setIsSubmitting(true);
      let response;
      
      if (editingJob) {
        // Update existing job
        response = await jobService.updateJob(jobData.id, jobData);
        if (response.success && response.data) {
          setJobPostings(jobPostings.map(j => j.id === jobData.id ? {
            ...response.data,
            posted: response.data.createdAt || jobData.posted,
            applications: jobData.applications,
            status: response.data.status || jobData.status
          } : j));
          toast({
            title: "Success",
            description: "Job posting updated successfully",
          });
        }
      } else {
        // Create new job
        response = await jobService.createJob({
          ...jobData,
          status: 'draft' // Default to draft
        });
        
        if (response.success && response.data) {
          const newJob = {
            ...response.data,
            posted: response.data.createdAt || new Date().toISOString(),
            applications: 0,
            status: response.data.status || 'draft'
          };
          setJobPostings([newJob, ...jobPostings]);
          toast({
            title: "Success",
            description: "Job posting created successfully",
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingJob(null);
    } catch (error: any) {
      console.error('Error saving job posting:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save job posting',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setIsDialogOpen(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await jobService.deleteJob(id);
      if (response.success) {
        setJobPostings(jobPostings.filter(job => job.id !== id));
        toast({
          title: "Success",
          description: "Job posting deleted successfully",
        });
      }
    } catch (error: any) {
      console.error('Error deleting job posting:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete job posting',
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'closed') => {
    try {
      const response = await jobService.updateJobStatus(id, newStatus);
      if (response.success) {
        setJobPostings(jobPostings.map(job => 
          job.id === id ? { ...job, status: newStatus } : job
        ));
        toast({
          title: "Success",
          description: `Job has been ${newStatus}`,
        });
      }
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update job status',
        variant: "destructive"
      });
    }
  };
  
  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: string }> = {
      'full-time': { label: 'Full-time', variant: 'default' },
      'part-time': { label: 'Part-time', variant: 'secondary' },
      'contract': { label: 'Contract', variant: 'outline' },
      'internship': { label: 'Internship', variant: 'secondary' },
      'temporary': { label: 'Temporary', variant: 'outline' }
    };
    
    const typeInfo = typeMap[type] || { label: type, variant: 'outline' };
    return (
      <Badge variant={typeInfo.variant as any}>
        {typeInfo.label}
      </Badge>
    );
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Job Postings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage and track your job postings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingJob(null)}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Job Posting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</DialogTitle>
              </DialogHeader>
              <JobPostingForm 
                initialData={editingJob || undefined}
                onSuccess={handleJobSaved}
                onCancel={() => setIsDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : jobPostings.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No job postings yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first job posting
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job Posting
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Applications</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.map((job) => (
                    <TableRow key={job.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{job.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {job.company?.name || 'Your Company'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{getTypeBadge(job.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(job.status)}
                          {job.status === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => handleStatusChange(job.id, 'published')}
                            >
                              Publish
                            </Button>
                          )}
                          {job.status === 'published' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => handleStatusChange(job.id, 'closed')}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {job.applications > 0 ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/dashboard/jobs/${job.id}/applications`)}
                          >
                            {job.applications} {job.applications === 1 ? 'Application' : 'Applications'}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(job.posted).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditJob(job)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
