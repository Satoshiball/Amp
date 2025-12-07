import { Router } from 'express';
import { db } from '../db/index.js';
import { competitions, competitionEntries, users, votes } from '@hotnotclub/shared/src/schema';
import { eq, and, desc, sql, ne, notInArray } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';
import { getCurrentCompetition, getUpcomingCompetition } from '../services/competition.js';
import { calculateAge } from '../utils/helpers.js';

const router = Router();

// Get current competition (voting phase)
router.get('/current', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const competition = await getCurrentCompetition();

    // Get user's entry if exists
    const [userEntry] = await db
      .select()
      .from(competitionEntries)
      .where(
        and(
          eq(competitionEntries.competitionId, competition.id),
          eq(competitionEntries.userId, req.userId!)
        )
      )
      .limit(1);

    res.json({
      success: true,
      data: {
        ...competition,
        userEntry: userEntry || null,
      }
    });
  } catch (error) {
    console.error('Get current competition error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current competition'
    });
  }
});

// Get upcoming competition (entry phase)
router.get('/upcoming', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const competition = await getUpcomingCompetition();

    // Get user's entry if exists
    const [userEntry] = await db
      .select()
      .from(competitionEntries)
      .where(
        and(
          eq(competitionEntries.competitionId, competition.id),
          eq(competitionEntries.userId, req.userId!)
        )
      )
      .limit(1);

    res.json({
      success: true,
      data: {
        ...competition,
        userEntry: userEntry || null,
      }
    });
  } catch (error) {
    console.error('Get upcoming competition error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming competition'
    });
  }
});

// Get competition by ID
router.get('/:id', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const [competition] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, req.params.id))
      .limit(1);

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: 'Competition not found'
      });
    }

    res.json({
      success: true,
      data: competition
    });
  } catch (error) {
    console.error('Get competition error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch competition'
    });
  }
});

// Get user's entry for a competition
router.get('/:id/entry', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const [entry] = await db
      .select()
      .from(competitionEntries)
      .where(
        and(
          eq(competitionEntries.competitionId, req.params.id),
          eq(competitionEntries.userId, req.userId!)
        )
      )
      .limit(1);

    res.json({
      success: true,
      data: entry || null
    });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entry'
    });
  }
});

// Submit entry for a competition
router.post('/:id/entry', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Photo URL is required'
      });
    }

    // Get competition
    const [competition] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, req.params.id))
      .limit(1);

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: 'Competition not found'
      });
    }

    // Check if competition is in entry phase
    if (competition.phase !== 'entry') {
      return res.status(400).json({
        success: false,
        error: 'Competition is not accepting entries'
      });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user already has an entry
    const [existing] = await db
      .select()
      .from(competitionEntries)
      .where(
        and(
          eq(competitionEntries.competitionId, competition.id),
          eq(competitionEntries.userId, user.id)
        )
      )
      .limit(1);

    const age = calculateAge(user.dob);

    if (existing) {
      // Update existing entry
      const [updated] = await db
        .update(competitionEntries)
        .set({
          photoUrl,
          ageAtEntry: age,
          citySnapshot: user.city,
          stateSnapshot: user.state,
          updatedAt: new Date(),
        })
        .where(eq(competitionEntries.id, existing.id))
        .returning();

      return res.json({
        success: true,
        data: updated
      });
    }

    // Create new entry
    const [entry] = await db.insert(competitionEntries).values({
      competitionId: competition.id,
      userId: user.id,
      photoUrl,
      ageAtEntry: age,
      citySnapshot: user.city,
      stateSnapshot: user.state,
    }).returning();

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Submit entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit entry'
    });
  }
});

// Get next entry for swipe deck
router.get('/:id/entries/next', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { gender, ageMin, ageMax, state, city } = req.query;

    // Get user's existing votes for this competition
    const userVotes = await db
      .select({ entryId: votes.entryId })
      .from(votes)
      .where(
        and(
          eq(votes.competitionId, req.params.id),
          eq(votes.voterUserId, req.userId!)
        )
      );

    const votedEntryIds = userVotes.map(v => v.entryId);

    // Build query conditions
    const conditions = [
      eq(competitionEntries.competitionId, req.params.id),
      eq(competitionEntries.isRemoved, false),
      ne(competitionEntries.userId, req.userId!), // Don't show user's own entry
    ];

    if (votedEntryIds.length > 0) {
      conditions.push(notInArray(competitionEntries.id, votedEntryIds));
    }

    // Get next entry with user info
    const entries = await db
      .select({
        entry: competitionEntries,
        user: users,
      })
      .from(competitionEntries)
      .innerJoin(users, eq(competitionEntries.userId, users.id))
      .where(and(...conditions))
      .orderBy(
        // Prefer entries with fewer votes
        sql`(${competitionEntries.hottieVotes} + ${competitionEntries.nottieVotes}) ASC`,
        sql`RANDOM()`
      )
      .limit(1);

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: {
          entry: null,
          hasMore: false
        }
      });
    }

    const { entry, user } = entries[0];

    res.json({
      success: true,
      data: {
        entry: {
          ...entry,
          user: {
            username: user.username,
            firstName: user.firstName,
            gender: user.gender,
          }
        },
        hasMore: true
      }
    });
  } catch (error) {
    console.error('Get next entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch next entry'
    });
  }
});

// Get competition winners
router.get('/:id/winners', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const [competition] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, req.params.id))
      .limit(1);

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: 'Competition not found'
      });
    }

    if (competition.phase !== 'ended') {
      return res.status(400).json({
        success: false,
        error: 'Competition has not ended yet'
      });
    }

    // Get winner entries
    const winnerIds = [
      competition.maleHottieWinnerId,
      competition.maleNottieWinnerId,
      competition.femaleHottieWinnerId,
      competition.femaleNottieWinnerId,
    ].filter(Boolean);

    if (winnerIds.length === 0) {
      return res.json({
        success: true,
        data: {
          maleHottie: null,
          maleNottie: null,
          femaleHottie: null,
          femaleNottie: null,
          jackpotAmount: competition.jackpotAmount,
          prizePerWinner: '0',
        }
      });
    }

    const winnerEntries = await db
      .select({
        entry: competitionEntries,
        user: users,
      })
      .from(competitionEntries)
      .innerJoin(users, eq(competitionEntries.userId, users.id))
      .where(
        and(
          eq(competitionEntries.competitionId, competition.id),
          sql`${competitionEntries.userId} = ANY(${winnerIds})`
        )
      );

    const jackpot = parseFloat(competition.jackpotAmount);
    const prizePerWinner = (jackpot / winnerIds.length).toFixed(2);

    const formatWinner = (userId: string | null) => {
      if (!userId) return null;
      const winner = winnerEntries.find(w => w.user.id === userId);
      if (!winner) return null;
      return {
        ...winner.entry,
        user: {
          username: winner.user.username,
          firstName: winner.user.firstName,
          gender: winner.user.gender,
        }
      };
    };

    res.json({
      success: true,
      data: {
        maleHottie: formatWinner(competition.maleHottieWinnerId),
        maleNottie: formatWinner(competition.maleNottieWinnerId),
        femaleHottie: formatWinner(competition.femaleHottieWinnerId),
        femaleNottie: formatWinner(competition.femaleNottieWinnerId),
        jackpotAmount: competition.jackpotAmount,
        prizePerWinner,
      }
    });
  } catch (error) {
    console.error('Get winners error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch winners'
    });
  }
});

export default router;
