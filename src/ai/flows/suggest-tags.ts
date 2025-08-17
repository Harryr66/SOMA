// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview AI-powered tag suggestions for artwork uploads.
 *
 * - suggestTags - A function that suggests relevant tags for an artwork.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  artworkDescription: z
    .string()
    .describe('Detailed description of the artwork, including style, medium, and subject matter.'),
  artistIntent: z
    .string()
    .describe('The story behind the piece.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the artwork.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are an expert art tag suggestion agent.

Based on the description and the story behind the piece, suggest relevant tags to improve the artwork's discoverability.
Provide only the tags in array format.

Description: {{{artworkDescription}}}
The story behind this piece: {{{artistIntent}}}

Tags:`, // Ensure the AI returns tags in array format.
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
