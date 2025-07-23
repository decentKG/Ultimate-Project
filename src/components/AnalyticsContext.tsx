import { createContext, useContext, useState, useEffect } from "react";

// Mock data for company-wide analytics
const mockCompanyData = {
  totalResumes: 12847,
  totalCompanies: 156,
  totalUsers: 423,
  processingAccuracy: 99.2,
  avgProcessingTime: 2.3,
  monthlyGrowth: 24.5,
  topSkills: [
    { name: "JavaScript", count: 3421, percentage: 26.6 },
    { name: "Python", count: 2987, percentage: 23.2 },
    { name: "React", count: 2654, percentage: 20.7 },
    { name: "Node.js", count: 2341, percentage: 18.2 },
    { name: "SQL", count: 2156, percentage: 16.8 },
    { name: "AWS", count: 1987, percentage: 15.5 },
    { name: "Java", count: 1876, percentage: 14.6 },
    { name: "TypeScript", count: 1654, percentage: 12.9 }
  ],
  industryBreakdown: [
    { name: "Technology", count: 4521, percentage: 35.2 },
    { name: "Finance", count: 2987, percentage: 23.3 },
    { name: "Healthcare", count: 2156, percentage: 16.8 },
    { name: "Manufacturing", count: 1654, percentage: 12.9 },
    { name: "Education", count: 987, percentage: 7.7 },
    { name: "Other", count: 542, percentage: 4.2 }
  ],
  monthlyStats: [
    { month: "Jan", resumes: 987, companies: 12 },
    { month: "Feb", resumes: 1234, companies: 15 },
    { month: "Mar", resumes: 1456, companies: 18 },
    { month: "Apr", resumes: 1678, companies: 21 },
    { month: "May", resumes: 1987, companies: 25 },
    { month: "Jun", resumes: 2341, companies: 28 },
    { month: "Jul", resumes: 2654, companies: 32 }
  ]
};

// Generate daily/weekly data for current company
const generateDailyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    resumes: Math.floor(Math.random() * 50) + 10,
    processed: Math.floor(Math.random() * 45) + 8,
    failed: Math.floor(Math.random() * 3) + 1
  }));
};

const generateWeeklyData = () => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return weeks.map(week => ({
    week,
    resumes: Math.floor(Math.random() * 200) + 100,
    processed: Math.floor(Math.random() * 190) + 95,
    failed: Math.floor(Math.random() * 10) + 2
  }));
};

const generateTopSkillsDaily = () => {
  const skills = ['React', 'Python', 'JavaScript', 'Node.js', 'SQL', 'AWS', 'Java', 'TypeScript'];
  return skills.slice(0, 5).map(skill => ({
    name: skill,
    count: Math.floor(Math.random() * 20) + 5,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    change: Math.floor(Math.random() * 15) + 1
  }));
};

export interface AnalyticsContextType {
  // Company-wide data
  companyData: typeof mockCompanyData;
  
  // Current company daily/weekly data
  dailyData: Array<{day: string, resumes: number, processed: number, failed: number}>;
  weeklyData: Array<{week: string, resumes: number, processed: number, failed: number}>;
  topSkillsDaily: Array<{name: string, count: number, trend: string, change: number}>;
  
  // Current period selection
  currentPeriod: 'daily' | 'weekly';
  setCurrentPeriod: (period: 'daily' | 'weekly') => void;
  
  // Refresh data
  refreshData: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [companyData] = useState(mockCompanyData);
  const [dailyData, setDailyData] = useState(generateDailyData);
  const [weeklyData, setWeeklyData] = useState(generateWeeklyData);
  const [topSkillsDaily, setTopSkillsDaily] = useState(generateTopSkillsDaily);
  const [currentPeriod, setCurrentPeriod] = useState<'daily' | 'weekly'>('daily');

  const refreshData = () => {
    setDailyData(generateDailyData());
    setWeeklyData(generateWeeklyData());
    setTopSkillsDaily(generateTopSkillsDaily());
  };

  // Auto-refresh data every 30 seconds for demo
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnalyticsContext.Provider value={{
      companyData,
      dailyData,
      weeklyData,
      topSkillsDaily,
      currentPeriod,
      setCurrentPeriod,
      refreshData
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}