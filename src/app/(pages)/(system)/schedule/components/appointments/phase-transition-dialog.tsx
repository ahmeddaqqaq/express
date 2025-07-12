"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppointmentStatus, UploadedFile } from "./types";
import { FiUser, FiCamera, FiArrowRight, FiX, FiClock } from "react-icons/fi";
import { TransactionResponse, AuditLogService } from "../../../../../../../client";
import { toast } from "sonner";
import { ImageDialog } from "./image-dialog";
import { useState, useEffect } from "react";

interface PhaseTransitionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
  pendingStatusChange: {
    from: AppointmentStatus;
    to: AppointmentStatus;
  } | null;
  onConfirmStatusChange: () => Promise<void>;
  movingItemId: string | null;
}

export function PhaseTransitionDialog({
  isOpen,
  onOpenChange,
  appointment,
  pendingStatusChange,
  onConfirmStatusChange,
  movingItemId,
}: PhaseTransitionDialogProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentStageTechnicians, setCurrentStageTechnicians] = useState<any[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  
  const getPhaseTitle = () => {
    if (!pendingStatusChange) return "";
    
    const { from, to } = pendingStatusChange;
    
    if (from === "scheduled" && to === "stageOne") return "Start Phase 1";
    if (from === "stageOne" && to === "stageTwo") return "Move to Phase 2";
    if (from === "stageTwo" && to === "stageThree") return "Move to Phase 3";
    if (from === "stageThree" && to === "completed") return "Complete Job";
    
    return "Phase Transition";
  };

  const getPhaseDescription = () => {
    if (!pendingStatusChange) return "";
    
    const { from, to } = pendingStatusChange;
    
    if (from === "scheduled" && to === "stageOne") return "Ready to begin work on this vehicle?";
    if (from === "stageOne" && to === "stageTwo") return "Move to the next phase of work?";
    if (from === "stageTwo" && to === "stageThree") return "Ready for the final phase?";
    if (from === "stageThree" && to === "completed") return "Mark this job as completed?";
    
    return "Confirm this phase transition";
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageDialogOpen(true);
  };

  const convertedImages: UploadedFile[] = appointment.images?.map((img, index) => ({
    id: img.id || `img-${index}`,
    file: { name: `Image ${index + 1}`, size: 0 } as File,
    preview: img.url || '',
    progress: 100,
    status: 'success' as const,
  })) || [];

  // Fetch technicians assigned to the current stage
  const fetchCurrentStageTechnicians = async () => {
    if (!pendingStatusChange) return;
    
    setIsLoadingTechnicians(true);
    try {
      const assignments = await AuditLogService.auditLogControllerGetTransactionAssignments({
        transactionId: appointment.id,
      });
      
      // Filter technicians assigned to the current stage (from which we're transitioning)
      const stageTechnicians = assignments.filter((assignment: any) => 
        assignment.stage === pendingStatusChange.from || 
        assignment.phase === pendingStatusChange.from ||
        assignment.status === pendingStatusChange.from
      ).map((assignment: any) => ({
        id: assignment.technician?.id || assignment.technicianId || assignment.id,
        fName: assignment.technician?.fName || assignment.fName || "Unknown",
        lName: assignment.technician?.lName || assignment.lName || "Technician",
        assignedAt: assignment.assignedAt || assignment.createdAt || assignment.timeStamp,
      }));
      
      setCurrentStageTechnicians(stageTechnicians);
    } catch (error) {
      console.error("Failed to fetch stage technicians:", error);
      setCurrentStageTechnicians([]);
    } finally {
      setIsLoadingTechnicians(false);
    }
  };

  useEffect(() => {
    if (isOpen && pendingStatusChange) {
      fetchCurrentStageTechnicians();
    }
  }, [isOpen, pendingStatusChange]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleConfirm = async () => {
    try {
      const statusName = pendingStatusChange?.to === "stageOne" ? "Phase 1" 
        : pendingStatusChange?.to === "stageTwo" ? "Phase 2"
        : pendingStatusChange?.to === "stageThree" ? "Phase 3"
        : pendingStatusChange?.to === "completed" ? "Completed"
        : "next phase";

      toast.loading(`Moving to ${statusName}...`, { id: `confirm-${appointment.id}` });
      
      await onConfirmStatusChange();
      
      toast.success(`Successfully moved to ${statusName}`, { 
        id: `confirm-${appointment.id}`,
        duration: 3000 
      });
    } catch (error) {
      console.error("Status change confirmation error:", error);
      toast.error("Failed to update status", {
        id: `confirm-${appointment.id}`,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiArrowRight className="text-blue-600" />
            {getPhaseTitle()}
          </DialogTitle>
          <p className="text-gray-600 mt-2">{getPhaseDescription()}</p>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Customer and Vehicle Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Vehicle Information</h3>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Customer:</span> {appointment.customer.fName} {appointment.customer.lName}</p>
              <p><span className="font-medium">Vehicle:</span> {appointment.car.brand.name} {appointment.car.model.name}</p>
              <p><span className="font-medium">Service:</span> {appointment.service.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assigned Technicians */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Assigned Technicians ({currentStageTechnicians.length})
              </h3>
              
              {isLoadingTechnicians ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm">Loading technicians...</p>
                </div>
              ) : currentStageTechnicians.length > 0 ? (
                <div className="space-y-3">
                  {currentStageTechnicians.map((technician, index) => {
                    const assignedTime = technician.assignedAt ? formatDate(technician.assignedAt) : null;
                    return (
                      <div
                        key={`${technician.id}-${index}`}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {technician.fName?.charAt(0) || "T"}{technician.lName?.charAt(0) || "N"}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {technician.fName} {technician.lName}
                          </p>
                          {assignedTime && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FiClock className="h-3 w-3" />
                              Assigned: {assignedTime.date} at {assignedTime.time}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiUser className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No technicians assigned yet</p>
                  <p className="text-xs text-gray-400 mt-1">Assign technicians using the "Add Worker" button</p>
                </div>
              )}
            </div>

            {/* Uploaded Photos */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCamera className="text-green-600" />
                Work Photos ({appointment.images?.length || 0})
              </h3>
              
              {appointment.images && appointment.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {appointment.images.map((image, index) => (
                    <div key={image.id || index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Work photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiCamera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No photos uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Use the camera button to upload work photos</p>
                </div>
              )}
            </div>
          </div>

          {/* Add-ons if any */}
          {appointment.addOns && appointment.addOns.length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add-ons</h3>
              <div className="flex flex-wrap gap-2">
                {appointment.addOns.map((addon) => (
                  <span
                    key={addon.id}
                    className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm"
                  >
                    {addon.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            <FiX className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          {pendingStatusChange && (
            <Button
              onClick={handleConfirm}
              className="px-6 bg-blue-600 hover:bg-blue-700"
              disabled={!!movingItemId}
            >
              <FiArrowRight className="mr-2 h-4 w-4" />
              {pendingStatusChange.to === "stageOne"
                ? "Start Phase 1"
                : pendingStatusChange.to === "stageTwo"
                ? "Move to Phase 2"
                : pendingStatusChange.to === "stageThree"
                ? "Move to Phase 3"
                : "Complete Job"}
            </Button>
          )}
        </div>
      </DialogContent>

      <ImageDialog
        isOpen={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        images={convertedImages}
        currentIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
      />
    </Dialog>
  );
}