import Anthropic from '@anthropic-ai/sdk';
import {NextResponse} from 'next/server';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const {userPrompt} = await req.json();

    if (!userPrompt) {
      return NextResponse.json(
        {error: 'userPrompt is required'},
        {status: 400}
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            'ANTHROPIC_API_KEY is not configured. Please set it in your environment variables.',
        },
        {status: 500}
      );
    }

    const msg = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{role: 'user', content: userPrompt}],
    });

    return NextResponse.json({response: msg.content});
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {error: 'Failed to call Claude AI', details: error.message},
        {status: error.status || 500}
      );
    }
    return NextResponse.json(
      {error: 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}
