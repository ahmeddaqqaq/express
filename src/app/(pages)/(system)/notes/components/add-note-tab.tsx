"use client";

import { useState, useRef } from "react";
import { 
  FiUploadCloud, 
  FiX, 
  FiImage, 
  FiCheck,
  FiSave 
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DailyNotesService } from "../../../../../../client";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

interface AddNoteTabProps {
  onNoteCreated: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
  "image/heic",
];

export default function AddNoteTab({ onNoteCreated }: AddNoteTabProps) {
  const [note, setNote] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 5MB. Current size: ${(
        file.size / 1024 / 1024
      ).toFixed(1)}MB`;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed";
    }

    return null;
  };

  const processFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      let convertedFile = file;

      if (file.type === "image/heic") {
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
        progress: 100,
        status: "success",
      };
    } catch (error) {
      toast.error(`Failed to convert ${file.name}`, {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = async (files: FileList) => {
    const newFiles: UploadedFile[] = [];

    const processPromises = Array.from(files).map(processFile);
    const processedFiles = await Promise.all(processPromises);

    processedFiles.forEach((processed) => {
      if (processed) newFiles.push(processed);
    });

    if (newFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...newFiles]);
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

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setIsSubmitting(true);
    try {
      if (uploadedFiles.length > 0) {
        const formData = {
          note: note.trim(),
          images: uploadedFiles.map(f => f.file)
        };

        await DailyNotesService.dailyNoteControllerCreateWithImages({
          formData
        });
      } else {
        await DailyNotesService.dailyNoteControllerCreate({
          requestBody: {
            note: note.trim()
          }
        });
      }

      toast.success("Note created successfully");
      setNote("");
      setUploadedFiles([]);
      onNoteCreated();
    } catch (error) {
      console.error("Failed to create note:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create note";
      toast.error("Failed to create note", {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = note.trim().length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiSave className="h-5 w-5" />
            Create New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Note Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Note Content *
            </label>
            <Textarea
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {note.length} characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <FiImage className="text-gray-600" />
              Attach Images (Optional)
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
                    Selected Files ({uploadedFiles.length})
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
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCheck className="h-4 w-4 text-green-500" />
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="gap-2"
            >
              <FiSave className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Note"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}