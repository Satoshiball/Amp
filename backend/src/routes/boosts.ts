import { Router } from 'express';
import { db } from '../db/index.js';
import { users, boostUsages, competitionEntries, competitions } from '@hotnotclub/shared/src/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Get boost balance
router.get('/balance', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({ boostBalance: users.boostBalance })
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
      data: {
        balance: user.boostBalance
      }
    });
  } catch (error) {
    console.error('Get boost balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch boost balance'
    });
  }
});

// Purchase boost pack
router.post('/purchase', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { packId } = req.body;

    const packs = {
      small: { quantity: 5, price: 499 }, // in cents
      medium: { quantity: 15, price: 999 },
      large: { quantity: 50, price: 2499 },
    };

    const pack = packs[packId as keyof typeof packs];

    if (!pack) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pack ID'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pack.quantity} Boosts`,
              description: 'HOTNOTCLUB Boost Pack',
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/boosts/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/boosts/cancel`,
      metadata: {
        userId: req.userId!,
        packId,
        quantity: pack.quantity.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      }
    });
  } catch (error) {
    console.error('Purchase boosts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// Apply boost to entry
router.post('/apply', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({
        success: false,
        error: 'Entry ID is required'
      });
    }

    // Get user's boost balance
    const [user] = await db
      .select({ boostBalance: users.boostBalance })
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.boostBalance <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient boost balance'
      });
    }

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

    // Check if user is boosting their own entry
    if (entry.userId === req.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot boost your own entry'
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
        error: 'Can only boost during voting phase'
      });
    }

    // Deduct boost from user
    await db
      .update(users)
      .set({
        boostBalance: sql`${users.boostBalance} - 1`,
      })
      .where(eq(users.id, req.userId!));

    // Add boost to entry
    await db
      .update(competitionEntries)
      .set({
        boostCount: sql`${competitionEntries.boostCount} + 1`,
        finalScore: sql`${competitionEntries.hottieVotes} - ${competitionEntries.nottieVotes} + ${competitionEntries.boostCount} + 1`,
      })
      .where(eq(competitionEntries.id, entryId));

    // Record boost usage
    const [boostUsage] = await db.insert(boostUsages).values({
      userId: req.userId!,
      competitionId: entry.competitionId,
      entryId,
    }).returning();

    res.json({
      success: true,
      data: boostUsage
    });
  } catch (error) {
    console.error('Apply boost error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply boost'
    });
  }
});

export default router;
