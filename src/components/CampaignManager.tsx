import React, { useState } from 'react';
import { Play, Pause, BarChart, ExternalLink, Eye } from 'lucide-react';

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

interface CampaignManagerProps {
  campaigns: Campaign[];
}

export function CampaignManager({ campaigns }: CampaignManagerProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKpiColor = (kpi: string) => {
    switch (kpi.toLowerCase()) {
      case 'foot-traffic': return 'bg-purple-100 text-purple-800';
      case 'web-lift': return 'bg-blue-100 text-blue-800';
      case 'search-lift': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKpiLabel = (kpi: string) => {
    switch (kpi.toLowerCase()) {
      case 'foot-traffic': return 'Foot Traffic';
      case 'web-lift': return 'Web Lift';
      case 'search-lift': return 'Search Lift';
      default: return kpi;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Management</h2>
        <p className="text-gray-600">Monitor and control your active media campaigns</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
          <p className="text-gray-600">Create a media plan first, then convert it to a campaign</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKpiColor(campaign.kpi)}`}>
                      {getKpiLabel(campaign.kpi)}
                    </span>
                    <span className="text-sm text-gray-600">Brand: {campaign.brand}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {campaign.status === 'active' && (
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md">
                      <Pause className="h-4 w-4" />
                    </button>
                  )}
                  {(campaign.status === 'paused' || campaign.status === 'draft') && (
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-md">
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                    <BarChart className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">${campaign.budget}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</p>
                  <p className="text-sm font-semibold text-gray-900">${campaign.spent}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reach</p>
                  <p className="text-sm font-semibold text-gray-900">{campaign.reach}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</p>
                  <p className={`text-sm font-semibold ${
                    campaign.performance.startsWith('+') ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {campaign.performance}
                  </p>
                </div>
              </div>

              {campaign.status === 'active' && campaign.spent !== '0' && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">Budget Progress</span>
                    <span className="text-xs font-medium text-gray-500">
                      {Math.round((parseInt(campaign.spent.replace(/[$,]/g, '')) / parseInt(campaign.budget.replace(/[$,]/g, ''))) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(parseInt(campaign.spent.replace(/[$,]/g, '')) / parseInt(campaign.budget.replace(/[$,]/g, ''))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}