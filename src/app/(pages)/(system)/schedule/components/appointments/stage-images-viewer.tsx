"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiCamera,
  FiUser,
  FiClock,
  FiImage,
  FiRefreshCw,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TransactionService, AuditLogService, TransactionResponse } from "../../../../../../../client";
import { toast } from "sonner";
import { ImageDialog } from "./image-dialog";
import { UploadedFile } from "./types";

interface StageImagesViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
}

interface StageImageData {
  stage: string;
  displayName: string;
  images: Array<{
    id?: string;
    key?: string;
    url?: string;
    isActive?: boolean;
    uploadedAtStage?: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
  }>;
  technicians: Array<{
    id: string;
    fName: string;
    lName: string;
    assignedAt: string;
  }>;
}

export function StageImagesViewer({
  isOpen,
  onOpenChange,
  appointment,
}: StageImagesViewerProps) {
  const [stageData, setStageData] = useState<StageImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedStageImages, setSelectedStageImages] = useState<UploadedFile[]>([]);

  const stages = [
    { key: "scheduled", displayName: "Scheduled" },
    { key: "stageOne", displayName: "Phase 1" },
    { key: "stageTwo", displayName: "Phase 2" },
    { key: "stageThree", displayName: "Phase 3" },
    { key: "completed", displayName: "Completed" },
  ];

  useEffect(() => {
    if (isOpen && appointment.id) {
      fetchStageData();
    }
  }, [isOpen, appointment.id]);

  const fetchStageData = async () => {
    setIsLoading(true);
    try {
      // Fetch images grouped by stage
      const imagesGrouped = await TransactionService.transactionControllerGetTransactionImagesGrouped({
        id: appointment.id,
      });

      // Fetch technician assignments
      const assignments = await AuditLogService.auditLogControllerGetTransactionAssignments({
        transactionId: appointment.id,
      });

      // Process data for each stage
      const processedStageData: StageImageData[] = stages.map(stage => {
        const stageImages = imagesGrouped[stage.key] || [];
        const stageTechnicians = assignments.filter((assignment: any) => 
          assignment.stage === stage.key || assignment.phase === stage.key
        ).map((assignment: any) => ({
          id: assignment.technician?.id || assignment.technicianId,
          fName: assignment.technician?.fName || "",
          lName: assignment.technician?.lName || "",
          assignedAt: assignment.assignedAt || assignment.createdAt || assignment.timeStamp,
        }));

        return {
          stage: stage.key,
          displayName: stage.displayName,
          images: stageImages,
          technicians: stageTechnicians,
        };
      });

      setStageData(processedStageData);
    } catch (error) {
      console.error("Failed to fetch stage data:", error);
      toast.error("Failed to load stage data", {
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStageStatus = (stage: StageImageData) => {
    if (stage.images.length > 0) {
      return { color: "bg-green-100 text-green-800 border-green-200", text: "✓ Complete" };
    } else {
      return { color: "bg-red-100 text-red-800 border-red-200", text: "⚠ No Images" };
    }
  };

  const handleImageClick = (stageImages: any[], imageIndex: number) => {
    const convertedImages: UploadedFile[] = stageImages.map((img, index) => ({
      id: img.id || `img-${index}`,
      file: { name: `Image ${index + 1}`, size: 0 } as File,
      preview: img.url || '',
      progress: 100,
      status: 'success' as const,
    }));
    
    setSelectedStageImages(convertedImages);
    setSelectedImageIndex(imageIndex);
    setImageDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiImage className="h-6 w-6 text-blue-600" />
            Work Progress by Stage
          </DialogTitle>
          <div className="text-sm text-gray-600">
            {appointment.customer.fName} {appointment.customer.lName} - {appointment.car.brand.name} {appointment.car.model.name}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading stage data...
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {stageData.map((stage, index) => {
              const status = getStageStatus(stage);
              const isCurrentStage = appointment.status === stage.stage;
              
              return (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${
                    isCurrentStage ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {stage.displayName}
                        {isCurrentStage && (
                          <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </h3>
                      <Badge className={`border ${status.color}`}>
                        {status.text}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {stage.images.length} image{stage.images.length !== 1 ? 's' : ''} • {stage.technicians.length} technician{stage.technicians.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Images Section */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FiCamera className="h-4 w-4" />
                        Work Images
                      </h4>
                      {stage.images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {stage.images.map((image, imageIndex) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt={`${stage.displayName} work photo ${imageIndex + 1}`}
                                className="w-full h-20 object-cover rounded border hover:opacity-80 transition-opacity cursor-pointer"
                                onClick={() => handleImageClick(stage.images, imageIndex)}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all" />
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                {imageIndex + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                          <FiCamera className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No images uploaded for this stage</p>
                        </div>
                      )}
                    </div>

                    {/* Technicians Section */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FiUsers className="h-4 w-4" />
                        Assigned Technicians
                      </h4>
                      {stage.technicians.length > 0 ? (
                        <div className="space-y-2">
                          {stage.technicians.map((technician, techIndex) => {
                            const assignedTime = formatDate(technician.assignedAt);
                            return (
                              <div
                                key={`${technician.id}-${techIndex}`}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                                  {technician.fName.charAt(0)}{technician.lName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{technician.fName} {technician.lName}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <FiClock className="h-3 w-3" />
                                    Assigned: {assignedTime.date} at {assignedTime.time}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                          <FiUser className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No technicians assigned to this stage</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <FiX className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button variant="outline" onClick={fetchStageData} disabled={isLoading}>
            <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </DialogContent>

      <ImageDialog
        isOpen={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        images={selectedStageImages}
        currentIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
      />
    </Dialog>
  );
}