import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  Database, 
  Calendar as CalendarIcon,
  Filter,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ExportJob {
  id: string;
  name: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  fileSize?: string;
  recordCount?: number;
}

export default function DataExport() {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'All Resumes - January 2025',
      format: 'CSV',
      status: 'completed',
      progress: 100,
      createdAt: new Date('2025-01-15'),
      fileSize: '2.4 MB',
      recordCount: 1247
    },
    {
      id: '2',
      name: 'Skills Analysis Report',
      format: 'JSON',
      status: 'processing',
      progress: 65,
      createdAt: new Date('2025-01-16'),
      recordCount: 856
    }
  ]);

  const [selectedFields, setSelectedFields] = useState({
    personalInfo: true,
    contactInfo: true,
    experience: true,
    education: true,
    skills: true,
    certifications: true,
    projects: false,
    references: false,
    customFields: false
  });

  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [filterCriteria, setFilterCriteria] = useState({
    status: 'all',
    experience: 'all',
    matchScore: 'all'
  });

  const { toast } = useToast();

  const handleExport = async () => {
    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `Export ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
      format: exportFormat.toUpperCase(),
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      recordCount: Math.floor(Math.random() * 1000) + 100
    };

    setExportJobs(prev => [newJob, ...prev]);

    // Simulate export process
    setTimeout(() => {
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id ? { ...job, status: 'processing' } : job
      ));
    }, 500);

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setTimeout(() => {
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress: i } : job
        ));
      }, 1000 + i * 100);
    }

    // Complete export
    setTimeout(() => {
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id ? { 
          ...job, 
          status: 'completed',
          fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`
        } : job
      ));
      
      toast({
        title: "Export completed",
        description: "Your data export is ready for download"
      });
    }, 12000);

    toast({
      title: "Export started",
      description: "Your data export has been queued for processing"
    });
  };

  const downloadFile = (job: ExportJob) => {
    // Simulate file download
    const blob = new Blob(['Sample export data'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.name}.${job.format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${job.name} is being downloaded`
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Export</h2>
          <p className="text-muted-foreground">
            Export and download your resume data in various formats
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Start New Export
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Export Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                    <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="xml">XML Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {dateRange.from ? format(dateRange.from, 'MMM dd') : 'From'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {dateRange.to ? format(dateRange.to, 'MMM dd') : 'To'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Filters</label>
                
                <Select 
                  value={filterCriteria.status} 
                  onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="processed">Processed Only</SelectItem>
                    <SelectItem value="failed">Failed Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filterCriteria.experience} 
                  onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    <SelectItem value="junior">Junior (0-3 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (4-7 years)</SelectItem>
                    <SelectItem value="senior">Senior (8+ years)</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filterCriteria.matchScore} 
                  onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, matchScore: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Match Score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="high">High (90-100%)</SelectItem>
                    <SelectItem value="medium">Medium (70-89%)</SelectItem>
                    <SelectItem value="low">Low (0-69%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Fields to Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(selectedFields).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setSelectedFields(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                    <label htmlFor={key} className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Jobs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Export History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium">{job.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {job.format}
                            </Badge>
                            <span>•</span>
                            <span>{format(job.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                            {job.recordCount && (
                              <>
                                <span>•</span>
                                <span>{job.recordCount.toLocaleString()} records</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'failed' ? 'destructive' : 'secondary'
                          }
                        >
                          {job.status}
                        </Badge>
                        {job.status === 'completed' && (
                          <Button size="sm" onClick={() => downloadFile(job)}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>

                    {job.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing...</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    {job.status === 'completed' && job.fileSize && (
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>File size: {job.fileSize}</span>
                        <span>Ready for download</span>
                      </div>
                    )}

                    {job.status === 'failed' && (
                      <div className="text-sm text-red-600">
                        Export failed. Please try again or contact support.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Templates */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Export Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Complete Resume Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Export all fields including personal info, experience, skills, and education
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-5 h-5" />
                    <span className="font-medium">Skills Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Export skills data for analysis and reporting purposes
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 mb-2">
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">High Match Candidates</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Export only candidates with match scores above 85%
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="font-medium">Recent Submissions</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Export resumes submitted in the last 30 days
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}