"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);
  const currentImage = images[currentIndex];

  const goToPrevious = useCallback(() => {
    setIsCurrentLoaded(false);
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  }, [currentIndex, images.length, onIndexChange]);

  const goToNext = useCallback(() => {
    setIsCurrentLoaded(false);
    onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, images.length, onIndexChange]);

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen || images.length <= 1) return;

    const preloadIndexes = [
      currentIndex > 0 ? currentIndex - 1 : images.length - 1,
      currentIndex < images.length - 1 ? currentIndex + 1 : 0,
    ];

    const preloadLinks: HTMLLinkElement[] = [];
    preloadIndexes.forEach((idx) => {
      const url = images[idx]?.preview;
      if (url) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "image";
        link.href = url;
        document.head.appendChild(link);
        preloadLinks.push(link);
      }
    });

    return () => {
      preloadLinks.forEach((link) => link.remove());
    };
  }, [isOpen, currentIndex, images]);

  // Reset loaded state when image changes
  useEffect(() => {
    setIsCurrentLoaded(false);
  }, [currentIndex]);

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

        <div className="relative flex-1 flex items-center justify-center p-4 pt-0 min-h-[40vh]">
          {/* Loading skeleton */}
          {!isCurrentLoaded && (
            <div className="absolute inset-4 top-0 flex items-center justify-center">
              <div className="w-full h-full max-h-[70vh] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              </div>
            </div>
          )}

          <img
            key={currentImage.preview}
            src={currentImage.preview}
            alt={currentImage.file.name}
            className={`max-w-full max-h-[70vh] object-contain rounded-lg transition-opacity duration-200 ${
              isCurrentLoaded ? "opacity-100" : "opacity-0"
            }`}
            decoding="async"
            onLoad={() => setIsCurrentLoaded(true)}
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
            <div className="flex justify-center mt-3 gap-1 flex-wrap">
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
