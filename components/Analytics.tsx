import React, { useState } from 'react';
import {
  useDashboardStats,
  useCompletionAnalysis,
  useAllocationAnalysis,
} from '../lib/api/hooks';
import {
  BarChart,
  TrendingUp,
  Clock,
  Users,
  Briefcase,
  Activity,
  Calendar,
  Download,
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'completion' | 'allocation'>('overview');

  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats(dateRange);
  const { data: completionAnalysis, isLoading: completionLoading } = useCompletionAnalysis();
  const { data: allocationAnalysis, isLoading: allocationLoading } = useAllocationAnalysis();

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const clearDateRange = () => {
    setDateRange({});
  };

  if (statsLoading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Insights and performance metrics</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          <input
            type="date"
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            value={dateRange.startDate || ''}
            onChange={(e) => handleDateRangeChange(e.target.value, dateRange.endDate || '')}
          />
          <span className="text-gray-600 dark:text-slate-400">to</span>
          <input
            type="date"
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            value={dateRange.endDate || ''}
            onChange={(e) => handleDateRangeChange(dateRange.startDate || '', e.target.value)}
          />
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={clearDateRange}
              className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`relative px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('completion')}
          className={`relative px-4 py-2 font-medium transition-colors ${
            activeTab === 'completion'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          Completion Time
          {activeTab === 'completion' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('allocation')}
          className={`relative px-4 py-2 font-medium transition-colors ${
            activeTab === 'allocation'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          Hour Allocation
          {activeTab === 'allocation' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardStats && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Activity className="w-6 h-6" />}
              label="Total Requests"
              value={dashboardStats.overview.totalRequests}
              color="blue"
              subtitle={`${dashboardStats.overview.activeRequests} active`}
            />
            <MetricCard
              icon={<Briefcase className="w-6 h-6" />}
              label="Total Projects"
              value={dashboardStats.overview.totalProjects}
              color="purple"
              subtitle={`${dashboardStats.overview.activeProjects} active`}
            />
            <MetricCard
              icon={<Users className="w-6 h-6" />}
              label="Total Users"
              value={dashboardStats.overview.totalUsers}
              color="green"
            />
            <MetricCard
              icon={<Clock className="w-6 h-6" />}
              label="Hours Allocated"
              value={`${dashboardStats.overview.totalHoursAllocated.toFixed(1)}h`}
              color="orange"
              subtitle={`${dashboardStats.overview.totalHoursUsed.toFixed(1)}h used`}
            />
          </div>

          {/* Average Metrics */}
          {dashboardStats.averageMetrics && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                Average Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.averageMetrics.averageCompletionTimeDays?.toFixed(1) || 'N/A'}{' '}
                    <span className="text-sm text-gray-500 dark:text-slate-500">days</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Avg. Hours per Request</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.averageMetrics.averageHoursPerRequest?.toFixed(1) || 'N/A'}{' '}
                    <span className="text-sm text-gray-500 dark:text-slate-500">hours</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Avg. Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.averageMetrics.averageResponseTime?.toFixed(1) || 'N/A'}{' '}
                    <span className="text-sm text-gray-500 dark:text-slate-500">hours</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requests by Status */}
          {dashboardStats.requestsByStatus && dashboardStats.requestsByStatus.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requests by Status</h2>
              <div className="space-y-3">
                {dashboardStats.requestsByStatus.map((item) => (
                  <div key={item.status} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-slate-300">{item.status}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-slate-300 w-16 text-right">
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requests by Priority */}
          {dashboardStats.requestsByPriority && dashboardStats.requestsByPriority.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requests by Priority</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {dashboardStats.requestsByPriority.map((item) => {
                  const colors = {
                    Critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800',
                    High: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800',
                    Medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800',
                    Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800',
                  };
                  return (
                    <div
                      key={item.priority}
                      className={`p-4 rounded-lg border ${colors[item.priority as keyof typeof colors] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-700'}`}
                    >
                      <div className="text-2xl font-bold">{item.count}</div>
                      <div className="text-sm font-medium mt-1">{item.priority}</div>
                      <div className="text-xs mt-1 opacity-80">{item.percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Project Utilization */}
          {dashboardStats.projectUtilization && dashboardStats.projectUtilization.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Project Utilization</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Code
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Total Hours
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Used Hours
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Available
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Utilization
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.projectUtilization.slice(0, 10).map((project) => (
                      <tr key={project.projectId} className="border-b border-gray-200 dark:border-slate-800">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {project.projectName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-slate-400">
                          {project.projectCode}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                          {project.totalHours.toFixed(1)}h
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                          {project.usedHours.toFixed(1)}h
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                          {project.availableHours.toFixed(1)}h
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden max-w-[100px]">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  project.utilizationPercentage > 90
                                    ? 'bg-red-500'
                                    : project.utilizationPercentage > 70
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(project.utilizationPercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 w-12">
                              {project.utilizationPercentage.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Engineer Workload */}
          {dashboardStats.engineerWorkload && dashboardStats.engineerWorkload.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Engineer Workload</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Engineer
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Active Requests
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Completed
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Hours Allocated
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Hours Logged
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Avg. Completion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.engineerWorkload.map((engineer) => (
                      <tr key={engineer.engineerId} className="border-b border-gray-200 dark:border-slate-800">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                          {engineer.engineerName}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                          {engineer.assignedRequests}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                          {engineer.completedRequests}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                          {engineer.totalHoursAllocated.toFixed(1)}h
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                          {engineer.totalHoursLogged.toFixed(1)}h
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-slate-400">
                          {engineer.averageCompletionTime
                            ? `${engineer.averageCompletionTime.toFixed(1)} days`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Vendors */}
          {dashboardStats.topVendors && dashboardStats.topVendors.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Vendors by Requests</h2>
              <div className="space-y-3">
                {dashboardStats.topVendors.slice(0, 5).map((vendor, index) => (
                  <div key={vendor.vendor} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{vendor.vendor}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-500">
                        {vendor.requestCount} requests • {vendor.totalHours.toFixed(1)}h total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Time Analysis Tab */}
      {activeTab === 'completion' && (
        <CompletionTimeTab data={completionAnalysis} isLoading={completionLoading} />
      )}

      {/* Hour Allocation Analysis Tab */}
      {activeTab === 'allocation' && (
        <AllocationAnalysisTab data={allocationAnalysis} isLoading={allocationLoading} />
      )}
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'green' | 'orange';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
      <div className={`inline-flex p-3 rounded-lg border ${colorClasses[color]} mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">{label}</div>
      {subtitle && <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );
};

// Completion Time Analysis Tab
const CompletionTimeTab: React.FC<{ data: any; isLoading: boolean }> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-slate-400">Loading completion analysis...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-12 border border-gray-200 dark:border-slate-800 text-center">
        <Clock className="w-16 h-16 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-slate-400">No completion data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Time-to-Completion Analysis by Priority
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Priority</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Requests
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Avg. Days
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Min Days
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Max Days
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Median Days
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.priority} className="border-b border-gray-200 dark:border-slate-800">
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      row.priority === 'Critical'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                        : row.priority === 'High'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800'
                          : row.priority === 'Medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800'
                    }`}
                  >
                    {row.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                  {row.totalRequests}
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                  {row.averageDays.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-slate-400">
                  {row.minDays.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-slate-400">
                  {row.maxDays.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-slate-400">
                  {row.medianDays.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Hour Allocation Analysis Tab
const AllocationAnalysisTab: React.FC<{ data: any; isLoading: boolean }> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-slate-400">Loading allocation analysis...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-12 border border-gray-200 dark:border-slate-800 text-center">
        <BarChart className="w-16 h-16 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-slate-400">No allocation data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Hour Allocation vs Actual Usage (Top 20)
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Request</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Priority</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Allocated
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Actual</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Variance
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                Usage %
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.requestId} className="border-b border-gray-200 dark:border-slate-800">
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                  {row.title}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      row.priority === 'Critical'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                        : row.priority === 'High'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800'
                          : row.priority === 'Medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800'
                    }`}
                  >
                    {row.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                  {row.allocatedHours.toFixed(1)}h
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                  {row.actualHours.toFixed(1)}h
                </td>
                <td
                  className={`py-3 px-4 text-sm text-right font-medium ${
                    row.variance > 0
                      ? 'text-red-600 dark:text-red-400'
                      : row.variance < 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {row.variance > 0 ? '+' : ''}
                  {row.variance.toFixed(1)}h
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-slate-300">
                  {row.usagePercentage.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
