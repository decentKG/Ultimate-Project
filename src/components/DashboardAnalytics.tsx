import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAnalytics } from "./AnalyticsContext";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardAnalytics() {
  const { 
    dailyData, 
    weeklyData, 
    topSkillsDaily, 
    currentPeriod, 
    setCurrentPeriod, 
    refreshData 
  } = useAnalytics();

  const currentData = currentPeriod === 'daily' ? dailyData : weeklyData;
  const periodLabel = currentPeriod === 'daily' ? 'This Week' : 'This Month';
  const xAxisKey = currentPeriod === 'daily' ? 'day' : 'week';

  // Calculate totals for current period
  const totalResumes = currentData.reduce((sum, item) => sum + item.resumes, 0);
  const totalProcessed = currentData.reduce((sum, item) => sum + item.processed, 0);
  const totalFailed = currentData.reduce((sum, item) => sum + item.failed, 0);
  const successRate = totalResumes > 0 ? ((totalProcessed / totalResumes) * 100).toFixed(1) : 0;

  // Prepare data for pie chart
  const statusData = [
    { name: 'Processed', value: totalProcessed, color: '#10B981' },
    { name: 'Failed', value: totalFailed, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Your company's resume processing insights</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={currentPeriod === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPeriod('daily')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Daily
          </Button>
          <Button
            variant={currentPeriod === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentPeriod('weekly')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Weekly
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResumes}</div>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successfully Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalProcessed}</div>
            <p className="text-xs text-muted-foreground">{successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Processing</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">
              {totalResumes > 0 ? ((totalFailed / totalResumes) * 100).toFixed(1) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPeriod === 'daily' 
                ? Math.round(totalResumes / 7) 
                : Math.round(totalResumes / 4)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPeriod === 'daily' ? 'per day' : 'per week'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Processing Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Processing Trends - {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="resumes" fill="#3B82F6" name="Total" />
                <Bar dataKey="processed" fill="#10B981" name="Processed" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Processing Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills for Current Period */}
      <Card>
        <CardHeader>
          <CardTitle>Top Skills Trending - {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topSkillsDaily.map((skill, index) => (
              <div key={skill.name} className="text-center p-4 border rounded-lg">
                <Badge variant="outline" className="mb-2">
                  #{index + 1}
                </Badge>
                <div className="font-semibold text-lg">{skill.name}</div>
                <div className="text-2xl font-bold text-blue-600 my-2">
                  {skill.count}
                </div>
                <div className="flex items-center justify-center space-x-1 text-sm">
                  {skill.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={skill.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {skill.change}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  vs last {currentPeriod === 'daily' ? 'week' : 'month'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}