'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { uploadImage, deleteImage, extractStoragePath } from '@/lib/supabase/storage';
import type { StoragePath } from '@/lib/supabase/storage.types';
import { toast } from 'sonner';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  path: StoragePath;
  currentImage?: string;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
  aspectRatio?: string; // e.g., '1/1', '16/9'
  className?: string;
  label?: string;
  description?: string;
}

export function ImageUploader({
  path,
  currentImage,
  onUploadComplete,
  onDelete,
  aspectRatio = '16/9',
  className,
  label,
  description,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadImage({ file, path });

      if (!result.success) {
        toast.error(result.error || 'Upload failed');
        return;
      }

      setPreview(result.url);
      onUploadComplete(result.url!);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    // If it's a Supabase Storage URL, delete from storage
    if (preview.includes('supabase.co/storage')) {
      const storagePath = await extractStoragePath(preview);
      if (storagePath) {
        const result = await deleteImage(storagePath);
        if (!result.success) {
          toast.error('Failed to delete image from storage');
          return;
        }
      }
    }

    setPreview(undefined);
    onDelete?.();
    toast.success('Image removed');
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors overflow-hidden',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          preview && 'border-solid'
        )}
        style={{ aspectRatio }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          // Preview state
          <div className="relative w-full h-full group">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={openFilePicker}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Upload state
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer"
            onClick={openFilePicker}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-center mb-1">
                  Drop image here or click to upload
                </p>
                {description && (
                  <p className="text-xs text-muted-foreground text-center">
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {isUploading && preview && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
