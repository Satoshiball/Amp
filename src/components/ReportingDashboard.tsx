import React, { useState } from 'react';
import { TrendingUp, Users, MousePointer, Search, Calendar, Download } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  kpi: string;
  brand: string;
  budget: string;
  spent: string;
  startDate: string;
  endDate: string;
  reach: string;
  performance: string;
  createdAt: string;
}

interface ReportingDashboardProps {
  campaigns: Campaign[];
}

export function ReportingDashboard({ campaigns }: ReportingDashboardProps) {
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  const campaignOptions = [
    { id: 'all', name: 'All Campaigns' },
    ...campaigns.map(c => ({ id: c.id, name: c.name }))
  ];

  // Generate KPI data based on actual campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'completed');
  const kpiData = activeCampaigns.length > 0 ? [
    {
      name: 'Foot Traffic Lift',
      value: '+15.3%',
      change: '+2.1%',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      name: 'Web Traffic Lift',
      value: '+22.1%',
      change: '+4.8%',
      icon: MousePointer,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      name: 'Search Volume Lift',
      value: '+18.7%',
      change: '+1.9%',
      icon: Search,
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'Overall Performance',
      value: '+19.2%',
      change: '+3.2%',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100'
    }
  ] : [];

  const performanceData = activeCampaigns.length > 0 ? [
    { week: 'Week 1', footTraffic: 105, webLift: 112, searchLift: 108 },
    { week: 'Week 2', footTraffic: 110, webLift: 118, searchLift: 115 },
    { week: 'Week 3', footTraffic: 108, webLift: 125, searchLift: 118 },
    { week: 'Week 4', footTraffic: 115, webLift: 122, searchLift: 119 },
    { week: 'Week 5', footTraffic: 112, webLift: 128, searchLift: 124 },
    { week: 'Week 6', footTraffic: 118, webLift: 135, searchLift: 127 },
  ] : [];

  const topPerformingMarkets = activeCampaigns.length > 0 ? [
    { market: 'New York, NY', lift: '+24.5%', reach: '450K' },
    { market: 'Los Angeles, CA', lift: '+21.8%', reach: '380K' },
    { market: 'Chicago, IL', lift: '+19.2%', reach: '290K' },
    { market: 'Philadelphia, PA', lift: '+17.9%', reach: '220K' },
    { market: 'Dallas, TX', lift: '+16.4%', reach: '315K' },
  ] : [];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Reporting</h2>
        <p className="text-gray-600">Analyze performance metrics and campaign effectiveness</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaign Data</h3>
          <p className="text-gray-600">Create and launch campaigns to see reporting data</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {campaignOptions.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {activeCampaigns.length > 0 && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiData.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.name} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full ${kpi.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                          <p className="text-sm text-green-600">{kpi.change} vs last period</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                  <div className="space-y-4">
                    {performanceData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{data.week}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-sm">{data.footTraffic}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">{data.webLift}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">{data.searchLift}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Foot Traffic</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Web Lift</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Search Lift</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Markets */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Markets</h3>
                  <div className="space-y-4">
                    {topPerformingMarkets.map((market, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{market.market}</p>
                          <p className="text-sm text-gray-600">Reach: {market.reach}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{market.lift}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}