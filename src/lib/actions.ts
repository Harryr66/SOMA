
'use server';

import { suggestTags as suggestTagsFlow } from '@/ai/flows/suggest-tags';
import type { SuggestTagsInput } from '@/ai/flows/suggest-tags';

export const handleSuggestTags = async (input: SuggestTagsInput) => {
  try {
    const result = await suggestTagsFlow(input);
    return { tags: result.tags };
  } catch (error) {
    console.error('Error suggesting tags:', error);
    return { error: 'Failed to suggest tags.' };
  }
};
