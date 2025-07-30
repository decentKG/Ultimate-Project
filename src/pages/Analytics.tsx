import { useEffect } from 'react';
import CompanyAnalytics from "@/components/CompanyAnalytics";

export default function Analytics() {
  // Set page title
  useEffect(() => {
    document.title = 'Analytics | Hiring Platform';
  }, []);

  return (
    <CompanyAnalytics />
  );
}