import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MapPin, Clock, DollarSign, FileText, ArrowRight } from "lucide-react";
import jobService, { JobCategory, JobPostingData } from "@/services/jobService";
import { useToast } from "@/components/ui/use-toast";

type JobType = 'all' | JobPostingData['type'];

const JobBoard = () => {
  const [jobs, setJobs] = useState<JobPostingData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPostingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<JobType>('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getJobs({ status: 'published' });
        if (response.success && response.data) {
          const jobList = Array.isArray(response.data) ? response.data : [response.data];
          setJobs(jobList);
          setFilteredJobs(jobList);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job postings. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  // Apply filters whenever they change
  useEffect(() => {
    let result = [...jobs];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        job =>
          job.title.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          job.department.toLowerCase().includes(term) ||
          job.requirements.some(req => req.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(job => job.category === selectedCategory);
    }

    // Apply job type filter
    if (selectedType !== 'all') {
      result = result.filter(job => job.type === selectedType);
    }

    // Apply location filter
    if (selectedLocation !== 'all') {
      result = result.filter(job => 
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredJobs(result);
  }, [jobs, searchTerm, selectedCategory, selectedType, selectedLocation]);

  // Extract unique locations for filter
  const locations = [...new Set(jobs.map(job => job.location))];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Navigate to job details
  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Get badge color based on job type
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find Your Dream Job</h1>
        <p className="text-muted-foreground">Browse through our latest job openings</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search jobs by title, keywords, or company..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedCategory} onValueChange={(value: JobCategory | 'all') => setSelectedCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="customer-service">Customer Service</SelectItem>
              <SelectItem value="human-resources">Human Resources</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(value: JobType) => setSelectedType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Job Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={selectedLocation} 
            onValueChange={(value: string) => setSelectedLocation(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedLocation('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className="mr-4">{job.company?.name || job.department}</span>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <Badge variant={getJobTypeBadgeVariant(job.type)} className="capitalize">
                    {job.type.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {job.category.replace('-', ' ')}
                  </Badge>
                  {job.salary && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  {job.posted && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Posted {formatDate(job.posted)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-4">
                  {job.description.substring(0, 200)}{job.description.length > 200 ? '...' : ''}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.requirements.slice(0, 4).map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {job.requirements.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.requirements.length - 4} more
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  {job.pdfUrl && (
                    <a 
                      href={job.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline mr-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Full Job Description
                    </a>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => job.id && handleViewJob(job.id)}
                  className="group"
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
