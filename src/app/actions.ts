'use server';

import {
  generateVideoScript,
  type GenerateVideoScriptInput,
} from '@/ai/flows/generate-video-script';
import { analyzeContentCreatorStyle } from '@/ai/flows/analyze-content-creator-style';
import { doc, getDoc, setDoc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

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
