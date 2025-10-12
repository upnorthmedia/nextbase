import { processMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export async function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const processed = await processMarkdown(content);

  return (
    <div
      className={cn(
        'prose prose-slate dark:prose-invert max-w-none',
        // Headings
        'prose-headings:scroll-mt-20 prose-headings:font-bold',
        'prose-h1:text-4xl prose-h1:mb-4',
        'prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4',
        'prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3',
        'prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-2',
        // Links
        'prose-a:text-primary prose-a:no-underline prose-a:font-medium',
        'hover:prose-a:underline hover:prose-a:decoration-2',
        // Code
        'prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5',
        'prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
        'prose-code:font-mono prose-code:text-foreground',
        // Pre/Code blocks
        'prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950',
        'prose-pre:border prose-pre:border-slate-800',
        'prose-pre:rounded-lg prose-pre:p-4',
        'prose-pre:overflow-x-auto',
        // Blockquotes
        'prose-blockquote:border-l-4 prose-blockquote:border-l-primary',
        'prose-blockquote:bg-muted/30',
        'prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r',
        'prose-blockquote:not-italic',
        // Lists
        'prose-ul:my-4 prose-ol:my-4',
        'prose-li:my-1',
        // Tables
        'prose-table:border prose-table:border-collapse',
        'prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700',
        'prose-th:bg-slate-100 dark:prose-th:bg-slate-800',
        'prose-th:px-4 prose-th:py-2',
        'prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700',
        'prose-td:px-4 prose-td:py-2',
        // Images - matching featured image rounded-lg style
        'prose-img:rounded-lg prose-img:shadow-lg',
        'prose-img:my-6',
        // Strong/Bold
        'prose-strong:font-bold prose-strong:text-foreground',
        // Horizontal rule
        'prose-hr:border-border prose-hr:my-8',
        // Custom spacing
        'prose-p:my-4 prose-p:leading-7',
        className
      )}
      dangerouslySetInnerHTML={{ __html: processed.content }}
    />
  );
}

// Skeleton loader for MarkdownRenderer
export function MarkdownSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 animate-pulse', className)}>
      {/* Heading skeleton */}
      <div className="h-10 bg-muted rounded w-3/4" />

      {/* Paragraph skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>

      {/* Subheading skeleton */}
      <div className="h-8 bg-muted rounded w-2/3 mt-8" />

      {/* More paragraph skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>

      {/* Code block skeleton */}
      <div className="h-32 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-lg" />

      {/* More content skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}
