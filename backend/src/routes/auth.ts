import { Router } from 'express';
import { db } from '../db/index.js';
import { users, referrals } from '@hotnotclub/shared/src/schema';
import { eq } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';
import { generateReferralCode, isAdult } from '../utils/helpers.js';
import { z } from 'zod';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(50),
  firstName: z.string().min(1).max(100),
  dob: z.string(),
  gender: z.enum(['male', 'female']),
  state: z.string(),
  city: z.string(),
  phoneNumber: z.string().optional(),
  referralCode: z.string().optional(),
});

// Get current user profile
router.get('/me', authenticateUser, async (req: AuthRequest, res) => {
  try {
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

// Update user profile
router.put('/me', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const allowedUpdates = [
      'firstName',
      'bio',
      'socialInstagram',
      'socialTiktok',
      'interests',
      'walletAddressUsdc',
      'city',
      'state',
    ];

    const updates: any = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid updates provided'
      });
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, req.userId!))
      .returning();

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Create user after Supabase signup
router.post('/register', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const data = signupSchema.parse(req.body);

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'User already registered'
      });
    }

    // Validate age
    const dob = new Date(data.dob);
    if (!isAdult(dob)) {
      return res.status(400).json({
        success: false,
        error: 'Must be 18 or older'
      });
    }

    // Generate referral code
    const referralCode = generateReferralCode(data.username);

    // Create user
    const [user] = await db.insert(users).values({
      id: req.userId!,
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      dob,
      gender: data.gender,
      state: data.state,
      city: data.city,
      phoneNumber: data.phoneNumber,
      referralCode,
    }).returning();

    // Handle referral if provided
    if (data.referralCode) {
      const [referrer] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, data.referralCode))
        .limit(1);

      if (referrer) {
        await db.insert(referrals).values({
          referrerUserId: referrer.id,
          referredUserId: user.id,
          rewardGranted: false,
        });
      }
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});

// Get user history
router.get('/me/history', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { competitionEntries } = await import('@hotnotclub/shared/src/schema');

    const entries = await db
      .select()
      .from(competitionEntries)
      .where(eq(competitionEntries.userId, req.userId!))
      .orderBy(desc(competitionEntries.createdAt));

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});

export default router;
