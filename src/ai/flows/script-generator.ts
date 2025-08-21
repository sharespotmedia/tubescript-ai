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
  const system = `You are an expert video script writer, known for creating scripts that are natural, engaging, and sound like a real person talking to their audience. Your scripts are ready to be used for recording immediately.

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

The output should be the script itself, formatted and ready for a creator to read. Do not include any introductory text like "Here is the script".`;

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
      const response = await fetch(input.referenceUrl);
      const text = await response.text();
      // This is a simplified analysis. A real implementation might extract more structured data.
      styleGuide = await getStyleGuide(input.referenceUrl);
    } catch (error) {
      console.warn('Could not fetch or analyze reference URL:', error);
      // Fail gracefully and generate script without style guide
    }
  }

  return generateScriptFromStyle(input.topic, input.contentType, styleGuide);
}
