"use client";

import { useState, useEffect } from "react";
import { FiCamera, FiX, FiRefreshCw } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./image-upload";
import { UploadedFile } from "./types";
import { TransactionResponse, TransactionService } from "../../../../../../../client";
import { toast } from "sonner";

interface PhotoUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
  onRefresh?: () => void;
}

export function PhotoUploadDialog({
  isOpen,
  onOpenChange,
  appointment,
  onRefresh,
}: PhotoUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentAppointment, setCurrentAppointment] =
    useState<TransactionResponse>(appointment);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Update current appointment when prop changes
  useEffect(() => {
    setCurrentAppointment(appointment);
  }, [appointment]);

  // Fetch existing images when dialog opens
  useEffect(() => {
    if (isOpen && appointment.id) {
      fetchExistingImages();
    }
  }, [isOpen, appointment.id]);

  const fetchExistingImages = async () => {
    setIsLoadingImages(true);
    try {
      const images = await TransactionService.transactionControllerGetTransactionImages({
        id: appointment.id,
      });
      setExistingImages(images);
    } catch (error) {
      console.error("Failed to fetch existing images:", error);
      toast.error("Failed to load existing images", {
        description: "Please try refreshing",
        duration: 3000,
      });
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleUploadSuccess = () => {
    // Clear uploaded files and refresh both local and parent data
    setUploadedFiles([]);
    fetchExistingImages(); // Refresh existing images immediately
    if (onRefresh) {
      onRefresh(); // Refresh parent appointment data
    }
  };

  const handleClose = () => {
    setUploadedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCamera className="h-5 w-5" />
              Upload Work Photos
            </div>
          </DialogTitle>
          <div className="text-sm text-gray-600">
            {currentAppointment.customer.fName}{" "}
            {currentAppointment.customer.lName} -{" "}
            {currentAppointment.car.brand.name}{" "}
            {currentAppointment.car.model.name}
          </div>
        </DialogHeader>

        <div className="mt-4">
          <ImageUpload
            appointment={currentAppointment}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Show existing uploaded photos */}
        {existingImages.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Previously Uploaded Photos ({existingImages.length})
            </h4>
            {isLoadingImages ? (
              <div className="flex items-center justify-center py-8">
                <FiRefreshCw className="h-5 w-5 animate-spin mr-2" />
                Loading images...
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                {existingImages.map((image, index) => (
                  <div key={image.id || index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Work photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded border hover:opacity-80 transition-opacity cursor-pointer"
                      onClick={() => window.open(image.url, "_blank")}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all" />
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                    {image.uploadedAtStage && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                        {image.uploadedAtStage === "scheduled" ? "S" : 
                         image.uploadedAtStage === "stageOne" ? "P1" :
                         image.uploadedAtStage === "stageTwo" ? "P2" :
                         image.uploadedAtStage === "stageThree" ? "P3" : "C"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <FiX className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
