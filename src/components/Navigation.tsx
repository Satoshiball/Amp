import React from 'react';
import { LayoutDashboard, PlusCircle, ShoppingCart, BarChart3 } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-plan', name: 'Create Plan', icon: PlusCircle },
    { id: 'campaigns', name: 'Campaigns', icon: ShoppingCart },
    { id: 'reporting', name: 'Reporting', icon: BarChart3 },
  ];

  return (
    <nav className="bg-gray-50 border-r border-gray-200 w-64 min-h-screen p-4">
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}