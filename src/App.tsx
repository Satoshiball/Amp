import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MediaPlanCreator } from './components/MediaPlanCreator';
import { CampaignManager } from './components/CampaignManager';
import { ReportingDashboard } from './components/ReportingDashboard';

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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mediaPlans, setMediaPlans] = useState<MediaPlan[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const handleLogin = (email: string, password: string) => {
    // Demo login - accept any credentials
    setIsLoggedIn(true);
    setCurrentUser(email.split('@')[0]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setActiveTab('dashboard');
    setMediaPlans([]);
    setCampaigns([]);
  };

  const handleCreatePlan = (planData: Omit<MediaPlan, 'id' | 'createdAt' | 'status'>) => {
    // In a real app, this would call the external inventory API
    const newPlan: MediaPlan = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    setMediaPlans(prev => [...prev, newPlan]);
    
    // Mock API response simulation
    setTimeout(() => {
      alert(`Media plan created successfully for ${planData.brand}!\n\nKPI: ${planData.kpi}\nMarkets: ${planData.geography.join(', ')}\nBudget: $${planData.budget}\n\nYou can now convert this plan to an active campaign.`);
      setActiveTab('dashboard');
    }, 1000);
  };

  const handleConvertToCampaign = (planId: string) => {
    const plan = mediaPlans.find(p => p.id === planId);
    if (!plan) return;

    const endDate = new Date(plan.startDate);
    endDate.setDate(endDate.getDate() + (parseInt(plan.duration) * 7));

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: `${plan.brand} - ${plan.kpi} Campaign`,
      status: 'active',
      kpi: plan.kpi,
      brand: plan.brand,
      budget: plan.budget,
      spent: '0',
      startDate: plan.startDate,
      endDate: endDate.toISOString().split('T')[0],
      reach: '0',
      performance: 'N/A',
      createdAt: new Date().toISOString()
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setMediaPlans(prev => prev.filter(p => p.id !== planId));
    
    alert(`Campaign "${newCampaign.name}" has been created and is now active!`);
    setActiveTab('campaigns');
  };
  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard mediaPlans={mediaPlans} campaigns={campaigns} onConvertToCampaign={handleConvertToCampaign} />;
      case 'create-plan':
        return <MediaPlanCreator onCreatePlan={handleCreatePlan} />;
      case 'campaigns':
        return <CampaignManager campaigns={campaigns} />;
      case 'reporting':
        return <ReportingDashboard campaigns={campaigns} />;
      default:
        return <Dashboard mediaPlans={mediaPlans} campaigns={campaigns} onConvertToCampaign={handleConvertToCampaign} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;