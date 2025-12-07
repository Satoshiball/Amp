import { pgTable, uuid, varchar, text, timestamp, boolean, integer, numeric, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female']);
export const voteTypeEnum = pgEnum('vote_type', ['hottie', 'nottie']);
export const competitionPhaseEnum = pgEnum('competition_phase', ['entry', 'voting', 'ended']);
export const reportReasonEnum = pgEnum('report_reason', ['nudity', 'violence', 'impersonation', 'hate_speech']);
export const reportStatusEnum = pgEnum('report_status', ['open', 'reviewed', 'resolved']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'incomplete']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'sent', 'failed']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  dob: timestamp('dob').notNull(),
  gender: genderEnum('gender').notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  bio: text('bio'),
  socialInstagram: varchar('social_instagram', { length: 100 }),
  socialTiktok: varchar('social_tiktok', { length: 100 }),
  interests: text('interests'),
  walletAddressUsdc: varchar('wallet_address_usdc', { length: 255 }),
  boostBalance: integer('boost_balance').notNull().default(0),
  deviceId: varchar('device_id', { length: 255 }),
  isBanned: boolean('is_banned').notNull().default(false),
  isAdmin: boolean('is_admin').notNull().default(false),
  referralCode: varchar('referral_code', { length: 20 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Competitions table
export const competitions = pgTable('competitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekLabel: varchar('week_label', { length: 20 }).notNull().unique(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  entryStartDate: timestamp('entry_start_date').notNull(),
  entryEndDate: timestamp('entry_end_date').notNull(),
  phase: competitionPhaseEnum('phase').notNull().default('entry'),
  jackpotAmount: numeric('jackpot_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  totalEntryRevenue: numeric('total_entry_revenue', { precision: 10, scale: 2 }).notNull().default('0'),
  totalBoostRevenueAllocated: numeric('total_boost_revenue_allocated', { precision: 10, scale: 2 }).notNull().default('0'),
  maleHottieWinnerId: uuid('male_hottie_winner_id').references(() => users.id),
  maleNottieWinnerId: uuid('male_nottie_winner_id').references(() => users.id),
  femaleHottieWinnerId: uuid('female_hottie_winner_id').references(() => users.id),
  femaleNottieWinnerId: uuid('female_nottie_winner_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Competition entries table
export const competitionEntries = pgTable('competition_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  competitionId: uuid('competition_id').notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  photoUrl: varchar('photo_url', { length: 500 }).notNull(),
  ageAtEntry: integer('age_at_entry').notNull(),
  hottieVotes: integer('hottie_votes').notNull().default(0),
  nottieVotes: integer('nottie_votes').notNull().default(0),
  boostCount: integer('boost_count').notNull().default(0),
  finalScore: integer('final_score').notNull().default(0),
  citySnapshot: varchar('city_snapshot', { length: 100 }).notNull(),
  stateSnapshot: varchar('state_snapshot', { length: 50 }).notNull(),
  isRemoved: boolean('is_removed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserCompetition: unique().on(table.competitionId, table.userId)
}));

// Votes table
export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  competitionId: uuid('competition_id').notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  entryId: uuid('entry_id').notNull().references(() => competitionEntries.id, { onDelete: 'cascade' }),
  voterUserId: uuid('voter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  voteType: voteTypeEnum('vote_type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueVote: unique().on(table.competitionId, table.entryId, table.voterUserId)
}));

// Boost purchases table
export const boostPurchases = pgTable('boost_purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Boost usages table
export const boostUsages = pgTable('boost_usages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitionId: uuid('competition_id').notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  entryId: uuid('entry_id').notNull().references(() => competitionEntries.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Entry payments table
export const entryPayments = pgTable('entry_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitionId: uuid('competition_id').notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull(),
  isRecurring: boolean('is_recurring').notNull().default(false),
  status: paymentStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  lastPhotoUrl: varchar('last_photo_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Referrals table
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerUserId: uuid('referrer_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: uuid('referred_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rewardGranted: boolean('reward_granted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Reports table
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterUserId: uuid('reporter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  entryId: uuid('entry_id').notNull().references(() => competitionEntries.id, { onDelete: 'cascade' }),
  reason: reportReasonEnum('reason').notNull(),
  description: text('description'),
  status: reportStatusEnum('status').notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Payouts table
export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitionId: uuid('competition_id').notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  status: payoutStatusEnum('status').notNull().default('pending'),
  txHash: varchar('tx_hash', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  entries: many(competitionEntries),
  votes: many(votes),
  boostPurchases: many(boostPurchases),
  boostUsages: many(boostUsages),
  entryPayments: many(entryPayments),
  subscriptions: many(subscriptions),
  referralsMade: many(referrals, { relationName: 'referrer' }),
  referralsReceived: many(referrals, { relationName: 'referred' }),
  reports: many(reports),
  payouts: many(payouts),
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
  entries: many(competitionEntries),
  votes: many(votes),
  boostUsages: many(boostUsages),
  entryPayments: many(entryPayments),
  payouts: many(payouts),
}));

export const competitionEntriesRelations = relations(competitionEntries, ({ one, many }) => ({
  competition: one(competitions, {
    fields: [competitionEntries.competitionId],
    references: [competitions.id],
  }),
  user: one(users, {
    fields: [competitionEntries.userId],
    references: [users.id],
  }),
  votes: many(votes),
  boostUsages: many(boostUsages),
  reports: many(reports),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  competition: one(competitions, {
    fields: [votes.competitionId],
    references: [competitions.id],
  }),
  entry: one(competitionEntries, {
    fields: [votes.entryId],
    references: [competitionEntries.id],
  }),
  voter: one(users, {
    fields: [votes.voterUserId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerUserId],
    references: [users.id],
    relationName: 'referrer',
  }),
  referred: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: 'referred',
  }),
}));
