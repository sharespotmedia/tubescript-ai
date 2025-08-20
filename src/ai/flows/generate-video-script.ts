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
  prompt: `You are an expert video script writer, known for creating scripts that are natural, engaging, and sound like a real person talking to their audience. Your scripts are ready to be used for recording immediately.

Generate a complete video script based on the following information:

Topic: {{{topic}}}
Content Type: {{{contentType}}}

{{#if referenceUrl}}
Analyze the style of the following reference URL and apply it to the generated script. Pay close attention to the creator's tone, pacing, vocabulary, and common phrases:
Reference URL: {{{referenceUrl}}}
{{/if}}

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

The output should be the script itself, formatted and ready for a creator to read.
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
