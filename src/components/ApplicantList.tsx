import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Mail, Phone, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  applied_at: string;
  status: 'new' | 'reviewed' | 'contacted' | 'hired' | 'rejected';
  skills: string[];
  experience: number;
  education: string;
  match_score: number;
}

export function ApplicantList() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'company') {
      fetchApplicants();
    }
  }, [user]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would fetch applicants for the specific company's job postings
      const { data, error: fetchError } = await supabase
        .from('applicants')
        .select('*')
        .eq('company_id', user?.id)
        .order('applied_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setApplicants(data || []);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to load applicants. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load applicants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: Applicant['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('applicants')
        .update({ status: newStatus })
        .eq('id', applicantId);

      if (updateError) throw updateError;

      setApplicants(prev => 
        prev.map(applicant => 
          applicant.id === applicantId 
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );

      toast({
        title: 'Status updated',
        description: `Applicant status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update applicant status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading applicants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchApplicants}>Retry</Button>
      </div>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle>Applicants</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchApplicants}>
              Refresh
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[300px]">Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No applicants found. Check back later or post a new job to attract candidates.
                  </TableCell>
                </TableRow>
              ) : (
                applicants.map((applicant) => (
                  <TableRow key={applicant.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {applicant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{applicant.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(applicant.applied_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {applicant.email}
                        </div>
                        {applicant.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {applicant.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {applicant.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {applicant.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{applicant.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {applicant.experience} {applicant.experience === 1 ? 'year' : 'years'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {applicant.education}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${applicant.match_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{applicant.match_score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={applicant.status}
                        onChange={(e) => handleStatusChange(applicant.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-md text-sm ${getStatusBadgeVariant(applicant.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => window.open(applicant.resume_url, '_blank')}
                          title="View Resume"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={`mailto:${applicant.email}`} title="Send Email">
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
