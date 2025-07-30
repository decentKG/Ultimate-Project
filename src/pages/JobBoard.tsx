import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MapPin, Clock, Building2, Filter, X, Star, Zap, Eye } from "lucide-react";
import jobService, { JobCategory, type JobPostingData } from "@/services/jobService";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "@/components/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

const JobBoard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allJobs, setAllJobs] = useState<JobPostingData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPostingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | 'all'>(searchParams.get('category') as JobCategory || 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [showMatchedOnly, setShowMatchedOnly] = useState(true);
  const [categories, setCategories] = useState<{category: JobCategory; count: number}[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get user's industry preferences or default to empty array
  const userInterests = user?.industryPreferences || [];

  // Available job types for filtering
  const jobTypes = [
    'full-time',
    'part-time',
    'contract',
    'internship',
    'temporary'
  ];

  // Fetch jobs based on filters
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (searchTerm) params.set('search', searchTerm);
        if (locationFilter) params.set('location', locationFilter);
        if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
        if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
        
        setSearchParams(params, { replace: true });
        
        const response = await jobService.getJobs({
          search: searchTerm,
          location: locationFilter,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          status: 'published',
          sortBy: 'newest'
        });
        
        if (response.success && response.data) {
          // Handle both array and paginated response formats
          const jobsData = Array.isArray(response.data) 
            ? response.data 
            : (response.data as any).data || [];
            
          setAllJobs(jobsData);
          
          // If user is logged in and has interests, filter jobs to show matched ones by default
          if (user?.industryPreferences?.length) {
            const matchedJobs = jobsData.filter((job: JobPostingData) => 
              job.category && user.industryPreferences?.includes(job.category)
            );
            setFilteredJobs(showMatchedOnly ? matchedJobs : jobsData);
          } else {
            setFilteredJobs(jobsData);
          }
        } else {
          throw new Error(response.error || 'Failed to load jobs');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job listings. Please try again later.',
          variant: 'destructive',
        });
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchTerm, locationFilter, categoryFilter, typeFilter, toast, setSearchParams]);

  // Fetch job categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await jobService.getCategories();
        setCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the search when searchTerm changes
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('all');
    setTypeFilter('all');
  };
  
  // Toggle between showing all jobs and matched jobs
  const toggleMatchedJobs = (checked: boolean) => {
    setShowMatchedOnly(checked);
    if (checked && user?.industryPreferences?.length) {
      const matched = allJobs.filter(job => 
        job.category && user.industryPreferences?.includes(job.category)
      );
      setFilteredJobs(matched);
    } else {
      setFilteredJobs(allJobs);
    }
  };
  
  // Check if a job matches user's interests
  const isJobMatched = (job: JobPostingData) => {
    return job.category && userInterests.includes(job.category);
  };

  // Apply all filters to jobs
  const getFilteredJobs = () => {
    if (!allJobs.length) return [];
    
    let result = [...allJobs];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        (job.title?.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term) ||
        job.company?.name?.toLowerCase().includes(term) ||
        job.department?.toLowerCase().includes(term)) ?? false
      );
    }
    
    // Apply location filter
    if (locationFilter) {
      const location = locationFilter.toLowerCase();
      result = result.filter(job => 
        job.location?.toLowerCase().includes(location) ?? false
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(job => job.category === categoryFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(job => job.type === typeFilter);
    }
    
    // Apply matched jobs filter if enabled
    if (showMatchedOnly && user?.industryPreferences?.length) {
      result = result.filter(job => isJobMatched(job));
    }
    
    return result;
  };
  
  // Update filtered jobs whenever filters or jobs change
  useEffect(() => {
    setFilteredJobs(getFilteredJobs());
  }, [allJobs, searchTerm, locationFilter, categoryFilter, typeFilter, showMatchedOnly, user?.industryPreferences]);

  // Check if any filters are active
  const hasActiveFilters = searchTerm || locationFilter || categoryFilter !== 'all' || typeFilter !== 'all';

  // Format job type for display
  const formatJobType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-gray-600 mb-4">
            {user?.industryPreferences?.length 
              ? `Showing ${showMatchedOnly ? 'jobs matching your interests' : 'all available jobs'}`
              : 'Browse through our latest job listings'}
          </p>
          
          {user?.industryPreferences?.length > 0 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Switch 
                id="matched-jobs" 
                checked={showMatchedOnly}
                onCheckedChange={toggleMatchedJobs}
              />
              <Label htmlFor="matched-jobs" className="flex items-center cursor-pointer">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                Show matched jobs only
              </Label>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Location"
                  className="pl-10"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={(value: JobCategory | 'all') => setCategoryFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {formatCategory(cat.category)} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Job Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <Button type="submit" className="hidden md:inline-flex">
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </Button>
              
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all filters
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchTerm && (
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                {searchTerm}
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {locationFilter && (
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                {locationFilter}
                <button 
                  onClick={() => setLocationFilter('')}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                {formatCategory(categoryFilter)}
                <button 
                  onClick={() => setCategoryFilter('all')}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {typeFilter !== 'all' && (
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                {formatJobType(typeFilter)}
                <button 
                  onClick={() => setTypeFilter('all')}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Job Listings */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {filteredJobs.map((job) => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="block hover:opacity-90 transition-opacity">
                  <Card className={`h-full hover:shadow-lg transition-shadow relative overflow-hidden ${
                    isJobMatched(job) ? 'border-l-4 border-primary' : ''
                  }`}>
                    {isJobMatched(job) && (
                      <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Matches your interests
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Building2 className="h-4 w-4 mr-1.5" />
                            <span className="mr-4">{job.company?.name || job.department}</span>
                            <MapPin className="h-4 w-4 mr-1.5" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {formatJobType(job.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="line-clamp-2 text-muted-foreground">
                        {job.description.substring(0, 200)}{job.description.length > 200 ? '...' : ''}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="capitalize">
                          {job.category.replace('-', ' ')}
                        </Badge>
                        {job.salary && (
                          <Badge variant="outline" className="flex items-center">
                            <DollarSign className="h-3.5 w-3.5 mr-1" />
                            {job.salary}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground justify-between pt-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        {job.posted ? (
                          <span>Posted {formatDistanceToNow(new Date(job.posted), { addSuffix: true })}</span>
                        ) : (
                          <span>Posted recently</span>
                        )}
                      </div>
                      <span className="text-primary hover:underline">View Details →</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {showMatchedOnly && user?.industryPreferences?.length 
                  ? 'No matching jobs found for your interests'
                  : 'No jobs found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filter criteria' 
                  : showMatchedOnly && user?.industryPreferences?.length
                    ? 'Try showing all jobs or update your interests in your profile.'
                    : 'There are currently no job listings available. Please check back later.'}
              </p>
              <div className="space-x-2">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mr-2">
                    Clear all filters
                  </Button>
                )}
                {showMatchedOnly && user?.industryPreferences?.length > 0 && (
                  <Button variant="outline" onClick={() => setShowMatchedOnly(false)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Show all jobs
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoard;
