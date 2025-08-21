'use server';
/**
 * @fileoverview A flow that generates a video script.
 */

import {ai} from '@/ai/genkit';
import {
  ScriptGeneratorInputSchema,
  ScriptGeneratorOutputSchema,
  type ScriptGeneratorInput,
} from '@/ai/schemas';

const styleAnalysisPrompt = ai.definePrompt({
  name: 'styleAnalysisPrompt',
  input: {
    schema: ScriptGeneratorInputSchema.pick({referenceUrl: true}).required(),
  },
  output: {
    schema: ScriptGeneratorOutputSchema,
  },
  prompt: `You are an expert content style analyst. Analyze the content from the following URL and create a style guide that captures the content creator's unique style, including tone, vocabulary, and presentation.

URL: {{{referenceUrl}}}

Respond with only the style guide.`,
});

const scriptGenerationPrompt = ai.definePrompt({
  name: 'scriptGenerationPrompt',
  input: {
    schema: ScriptGeneratorInputSchema.extend({
      styleGuide: ScriptGeneratorOutputSchema.optional(),
    }),
  },
  output: {
    schema: ScriptGeneratorOutputSchema,
  },
  prompt: `You are an expert video script writer, known for creating scripts that are natural, engaging, and sound like a real person talking to their audience. Your scripts are ready to be used for recording immediately.

Generate a complete video script based on the following information:

Topic: {{{topic}}}
Content Type: {{{contentType}}}
{{#if styleGuide}}
Apply the following style guide to the generated script. Pay close attention to the creator's tone, pacing, vocabulary, and common phrases:
Style Guide: {{{styleGuide}}}
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

The output should be the script itself, formatted and ready for a creator to read. Do not include any introductory text like "Here is the script".`,
  config: {
    model: 'gemini-pro',
  },
});

const generateScriptFlow = ai.defineFlow(
  {
    name: 'generateScriptFlow',
    inputSchema: ScriptGeneratorInputSchema,
    outputSchema: ScriptGeneratorOutputSchema,
  },
  async (input) => {
    let styleGuide: string | undefined = undefined;
    if (input.referenceUrl) {
      const styleAnalysisResponse = await styleAnalysisPrompt({
        referenceUrl: input.referenceUrl,
      });
      styleGuide = styleAnalysisResponse.output;
    }

    const scriptResponse = await scriptGenerationPrompt({
      ...input,
      styleGuide,
    });

    return scriptResponse.output!;
  }
);

export async function generateScript(
  input: ScriptGeneratorInput
): Promise<string> {
  return generateScriptFlow(input);
}
