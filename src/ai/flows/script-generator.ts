
'use server';
/**
 * @fileOverview A script generation AI agent using Anthropic's Claude.
 *
 * - generateScript - A function that handles the script generation process.
 * - ScriptGeneratorInput - The input type for the generateScript function.
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Initialize the Anthropic client with the API key from environment variables.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

// This function is kept for potential future use with web scraping, but is not currently implemented.
async function getStyleGuideFromUrl(url: string): Promise<string> {
    // In a real application, you would fetch the content of the URL (e.g., transcript)
    // and analyze it. For this example, we'll return a placeholder style guide.
    console.warn("Reference URL analysis is not implemented. Using a generic style guide.");
    return "Style Guide: Casual, informative, and friendly tone. Uses simple language and occasional humor.";
}

function constructPrompt(input: ScriptGeneratorInput, styleGuide?: string): string {
    let prompt = `You are an expert video script writer. Your task is to create a script that is ready for voiceover. The script should be natural, engaging, and sound like a real person talking to their audience.

Do not include any visual cues, scene directions, or notes like "[B-roll of...]" or "(pause)". The output should only contain the spoken words of the script.

Generate a complete video script based on the following information:

Topic: ${input.topic}
Content Type: ${input.contentType}
`;

    if (styleGuide) {
        prompt += `
Apply the following style guide to the generated script. Pay close attention to the creator's tone, pacing, vocabulary, and common phrases:
${styleGuide}
`;
    }

    return prompt;
}


/**
 * Generates a video script based on the provided input using the Anthropic API.
 * @param input The input for the script generator.
 * @returns The generated script as a string.
 */
export async function generateScript(
  input: ScriptGeneratorInput
): Promise<string> {
  let styleGuide: string | undefined;

  // Note: Actual web scraping/analysis of the reference URL is not implemented.
  // This part of the logic is simplified to focus on the AI interaction.
  if (input.referenceUrl) {
    try {
      styleGuide = await getStyleGuideFromUrl(input.referenceUrl);
    } catch (error) {
      console.warn('Could not fetch or analyze reference URL:', error);
      // Fail gracefully and generate script without a style guide.
    }
  }

  const user_prompt = constructPrompt(input, styleGuide);

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // A powerful and cost-effective model
      max_tokens: 2048,
      messages: [{ role: 'user', content: user_prompt }],
    });

    if (msg.content && msg.content.length > 0) {
      // Assuming the first content block is the text we want.
      return msg.content[0].type === 'text' ? msg.content[0].text : '';
    } else {
      throw new Error('Anthropic API returned no content.');
    }
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw new Error('Failed to generate script due to an API error.');
  }
}
