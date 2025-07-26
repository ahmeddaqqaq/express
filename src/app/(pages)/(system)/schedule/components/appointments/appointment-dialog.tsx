"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppointmentStatus, UploadedFile } from "./types";
import { useState } from "react";
import { FiPackage, FiTool, FiUsers, FiUser } from "react-icons/fi";
import { TransactionResponse } from "../../../../../../../client";
import { ImageUpload } from "./image-upload";

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Check if images are required for the current status transition
  const imagesRequired =
    pendingStatusChange?.from === "scheduled" ||
    pendingStatusChange?.from === "stageOne" ||
    pendingStatusChange?.from === "stageTwo" ||
    pendingStatusChange?.from === "stageThree";

  // Check if the action button should be disabled
  const isActionDisabled = () => {
    // Disable if already moving
    if (movingItemId) return true;

    // Disable if images are required but none uploaded
    if (imagesRequired && uploadedFiles.length === 0) return true;

    return false;
  };

  const handleConfirm = async () => {
    // Additional validation if needed
    if (imagesRequired && uploadedFiles.length === 0) {
      // You could show a toast message here
      console.warn("Please upload at least one image before proceeding");
      return;
    }

    await onConfirmStatusChange();
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
                    <FiUser className="text-gray-500" />
                    Supervisor
                  </h4>
                  {appointment.createdBy ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        {appointment.createdBy.firstName?.charAt(0)}
                        {appointment.createdBy.lastName?.charAt(0)}
                      </div>
                      <span className="font-medium">
                        {appointment.createdBy.firstName}{" "}
                        {appointment.createdBy.lastName}
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-400 italic p-2 bg-white rounded-lg">
                      No supervisor assigned
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUsers className="text-gray-500" />
                    Phase Assignments
                  </h4>
                  {appointment.assignments &&
                  appointment.assignments.length > 0 ? (
                    <div className="space-y-2">
                      {appointment.assignments
                        .filter((assignment) => assignment.isActive)
                        .map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center gap-3 p-2 bg-white rounded-lg"
                          >
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              {assignment.technician?.fName?.charAt(0)}
                              {assignment.technician?.lName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">
                                {assignment.technician?.fName}{" "}
                                {assignment.technician?.lName}
                              </span>
                              <div className="text-xs text-gray-500">
                                {assignment.phase === "stageOne"
                                  ? "Phase One"
                                  : assignment.phase === "stageTwo"
                                  ? "Phase Two"
                                  : assignment.phase === "stageThree"
                                  ? "Phase Three"
                                  : "Unknown Phase"}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic p-2 bg-white rounded-lg">
                      No technicians assigned
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

          {/* Second Column: Image Upload */}
          <div className="w-1/2 space-y-6">
            <ImageUpload
              appointment={appointment}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
            {imagesRequired && uploadedFiles.length === 0 && (
              <div className="text-red-500 text-sm mt-2">
                Please upload at least 15 images before proceeding to the next
                phase.
              </div>
            )}
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
