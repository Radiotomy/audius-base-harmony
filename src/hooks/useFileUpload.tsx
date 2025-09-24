import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResult {
  url: string;
  path: string;
  fullPath: string;
}

export type UploadBucket = 'artist-tracks' | 'cover-art' | 'profile-media' | 'merch-images' | 'avatars';

interface UseFileUploadOptions {
  bucket: UploadBucket;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: FileUploadResult) => void;
  onError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    bucket,
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = [],
    onProgress,
    onSuccess,
    onError
  } = options;

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Check file type if specified
    if (allowedTypes.length > 0) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const isTypeAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.substring(1);
        }
        return fileType.startsWith(type);
      });

      if (!isTypeAllowed) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  }, [maxFileSize, allowedTypes]);

  const uploadFile = useCallback(async (file: File, customPath?: string): Promise<FileUploadResult | null> => {
    if (!user) {
      const error = 'User must be authenticated to upload files';
      onError?.(error);
      toast({
        title: 'Authentication Required',
        description: error,
        variant: 'destructive',
      });
      return null;
    }

    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      toast({
        title: 'File Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Generate file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = customPath || `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL for public buckets
      let publicUrl = '';
      if (['cover-art', 'profile-media', 'merch-images', 'avatars'].includes(bucket)) {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      const result: FileUploadResult = {
        url: publicUrl,
        path: filePath,
        fullPath: data.path,
      };

      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      onSuccess?.(result);
      
      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded successfully`,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload file';
      onError?.(errorMessage);
      
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [user, bucket, validateFile, onProgress, onSuccess, onError, toast]);

  const uploadMultipleFiles = useCallback(async (
    files: File[], 
    customPaths?: string[]
  ): Promise<FileUploadResult[]> => {
    const results: FileUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const customPath = customPaths?.[i];
      
      const result = await uploadFile(file, customPath);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }, [uploadFile]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'User must be authenticated to delete files',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully',
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete file';
      
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return false;
    }
  }, [user, bucket, toast]);

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    uploading,
    progress,
    validateFile,
  };
};

// Predefined configurations for different upload types
export const useTrackUpload = (options?: Partial<UseFileUploadOptions>) => {
  return useFileUpload({
    bucket: 'artist-tracks',
    maxFileSize: 100 * 1024 * 1024, // 100MB for audio files
    allowedTypes: ['audio/', '.mp3', '.wav', '.flac', '.m4a', '.aac'],
    ...options,
  });
};

export const useCoverArtUpload = (options?: Partial<UseFileUploadOptions>) => {
  return useFileUpload({
    bucket: 'cover-art',
    maxFileSize: 10 * 1024 * 1024, // 10MB for images
    allowedTypes: ['image/', '.jpg', '.jpeg', '.png', '.webp'],
    ...options,
  });
};

export const useProfileMediaUpload = (options?: Partial<UseFileUploadOptions>) => {
  return useFileUpload({
    bucket: 'profile-media',
    maxFileSize: 10 * 1024 * 1024, // 10MB for images
    allowedTypes: ['image/', '.jpg', '.jpeg', '.png', '.webp'],
    ...options,
  });
};

export const useMerchImageUpload = (options?: Partial<UseFileUploadOptions>) => {
  return useFileUpload({
    bucket: 'merch-images',
    maxFileSize: 10 * 1024 * 1024, // 10MB for images
    allowedTypes: ['image/', '.jpg', '.jpeg', '.png', '.webp'],
    ...options,
  });
};