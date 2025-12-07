import Constants from 'expo-constants';
import { supabase } from './supabase';
import type { ApiResponse } from '@hotnotclub/shared';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  private async getAuthHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth
  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserHistory() {
    return this.request('/auth/me/history');
  }

  // Competitions
  async getCurrentCompetition() {
    return this.request('/competitions/current');
  }

  async getUpcomingCompetition() {
    return this.request('/competitions/upcoming');
  }

  async getCompetition(id: string) {
    return this.request(`/competitions/${id}`);
  }

  async submitEntry(competitionId: string, photoUrl: string) {
    return this.request(`/competitions/${competitionId}/entry`, {
      method: 'POST',
      body: JSON.stringify({ photoUrl }),
    });
  }

  async getNextEntry(competitionId: string, filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request(`/competitions/${competitionId}/entries/next?${params}`);
  }

  async getWinners(competitionId: string) {
    return this.request(`/competitions/${competitionId}/winners`);
  }

  // Voting
  async vote(entryId: string, type: 'hottie' | 'nottie') {
    return this.request(`/entries/${entryId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  // Boosts
  async getBoostBalance() {
    return this.request('/boosts/balance');
  }

  async purchaseBoosts(packId: string) {
    return this.request('/boosts/purchase', {
      method: 'POST',
      body: JSON.stringify({ packId }),
    });
  }

  async applyBoost(entryId: string) {
    return this.request('/boosts/apply', {
      method: 'POST',
      body: JSON.stringify({ entryId }),
    });
  }

  // Leaderboard
  async getCurrentLeaderboard(filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request(`/leaderboard/current?${params}`);
  }

  async getLeaderboard(competitionId: string, filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request(`/leaderboard/${competitionId}?${params}`);
  }

  // Referrals
  async getReferralCode() {
    return this.request('/referrals/code');
  }

  async getReferrals() {
    return this.request('/referrals/list');
  }

  // Reports
  async createReport(data: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async createEntryCheckout(competitionId: string, recurring: boolean) {
    return this.request('/payments/entries/checkout', {
      method: 'POST',
      body: JSON.stringify({ competitionId, recurring }),
    });
  }
}

export const api = new ApiClient();
