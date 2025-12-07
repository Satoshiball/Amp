import { Router } from 'express';
import { db } from '../db/index.js';
import { users, referrals } from '@hotnotclub/shared/src/schema';
import { eq } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user's referral code
router.get('/code', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const referralLink = `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`;

    res.json({
      success: true,
      data: {
        code: user.referralCode,
        link: referralLink,
      }
    });
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch referral code'
    });
  }
});

// Get user's referrals
router.get('/list', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const userReferrals = await db
      .select({
        referral: referrals,
        referred: {
          username: users.username,
          firstName: users.firstName,
        },
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredUserId, users.id))
      .where(eq(referrals.referrerUserId, req.userId!));

    res.json({
      success: true,
      data: userReferrals.map(({ referral, referred }) => ({
        ...referral,
        referred,
      }))
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch referrals'
    });
  }
});

export default router;
