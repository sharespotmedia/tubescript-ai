'use server';
import 'dotenv/config';

interface ScriptGeneratorInput {
  topic: string;
  contentType: string;
  referenceUrl?: string;
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

async function callAnthropicAPI(
  system: string,
  userContent: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables.');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system: system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Anthropic API Error: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to call Anthropic API: ${errorBody}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function getStyleGuide(referenceUrl: string): Promise<string> {
  const system = `You are an expert content style analyst. Analyze the content from the following URL and create a style guide that captures the content creator's unique style, including tone, vocabulary, and presentation. Respond with only the style guide.`;
  const userContent = `URL: ${referenceUrl}`;
  return callAnthropicAPI(system, userContent);
}

async function generateScriptFromStyle(
  topic: string,
  contentType: string,
  styleGuide?: string
): Promise<string> {
  const system = `You are an expert video script writer. Your task is to create a script that is ready for voiceover. The script should be natural, engaging, and sound like a real person talking to their audience.

Do not include any visual cues, scene directions, or notes like "[B-roll of...]" or "(pause)". The output should only contain the spoken words of the script.`;

  let userContent = `Generate a complete video script based on the following information:\n\nTopic: ${topic}\nContent Type: ${contentType}`;

  if (styleGuide) {
    userContent += `\n\nApply the following style guide to the generated script. Pay close attention to the creator's tone, pacing, vocabulary, and common phrases:\nStyle Guide: ${styleGuide}`;
  }

  return callAnthropicAPI(system, userContent);
}

export async function generateScript(
  input: ScriptGeneratorInput
): Promise<string> {
  let styleGuide: string | undefined;

  if (input.referenceUrl) {
    try {
      // We don't need to actually fetch the URL content here,
      // as the style analysis API will do that. This is just a placeholder
      // to check if the URL is provided.
      styleGuide = await getStyleGuide(input.referenceUrl);
    } catch (error) {
      console.warn('Could not fetch or analyze reference URL:', error);
      // Fail gracefully and generate script without style guide
    }
  }

  return generateScriptFromStyle(input.topic, input.contentType, styleGuide);
}
