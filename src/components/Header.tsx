import React from 'react';
import { Radio, BarChart3, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: string;
  onLogout: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Radio className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AMP</h1>
          </div>
          <span className="text-gray-500">Audio Media Planning</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, {currentUser}</span>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Settings className="h-5 w-5" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}