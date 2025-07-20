"use client";

import { useEffect, useState } from "react";
import { FiImage, FiEye } from "react-icons/fi";
import { TransactionResponse, TransactionService } from "../../../../../../../client";
import { ImageDialog } from "./image-dialog";
import { UploadedFile } from "./types";

interface PhaseImagesDisplayProps {
  appointment: TransactionResponse;
}

interface PhaseImage {
  id: string;
  key: string;
  url: string;
  isActive: boolean;
  uploadedAtStage: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

type GroupedImages = Record<string, PhaseImage[]>;

export function PhaseImagesDisplay({
  appointment
}: PhaseImagesDisplayProps) {
  const [groupedImages, setGroupedImages] = useState<GroupedImages>({});
  const [selectedImages, setSelectedImages] = useState<UploadedFile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const phaseLabels = {
    scheduled: 'Scheduled',
    stageOne: 'Phase 1',
    stageTwo: 'Phase 2', 
    stageThree: 'Phase 3',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  useEffect(() => {
    fetchGroupedImages();
  }, [appointment.id]);

  const fetchGroupedImages = async () => {
    try {
      setIsLoading(true);
      const response = await TransactionService.transactionControllerGetTransactionImagesGrouped({
        id: appointment.id
      });
      setGroupedImages(response as GroupedImages);
    } catch (error) {
      console.error("Error fetching grouped images:", error);
      setGroupedImages({});
    } finally {
      setIsLoading(false);
    }
  };

  const openImageDialog = (images: PhaseImage[], startIndex: number) => {
    const uploadedFiles: UploadedFile[] = images.map((image, index) => ({
      id: `${image.id}-${index}`,
      file: new File([], 'image.jpg'), // Placeholder file
      preview: image.url,
      progress: 100,
      status: 'success' as const
    }));
    
    setSelectedImages(uploadedFiles);
    setCurrentImageIndex(startIndex);
    setIsImageDialogOpen(true);
  };

  const getTotalImageCount = () => {
    return Object.values(groupedImages).reduce((total, images) => total + images.length, 0);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
          <FiImage className="text-gray-600" />
          Phase Images ({getTotalImageCount()} total)
        </h3>

        <div className="space-y-4">
          {Object.keys(phaseLabels).map((phase) => {
            const images = groupedImages[phase] || [];
            const phaseLabel = phaseLabels[phase as keyof typeof phaseLabels];
            
            return (
              <div key={phase} className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">
                    {phaseLabel} ({images.length} images)
                  </h4>
                </div>
                
                {images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 8).map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={`${phaseLabel} image ${index + 1}`}
                          className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => openImageDialog(images, index)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center transition-all">
                          <FiEye className="text-white opacity-0 group-hover:opacity-100 h-5 w-5" />
                        </div>
                      </div>
                    ))}
                    {images.length > 8 && (
                      <div 
                        className="w-full h-20 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => openImageDialog(images, 8)}
                      >
                        <span className="text-sm text-gray-600">
                          +{images.length - 8} more
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 italic text-center py-4">
                    No images for this phase
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ImageDialog
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        images={selectedImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </>
  );
}