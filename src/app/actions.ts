'use server';

import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { headers } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callClaudeApi(prompt: string): Promise<any> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is not configured. Please set it in your environment variables.'
      );
    }
    
    try {
        const msg = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            messages: [{role: 'user', content: prompt}],
        });
        return msg.content[0].text;
    } catch (error) {
        console.error('Error calling Anthropic API:', error);
        if (error instanceof Anthropic.APIError) {
          throw new Error(`Failed to call Claude AI: ${error.status} ${error.message}`);
        }
        throw new Error('An unexpected error occurred while calling Claude AI.');
    }
}


export async function handleGenerateScript(input: {
  topic: string;
  contentType: 'Vlog' | 'Tutorial' | 'Commentary' | 'Review';
  referenceUrl?: string;
}) {
  try {
    let styleGuide: string | undefined = undefined;
    if (input.referenceUrl) {
       const styleAnalysisPrompt = `You are an expert content style analyst. Analyze the content from the following URL and create a style guide that captures the content creator's unique style, including tone, vocabulary, and presentation.

URL: ${input.referenceUrl}

Respond with only the style guide.`;
      styleGuide = await callClaudeApi(styleAnalysisPrompt);
    }
    
    const scriptGenerationPrompt = `You are an expert video script writer, known for creating scripts that are natural, engaging, and sound like a real person talking to their audience. Your scripts are ready to be used for recording immediately.

Generate a complete video script based on the following information:

Topic: ${input.topic}
Content Type: ${input.contentType}
${
  styleGuide
    ? `
Apply the following style guide to the generated script. Pay close attention to the creator's tone, pacing, vocabulary, and common phrases:
Style Guide: ${styleGuide}
`
    : ''
}

Your script should have a clear structure:
1.  **Introduction (Hook)**: Grab the viewer's attention in the first 10-15 seconds. State what the video is about and why they should watch.
2.  **Main Content**: Deliver the core message. Break it down into clear, easy-to-follow points.
3.  **Conclusion (Outro)**: Summarize the key takeaways and include a clear call to action (e.g., "like and subscribe," "check out this other video," "leave a comment below").

Writing Style Guidelines:
-   **Be Conversational**: Write as if you're talking to a friend. Use contractions (e.g., "it's," "you're").
-   **Add Pauses**: Indicate where the speaker should pause for effect, using "(pause)" or "...".
-   **Emphasize Words**: Suggest which words or phrases should be emphasized to add personality.
-   **Include Action/Visual Cues**: Add notes in brackets like "[Show B-roll of...]" or "[Text on screen: ...]" to suggest visuals. This makes the script ready for editing.
-   **Clarity is Key**: Make sure the script is easy to read and understand.

The output should be the script itself, formatted and ready for a creator to read. Do not include any introductory text like "Here is the script".`;

    const script = await callClaudeApi(scriptGenerationPrompt);

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
