"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { UploadedFile } from "./types";

interface ImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  images: UploadedFile[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function ImageDialog({
  isOpen,
  onOpenChange,
  images,
  currentIndex,
  onIndexChange,
}: ImageDialogProps) {
  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const goToNext = () => {
    onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-4xl w-full max-h-[90vh] p-0"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Image {currentIndex + 1} of {images.length}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="relative flex-1 flex items-center justify-center p-4 pt-0">
          <img
            src={currentImage.preview}
            alt={currentImage.file.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
                onClick={goToPrevious}
              >
                <FiChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black/20 hover:bg-black/40 text-white rounded-full"
                onClick={goToNext}
              >
                <FiChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        <div className="p-4 pt-0 border-t">
          {images.length > 1 && (
            <div className="flex justify-center mt-3 gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  onClick={() => onIndexChange(index)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
