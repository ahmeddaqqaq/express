"use client";

import { useState, useRef } from "react";
import {
  FiUploadCloud,
  FiX,
  FiImage,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { UploadedFile, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "./types";
import { TransactionResponse } from "../../../../../../../client";

interface ImageUploadProps {
  appointment: TransactionResponse;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (
    files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])
  ) => void;
}

export function ImageUpload({
  appointment,
  uploadedFiles,
  setUploadedFiles,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE = `${
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://lionsinternationalco.com"
  }/express/transaction`;

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 5MB. Current size: ${(
        file.size /
        1024 /
        1024
      ).toFixed(1)}MB`;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed";
    }

    return null;
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      let convertedFile = file;

      if (file.type === "image/heic") {
        // Only import when needed
        const heic2any = (await import("heic2any")).default;
        const blob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });

        convertedFile = new File(
          [blob as BlobPart],
          file.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      }

      const validationError = validateFile(convertedFile);
      if (validationError) {
        toast.error(`Invalid file: ${convertedFile.name}`, {
          description: validationError,
        });
        return null;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(convertedFile);

      return {
        id: fileId,
        file: convertedFile,
        preview,
        progress: 0,
        status: "uploading",
      };
    } catch (error) {
      toast.error(`Failed to convert ${file.name}`, {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  };

  const handleFiles = async (files: FileList) => {
    const newFiles: UploadedFile[] = [];

    // Process all files in parallel
    const processPromises = Array.from(files).map(processFile);
    const processedFiles = await Promise.all(processPromises);

    processedFiles.forEach((processed) => {
      if (processed) newFiles.push(processed);
    });

    if (newFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      // Upload all files in parallel
      const uploadPromises = newFiles.map(uploadFile);
      Promise.all(uploadPromises);
    }
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    const formData = new FormData();
    formData.append("file", uploadedFile.file);

    try {
      const xhr = new XMLHttpRequest();

      // Track real upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadedFiles((prev: UploadedFile[]) =>
            prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f))
          );
        }
      });

      const uploadPromise = new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        xhr.open("PATCH", `${API_BASE}/${appointment.id}/upload`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });

      const res = await uploadPromise;

      if (!res.ok) {
        let errorDetails = `${res.status} ${res.statusText}`;
        try {
          const errorBody = await res.text();
          if (errorBody) errorDetails += `: ${errorBody}`;
        } catch (_) {}
        throw new Error(`Upload failed: ${errorDetails}`);
      }

      setUploadedFiles((prev: UploadedFile[]) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, progress: 100, status: "success" }
            : f
        )
      );

      toast.success(`${uploadedFile.file.name} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      setUploadedFiles((prev: UploadedFile[]) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "error", error: errorMessage }
            : f
        )
      );

      toast.error(`Failed to upload ${uploadedFile.file.name}`, {
        description: errorMessage,
      });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev: UploadedFile[]) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const retryUpload = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (file) {
      setUploadedFiles((prev: UploadedFile[]) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "uploading", progress: 0, error: undefined }
            : f
        )
      );
      uploadFile(file);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
        <FiImage className="text-gray-600" />
        Work Progress Images
      </h3>

      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <FiUploadCloud
              className={`h-12 w-12 ${
                isDragOver ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drop images here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP (HEIC auto-converted) – max 5MB
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectFiles}
              className="mt-2"
            >
              Select Files
            </Button>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    {file.status === "uploading" && (
                      <div className="mt-1">
                        <Progress value={file.progress} className="h-1" />
                      </div>
                    )}
                    {file.status === "error" && file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "uploading" && (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    )}
                    {file.status === "success" && (
                      <FiCheck className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === "error" && (
                      <>
                        <FiAlertCircle className="h-4 w-4 text-red-500" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => retryUpload(file.id)}
                        >
                          <FiUploadCloud className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => removeFile(file.id)}
                    >
                      <FiX className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
