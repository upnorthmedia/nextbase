'use client';

import { useState, useEffect, useRef } from 'react';
import { processMarkdownAction } from './BlogEditor.actions';
import { uploadImage } from '@/lib/supabase/storage';
import { cn } from '@/lib/utils';
import { Eye, Code, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function BlogEditor({ value, onChange, className }: BlogEditorProps) {
  const [preview, setPreview] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes
  useEffect(() => {
    let isCancelled = false;

    const updatePreview = async () => {
      if (!value.trim()) {
        setPreview('');
        return;
      }

      setIsProcessing(true);
      try {
        const result = await processMarkdownAction(value);
        if (!isCancelled) {
          if (result.success && result.html) {
            setPreview(result.html);
          } else {
            setPreview('<p class="text-red-500">Error processing markdown</p>');
          }
        }
      } catch {
        if (!isCancelled) {
          setPreview('<p class="text-red-500">Error processing markdown</p>');
        }
      } finally {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      }
    };

    // Debounce preview updates
    const timeoutId = setTimeout(updatePreview, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [value]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploadingImage(true);

    try {
      const result = await uploadImage({ file, path: 'content' });

      if (!result.success) {
        toast.error(result.error || 'Upload failed');
        return;
      }

      // Insert markdown image at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![Image description](${result.url})`;
        const newValue =
          value.substring(0, start) + imageMarkdown + value.substring(end);
        onChange(newValue);

        // Move cursor after inserted markdown
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + imageMarkdown.length;
          textarea.focus();
        }, 0);
      }

      toast.success('Image inserted successfully!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              !isPreviewMode
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Code className="h-4 w-4" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMode(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              isPreviewMode
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={isUploadingImage || isPreviewMode}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              'text-muted-foreground hover:text-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Insert image"
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            Insert Image
          </button>
        </div>

        {isProcessing && (
          <span className="text-xs text-muted-foreground">
            Updating preview...
          </span>
        )}
        {isUploadingImage && (
          <span className="text-xs text-muted-foreground">
            Uploading image...
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
        disabled={isUploadingImage}
      />

      {/* Editor Content */}
      <div className="flex-1 min-h-0 relative">
        {!isPreviewMode ? (
          // Markdown Editor
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-background resize-none focus:outline-none"
            placeholder="Write your blog post in markdown..."
            spellCheck="false"
          />
        ) : (
          // Preview Pane
          <div className="w-full h-full overflow-auto p-4">
            {preview ? (
              <div
                className={cn(
                  'prose prose-slate dark:prose-invert max-w-none',
                  // Same prose styles as MarkdownRenderer
                  'prose-headings:scroll-mt-20 prose-headings:font-bold',
                  'prose-h1:text-4xl prose-h1:mb-4',
                  'prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2',
                  'prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3',
                  'prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline',
                  'prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
                  'prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:border prose-pre:rounded-lg',
                  'prose-blockquote:border-l-primary prose-blockquote:bg-muted/30',
                  'prose-img:rounded-lg prose-img:shadow-md'
                )}
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Nothing to preview yet. Start writing!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <p>
          Supports markdown, code blocks, tables, and{' '}
          <a
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            more
          </a>
          . Try callouts: <code className="px-1 py-0.5 bg-muted rounded">:::note</code>{' '}
          <code className="px-1 py-0.5 bg-muted rounded">:::warning</code>{' '}
          <code className="px-1 py-0.5 bg-muted rounded">:::tip</code>
        </p>
      </div>
    </div>
  );
}
