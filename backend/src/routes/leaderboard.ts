import { Router } from 'express';
import { db } from '../db/index.js';
import { competitionEntries, users, competitions } from '@hotnotclub/shared/src/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';
import { getCurrentCompetition } from '../services/competition.js';

const router = Router();

// Get current leaderboard
router.get('/current', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { gender, state, city } = req.query;

    const competition = await getCurrentCompetition();

    // Build conditions
    const conditions = [
      eq(competitionEntries.competitionId, competition.id),
      eq(competitionEntries.isRemoved, false),
    ];

    if (gender && gender !== 'all') {
      conditions.push(eq(users.gender, gender as 'male' | 'female'));
    }

    if (state) {
      conditions.push(eq(competitionEntries.stateSnapshot, state as string));
    }

    if (city) {
      conditions.push(eq(competitionEntries.citySnapshot, city as string));
    }

    // Get entries with user info
    const entries = await db
      .select({
        entry: competitionEntries,
        user: {
          username: users.username,
          firstName: users.firstName,
          gender: users.gender,
        },
      })
      .from(competitionEntries)
      .innerJoin(users, eq(competitionEntries.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(competitionEntries.finalScore))
      .limit(100);

    res.json({
      success: true,
      data: entries.map(({ entry, user }) => ({
        ...entry,
        user,
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Get leaderboard for specific competition
router.get('/:competitionId', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { gender, state, city } = req.query;
    const { competitionId } = req.params;

    // Build conditions
    const conditions = [
      eq(competitionEntries.competitionId, competitionId),
      eq(competitionEntries.isRemoved, false),
    ];

    if (gender && gender !== 'all') {
      conditions.push(eq(users.gender, gender as 'male' | 'female'));
    }

    if (state) {
      conditions.push(eq(competitionEntries.stateSnapshot, state as string));
    }

    if (city) {
      conditions.push(eq(competitionEntries.citySnapshot, city as string));
    }

    // Get entries with user info
    const entries = await db
      .select({
        entry: competitionEntries,
        user: {
          username: users.username,
          firstName: users.firstName,
          gender: users.gender,
        },
      })
      .from(competitionEntries)
      .innerJoin(users, eq(competitionEntries.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(competitionEntries.finalScore))
      .limit(100);

    res.json({
      success: true,
      data: entries.map(({ entry, user }) => ({
        ...entry,
        user,
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

export default router;
