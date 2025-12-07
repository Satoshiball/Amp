import { Router } from 'express';
import { db } from '../db/index.js';
import { users, entryPayments, boostPurchases, subscriptions, referrals, competitions } from '@hotnotclub/shared/src/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticateUser, type AuthRequest } from '../middleware/auth.js';
import { updateJackpot } from '../services/competition.js';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Create checkout session for entry payment
router.post('/entries/checkout', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { competitionId, recurring } = req.body;

    if (!competitionId) {
      return res.status(400).json({
        success: false,
        error: 'Competition ID is required'
      });
    }

    const price = recurring
      ? parseFloat(process.env.ENTRY_PRICE_SUBSCRIPTION || '1.50')
      : parseFloat(process.env.ENTRY_PRICE_ONE_TIME || '1.99');

    const priceInCents = Math.round(price * 100);

    if (recurring) {
      // Create subscription
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Weekly Competition Entry Subscription',
                description: 'Auto-entry into weekly competitions',
              },
              unit_amount: priceInCents,
              recurring: {
                interval: 'week',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/entry/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/entry/cancel`,
        metadata: {
          userId: req.userId!,
          competitionId,
          recurring: 'true',
        },
      });

      return res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        }
      });
    } else {
      // One-time payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Competition Entry',
                description: 'One-time entry into weekly competition',
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/entry/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/entry/cancel`,
        metadata: {
          userId: req.userId!,
          competitionId,
          recurring: 'false',
        },
      });

      return res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        }
      });
    }
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// Stripe webhook handler
router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, competitionId, recurring, packId, quantity } = session.metadata || {};

        if (packId && quantity) {
          // Boost purchase
          const amountPaid = (session.amount_total || 0) / 100;

          await db.insert(boostPurchases).values({
            userId: userId!,
            stripePaymentId: session.payment_intent as string,
            quantity: parseInt(quantity),
            amountPaid: amountPaid.toString(),
          });

          // Add boosts to user balance
          await db
            .update(users)
            .set({
              boostBalance: sql`${users.boostBalance} + ${parseInt(quantity)}`,
            })
            .where(eq(users.id, userId!));

        } else if (competitionId) {
          // Entry payment
          const amountPaid = (session.amount_total || 0) / 100;
          const isRecurring = recurring === 'true';

          // Record payment
          await db.insert(entryPayments).values({
            userId: userId!,
            competitionId: competitionId!,
            stripePaymentId: session.payment_intent as string || session.subscription as string,
            amountPaid: amountPaid.toString(),
            isRecurring,
            status: 'paid',
          });

          // Update competition revenue and jackpot
          await db
            .update(competitions)
            .set({
              totalEntryRevenue: sql`${competitions.totalEntryRevenue} + ${amountPaid}`,
            })
            .where(eq(competitions.id, competitionId!));

          await updateJackpot(competitionId!);

          // If subscription, create subscription record
          if (isRecurring && session.subscription) {
            await db.insert(subscriptions).values({
              userId: userId!,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
            });
          }

          // Check if this is user's first payment (for referral reward)
          const [firstPayment] = await db
            .select()
            .from(entryPayments)
            .where(
              and(
                eq(entryPayments.userId, userId!),
                eq(entryPayments.status, 'paid')
              )
            )
            .limit(2);

          if (!firstPayment) {
            // This is the first payment, check for referral
            const [referral] = await db
              .select()
              .from(referrals)
              .where(
                and(
                  eq(referrals.referredUserId, userId!),
                  eq(referrals.rewardGranted, false)
                )
              )
              .limit(1);

            if (referral) {
              // Grant 1 boost to referrer
              await db
                .update(users)
                .set({
                  boostBalance: sql`${users.boostBalance} + 1`,
                })
                .where(eq(users.id, referral.referrerUserId));

              // Mark reward as granted
              await db
                .update(referrals)
                .set({ rewardGranted: true })
                .where(eq(referrals.id, referral.id));
            }
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get subscription
        const [subscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
          .limit(1);

        if (!subscription) break;

        // This is a recurring payment - auto-entry for next competition
        // Implementation depends on how you want to handle auto-entries
        // For now, we'll just mark it as paid
        console.log('Recurring payment succeeded for user:', subscription.userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await db
          .update(subscriptions)
          .set({
            status: 'canceled',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
