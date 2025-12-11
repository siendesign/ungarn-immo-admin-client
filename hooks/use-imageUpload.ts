import { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

interface UseImageUploadOptions {
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>;
  deleteImage: (url: string) => Promise<boolean>;
  isUploading: boolean;
  isDeleting: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export const useImageUpload = ({
  bucket,
  folder = "",
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: UseImageUploadOptions): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const reset = useCallback(() => {
    setIsUploading(false);
    setIsDeleting(false);
    setProgress(0);
    setError(null);
  }, []);

  /**
   * Extracts the file path from a Supabase storage URL
   * Example URL: https://xxx.supabase.co/storage/v1/object/public/bucket-name/folder/filename.jpg
   * Returns: folder/filename.jpg
   */
  const extractPathFromUrl = useCallback(
    (url: string): string | null => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        // Pattern: /storage/v1/object/public/{bucket}/{path}
        const publicPattern = `/storage/v1/object/public/${bucket}/`;
        const signedPattern = `/storage/v1/object/sign/${bucket}/`;

        let path: string | null = null;

        if (pathname.includes(publicPattern)) {
          path = pathname.split(publicPattern)[1];
        } else if (pathname.includes(signedPattern)) {
          path = pathname.split(signedPattern)[1];
        }

        // Decode URI components (handles spaces, special chars)
        return path ? decodeURIComponent(path) : null;
      } catch {
        console.error("Failed to parse URL:", url);
        return null;
      }
    },
    [bucket]
  );

  const deleteImage = useCallback(
    async (url: string): Promise<boolean> => {
      if (!url) {
        setError("No image URL provided");
        return false;
      }

      setError(null);
      setIsDeleting(true);

      try {
        const filePath = extractPathFromUrl(url);

        if (!filePath) {
          throw new Error("Could not extract file path from URL");
        }

        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        setIsDeleting(false);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete image";
        setError(errorMessage);
        setIsDeleting(false);
        return false;
      }
    },
    [bucket, supabase, extractPathFromUrl]
  );

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      setError(null);
      setProgress(0);

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setError(
          `Invalid file type. Allowed types: ${allowedTypes
            .map((t) => t.split("/")[1])
            .join(", ")}`
        );
        return null;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return null;
      }

      setIsUploading(true);
      setProgress(10);

      try {
        // Generate unique filename
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        setProgress(30);

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setProgress(80);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path);

        setProgress(100);
        setIsUploading(false);

        return publicUrl;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload image";
        setError(errorMessage);
        setIsUploading(false);
        return null;
      }
    },
    [bucket, folder, maxSizeMB, allowedTypes, supabase]
  );

  return {
    uploadImage,
    deleteImage,
    isUploading,
    isDeleting,
    progress,
    error,
    reset,
  };
};

export default useImageUpload;