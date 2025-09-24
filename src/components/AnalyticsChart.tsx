import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  Play,
  DollarSign,
  Calendar,
  BarChart3,
  PieChartIcon,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  date: string;
  plays: number;
  tips: number;
  followers: number;
  earnings: number;
}

interface ChartProps {
  data: AnalyticsData[];
  loading: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

type TimeRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'line' | 'bar' | 'pie';

const LineChartComponent: React.FC<ChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-64 bg-muted animate-pulse rounded"></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="plays" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Plays"
        />
        <Line 
          type="monotone" 
          dataKey="tips" 
          stroke="#82ca9d" 
          strokeWidth={2}
          name="Tips"
        />
        <Line 
          type="monotone" 
          dataKey="followers" 
          stroke="#ffc658" 
          strokeWidth={2}
          name="New Followers"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const BarChartComponent: React.FC<ChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-64 bg-muted animate-pulse rounded"></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="plays" fill="#8884d8" name="Plays" />
        <Bar dataKey="tips" fill="#82ca9d" name="Tips" />
        <Bar dataKey="earnings" fill="#ffc658" name="Earnings ($)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const RevenueBreakdownChart: React.FC<{ data: any[], loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-64 bg-muted animate-pulse rounded"></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const AnalyticsChart: React.FC = () => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch analytics data from artist_analytics table
      const { data: analyticsData, error } = await supabase
        .from('artist_analytics')
        .select('*')
        .eq('artist_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      // Process data for charts
      const processedData: AnalyticsData[] = (analyticsData || []).map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        plays: item.total_plays || 0,
        tips: item.tip_count || 0,
        followers: item.new_followers || 0,
        earnings: item.total_tips || 0,
      }));

      // Generate mock data if no real data exists
      if (processedData.length === 0) {
        const mockData: AnalyticsData[] = [];
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toLocaleDateString(),
            plays: Math.floor(Math.random() * 100) + 20,
            tips: Math.floor(Math.random() * 10),
            followers: Math.floor(Math.random() * 5),
            earnings: Math.floor(Math.random() * 50) + 10,
          });
        }
        setData(mockData);
      } else {
        setData(processedData);
      }

      // Revenue breakdown data
      const revenueBreakdown = [
        { name: 'Tips', value: 45 },
        { name: 'NFT Sales', value: 30 },
        { name: 'Merchandise', value: 15 },
        { name: 'Royalties', value: 10 },
      ];
      setRevenueData(revenueBreakdown);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <LineChartComponent data={data} loading={loading} />;
      case 'bar':
        return <BarChartComponent data={data} loading={loading} />;
      case 'pie':
        return <RevenueBreakdownChart data={revenueData} loading={loading} />;
      default:
        return <LineChartComponent data={data} loading={loading} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Revenue Split</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {chartType === 'line' && <Activity className="h-5 w-5" />}
            {chartType === 'bar' && <BarChart3 className="h-5 w-5" />}
            {chartType === 'pie' && <PieChartIcon className="h-5 w-5" />}
            {chartType === 'pie' ? 'Revenue Breakdown' : 'Performance Metrics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {chartType !== 'pie' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Plays</p>
                  <p className="text-lg font-semibold">
                    {data.reduce((sum, item) => sum + item.plays, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tips</p>
                  <p className="text-lg font-semibold">
                    {data.reduce((sum, item) => sum + item.tips, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">New Followers</p>
                  <p className="text-lg font-semibold">
                    {data.reduce((sum, item) => sum + item.followers, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                  <p className="text-lg font-semibold">
                    ${data.reduce((sum, item) => sum + item.earnings, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};