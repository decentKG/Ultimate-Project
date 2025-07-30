import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import jobService from "@/services/jobService";
import api from "@/services/api";
import { 
  FileText, 
  Upload, 
  User, 
  Briefcase, 
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  Settings,
  Bell,
  Search,
  Menu,
  Pencil 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { Link } from "react-router-dom";
import ChatBot from "@/components/ChatBot";


interface Application {
  id: string;
  companyName: string;
  position: string;
  appliedDate: Date;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  matchScore?: number;
}

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string[];
  certifications: string[];
  bio: string;
}

const SidebarNav = ({ activeSection, setActiveSection, logout }) => (
  <div className="w-full bg-primary text-primary-foreground flex flex-col h-full">
    {/* Logo */}
    <div className="p-4 border-b border-primary-foreground/10">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium">{useAuth().user?.name}</div>
          <div className="text-xs text-primary-foreground/70">Job Applicant</div>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-4">
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeSection === 'overview' ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          onClick={() => setActiveSection('overview')}
        >
          <Briefcase className="w-4 h-4 mr-3" />
          Overview
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeSection === 'profile' ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          onClick={() => setActiveSection('profile')}
        >
          <User className="w-4 h-4 mr-3" />
          My Profile
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeSection === 'upload' ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          onClick={() => setActiveSection('upload')}
        >
          <Upload className="w-4 h-4 mr-3" />
          Upload Resume
        </Button>
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${activeSection === 'applications' ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
          onClick={() => setActiveSection('applications')}
        >
          <FileText className="w-4 h-4 mr-3" />
          My Applications
        </Button>
      </div>
    </nav>

    {/* Bottom Nav */}
    <div className="p-4 border-t border-primary-foreground/10 space-y-2">
      <Button variant="ghost" className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
        <Settings className="w-4 h-4 mr-3" />
        Settings
      </Button>
      <Button variant="ghost" className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={logout}>
        <LogOut className="w-4 h-4 mr-3" />
        Logout
      </Button>
    </div>
  </div>
);


const ApplicantDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'applications' | 'upload'>('overview');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [profile, setProfile] = useState<Profile>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    location: '',
    summary: '',
    experience: '',
    education: '',
    skills: [],
    certifications: [],
    bio: ''
  });
  
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [availableJobs] = useState([
    {
      id: '1',
      company: 'TechStart Inc.',
      position: 'React Developer',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      posted: '2 days ago'
    },
    {
      id: '2',
      company: 'Global Systems',
      position: 'Backend Engineer',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$80,000 - $100,000',
      posted: '1 week ago'
    },
    {
      id: '3',
      company: 'Creative Agency',
      position: 'UI/UX Designer',
      location: 'San Francisco, CA',
      type: 'Contract',
      salary: '$60/hour',
      posted: '3 days ago'
    }
  ]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setResumeFile(file);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Resume uploaded successfully!",
            description: "Your resume has been processed and is ready to use for applications."
          });
        }
      }, 200);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewed':
        return <Eye className="w-4 h-4" />;
      case 'shortlisted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = () => {
      if (!user?.id) return;
      
      try {
        setIsProfileLoading(true);
        const savedProfile = localStorage.getItem(`applicant_profile_${user.id}`);
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(prev => ({
            ...prev,
            ...parsedProfile,
            firstName: parsedProfile.firstName || prev.firstName,
            lastName: parsedProfile.lastName || prev.lastName,
            email: parsedProfile.email || user.email || ''
          }));
        } else {
          // Initialize with default values if no saved profile
          setProfile(prev => ({
            ...prev,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ')[1] || '',
            email: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading profile from local storage:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Load applications on component mount or when activeSection changes to 'applications'
  useEffect(() => {
    if (activeSection === 'applications' && user?.id) {
      fetchApplications();
    }
  }, [activeSection, user?.id]);

  const fetchApplications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingApplications(true);
      // Try to load from localStorage first
      const savedApplications = localStorage.getItem(`applicant_applications_${user.id}`);
      
      if (savedApplications) {
        const parsedApplications = JSON.parse(savedApplications);
        // Ensure we have an array and format the data correctly
        const formattedApplications = Array.isArray(parsedApplications) 
          ? parsedApplications.map((app: any) => ({
              ...app,
              appliedDate: app.appliedDate ? new Date(app.appliedDate) : new Date(),
              status: app.status || 'pending',
              id: app.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }))
          : [];
          
        setApplications(formattedApplications);
      } else {
        // Initialize with empty array if no saved applications
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback to empty array on error
      setApplications([]);
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive"
      });
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    
    try {
      setIsSavingProfile(true);
      // Save to local storage as a temporary solution
      localStorage.setItem(`applicant_profile_${user.id}`, JSON.stringify(profile));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default"
      });
      setIsEditingProfile(false);
      
      // In a real app, you would also save to the backend here
      // await api.put(`/api/users/${user.id}/profile`, profile);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const startEditing = () => {
    setIsEditingProfile(true);
  };

  const applyToJob = async (jobId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for jobs",
        variant: "destructive"
      });
      return;
    }

    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload your resume before applying to jobs.",
        variant: "destructive"
      });
      return;
    }

    try {
      const job = availableJobs.find(j => j.id === jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const newApplication: Application = {
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyName: job.company,
        position: job.position,
        appliedDate: new Date(),
        status: 'pending',
        matchScore: Math.floor(Math.random() * 30) + 70 // Random score 70-100
      };
      
      // Save to local storage
      const savedApplications = localStorage.getItem(`applicant_applications_${user.id}`);
      const applications = savedApplications ? JSON.parse(savedApplications) : [];
      applications.unshift(newApplication);
      localStorage.setItem(
        `applicant_applications_${user.id}`, 
        JSON.stringify(applications)
      );
      
      // Update state
      setApplications(prev => [newApplication, ...prev]);
      
      toast({
        title: "Application submitted!",
        description: `You've applied for ${job.position} at ${job.company}`,
        variant: "default"
      });
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 grid md:grid-cols-[250px_1fr]">
      {/* Sidebar - Hidden on mobile, visible on medium screens and up */}
      <div className="hidden md:block">
        <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} logout={logout} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} logout={logout} />
                </SheetContent>
              </Sheet>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." className="pl-10 w-40 md:w-64" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          {activeSection === 'overview' && (
            <>
              {/* Stats Cards - now responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{applications.length}</div>
                    <p className="text-xs text-muted-foreground">+2 from last week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {applications.filter(app => app.status === 'reviewed').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Companies reviewing</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {applications.filter(app => app.status === 'shortlisted').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Great progress!</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
                    {/* Award icon was removed from imports, so it's commented out */}
                    {/* <Award className="h-4 w-4 text-muted-foreground" /> */}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {applications.length > 0 ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Resume compatibility</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Applications & Available Jobs - now responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Track your job application status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Briefcase className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{app.position}</div>
                              <div className="text-sm text-muted-foreground">{app.companyName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(app.status)}>
                              {getStatusIcon(app.status)}
                              <span className="ml-1 capitalize">{app.status}</span>
                            </Badge>
                            {app.matchScore && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {app.matchScore}% match
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Available Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Jobs</CardTitle>
                    <CardDescription>Jobs matching your profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="p-3 border rounded-lg">
                          <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                            <div>
                              <div className="font-medium">{job.position}</div>
                              <div className="text-sm text-muted-foreground">{job.company}</div>
                            </div>
                            <Button size="sm" onClick={() => applyToJob(job.id)} className="w-full sm:w-auto">
                              Apply
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>{job.location}</span>
                            <span>{job.type}</span>
                            <span>{job.salary}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-4">
                    {isEditingProfile ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profile.firstName}
                              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                              placeholder="John"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profile.lastName}
                              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profile.phone || ''}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profile.bio || ''}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={saveProfile} 
                            disabled={isSavingProfile}
                          >
                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">First Name</p>
                            <p className="text-sm">{profile.firstName || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                            <p className="text-sm">{profile.lastName || 'Not provided'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="text-sm">{profile.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone</p>
                          <p className="text-sm">{profile.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Bio</p>
                          <p className="text-sm whitespace-pre-line">{profile.bio || 'No bio provided'}</p>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline"
                            onClick={startEditing}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Resume</CardTitle>
                  <CardDescription>Upload your resume to apply for jobs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-lg font-medium mb-2">Drop your resume here</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      or click to browse your computer
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                      ref={fileInputRef}
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                    <div className="text-xs text-muted-foreground mt-4">
                      Supports PDF, DOC, DOCX files up to 10MB
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  {resumeFile && !isUploading && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">Resume uploaded successfully!</span>
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        File: {resumeFile.name}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'applications' && (
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track the status of your job applications.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingApplications ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading applications...</p>
                    </div>
                  ) : applications.length > 0 ? (
                    applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{app.position}</p>
                          <p className="text-sm text-muted-foreground">{app.companyName}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1">{app.status}</span>
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied on {app.appliedDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">You have not submitted any applications yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ChatBot />
    </div>
  );
};

export default ApplicantDashboard;