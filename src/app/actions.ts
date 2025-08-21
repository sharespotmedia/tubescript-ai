'use server';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { generateScript } from '@/ai/flows/script-generator';
import type { ScriptGeneratorInput } from '@/ai/schemas';


export async function handleGenerateScript(input: ScriptGeneratorInput) {
  try {
    const script = await generateScript(input);
    return { success: true, data: { script } };
  } catch (error) {
    console.error('Error generating script:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function createCheckoutSession(priceId: string) {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }
    
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    try {
        const res = await fetch(`${protocol}://${host}/api/stripe/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId: priceId, userId: user.uid }),
        });

        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(errorBody.error || 'Failed to create checkout session');
        }

        const { sessionId } = await res.json();
        return { success: true, data: { sessionId } };

    } catch (error) {
        console.error('Error creating checkout session:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}
