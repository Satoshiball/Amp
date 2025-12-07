import { Router } from 'express';
import { db } from '../db/index.js';
import { votes, competitionEntries, competitions } from '@hotnotclub/shared/src/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const voteSchema = z.object({
  type: z.enum(['hottie', 'nottie']),
});

// Vote on an entry
router.post('/:entryId/vote', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const data = voteSchema.parse(req.body);
    const entryId = req.params.entryId;

    // Get entry
    const [entry] = await db
      .select()
      .from(competitionEntries)
      .where(eq(competitionEntries.id, entryId))
      .limit(1);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    // Check if user is voting on their own entry
    if (entry.userId === req.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot vote on your own entry'
      });
    }

    // Get competition
    const [competition] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, entry.competitionId))
      .limit(1);

    if (!competition) {
      return res.status(404).json({
        success: false,
        error: 'Competition not found'
      });
    }

    // Check if competition is in voting phase
    if (competition.phase !== 'voting') {
      return res.status(400).json({
        success: false,
        error: 'Competition is not in voting phase'
      });
    }

    // Check if user already voted
    const [existing] = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.competitionId, entry.competitionId),
          eq(votes.entryId, entryId),
          eq(votes.voterUserId, req.userId!)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Already voted on this entry'
      });
    }

    // Create vote
    const [vote] = await db.insert(votes).values({
      competitionId: entry.competitionId,
      entryId,
      voterUserId: req.userId!,
      voteType: data.type,
    }).returning();

    // Update entry vote counts
    if (data.type === 'hottie') {
      await db
        .update(competitionEntries)
        .set({
          hottieVotes: sql`${competitionEntries.hottieVotes} + 1`,
          finalScore: sql`${competitionEntries.hottieVotes} + 1 - ${competitionEntries.nottieVotes} + ${competitionEntries.boostCount}`,
        })
        .where(eq(competitionEntries.id, entryId));
    } else {
      await db
        .update(competitionEntries)
        .set({
          nottieVotes: sql`${competitionEntries.nottieVotes} + 1`,
          finalScore: sql`${competitionEntries.hottieVotes} - (${competitionEntries.nottieVotes} + 1) + ${competitionEntries.boostCount}`,
        })
        .where(eq(competitionEntries.id, entryId));
    }

    res.json({
      success: true,
      data: vote
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record vote'
    });
  }
});

export default router;
