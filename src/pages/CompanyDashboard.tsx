import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicantList } from "@/components/ApplicantList";
import ChatBot from "@/components/ChatBot";
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Settings,
  Bell,
  LogOut,
  Building2,
  Inbox,
  Star,
  MoreHorizontal,
  Trash2,
  Archive,
  UserCheck,
  Mail,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { Link, useNavigate } from "react-router-dom";

interface Resume {
  id: string;
  applicantName: string;
  email: string;
  phone?: string;
  position: string;
  experience: string;
  skills: string[];
  education: string;
  uploadDate: Date;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  matchScore: number;
  resumeFile: string;
  summary?: string;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  applications: number;
  posted: Date;
  status: 'active' | 'closed' | 'draft';
}

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeSection, setActiveSection] = useState<'overview' | 'resumes' | 'jobs' | 'analytics' | 'applicants'>('overview');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

  const filteredResumes = resumes.filter(resume => {
    if (!resume) return false;
    const matchesSearch = resume.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || resume.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  const updateResumeStatus = (resumeId: string, newStatus: string) => {
    toast({
      title: "Status updated",
      description: `Resume status has been updated to ${newStatus}`
    });
  };

  const downloadResume = (resume: Resume) => {
    toast({
      title: "Download started",
      description: `Downloading ${resume.resumeFile}`
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-primary-foreground flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
        {/* Logo */}
        <div className="p-4 border-b border-primary-foreground/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium">{user?.companyName || 'Company'}</div>
              <div className="text-xs text-primary-foreground/70">{user?.industry || 'Technology'}</div>
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
              <BarChart3 className="w-4 h-4 mr-3" />
              Overview
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${activeSection === 'resumes' ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
              onClick={() => setActiveSection('resumes')}
            >
              <Inbox className="w-4 h-4 mr-3" />
              Received Resumes
              <Badge className="ml-auto bg-primary-foreground/20 text-primary-foreground">
                {resumes.filter(r => r.status === 'pending').length}
              </Badge>
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${activeSection === 'jobs' ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
              onClick={() => setActiveSection('jobs')}
            >
              <Users className="w-4 h-4 mr-3" />
              Job Postings
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${activeSection === 'analytics' ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'}`}
              onClick={() => setActiveSection('analytics')}
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Analytics
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => navigate('/applicants')}
            >
              <Users className="w-4 h-4 mr-3" />
              View All Applicants
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {activeSection === 'overview' ? 'Company Dashboard' :
                 activeSection === 'resumes' ? 'Received Resumes' :
                 activeSection === 'jobs' ? 'Job Postings' :
                 activeSection === 'analytics' ? 'Analytics' : 'Dashboard'}
              </h1>
              <p className="text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeSection === 'resumes' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search resumes..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6">
          {activeSection === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{resumes.length}</div>
                    <p className="text-xs text-muted-foreground">+3 from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {resumes.filter(r => r.status === 'pending').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Awaiting review</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {resumes.filter(r => r.status === 'shortlisted').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Ready for interview</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(resumes.reduce((sum, r) => sum + r.matchScore, 0) / resumes.length)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Resume compatibility</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Resumes & Job Postings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Resumes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Latest resumes received</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {resumes.slice(0, 3).map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{resume.applicantName}</div>
                              <div className="text-sm text-muted-foreground">{resume.position}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(resume.status)}>
                              {getStatusIcon(resume.status)}
                              <span className="ml-1 capitalize">{resume.status}</span>
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {resume.matchScore}% match
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Job Postings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Job Postings</CardTitle>
                    <CardDescription>Current open positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobPostings.slice(0, 3).map((job) => (
                        <div key={job.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium">{job.title}</div>
                              <div className="text-sm text-muted-foreground">{job.department}</div>
                            </div>
                            <Badge variant="outline">{job.applications} applications</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{job.location}</span>
                            <span className="capitalize">{job.type}</span>
                            <span>Posted {job.posted.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'resumes' && (
            <>
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filter Resumes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <span className="text-sm font-medium">Status:</span>
                    </div>
                    <div className="flex space-x-2">
                      {['all', 'pending', 'reviewed', 'shortlisted', 'rejected'].map((status) => (
                        <Button
                          key={status}
                          variant={filterStatus === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterStatus(status)}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resume List */}
              <Card>
                <CardHeader>
                  <CardTitle>Received Resumes ({filteredResumes.length})</CardTitle>
                  <CardDescription>Manage and review candidate applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResumes.length > 0 ? (
                      filteredResumes.map((resume) => (
                        <Card key={resume.id} className="flex flex-col">
                          <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-lg">{resume.applicantName}</div>
                              <div className="text-muted-foreground">{resume.position}</div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {resume.email}
                                </span>
                                {resume.phone && (
                                  <span className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {resume.phone}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {resume.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {resume.skills.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{resume.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right p-4 border-t">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(resume.status)}>
                                {getStatusIcon(resume.status)}
                                <span className="ml-1 capitalize">{resume.status}</span>
                              </Badge>
                              <div className="text-sm font-medium">
                                {resume.matchScore}% match
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mb-3">
                              Received {resume.uploadDate.toLocaleDateString()}
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" onClick={() => setSelectedResume(resume)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => downloadResume(resume)}>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 col-span-full">
                        <p className="text-muted-foreground">No resumes found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'jobs' && (
            <Card>
              <CardHeader>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>Manage your company's job openings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium text-lg">{job.title}</div>
                        <div className="text-muted-foreground">{job.department}</div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>{job.location}</span>
                          <span className="capitalize">{job.type}</span>
                          <span>Posted {job.posted.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {job.applications} applications
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Applications
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>This Week</span>
                      <span className="font-bold">12 applications</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>Last Week</span>
                      <span className="font-bold">8 applications</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['React', 'Python', 'Node.js', 'TypeScript', 'AWS'].map((skill, index) => (
                      <div key={skill} className="flex justify-between items-center">
                        <span>{skill}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={90 - index * 10} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">{90 - index * 10}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Resume Details Modal */}
      <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Details - {selectedResume?.applicantName}</DialogTitle>
          </DialogHeader>
          {selectedResume && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {selectedResume.applicantName}</div>
                      <div><strong>Email:</strong> {selectedResume.email}</div>
                      {selectedResume.phone && <div><strong>Phone:</strong> {selectedResume.phone}</div>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Application Info</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Position:</strong> {selectedResume.position}</div>
                      <div><strong>Experience:</strong> {selectedResume.experience}</div>
                      <div><strong>Match Score:</strong> {selectedResume.matchScore}%</div>
                      <div><strong>Applied:</strong> {selectedResume.uploadDate.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {selectedResume.summary && (
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-sm text-muted-foreground">{selectedResume.summary}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Education</h3>
                  <p className="text-sm">{selectedResume.education}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Experience Details</h3>
                  <p className="text-sm">{selectedResume.experience} of professional experience</p>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => updateResumeStatus(selectedResume.id, 'reviewed')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Mark as Reviewed
                  </Button>
                  <Button onClick={() => updateResumeStatus(selectedResume.id, 'shortlisted')}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Shortlist
                  </Button>
                  <Button variant="outline" onClick={() => downloadResume(selectedResume)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default CompanyDashboard;