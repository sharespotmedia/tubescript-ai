'use server';

/**
 * @fileOverview Video script generation flow.
 *
 * - generateVideoScript - A function that generates a video script based on a topic, content type, and optional reference URL.
 * - GenerateVideoScriptInput - The input type for the generateVideoScript function.
 * - GenerateVideoScriptOutput - The return type for the generateVideoScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { gemini15Pro } from '@genkit-ai/googleai';

const GenerateVideoScriptInputSchema = z.object({
  topic: z.string().describe('The topic of the video script.'),
  contentType: z.enum(['Vlog', 'Tutorial', 'Commentary', 'Review']).describe('The type of content for the video script.'),
  referenceUrl: z.string().url().optional().describe('An optional reference URL to analyze for style.'),
});
export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

const GenerateVideoScriptOutputSchema = z.object({
  script: z.string().describe('The generated video script.'),
});
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const generateVideoScriptPrompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  input: {schema: GenerateVideoScriptInputSchema},
  output: {schema: GenerateVideoScriptOutputSchema},
  prompt: `You are an expert video script writer. Generate a video script based on the following information:

Topic: {{{topic}}}
Content Type: {{{contentType}}}

{{#if referenceUrl}}
Analyze the style of the following reference URL and apply it to the generated script:
Reference URL: {{{referenceUrl}}}
{{/if}}
`,
  config: {
    model: gemini15Pro,
  },
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: GenerateVideoScriptInputSchema,
    outputSchema: GenerateVideoScriptOutputSchema,
  },
  async input => {
    const {output} = await generateVideoScriptPrompt(input);
    return output!;
  }
);
