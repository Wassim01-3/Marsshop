import { useState, useCallback } from "react";

interface UseImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFiles = 5,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        };
      }

      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
        };
      }

      return { valid: true };
    },
    [allowedTypes, maxSize],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult> => {
      const validation = validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate file upload progress
        const uploadPromise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              setUploadProgress(progress);
              if (progress >= 100) {
                clearInterval(interval);
                resolve(reader.result as string);
              }
            }, 100);
          };
          reader.readAsDataURL(file);
        });

        const url = await uploadPromise;

        return { success: true, url };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile],
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      if (files.length > maxFiles) {
        return [
          {
            success: false,
            error: `Too many files. Maximum ${maxFiles} files allowed.`,
          },
        ];
      }

      const results = await Promise.all(files.map(uploadFile));
      return results;
    },
    [uploadFile, maxFiles],
  );

  const createImagePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    validateFile,
    createImagePreview,
    isUploading,
    uploadProgress,
  };
};

export default useImageUpload;
