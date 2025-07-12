"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppointmentStatus } from "./types";
import { FiPackage, FiTool, FiUsers } from "react-icons/fi";
import { TransactionResponse } from "../../../../../../../client";
import { toast } from "sonner";

interface AppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
  pendingStatusChange: {
    from: AppointmentStatus;
    to: AppointmentStatus;
  } | null;
  onConfirmStatusChange: () => Promise<void>;
  movingItemId: string | null;
  status: AppointmentStatus;
}

export function AppointmentDialog({
  isOpen,
  onOpenChange,
  appointment,
  pendingStatusChange,
  onConfirmStatusChange,
  movingItemId,
  status,
}: AppointmentDialogProps) {

  // Check required images based on backend validation rules
  const getRequiredImages = () => {
    if (!pendingStatusChange) return 0;
    
    const { from, to } = pendingStatusChange;
    
    if (from === "scheduled" && to === "stageOne") return 4;
    if (from === "stageOne" && to === "stageTwo") return 1;
    if (from === "stageTwo" && to === "stageThree") return 1;
    if (from === "stageThree" && to === "completed") return 1;
    
    return 0;
  };

  const requiredImages = getRequiredImages();
  const imagesRequired = requiredImages > 0;

  // Check if the action button should be disabled
  const isActionDisabled = () => {
    // Disable if already moving
    if (movingItemId) return true;

    // Check current images (only existing ones since upload is separate)
    const currentImages = appointment.images?.length || 0;
    
    // Disable if required images not met
    if (imagesRequired && currentImages < requiredImages) return true;

    return false;
  };

  const handleConfirm = async () => {
    // Additional validation based on backend requirements
    const currentImages = appointment.images?.length || 0;
    
    if (imagesRequired && currentImages < requiredImages) {
      toast.error("Images required", {
        description: `Please upload at least ${requiredImages} image${requiredImages > 1 ? 's' : ''} before proceeding. Currently have ${currentImages} image${currentImages !== 1 ? 's' : ''}. Use the camera button on the card to upload photos.`,
        duration: 6000,
      });
      return;
    }

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
      <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {pendingStatusChange?.to === "stageOne"
              ? "Start Phase 1 - Confirmation"
              : pendingStatusChange?.to === "stageTwo"
              ? "Move to Phase 2 - Confirmation"
              : pendingStatusChange?.to === "stageThree"
              ? "Move to Phase 3 - Confirmation"
              : pendingStatusChange?.to === "completed"
              ? "Complete Job - Confirmation"
              : status === "stageOne"
              ? "Stage One Details"
              : status === "stageTwo"
              ? "Stage Two Details"
              : "Stage Three Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 p-4">
          {/* First Column: Appointment Info */}
          <div className="w-1/2 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Appointment Information
              </h3>

              <div className="space-y-5">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUsers className="text-gray-500" />
                    Technicians ({appointment.status})
                  </h4>
                  {appointment.technicians?.length > 0 ? (
                    <ul className="space-y-2 pl-1">
                      {appointment.technicians.map((e) => (
                        <li
                          key={e.id}
                          className="flex items-center gap-3 p-2 bg-white rounded-lg"
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {e.fName.charAt(0)}
                            {e.lName.charAt(0)}
                          </div>
                          <span className="font-medium">
                            {e.fName} {e.lName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400 italic p-2 bg-white rounded-lg">
                      No technicians assigned to {appointment.status}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiPackage className="text-gray-500" />
                    Add-Ons
                  </h4>
                  {appointment.addOns.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {appointment.addOns.map((e) => (
                        <span
                          key={e.id}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                        >
                          {e.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic p-2 bg-white rounded-lg">
                      No add-ons selected
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiTool className="text-gray-500" />
                    Service
                  </h4>
                  <div className="p-3 bg-white rounded-lg font-medium">
                    {appointment.service.name}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Column: Image Status */}
          <div className="w-1/2 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Photo Requirements
              </h3>
              
              {imagesRequired ? (
                <div className={`p-4 rounded-lg border-2 ${(() => {
                  const currentImages = appointment.images?.length || 0;
                  const remaining = Math.max(0, requiredImages - currentImages);
                  return remaining > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50';
                })()}`}>
                  <div className={`text-sm font-medium ${(() => {
                    const currentImages = appointment.images?.length || 0;
                    const remaining = Math.max(0, requiredImages - currentImages);
                    return remaining > 0 ? 'text-red-700' : 'text-green-700';
                  })()}`}>
                    {(() => {
                      const currentImages = appointment.images?.length || 0;
                      const remaining = Math.max(0, requiredImages - currentImages);
                      
                      if (remaining > 0) {
                        return `⚠️ ${remaining} more image${remaining !== 1 ? 's' : ''} required`;
                      }
                      
                      return `✅ Image requirement met`;
                    })()}
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-2">
                    Current: {appointment.images?.length || 0} / Required: {requiredImages}
                  </div>
                  
                  {(() => {
                    const currentImages = appointment.images?.length || 0;
                    const remaining = Math.max(0, requiredImages - currentImages);
                    
                    if (remaining > 0) {
                      return (
                        <div className="text-xs text-gray-600 mt-2 italic">
                          💡 Use the camera button on the card to upload photos
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  No photo requirements for this transition
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialog Footer with Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            {pendingStatusChange ? "Cancel" : "Close"}
          </Button>
          {pendingStatusChange && (
            <Button
              onClick={handleConfirm}
              className="px-6"
              disabled={isActionDisabled()}
            >
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
    </Dialog>
  );
}
