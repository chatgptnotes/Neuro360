import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react';
import DatabaseService from '../../services/databaseService';

const AnalyticsDashboard = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState('30'); // days
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateChartData();
  }, [timeRange, analytics]);

  const generateChartData = () => {
    setLoading(true);
    try {
      // Mock chart data generation
      const days = parseInt(timeRange);
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0];
      });

      // Generate mock data for charts
      const reportsData = dates.map((date, index) => ({
        date,
        reports: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 1000) + 100
      }));

      const clinicUsage = [
        { name: 'Active Clinics', value: analytics.activeClinics || 0, color: '#3B82F6' },
        { name: 'Trial Clinics', value: Math.floor((analytics.activeClinics || 0) * 0.6), color: '#F59E0B' },
        { name: 'Inactive Clinics', value: Math.floor((analytics.activeClinics || 0) * 0.2), color: '#EF4444' }
      ];

      setChartData({
        reportsOverTime: reportsData,
        revenueOverTime: reportsData,
        clinicDistribution: clinicUsage
      });
    } catch (error) {
      console.error('Error generating chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Mock export functionality
    const exportData = {
      timestamp: new Date().toISOString(),
      analytics: analytics,
      chartData: chartData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neuro360-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into platform usage and revenue</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={exportData}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.monthlyRevenue || 0}`}
          change="+12%"
          changeType="positive"
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Active Clinics"
          value={analytics.activeClinics || 0}
          change="+5%"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Reports Generated"
          value={analytics.totalReports || 0}
          change="+23%"
          changeType="positive"
          icon={FileText}
          color="purple"
        />
        <MetricCard
          title="Avg. Reports/Clinic"
          value={analytics.activeClinics ? Math.round((analytics.totalReports || 0) / analytics.activeClinics) : 0}
          change="+8%"
          changeType="positive"
          icon={Activity}
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reports Generated</h3>
              <p className="text-sm text-gray-600">Daily report creation over time</p>
            </div>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            ) : (
              <SimpleBarChart data={chartData.reportsOverTime} dataKey="reports" />
            )}
          </div>
        </div>

        {/* Revenue Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-600">Daily revenue over time</p>
            </div>
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            ) : (
              <SimpleLineChart data={chartData.revenueOverTime} dataKey="revenue" />
            )}
          </div>
        </div>
      </div>

      {/* Clinic Distribution and Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clinic Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Clinic Status</h3>
              <p className="text-sm text-gray-600">Distribution by status</p>
            </div>
            <PieChart className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {chartData.clinicDistribution?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Clinics */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Clinics</h3>
              <p className="text-sm text-gray-600">Clinics by report usage</p>
            </div>
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {DatabaseService.get('clinics')
              .sort((a, b) => (b.reportsUsed || 0) - (a.reportsUsed || 0))
              .slice(0, 5)
              .map((clinic, index) => (
                <div key={clinic.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                      <div className="text-sm text-gray-500">{clinic.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {clinic.reportsUsed || 0} reports
                    </div>
                    <div className="text-sm text-gray-500">
                      {((clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10) * 100).toFixed(0)}% used
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
            <p className="text-sm text-gray-600">Detailed breakdown of platform usage</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Subscription Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Subscriptions</span>
                <span className="font-medium">
                  {DatabaseService.get('clinics').filter(c => c.subscriptionStatus === 'active').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trial Users</span>
                <span className="font-medium">
                  {DatabaseService.get('clinics').filter(c => c.subscriptionStatus === 'trial').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expired Trials</span>
                <span className="font-medium">
                  {DatabaseService.get('clinics').filter(c => c.subscriptionStatus === 'expired').length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Report Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Reports</span>
                <span className="font-medium">{analytics.totalReports || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Month</span>
                <span className="font-medium">
                  {DatabaseService.get('reports').filter(r => {
                    const reportDate = new Date(r.createdAt);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() && 
                           reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Week</span>
                <span className="font-medium">
                  {DatabaseService.get('reports').filter(r => {
                    const reportDate = new Date(r.createdAt);
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return reportDate >= weekAgo;
                  }).length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Financial Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-medium">${analytics.monthlyRevenue || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Revenue/Clinic</span>
                <span className="font-medium">
                  ${analytics.activeClinics ? Math.round((analytics.monthlyRevenue || 0) / analytics.activeClinics) : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Revenue Growth</span>
                <span className="font-medium text-green-600">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component (Mock)
const SimpleBarChart = ({ data, dataKey }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d[dataKey]));

  return (
    <div className="flex items-end space-x-2 h-full w-full p-4">
      {data.slice(-10).map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="bg-primary-500 rounded-t w-full min-h-[4px]"
            style={{
              height: `${(item[dataKey] / maxValue) * 200}px`
            }}
          ></div>
          <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
            {item.date.slice(-5)}
          </span>
        </div>
      ))}
    </div>
  );
};

// Simple Line Chart Component (Mock)
const SimpleLineChart = ({ data, dataKey }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500">No data available</div>;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <TrendingUp className="h-12 w-12 text-primary-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Revenue trending upward</p>
        <p className="text-lg font-semibold text-green-600">+12% this month</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;