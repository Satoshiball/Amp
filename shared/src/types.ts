import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type * as schema from './schema';

// User types
export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

// Competition types
export type Competition = InferSelectModel<typeof schema.competitions>;
export type NewCompetition = InferInsertModel<typeof schema.competitions>;

// Competition entry types
export type CompetitionEntry = InferSelectModel<typeof schema.competitionEntries>;
export type NewCompetitionEntry = InferInsertModel<typeof schema.competitionEntries>;

// Vote types
export type Vote = InferSelectModel<typeof schema.votes>;
export type NewVote = InferInsertModel<typeof schema.votes>;

// Boost purchase types
export type BoostPurchase = InferSelectModel<typeof schema.boostPurchases>;
export type NewBoostPurchase = InferInsertModel<typeof schema.boostPurchases>;

// Boost usage types
export type BoostUsage = InferSelectModel<typeof schema.boostUsages>;
export type NewBoostUsage = InferInsertModel<typeof schema.boostUsages>;

// Entry payment types
export type EntryPayment = InferSelectModel<typeof schema.entryPayments>;
export type NewEntryPayment = InferInsertModel<typeof schema.entryPayments>;

// Subscription types
export type Subscription = InferSelectModel<typeof schema.subscriptions>;
export type NewSubscription = InferInsertModel<typeof schema.subscriptions>;

// Referral types
export type Referral = InferSelectModel<typeof schema.referrals>;
export type NewReferral = InferInsertModel<typeof schema.referrals>;

// Report types
export type Report = InferSelectModel<typeof schema.reports>;
export type NewReport = InferInsertModel<typeof schema.reports>;

// Payout types
export type Payout = InferSelectModel<typeof schema.payouts>;
export type NewPayout = InferInsertModel<typeof schema.payouts>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  dob: string;
  gender: 'male' | 'female';
  state: string;
  city: string;
  phoneNumber?: string;
  referralCode?: string;
}

// Competition types
export interface CompetitionWithEntry extends Competition {
  userEntry?: CompetitionEntry | null;
}

export interface LeaderboardEntry extends CompetitionEntry {
  user: {
    username: string;
    firstName: string;
    gender: 'male' | 'female';
  };
}

export interface CompetitionWinners {
  maleHottie?: LeaderboardEntry;
  maleNottie?: LeaderboardEntry;
  femaleHottie?: LeaderboardEntry;
  femaleNottie?: LeaderboardEntry;
  jackpotAmount: string;
  prizePerWinner: string;
}

// Voting types
export interface VoteRequest {
  type: 'hottie' | 'nottie';
}

export interface NextEntryResponse {
  entry: LeaderboardEntry | null;
  hasMore: boolean;
}

// Boost types
export interface BoostPackage {
  id: 'small' | 'medium' | 'large';
  quantity: number;
  price: number;
  label: string;
}

export const BOOST_PACKAGES: BoostPackage[] = [
  { id: 'small', quantity: 5, price: 4.99, label: '5 Boosts' },
  { id: 'medium', quantity: 15, price: 9.99, label: '15 Boosts' },
  { id: 'large', quantity: 50, price: 24.99, label: '50 Boosts' },
];

// Entry pricing
export const ENTRY_PRICE_ONE_TIME = 1.99;
export const ENTRY_PRICE_SUBSCRIPTION = 1.50;

// Leaderboard filters
export interface LeaderboardFilters {
  gender?: 'all' | 'male' | 'female';
  state?: string;
  city?: string;
}

// User profile update
export interface UpdateProfileRequest {
  firstName?: string;
  bio?: string;
  socialInstagram?: string;
  socialTiktok?: string;
  interests?: string;
  walletAddressUsdc?: string;
  city?: string;
  state?: string;
}

// Notification preferences
export interface NotificationPreferences {
  competitionReminders: boolean;
  rankingUpdates: boolean;
  marketingPromos: boolean;
}

// Report request
export interface ReportRequest {
  entryId: string;
  reason: 'nudity' | 'violence' | 'impersonation' | 'hate_speech';
  description?: string;
}

// Analytics event
export interface AnalyticsEvent {
  name: string;
  payload?: Record<string, any>;
  timestamp?: number;
}
