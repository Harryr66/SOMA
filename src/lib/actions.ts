'use server';

// Temporarily disabled AI features for deployment
// import { suggestTags as suggestTagsFlow } from '@/ai/flows/suggest-tags';
// import type { SuggestTagsInput } from '@/ai/flows/suggest-tags';

export const handleSuggestTags = async (input: any) => {
  try {
    // Temporarily return mock data
    return { tags: ['art', 'painting', 'creative'] };
  } catch (error) {
    console.error('Error suggesting tags:', error);
    return { tags: [] };
  }
};
