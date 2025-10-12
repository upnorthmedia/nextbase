import type { Plugin } from 'unified';
import type { Root, RootContent, Paragraph, Link, Image, Code, Text, Heading, Parent } from 'mdast';
import { visit } from 'unist-util-visit';
import { getStorageUrl, extractYouTubeId } from '@/lib/blog/utils';

/**
 * Remark plugin to transform YouTube URLs into embeds
 */
export const youtubeEmbedPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index: number | null | undefined, parent: Parent | undefined) => {
      if (!node.children || node.children.length !== 1) return;

      const child = node.children[0];

      // Check if it's a text node with just a YouTube URL
      if (child.type === 'text') {
        const textChild = child as Text;
        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)(\S*)?$/;
        const match = textChild.value.match(youtubeUrlRegex);

        if (match && parent) {
          const videoId = extractYouTubeId(textChild.value);
          if (videoId && index !== null && index !== undefined) {
            // Replace the paragraph with an HTML node containing the YouTube embed
            parent.children[index] = {
              type: 'html',
              value: generateYouTubeEmbed(videoId),
            };
          }
        }
      }

      // Check if it's a link node with a YouTube URL
      if (child.type === 'link' && child.children && child.children.length > 0) {
        const linkChild = child as Link;
        const videoId = extractYouTubeId(linkChild.url);
        if (videoId && parent && index !== null && index !== undefined) {
          // Replace the paragraph with an HTML node containing the YouTube embed
          parent.children[index] = {
            type: 'html',
            value: generateYouTubeEmbed(videoId),
          };
        }
      }
    });

    // Also check for YouTube URLs in plain links (not wrapped in paragraphs)
    visit(tree, 'link', (node: Link, index: number | null | undefined, parent: Parent | undefined) => {
      const videoId = extractYouTubeId(node.url);
      if (videoId && parent && index !== null && index !== undefined && parent.type !== 'paragraph') {
        // Replace the link with an HTML node containing the YouTube embed
        parent.children[index] = {
          type: 'html',
          value: generateYouTubeEmbed(videoId),
        };
      }
    });
  };
};

/**
 * Generate YouTube embed HTML
 */
function generateYouTubeEmbed(videoId: string): string {
  return `
    <div class="youtube-embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 2rem 0;">
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        title="YouTube video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem;"
        loading="lazy"
      ></iframe>
    </div>
  `;
}

/**
 * Remark plugin to transform image URLs to use Supabase storage
 */
export const imageUrlTransformPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'image', (node: Image) => {
      // Skip if it's already a full URL (http/https)
      if (node.url.startsWith('http://') || node.url.startsWith('https://')) {
        return;
      }

      // Transform relative URLs to Supabase storage URLs
      node.url = getStorageUrl(node.url);
    });
  };
};

/**
 * Remark plugin to extract headings for table of contents
 */
export const extractHeadingsPlugin: Plugin<
  [{ headings: Array<{ id: string; text: string; level: number }> }],
  Root
> = ({ headings }) => {
  return (tree: Root) => {
    visit(tree, 'heading', (node: Heading) => {
      const text = extractText(node);
      const id = generateId(text);

      headings.push({
        id,
        text,
        level: node.depth,
      });
    });
  };
};

/**
 * Extract text from a node
 */
function extractText(node: RootContent | Paragraph | Heading | Link): string {
  if (node.type === 'text') {
    return (node as Text).value;
  }

  if ('children' in node && node.children && node.children.length > 0) {
    return node.children.map((child) => extractText(child as RootContent)).join('');
  }

  return '';
}

/**
 * Generate a slug/id from text
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Remark plugin to add custom classes to code blocks
 */
export const codeBlockClassPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      const data = node.data || (node.data = {});
      const props = data.hProperties || (data.hProperties = {});

      // Add custom classes for styling
      let classNames: string[] = [];
      if (props.className) {
        if (Array.isArray(props.className)) {
          classNames = props.className.filter((c): c is string => typeof c === 'string');
        } else if (typeof props.className === 'string') {
          classNames = [props.className];
        }
      }

      classNames.push('code-block');

      if (node.lang) {
        classNames.push(`language-${node.lang}`);
      }

      props.className = classNames;

      // Add data attributes
      if (node.lang) {
        props['data-language'] = node.lang;
      }
    });
  };
};

/**
 * Remark plugin to handle custom markdown extensions
 */
