
'use server';
/**
 * @fileOverview A script generation AI agent.
 *
 * - generateScript - A function that handles the script generation process.
 * - ScriptGeneratorInput - The input type for the generateScript function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the input of the script generator.
const ScriptGeneratorInputSchema = z.object({
  topic: z.string().describe('The main topic of the video.'),
  contentType: z
    .string()
    .describe('The type of content (e.g., Vlog, Tutorial).'),
  referenceUrl: z
    .string()
    .url()
    .optional()
    .describe('An optional URL to a reference video for style matching.'),
});
export type ScriptGeneratorInput = z.infer<typeof ScriptGeneratorInputSchema>;

const StyleGuideSchema = z.object({
    styleGuide: z.string().describe("A style guide that captures the content creator's unique style, including tone, vocabulary, and presentation.")
});

const ScriptSchema = z.object({
    script: z.string().describe("The generated video script, ready for voiceover. It should be natural, engaging, and contain only the spoken words without any visual cues or directions.")
});

// Define a prompt to get the style guide from a URL.
const styleGuidePrompt = ai.definePrompt({
  name: 'styleGuidePrompt',
  input: { schema: z.object({ referenceUrl: z.string() }) },
  output: { schema: StyleGuideSchema },
  prompt: `You are an expert content style analyst. Analyze the content from the following URL and create a style guide that captures the content creator's unique style, including tone, vocabulary, and presentation. Respond with only the style guide.

URL: {{{referenceUrl}}}`,
});

// Define a prompt to generate a script based on a topic, content type, and optional style guide.
const scriptGenerationPrompt = ai.definePrompt({
  name: 'scriptGenerationPrompt',
  input: { schema: z.object({
    topic: z.string(),
    contentType: z.string(),
    styleGuide: z.string().optional()
  }) },
  output: { schema: ScriptSchema },
  prompt: `You are an expert video script writer. Your task is to create a script that is ready for voiceover. The script should be natural, engaging, and sound like a real person talking to their audience.

Do not include any visual cues, scene directions, or notes like "[B-roll of...]" or "(pause)". The output should only contain the spoken words of the script.

Generate a complete video script based on the following information:

Topic: {{{topic}}}
Content Type: {{{contentType}}}

{{#if styleGuide}}
Apply the following style guide to the generated script. Pay close attention to the creator's tone, pacing, vocabulary, and common phrases:
Style Guide: {{{styleGuide}}}
{{/if}}
`,
});

// Define the main flow for generating the script.
const scriptGeneratorFlow = ai.defineFlow(
  {
    name: 'scriptGeneratorFlow',
    inputSchema: ScriptGeneratorInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    let styleGuide: string | undefined;

    if (input.referenceUrl) {
      try {
        const { output } = await styleGuidePrompt({ referenceUrl: input.referenceUrl });
        if (output) {
          styleGuide = output.styleGuide;
        }
      } catch (error) {
        console.warn('Could not fetch or analyze reference URL:', error);
        // Fail gracefully and generate script without style guide
      }
    }
    
    const { output } = await scriptGenerationPrompt({ ...input, styleGuide });

    if (!output) {
      throw new Error('Failed to generate script.');
    }
    
    return output.script;
  }
);

/**
 * Generates a video script based on the provided input.
 * @param input The input for the script generator.
 * @returns The generated script as a string.
 */
export async function generateScript(
  input: ScriptGeneratorInput
): Promise<string> {
  return await scriptGeneratorFlow(input);
}
