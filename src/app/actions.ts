'use server';

import {
  generateVideoScript,
  type GenerateVideoScriptInput,
} from '@/ai/flows/generate-video-script';
import { analyzeContentCreatorStyle } from '@/ai/flows/analyze-content-creator-style';
import { doc, getDoc, setDoc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { headers } from 'next/headers';

export async function handleGenerateScript(input: {
  topic: string;
  contentType: 'Vlog' | 'Tutorial' | 'Commentary' | 'Review';
  referenceUrl?: string;
}) {
  try {
    let styleGuide: string | undefined = undefined;
    if (input.referenceUrl) {
      const styleAnalysis = await analyzeContentCreatorStyle({ referenceUrl: input.referenceUrl });
      styleGuide = styleAnalysis.styleGuide;
    }
    
    const payload: GenerateVideoScriptInput = {
      topic: input.topic,
      contentType: input.contentType,
      styleGuide: styleGuide,
    };

    const result = await generateVideoScript(payload);
    return { success: true, data: result };
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
