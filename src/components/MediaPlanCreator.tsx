import React, { useState } from 'react';
import { Calendar, MapPin, Target, Building2, DollarSign } from 'lucide-react';

interface MediaPlan {
  kpi: string;
  brand: string;
  industry: string;
  geography: string[];
  budget: string;
  duration: string;
  startDate: string;
}

interface MediaPlanCreatorProps {
  onCreatePlan: (plan: MediaPlan) => void;
}

export function MediaPlanCreator({ onCreatePlan }: MediaPlanCreatorProps) {
  const [plan, setPlan] = useState<MediaPlan>({
    kpi: '',
    brand: '',
    industry: '',
    geography: [],
    budget: '',
    duration: '',
    startDate: ''
  });

  const kpiOptions = [
    { value: 'foot-traffic', label: 'Foot Traffic', description: 'Drive physical store visits' },
    { value: 'web-lift', label: 'Web Lift', description: 'Increase website traffic and engagement' },
    { value: 'search-lift', label: 'Search Lift', description: 'Boost brand search volume' }
  ];

  const industries = [
    'Automotive', 'Banking & Finance', 'Consumer Goods', 'Entertainment',
    'Fashion & Beauty', 'Food & Beverage', 'Healthcare', 'Insurance',
    'Real Estate', 'Retail', 'Technology', 'Travel & Hospitality'
  ];

  const dmaOptions = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Philadelphia, PA',
    'Dallas-Ft. Worth, TX', 'Washington, DC', 'Houston, TX', 'Boston, MA',
    'Atlanta, GA', 'Phoenix, AZ', 'Detroit, MI', 'Tampa-St. Pete, FL',
    'Minneapolis-St. Paul, MN', 'Miami-Ft. Lauderdale, FL', 'Denver, CO',
    'Cleveland-Akron, OH', 'Orlando-Daytona Bch, FL', 'Sacramento, CA'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plan.kpi && plan.brand && plan.industry && plan.geography.length > 0) {
      onCreatePlan(plan);
    }
  };

  const handleGeographyChange = (dma: string) => {
    setPlan(prev => ({
      ...prev,
      geography: prev.geography.includes(dma)
        ? prev.geography.filter(g => g !== dma)
        : [...prev.geography, dma]
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Media Plan</h2>
        <p className="text-gray-600">Design your data-driven audio campaign strategy</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* KPI Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Campaign Objective</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpiOptions.map((kpi) => (
              <label
                key={kpi.value}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  plan.kpi === kpi.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="kpi"
                  value={kpi.value}
                  checked={plan.kpi === kpi.value}
                  onChange={(e) => setPlan(prev => ({ ...prev, kpi: e.target.value }))}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-semibold text-gray-900 mb-1">{kpi.label}</div>
                  <div className="text-sm text-gray-600">{kpi.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Brand & Industry */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Brand Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={plan.brand}
                onChange={(e) => setPlan(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter brand name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={plan.industry}
                onChange={(e) => setPlan(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Geography Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Target Markets (DMA)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dmaOptions.map((dma) => (
              <label
                key={dma}
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={plan.geography.includes(dma)}
                  onChange={() => handleGeographyChange(dma)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{dma}</span>
              </label>
            ))}
          </div>
          {plan.geography.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Selected Markets: {plan.geography.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Campaign Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={plan.budget}
                  onChange={(e) => setPlan(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50,000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (weeks)
              </label>
              <select
                value={plan.duration}
                onChange={(e) => setPlan(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select duration</option>
                <option value="2">2 weeks</option>
                <option value="4">4 weeks</option>
                <option value="8">8 weeks</option>
                <option value="12">12 weeks</option>
                <option value="24">24 weeks</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={plan.startDate}
                onChange={(e) => setPlan(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Generate Media Plan
          </button>
        </div>
      </form>
    </div>
  );
}