export const customMarkdownExtensions: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number | null | undefined, parent: Parent | undefined) => {
      if (!parent || index === null || index === undefined) return;

      // Handle custom callout syntax: :::note, :::warning, :::tip
      const calloutRegex = /^:::(note|warning|tip|info)\n([\s\S]*?)^:::$/gm;
      const matches = [...node.value.matchAll(calloutRegex)];

      if (matches.length > 0) {
        const newNodes: RootContent[] = [];
        let lastIndex = 0;

        matches.forEach((match) => {
          const [fullMatch, type, content] = match;
          const startIndex = match.index!;

          // Add text before the callout
          if (startIndex > lastIndex) {
            newNodes.push({
              type: 'text',
              value: node.value.slice(lastIndex, startIndex),
            });
          }

          // Add the callout as HTML
          newNodes.push({
            type: 'html',
            value: generateCallout(type, content.trim()),
          });

          lastIndex = startIndex + fullMatch.length;
        });

        // Add any remaining text
        if (lastIndex < node.value.length) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex),
          });
        }

        // Replace the node with the new nodes
        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
};

/**
 * Generate callout HTML
 */
function generateCallout(type: string, content: string): string {
  const typeStyles = {
    note: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    tip: 'border-green-500 bg-green-50 dark:bg-green-950',
    info: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
  };

  const typeIcons = {
    note: '📝',
    warning: '⚠️',
    tip: '💡',
    info: 'ℹ️',
  };

  const style = typeStyles[type as keyof typeof typeStyles] || typeStyles.note;
  const icon = typeIcons[type as keyof typeof typeIcons] || typeIcons.note;

  return `
    <div class="callout callout-${type} border-l-4 p-4 my-4 ${style}">
      <div class="flex items-start gap-2">
        <span class="text-xl">${icon}</span>
        <div class="callout-content prose dark:prose-invert max-w-none">
          ${content.replace(/\n/g, '<br />')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Remark plugin to add line numbers to code blocks
 */
export const lineNumbersPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      if (!node.value) return;

      const lines = node.value.split('\n');
      const data = node.data || (node.data = {});
      const props = data.hProperties || (data.hProperties = {});

      // Add line count as data attribute
      props['data-line-count'] = lines.length;

      // Add a class to enable line numbers via CSS
      let classNames: string[] = [];
      if (props.className) {
        if (Array.isArray(props.className)) {
          classNames = props.className.filter((c): c is string => typeof c === 'string');
        } else if (typeof props.className === 'string') {
          classNames = [props.className];
        }
      }
      classNames.push('line-numbers');
      props.className = classNames;
    });
  };
};

/**
 * Remark plugin to handle footnotes
 */
export const footnotePlugin: Plugin<[], Root> = () => {
  let footnoteCounter = 0;
  const footnotes: { id: string; content: string }[] = [];

  return (tree: Root) => {
    // Reset for each document
    footnoteCounter = 0;
    footnotes.length = 0;

    // First pass: find and process footnote definitions
    visit(tree, 'footnoteDefinition', (node: RootContent) => {
      footnoteCounter++;
      const id = `fn-${footnoteCounter}`;
      footnotes.push({
        id,
        content: extractText(node),
      });

      // Mark for removal by modifying the type (this is a safe mutation within the plugin)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any).type = 'remove';
    });

    // Second pass: replace footnote references
    visit(tree, 'footnoteReference', (node: RootContent, index: number | null | undefined, parent: Parent | undefined) => {
      if (!parent || index === null || index === undefined) return;

      const refNode = node as RootContent & { identifier?: string };
      if (!refNode.identifier) return;

      const footnoteIndex = parseInt(refNode.identifier) - 1;
      if (footnotes[footnoteIndex]) {
        parent.children[index] = {
          type: 'html',
          value: `<sup><a href="#${footnotes[footnoteIndex].id}" id="${footnotes[footnoteIndex].id}-ref" class="footnote-ref">[${footnoteIndex + 1}]</a></sup>`,
        };
      }
    });

    // Add footnotes section at the end if there are any
    if (footnotes.length > 0) {
      tree.children.push({
        type: 'html',
        value: generateFootnotesSection(footnotes),
      } as RootContent);
    }

    // Remove marked nodes (filter out nodes marked with type 'remove')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tree.children = tree.children.filter((node: any) => node.type !== 'remove');
  };
};

/**
 * Generate footnotes section HTML
 */
function generateFootnotesSection(footnotes: { id: string; content: string }[]): string {
  const items = footnotes
    .map(
      (fn) => `
        <li id="${fn.id}">
          ${fn.content}
          <a href="#${fn.id}-ref" class="footnote-backref">↩</a>
        </li>
      `
    )
    .join('');

  return `
    <div class="footnotes-section border-t pt-4 mt-8">
      <h3 class="text-sm font-semibold mb-2">Footnotes</h3>
      <ol class="text-sm space-y-1">
        ${items}
      </ol>
    </div>
  `;
}