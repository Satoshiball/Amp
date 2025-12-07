import { Router } from 'express';
import { db } from '../db/index.js';
import { reports, competitionEntries } from '@hotnotclub/shared/src/schema';
import { eq } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const reportSchema = z.object({
  entryId: z.string().uuid(),
  reason: z.enum(['nudity', 'violence', 'impersonation', 'hate_speech']),
  description: z.string().optional(),
});

// Create report
router.post('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const data = reportSchema.parse(req.body);

    // Check if entry exists
    const [entry] = await db
      .select()
      .from(competitionEntries)
      .where(eq(competitionEntries.id, data.entryId))
      .limit(1);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found'
      });
    }

    // Create report
    const [report] = await db.insert(reports).values({
      reporterUserId: req.userId!,
      entryId: data.entryId,
      reason: data.reason,
      description: data.description,
      status: 'open',
    }).returning();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create report'
    });
  }
});

export default router;
