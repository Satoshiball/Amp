import React from 'react';
import { TrendingUp, DollarSign, Users, Radio, ArrowRight, Calendar, MapPin } from 'lucide-react';

interface MediaPlan {
  id: string;
  kpi: string;
  brand: string;
  industry: string;
  geography: string[];
  budget: string;
  duration: string;
  startDate: string;
  createdAt: string;
  status: 'pending' | 'active' | 'completed';
}

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

interface DashboardProps {
  mediaPlans: MediaPlan[];
  campaigns: Campaign[];
  onConvertToCampaign: (planId: string) => void;
}

export function Dashboard({ mediaPlans, campaigns, onConvertToCampaign }: DashboardProps) {
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSpend = campaigns.reduce((sum, c) => sum + parseInt(c.spent.replace(/[$,]/g, '') || '0'), 0);
  const totalReach = campaigns.reduce((sum, c) => {
    const reach = c.reach.replace(/[K,M]/g, '');
    const multiplier = c.reach.includes('M') ? 1000000 : c.reach.includes('K') ? 1000 : 1;
    return sum + (parseFloat(reach) * multiplier);
  }, 0);

  const stats = [
    { name: 'Active Campaigns', value: activeCampaigns.toString(), icon: Radio, color: 'text-blue-600 bg-blue-100' },
    { name: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-100' },
    { name: 'Pending Plans', value: mediaPlans.length.toString(), icon: Calendar, color: 'text-purple-600 bg-purple-100' },
    { name: 'Total Reach', value: totalReach > 1000000 ? `${(totalReach/1000000).toFixed(1)}M` : totalReach > 1000 ? `${(totalReach/1000).toFixed(0)}K` : totalReach.toString(), icon: Users, color: 'text-orange-600 bg-orange-100' },
  ];

  const getKpiColor = (kpi: string) => {
    switch (kpi) {
      case 'foot-traffic': return 'bg-purple-100 text-purple-800';
      case 'web-lift': return 'bg-blue-100 text-blue-800';
      case 'search-lift': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKpiLabel = (kpi: string) => {
    switch (kpi) {
      case 'foot-traffic': return 'Foot Traffic';
      case 'web-lift': return 'Web Lift';
      case 'search-lift': return 'Search Lift';
      default: return kpi;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Monitor your audio media campaigns and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Media Plans */}
      {mediaPlans.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Media Plans</h3>
            <p className="text-sm text-gray-600">Convert these plans to active campaigns</p>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {mediaPlans.map((plan) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{plan.brand}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKpiColor(plan.kpi)}`}>
                          {getKpiLabel(plan.kpi)}
                        </span>
                        <span className="text-sm text-gray-600">{plan.industry}</span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{plan.geography.length} markets</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${plan.budget}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{plan.duration} weeks</span>
                        </div>
                        <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onConvertToCampaign(plan.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <span>Convert to Campaign</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Campaigns */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.slice(0, 5).map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${campaign.budget}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {mediaPlans.length === 0 && campaigns.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Media Plans Yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first media plan</p>
          <button
            onClick={() => window.location.hash = 'create-plan'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Media Plan
          </button>
        </div>
      )}
    </div>
  );
}