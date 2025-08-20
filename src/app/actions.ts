'use server';

import { generateVideoScript, type GenerateVideoScriptInput } from '@/ai/flows/generate-video-script';

export async function handleGenerateScript(input: GenerateVideoScriptInput) {
  try {
    const payload = {
      ...input,
      referenceUrl: input.referenceUrl || undefined,
    };
    
    const result = await generateVideoScript(payload);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating script:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
