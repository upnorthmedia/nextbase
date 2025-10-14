'use server';

import { processMarkdown } from '@/lib/markdown';

export async function processMarkdownAction(content: string) {
  try {
    const result = await processMarkdown(content);
    return { success: true, html: result.content };
  } catch {
    return { success: false, error: 'Failed to process markdown' };
  }
}
