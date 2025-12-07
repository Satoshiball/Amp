import { Router } from 'express';
import { db } from '../db/index.js';
import { users, reports, competitionEntries, payouts, competitions } from '@hotnotclub/shared/src/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateUser, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin access
router.use(authenticateUser);
router.use(requireAdmin);

// Get all reports
router.get('/reports', async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    const conditions = status
      ? [eq(reports.status, status as 'open' | 'reviewed' | 'resolved')]
      : [];

    const allReports = await db
      .select({
        report: reports,
        reporter: {
          id: users.id,
          username: users.username,
        },
        entry: competitionEntries,
      })
      .from(reports)
      .innerJoin(users, eq(reports.reporterUserId, users.id))
      .innerJoin(competitionEntries, eq(reports.entryId, competitionEntries.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reports.createdAt));

    res.json({
      success: true,
      data: allReports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Update report status
router.patch('/reports/:id', async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    if (!['open', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const [report] = await db
      .update(reports)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, req.params.id))
      .returning();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report'
    });
  }
});

// Remove entry
router.post('/entries/:id/remove', async (req: AuthRequest, res) => {
  try {
    const [entry] = await db
      .update(competitionEntries)
      .set({
        isRemoved: true,
        updatedAt: new Date(),
      })
      .where(eq(competitionEntries.id, req.params.id))
      .returning();

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Remove entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove entry'
    });
  }
});

// Ban user
router.post('/users/:id/ban', async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .update(users)
      .set({
        isBanned: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.params.id))
      .returning();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ban user'
    });
  }
});

// Unban user
router.post('/users/:id/unban', async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .update(users)
      .set({
        isBanned: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.params.id))
      .returning();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unban user'
    });
  }
});

// Get all payouts
router.get('/payouts', async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    const conditions = status
      ? [eq(payouts.status, status as 'pending' | 'sent' | 'failed')]
      : [];

    const allPayouts = await db
      .select({
        payout: payouts,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
        competition: {
          id: competitions.id,
          weekLabel: competitions.weekLabel,
        },
      })
      .from(payouts)
      .innerJoin(users, eq(payouts.userId, users.id))
      .innerJoin(competitions, eq(payouts.competitionId, competitions.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(payouts.createdAt));

    res.json({
      success: true,
      data: allPayouts
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payouts'
    });
  }
});

// Update payout status
router.patch('/payouts/:id', async (req: AuthRequest, res) => {
  try {
    const { status, txHash } = req.body;

    if (!['pending', 'sent', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (txHash) {
      updates.txHash = txHash;
    }

    const [payout] = await db
      .update(payouts)
      .set(updates)
      .where(eq(payouts.id, req.params.id))
      .returning();

    res.json({
      success: true,
      data: payout
    });
  } catch (error) {
    console.error('Update payout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payout'
    });
  }
});

// Get user details
router.get('/users/:id', async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.params.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

export default router;
