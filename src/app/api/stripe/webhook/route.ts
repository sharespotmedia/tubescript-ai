import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/firebase-admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function updateUserSubscription(session: Stripe.Checkout.Session) {
  const firebaseUID = session.metadata?.firebaseUID;
  const stripeSubscriptionId = session.subscription;

  if (!firebaseUID || !stripeSubscriptionId) {
    console.error('Missing firebaseUID or subscription ID in session metadata');
    return;
  }
  
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId as string);

  try {
    const userRef = auth.firestore().collection('users').doc(firebaseUID);
    await userRef.update({
      subscriptionTier: 'paid',
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
    });
    console.log(`Updated user ${firebaseUID} to paid tier.`);
  } catch (error) {
    console.error(`Failed to update user ${firebaseUID} subscription:`, error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription;
    if (typeof subscriptionId !== 'string') {
        console.error('Subscription ID is not a string.');
        return;
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userRef = auth.firestore().collection('users').where('stripeCustomerId', '==', subscription.customer).limit(1);
    
    try {
        const userSnapshot = await userRef.get();
        if (userSnapshot.empty) {
            console.log("No user found with this customer ID");
            return;
        }
        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.update({
            stripeSubscriptionStatus: 'active'
        });

    } catch(err) {
        console.error(err);
    }

}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userRef = auth.firestore().collection('users').where('stripeCustomerId', '==', subscription.customer).limit(1);

    try {
        const userSnapshot = await userRef.get();
        if (userSnapshot.empty) {
            console.log("No user found with this customer ID");
            return;
        }
        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.update({
            subscriptionTier: 'free',
            stripeSubscriptionStatus: 'canceled'
        });

    } catch(err) {
        console.error(err);
    }
}


export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = headers().get('stripe-signature')!;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook error: ${errorMessage}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await updateUserSubscription(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
