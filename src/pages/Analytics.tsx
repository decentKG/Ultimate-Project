import { useEffect } from 'react';
import CompanyAnalytics from "@/components/CompanyAnalytics";
import ChatBot from "@/components/ChatBot";

export default function Analytics() {
  // Set page title
  useEffect(() => {
    document.title = 'Analytics | Hiring Platform';
  }, []);

  return (
    <>
      <CompanyAnalytics />
      <ChatBot />
    </>
  );
}