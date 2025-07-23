import { createContext, useContext, useState, useEffect } from "react";

// Interface for company data
interface CompanyData {
  totalResumes: number;
  totalCompanies: number;
  totalUsers: number;
  processingAccuracy: number;
  avgProcessingTime: number;
  monthlyGrowth: number;
  topSkills: Array<{ name: string; count: number; percentage: number }>;
  industryBreakdown: Array<{ name: string; count: number; percentage: number }>;
  monthlyStats: Array<{ month: string; resumes: number; companies: number }>;
}

// Interface for daily data
interface DailyData {
  day: string;
  resumes: number;
  processed: number;
  failed: number;
}

// Interface for weekly data
interface WeeklyData {
  week: string;
  resumes: number;
  processed: number;
  failed: number;
}

// Interface for top skills
interface TopSkill {
  name: string;
  count: number;
  trend: 'up' | 'down';
  change: number;
}

export interface AnalyticsContextType {
  // Company-wide data
  companyData: CompanyData | null;
  
  // Current company daily/weekly data
  dailyData: DailyData[];
  weeklyData: WeeklyData[];
  topSkillsDaily: TopSkill[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
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
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [topSkillsDaily, setTopSkillsDaily] = useState<TopSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<'daily' | 'weekly'>('daily');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API calls
      // const response = await fetch('/api/analytics/company');
      // const data = await response.json();
      // setCompanyData(data);
      // 
      // const dailyResponse = await fetch('/api/analytics/daily');
      // const daily = await dailyResponse.json();
      // setDailyData(daily);
      // 
      // const weeklyResponse = await fetch('/api/analytics/weekly');
      // const weekly = await weeklyResponse.json();
      // setWeeklyData(weekly);
      // 
      // const skillsResponse = await fetch('/api/analytics/skills');
      // const skills = await skillsResponse.json();
      // setTopSkillsDaily(skills);
      
      // For now, set empty data
      setCompanyData(null);
      setDailyData([]);
      setWeeklyData([]);
      setTopSkillsDaily([]);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalyticsData();
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

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
      loading,
      error,
      currentPeriod,
      setCurrentPeriod,
      refreshData
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}