import { NextResponse, type NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    if (!priceId) {
        return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const user = await auth.getUser(userId);
    const db = auth.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    let stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
            email: user.email,
            name: user.displayName,
            metadata: {
                firebaseUID: userId,
            },
        });
        stripeCustomerId = stripeCustomer.id;
        await userRef.update({ stripeCustomerId });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      metadata: {
        firebaseUID: userId,
      }
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Stripe error: ${errorMessage}` }, { status: 500 });
  }
}
