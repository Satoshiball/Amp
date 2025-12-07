import { db } from '../db/index.js';
import { competitions, competitionEntries, users, payouts } from '@hotnotclub/shared/src/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { getWeekBounds, getWeekLabel, calculateJackpot, calculatePrizePerWinner } from '../utils/helpers.js';

/**
 * Create a new competition for a given week
 */
export async function createCompetition(weekStart: Date) {
  const { start, end } = getWeekBounds(weekStart);
  const weekLabel = getWeekLabel(weekStart);

  // Entry window is the previous week (while current competition is in voting)
  const entryStart = new Date(start);
  entryStart.setUTCDate(entryStart.getUTCDate() - 7);

  const entryEnd = new Date(start);
  entryEnd.setUTCSeconds(entryEnd.getUTCSeconds() - 1);

  const [competition] = await db.insert(competitions).values({
    weekLabel,
    startDate: start,
    endDate: end,
    entryStartDate: entryStart,
    entryEndDate: entryEnd,
    phase: 'entry',
    jackpotAmount: '0',
    totalEntryRevenue: '0',
    totalBoostRevenueAllocated: '0',
  }).returning();

  return competition;
}

/**
 * Get or create the current competition (voting phase)
 */
export async function getCurrentCompetition() {
  const now = new Date();
  const { start } = getWeekBounds(now);

  // Current competition should be in voting phase
  const [competition] = await db
    .select()
    .from(competitions)
    .where(
      and(
        eq(competitions.weekLabel, getWeekLabel(start)),
        eq(competitions.phase, 'voting')
      )
    )
    .limit(1);

  if (competition) {
    return competition;
  }

  // If not found, create and set to voting
  const newComp = await createCompetition(start);
  const [updated] = await db
    .update(competitions)
    .set({ phase: 'voting' })
    .where(eq(competitions.id, newComp.id))
    .returning();

  return updated;
}

/**
 * Get or create the upcoming competition (entry phase)
 */
export async function getUpcomingCompetition() {
  const now = new Date();
  const nextWeekStart = new Date(now);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);

  const { start } = getWeekBounds(nextWeekStart);
  const weekLabel = getWeekLabel(start);

  const [competition] = await db
    .select()
    .from(competitions)
    .where(
      and(
        eq(competitions.weekLabel, weekLabel),
        eq(competitions.phase, 'entry')
      )
    )
    .limit(1);

  if (competition) {
    return competition;
  }

  // Create new competition for next week
  return await createCompetition(start);
}

/**
 * Calculate final scores for all entries in a competition
 */
export async function calculateFinalScores(competitionId: string) {
  await db.execute(sql`
    UPDATE ${competitionEntries}
    SET final_score = hottie_votes - nottie_votes + boost_count
    WHERE competition_id = ${competitionId}
  `);
}

/**
 * Determine winners for a competition
 */
export async function determineWinners(competitionId: string) {
  // Calculate final scores first
  await calculateFinalScores(competitionId);

  // Get male entries
  const maleEntries = await db
    .select()
    .from(competitionEntries)
    .innerJoin(users, eq(competitionEntries.userId, users.id))
    .where(
      and(
        eq(competitionEntries.competitionId, competitionId),
        eq(users.gender, 'male'),
        eq(competitionEntries.isRemoved, false)
      )
    );

  // Get female entries
  const femaleEntries = await db
    .select()
    .from(competitionEntries)
    .innerJoin(users, eq(competitionEntries.userId, users.id))
    .where(
      and(
        eq(competitionEntries.competitionId, competitionId),
        eq(users.gender, 'female'),
        eq(competitionEntries.isRemoved, false)
      )
    );

  // Determine male winners
  const maleHottie = maleEntries.reduce((max, entry) =>
    entry.competition_entries.finalScore > (max?.competition_entries.finalScore || -Infinity)
      ? entry
      : max
  , maleEntries[0]);

  const maleNottie = maleEntries.reduce((min, entry) =>
    entry.competition_entries.finalScore < (min?.competition_entries.finalScore || Infinity)
      ? entry
      : min
  , maleEntries[0]);

  // Determine female winners
  const femaleHottie = femaleEntries.reduce((max, entry) =>
    entry.competition_entries.finalScore > (max?.competition_entries.finalScore || -Infinity)
      ? entry
      : max
  , femaleEntries[0]);

  const femaleNottie = femaleEntries.reduce((min, entry) =>
    entry.competition_entries.finalScore < (min?.competition_entries.finalScore || Infinity)
      ? entry
      : min
  , femaleEntries[0]);

  // Update competition with winners
  await db
    .update(competitions)
    .set({
      maleHottieWinnerId: maleHottie?.users.id,
      maleNottieWinnerId: maleNottie?.users.id,
      femaleHottieWinnerId: femaleHottie?.users.id,
      femaleNottieWinnerId: femaleNottie?.users.id,
      phase: 'ended',
    })
    .where(eq(competitions.id, competitionId));

  return {
    maleHottie,
    maleNottie,
    femaleHottie,
    femaleNottie,
  };
}

/**
 * Create payout records for winners
 */
export async function createPayouts(competitionId: string) {
  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId))
    .limit(1);

  if (!competition) {
    throw new Error('Competition not found');
  }

  const jackpot = parseFloat(competition.jackpotAmount);
  const winnerIds = [
    competition.maleHottieWinnerId,
    competition.maleNottieWinnerId,
    competition.femaleHottieWinnerId,
    competition.femaleNottieWinnerId,
  ].filter(Boolean) as string[];

  if (winnerIds.length === 0) {
    return [];
  }

  const prizePerWinner = calculatePrizePerWinner(jackpot, winnerIds.length);

  // Get winner wallet addresses
  const winners = await db
    .select()
    .from(users)
    .where(sql`${users.id} = ANY(${winnerIds})`);

  const payoutRecords = [];

  for (const winner of winners) {
    if (!winner.walletAddressUsdc) {
      console.warn(`Winner ${winner.id} has no wallet address`);
      continue;
    }

    const [payout] = await db.insert(payouts).values({
      userId: winner.id,
      competitionId,
      amount: prizePerWinner.toString(),
      walletAddress: winner.walletAddressUsdc,
      status: 'pending',
    }).returning();

    payoutRecords.push(payout);
  }

  return payoutRecords;
}

/**
 * End current competition and transition to next week
 */
export async function endCompetition(competitionId: string) {
  // Determine winners
  const winners = await determineWinners(competitionId);

  // Create payouts
  await createPayouts(competitionId);

  return winners;
}

/**
 * Update competition jackpot based on entry and boost revenue
 */
export async function updateJackpot(competitionId: string) {
  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId))
    .limit(1);

  if (!competition) {
    throw new Error('Competition not found');
  }

  const totalRevenue =
    parseFloat(competition.totalEntryRevenue) +
    parseFloat(competition.totalBoostRevenueAllocated);

  const jackpot = calculateJackpot(totalRevenue);

  await db
    .update(competitions)
    .set({ jackpotAmount: jackpot.toString() })
    .where(eq(competitions.id, competitionId));

  return jackpot;
}
