// This file is used to analyze content creator's style from a reference URL.

'use server';

/**
 * @fileOverview Analyzes the content creator's style from a reference YouTube video or website URL.
 *
 * - analyzeContentCreatorStyle - A function that handles the content creator style analysis.
 * - AnalyzeContentCreatorStyleInput - The input type for the analyzeContentCreatorStyle function.
 * - AnalyzeContentCreatorStyleOutput - The return type for the analyzeContentCreatorStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { geminiPro } from '@genkit-ai/googleai';

const AnalyzeContentCreatorStyleInputSchema = z.object({
  referenceUrl: z
    .string()
    .url()
    .describe(
      'A YouTube video or website URL to analyze the content creator style from.'
    ),
});
export type AnalyzeContentCreatorStyleInput = z.infer<typeof AnalyzeContentCreatorStyleInputSchema>;

const AnalyzeContentCreatorStyleOutputSchema = z.object({
  styleGuide: z
    .string()
    .describe(
      'A style guide extracted from the reference URL, describing the content creator style, including tone, vocabulary, and presentation.'
    ),
});
export type AnalyzeContentCreatorStyleOutput = z.infer<typeof AnalyzeContentCreatorStyleOutputSchema>;

export async function analyzeContentCreatorStyle(
  input: AnalyzeContentCreatorStyleInput
): Promise<AnalyzeContentCreatorStyleOutput> {
  return analyzeContentCreatorStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeContentCreatorStylePrompt',
  input: {schema: AnalyzeContentCreatorStyleInputSchema},
  output: {schema: AnalyzeContentCreatorStyleOutputSchema},
  prompt: `You are an expert content style analyst. Analyze the content from the following URL and create a style guide that captures the content creator's unique style, including tone, vocabulary, and presentation.

URL: {{{referenceUrl}}}

Style Guide:`,
  config: {
    model: geminiPro,
  },
});

const analyzeContentCreatorStyleFlow = ai.defineFlow(
  {
    name: 'analyzeContentCreatorStyleFlow',
    inputSchema: AnalyzeContentCreatorStyleInputSchema,
    outputSchema: AnalyzeContentCreatorStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
