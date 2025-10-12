import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import readingTime from 'reading-time';
import matter from 'gray-matter';
import type { TableOfContentsItem } from '@/lib/blog/types';
import { youtubeEmbedPlugin, imageUrlTransformPlugin, extractHeadingsPlugin } from './plugins';

export interface FrontmatterData {
  title?: string;
  excerpt?: string;
  author?: string;
  date?: string;
  [key: string]: unknown;
}

export interface ProcessedMarkdown {
  content: string;
  frontmatter: FrontmatterData;
  readingTime: number;
  wordCount: number;
  headings: Array<{
    id: string;
    text: string;
    level: number;
  }>;
  tableOfContents: TableOfContentsItem[];
  excerpt?: string;
}

/**
 * Process markdown content with frontmatter and all plugins
 */
export async function processMarkdown(
  markdown: string,
  options: {
    generateExcerpt?: boolean;
    excerptLength?: number;
    transformImageUrls?: boolean;
  } = {}
): Promise<ProcessedMarkdown> {
  const {
    generateExcerpt = true,
    excerptLength = 160,
    transformImageUrls = true,
  } = options;

  // Parse frontmatter
  const { data: frontmatter, content: markdownContent } = matter(markdown);

  // Calculate reading time
  const stats = readingTime(markdownContent);

  // Extract headings for table of contents
  const headings: Array<{ id: string; text: string; level: number }> = [];

  // Process markdown
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm) // GitHub Flavored Markdown
    .use(youtubeEmbedPlugin) // Custom YouTube embed support
    .use(transformImageUrls ? imageUrlTransformPlugin : () => {}) // Transform image URLs to Supabase
    .use(extractHeadingsPlugin, { headings }) // Extract headings
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug) // Add IDs to headings for TOC navigation
    .use(rehypeHighlight, {
      detect: true,
      ignoreMissing: true,
    })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(markdownContent);
  const content = String(result);

  // Build table of contents
  const tableOfContents = buildTableOfContents(headings);

  // Generate excerpt if needed
  let excerpt: string | undefined;
  if (generateExcerpt && !frontmatter.excerpt) {
    excerpt = generateExcerptFromMarkdown(markdownContent, excerptLength);
  } else if (frontmatter.excerpt) {
    excerpt = frontmatter.excerpt;
  }

  return {
    content,
    frontmatter,
    readingTime: Math.ceil(stats.minutes),
    wordCount: stats.words,
    headings,
    tableOfContents,
    excerpt,
  };
}

/**
 * Process markdown for preview (without some heavy transformations)
 */
export async function processMarkdownPreview(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(markdown);
  return String(result);
}

/**
 * Generate excerpt from markdown content
 */
function generateExcerptFromMarkdown(
  markdown: string,
  maxLength: number = 160
): string {
  // Remove markdown formatting
  const plainText = markdown
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/^[-*+]\s/gm, '') // Remove list markers
    .replace(/^\d+\.\s/gm, '') // Remove numbered list markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Cut at the last complete word before maxLength
  const excerpt = plainText.substring(0, maxLength);
  const lastSpaceIndex = excerpt.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    return excerpt.substring(0, lastSpaceIndex) + '...';
  }

  return excerpt + '...';
}

/**
 * Build hierarchical table of contents
 */
function buildTableOfContents(
  headings: Array<{ id: string; text: string; level: number }>
): TableOfContentsItem[] {
  const toc: TableOfContentsItem[] = [];
  const stack: TableOfContentsItem[] = [];

  headings.forEach(heading => {
    // Only include h2 and h3 in TOC
    if (heading.level > 3) return;

    const item: TableOfContentsItem = {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      children: [],
    };

    // Find the correct parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top-level heading
      toc.push(item);
    } else {
      // Child heading
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    }

    stack.push(item);
  });

  return toc;
}

/**
 * Extract plain text from markdown
 */
export function extractPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate markdown content
 */
export function validateMarkdown(markdown: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for basic content
  if (!markdown || markdown.trim().length === 0) {
    errors.push('Markdown content is empty');
  }

  // Check for unclosed code blocks
  const codeBlockCount = (markdown.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }

  // Check for broken image syntax
  const imageRegex = /!\[([^\]]*)\]\(/g;
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const remainingText = markdown.slice(match.index + match[0].length);
    if (!remainingText.match(/^[^)]+\)/)) {
      errors.push(`Broken image syntax at position ${match.index}`);
    }
  }

  // Check for broken link syntax
  const linkRegex = /\[([^\]]+)\]\(/g;
  while ((match = linkRegex.exec(markdown)) !== null) {
    const remainingText = markdown.slice(match.index + match[0].length);
    if (!remainingText.match(/^[^)]+\)/)) {
      errors.push(`Broken link syntax at position ${match.index}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize markdown to prevent XSS
 */
export function sanitizeMarkdown(markdown: string): string {
  // Remove any script tags
  markdown = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove any style tags with potentially dangerous content
  markdown = markdown.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove on* event handlers
  markdown = markdown.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  markdown = markdown.replace(/javascript:/gi, '');

  // Remove data: protocol for non-image types
  markdown = markdown.replace(/data:(?!image\/)/gi, '');

  return markdown;
}

// Re-export for convenience
export { youtubeEmbedPlugin, imageUrlTransformPlugin } from './plugins';