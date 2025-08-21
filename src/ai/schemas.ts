import {z} from 'genkit';

export const ScriptGeneratorInputSchema = z.object({
  topic: z.string().describe('The main topic of the video.'),
  contentType: z
    .enum(['Vlog', 'Tutorial', 'Commentary', 'Review'])
    .describe('The type of content to be generated.'),
  referenceUrl: z
    .string()
    .optional()
    .describe(
      'An optional URL to a reference video to match its style and tone.'
    ),
});
export type ScriptGeneratorInput = z.infer<typeof ScriptGeneratorInputSchema>;

export const ScriptGeneratorOutputSchema = z
  .string()
  .describe('The fully generated video script.');
export type ScriptGeneratorOutput = z.infer<
  typeof ScriptGeneratorOutputSchema
>;
