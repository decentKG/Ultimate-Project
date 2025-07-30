import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, FileText, Building2, Globe, Mail, Phone } from "lucide-react";
import jobService, { JobPostingData } from "@/services/jobService";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "@/components/AuthContext";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPostingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await jobService.getJobById(id);
        
        if (response.success && response.data) {
          const jobData = Array.isArray(response.data) ? response.data[0] : response.data;
          setJob(jobData);
        } else {
          throw new Error(response.error || 'Failed to load job details');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details. Please try again later.',
          variant: 'destructive',
        });
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate, toast]);

  const handleApply = async () => {
    if (!user) {
      // Redirect to login with a return URL
      navigate('/login', { state: { from: `/jobs/${id}`, message: 'Please sign in to apply for this position' } });
      return;
    }

    setApplying(true);
    try {
      // TODO: Implement application submission
      // This would typically involve opening a modal or navigating to an application form
      toast({
        title: 'Application Started',
        description: `You're applying for ${job?.title} at ${job?.company?.name || job?.department}`,
      });
      
      // For now, just show a success message
      setTimeout(() => {
        toast({
          title: 'Application Submitted',
          description: `Your application for ${job?.title} has been received!`,
        });
        setApplying(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">The job you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/jobs">Browse All Jobs</Link>
        </Button>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get time ago string
  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <Badge variant="outline" className="capitalize">
                {job.category.replace('-', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-4 w-4 mr-1.5" />
              <span className="mr-4">{job.company?.name || job.department}</span>
              <MapPin className="h-4 w-4 mr-1.5" />
              <span className="mr-4">{job.location}</span>
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{getTimeAgo(job.posted || new Date().toISOString())}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant={getJobTypeBadgeVariant(job.type)} className="capitalize">
                {job.type.replace('-', ' ')}
              </Badge>
              {job.salary && (
                <Badge variant="secondary" className="flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  {job.salary}
                </Badge>
              )}
            </div>
          </div>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>About the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2 pl-5 list-disc">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.experience && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  <p>{job.experience}</p>
                </div>
              )}

              {job.pdfUrl && (
                <div className="pt-4 border-t">
                  <a 
                    href={job.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Job Description (PDF)
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Submitting...' : 'Apply Now'}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                {user ? 'You are applying as ' + user.email : 'You need to be signed in to apply'}
              </p>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <h4 className="font-medium">Application ends:</h4>
                <p className="text-sm">
                  {job.expiresAt 
                    ? formatDate(job.expiresAt) 
                    : 'Not specified'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Info Card */}
          {job.company && (
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">{job.company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company.description?.substring(0, 60)}
                      {job.company.description && job.company.description.length > 60 ? '...' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  {job.company.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {new URL(job.company.website).hostname.replace('www.', '')}
                      </a>
                    </div>
                  )}
                  
                  {job.company.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${job.company.email}`} className="hover:underline">
                        {job.company.email}
                      </a>
                    </div>
                  )}
                  
                  {job.company.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`tel:${job.company.phone}`} className="hover:underline">
                        {job.company.phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Share Job */}
          <Card>
            <CardHeader>
              <CardTitle>Share this job</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Share on LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function to get badge variant based on job type
const getJobTypeBadgeVariant = (type: JobPostingData['type']) => {
  switch (type) {
    case 'full-time':
      return 'default';
    case 'part-time':
      return 'secondary';
    case 'contract':
      return 'outline';
    case 'internship':
      return 'outline';
    case 'temporary':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default JobDetail;
