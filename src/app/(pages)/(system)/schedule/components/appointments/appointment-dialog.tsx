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
import { FiPackage, FiTool, FiUsers } from "react-icons/fi";
import { TransactionResponse } from "../../../../../../../client";
import { TechnicianAssignment } from "./technician-assignment";
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {pendingStatusChange?.to === "stageOne"
              ? "Start Phase 1 - Confirmation"
              : pendingStatusChange?.to === "stageTwo"
              ? "Move to Phase 2 - Confirmation"
              : pendingStatusChange?.to === "stageThree" // Added Stage 3
              ? "Move to Phase 3 - Confirmation"
              : status === "stageOne"
              ? "Stage One Details"
              : status === "stageTwo"
              ? "Stage Two Details"
              : "Stage Three Details"}{" "}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-8 p-4">
          {/* Left Side: Appointment Info */}
          <div className="w-1/2 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Appointment Information
              </h3>

              <div className="space-y-5">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUsers className="text-gray-500" />
                    Technicians
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

          {/* Right Side: Technician Assignment & Image Upload */}
          <div className="w-1/2 space-y-6">
            <TechnicianAssignment appointment={appointment} />
            <ImageUpload
              appointment={appointment}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
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
              onClick={onConfirmStatusChange}
              className="px-6"
              disabled={!!movingItemId}
            >
              {pendingStatusChange.to === "stageOne"
                ? "Start Phase 1"
                : pendingStatusChange.to === "stageTwo"
                ? "Move to Phase 2"
                : "Move to Phase 3"}{" "}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
