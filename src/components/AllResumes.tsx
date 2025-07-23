import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Star,
  MoreHorizontal,
  Trash2,
  Edit,
  Share,
  Archive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AllResumes() {
  // Placeholder for resumes fetched from backend
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterExperience, setFilterExperience] = useState("all");
  const [sortBy, setSortBy] = useState("uploadDate");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { toast } = useToast();

  // Placeholder for filtered/sorted resumes (will be replaced by backend logic)
  const filteredResumes = resumes;

  // Placeholder action handler (to be implemented with backend)
  const handleAction = (action: string, resumeId: number) => {
    toast({ title: `Action '${action}' triggered for resume ID ${resumeId}` });
  };

  // Placeholder export (to be implemented with backend data)
  const exportResumes = () => {
    toast({ title: "Export not implemented yet" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Resumes</h2>
          <p className="text-muted-foreground">
            Manage and analyze all parsed resumes ({filteredResumes.length})
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportResumes}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}>
            {viewMode === "list" ? "Grid View" : "List View"}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterExperience} onValueChange={setFilterExperience}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="junior">Junior (0-3 years)</SelectItem>
                <SelectItem value="mid">Mid-level (4-7 years)</SelectItem>
                <SelectItem value="senior">Senior (8+ years)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uploadDate">Upload Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="matchScore">Match Score</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
              setFilterExperience("all");
              setSortBy("uploadDate");
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resume List */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {filteredResumes.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No resumes found. Connect to backend to display data.</div>
        ) : (
          filteredResumes.map((resume) => (
          <Card key={resume.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{resume.name}</h3>
                    <p className="text-sm text-muted-foreground">{resume.position}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={resume.status === 'processed' ? 'default' : 'secondary'}>
                    {resume.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
                {/* ...rest of the card, as before, but will be populated from backend data... */}
              <div className="flex space-x-2 mt-4 pt-4 border-t">
                <Button size="sm" onClick={() => setSelectedResume(resume)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction("share", resume.id)}>
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction("archive", resume.id)}>
                  <Archive className="w-4 h-4 mr-1" />
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Resume Details Modal */}
      <Dialog open={!!selectedResume} onOpenChange={() => setSelectedResume(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Details - {selectedResume?.name}</DialogTitle>
          </DialogHeader>
          {/* Details tabs will be populated from backend data */}
        </DialogContent>
      </Dialog>
    </div>
  );
}