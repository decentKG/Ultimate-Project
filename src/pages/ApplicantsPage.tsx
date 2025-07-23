import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicantList } from '@/components/ApplicantList';
import { ArrowLeft } from 'lucide-react';

export default function ApplicantsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated or not a company user
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.role !== 'company') {
      navigate('/');
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Applicant Management</CardTitle>
            <CardDescription>
              View and manage all applicants for your job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicantList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
