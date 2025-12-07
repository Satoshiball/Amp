import cron from 'node-cron';
import { db } from '../db/index.js';
import { competitions } from '@hotnotclub/shared/src/schema';
import { eq } from 'drizzle-orm';
import { endCompetition, getCurrentCompetition, getUpcomingCompetition } from '../services/competition.js';
import { getWeekBounds } from '../utils/helpers.js';

/**
 * Run every Monday at 00:00 UTC to transition competitions
 * - End the current competition (voting phase)
 * - Move upcoming competition to voting phase
 * - Create new upcoming competition for next week
 */
export function startCompetitionLifecycleJob() {
  // Run every Monday at 00:00 UTC
  cron.schedule('0 0 * * 1', async () => {
    console.log('[CRON] Starting weekly competition transition...');

    try {
      // Get current competition (should be in voting phase)
      const current = await getCurrentCompetition();

      if (current.phase === 'voting') {
        console.log(`[CRON] Ending competition: ${current.weekLabel}`);

        // End competition and determine winners
        await endCompetition(current.id);

        console.log(`[CRON] Competition ${current.weekLabel} ended successfully`);
      }

      // Get upcoming competition (should be in entry phase)
      const upcoming = await getUpcomingCompetition();

      if (upcoming.phase === 'entry') {
        console.log(`[CRON] Moving competition ${upcoming.weekLabel} to voting phase`);

        // Move to voting phase
        await db
          .update(competitions)
          .set({ phase: 'voting' })
          .where(eq(competitions.id, upcoming.id));

        console.log(`[CRON] Competition ${upcoming.weekLabel} now in voting phase`);
      }

      // Create new upcoming competition for next week
      const nextWeek = new Date();
      nextWeek.setUTCDate(nextWeek.getUTCDate() + 14); // Two weeks from now
      const { start } = getWeekBounds(nextWeek);

      console.log(`[CRON] Creating new competition for week of ${start.toISOString().split('T')[0]}`);

      await getUpcomingCompetition(); // This will create if doesn't exist

      console.log('[CRON] Weekly competition transition completed successfully');
    } catch (error) {
      console.error('[CRON] Error in competition lifecycle job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('[CRON] Competition lifecycle job scheduled (Every Monday at 00:00 UTC)');
}

/**
 * Run every hour to check and update competition jackpots
 */
export function startJackpotUpdateJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Updating competition jackpots...');

    try {
      const { updateJackpot } = await import('../services/competition.js');

      // Get current and upcoming competitions
      const current = await getCurrentCompetition();
      const upcoming = await getUpcomingCompetition();

      // Update jackpots
      await updateJackpot(current.id);
      await updateJackpot(upcoming.id);

      console.log('[CRON] Jackpots updated successfully');
    } catch (error) {
      console.error('[CRON] Error in jackpot update job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('[CRON] Jackpot update job scheduled (Every hour)');
}
