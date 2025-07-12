"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiSettings, FiUser, FiUserPlus, FiCamera } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  AppointmentCardProps,
  AppointmentStatus,
  statusConfigs,
} from "./types";
import { TransactionService, AuditLogService } from "../../../../../../../client";
import { FaCar, FaDotCircle } from "react-icons/fa";
import TicketInfoDialog from "./ticket-info-dialog";
import { WorkerAssignmentDialog } from "./worker-assignment-dialog";
import { PhotoUploadDialog } from "./photo-upload-dialog";
import { toast } from "sonner";

export function AppointmentsCard({
  appointment,
  status,
  movingItemId,
  handleStatusChange,
  formatTime,
  openDetailsDrawer,
  onRefresh,
}: AppointmentCardProps) {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isWorkerDialogOpen, setIsWorkerDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [timerActive, setTimerActive] = useState(false);

  const currentStatus = statusConfigs[status];
  const showInfoButton =
    status === "stageOne" || status === "stageTwo" || status === "stageThree";

  useEffect(() => {
    if (
      status === "stageOne" ||
      status === "stageTwo" ||
      status === "stageThree"
    ) {
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStatusChangeClick = async (
    from: AppointmentStatus,
    to: AppointmentStatus
  ) => {
    try {
      // Fetch current stage images using the API to get real-time data
      const currentStageImages = await TransactionService.transactionControllerGetTransactionImages({
        id: appointment.id,
        stage: from,
      });
      
      // Check if there are images for the current stage
      if (!currentStageImages || currentStageImages.length === 0) {
        let stageDisplayName = "";
        switch (from) {
          case "scheduled":
            stageDisplayName = "Scheduled";
            break;
          case "stageOne":
            stageDisplayName = "Phase 1";
            break;
          case "stageTwo":
            stageDisplayName = "Phase 2";
            break;
          case "stageThree":
            stageDisplayName = "Phase 3";
            break;
        }
        
        toast.error(`Images required for ${stageDisplayName}`, {
          description: `Please upload at least one image for the current ${stageDisplayName} stage before proceeding to the next phase. Use the camera button to upload photos.`,
          duration: 6000,
        });
        return;
      }
    } catch (error) {
      console.error("Failed to check stage images:", error);
      toast.error("Failed to validate images", {
        description: "Please try again",
        duration: 3000,
      });
      return;
    }

    // Check if technicians are assigned to the current stage before allowing progression
    try {
      const assignments = await AuditLogService.auditLogControllerGetTransactionAssignments({
        transactionId: appointment.id,
      });
      
      // Check if there are technicians assigned to the current stage
      const currentStageAssignments = assignments.filter((assignment: any) => 
        assignment.stage === from || assignment.phase === from
      );
      
      if (!currentStageAssignments || currentStageAssignments.length === 0) {
        let stageDisplayName = "";
        switch (from) {
          case "scheduled":
            stageDisplayName = "Scheduled";
            break;
          case "stageOne":
            stageDisplayName = "Phase 1";
            break;
          case "stageTwo":
            stageDisplayName = "Phase 2";
            break;
          case "stageThree":
            stageDisplayName = "Phase 3";
            break;
        }
        
        toast.error(`Technician required for ${stageDisplayName}`, {
          description: `Please assign at least one technician to the current ${stageDisplayName} stage before proceeding to the next phase. Use the "Add Worker" button to assign technicians.`,
          duration: 6000,
        });
        return;
      }
    } catch (error) {
      console.error("Failed to check technician assignments:", error);
      toast.error("Failed to validate technician assignments", {
        description: "Please try again",
        duration: 3000,
      });
      return;
    }

    try {
      toast.loading("Updating status...", { id: `status-${appointment.id}` });
      await handleStatusChange(appointment.id, from, to);

      let successMessage = "Status updated successfully";
      if (to === "stageOne") successMessage = "Successfully started Phase 1";
      if (to === "stageTwo") successMessage = "Successfully moved to Phase 2";
      if (to === "stageThree") successMessage = "Successfully moved to Phase 3";
      if (to === "completed") successMessage = "Job completed successfully";

      toast.success(successMessage, {
        id: `status-${appointment.id}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Status change error:", error);

      // Enhanced error handling for backend validation errors
      let errorMessage = "Failed to update status";
      let errorDescription = "An unexpected error occurred";

      if (error instanceof Error) {
        errorDescription = error.message;

        // Check if it's a backend validation error
        if (error.message.includes("images are required")) {
          errorMessage = "Image requirement not met";
        }
      }

      toast.error(errorMessage, {
        id: `status-${appointment.id}`,
        description: errorDescription,
        duration: 6000,
      });
    }
  };

  const getTimeDisplay = () => {
    if (!timerActive) return null;

    const updatedAtTime = new Date(appointment.updatedAt).getTime();
    const elapsedSeconds = Math.floor((currentTime - updatedAtTime) / 1000);
    const fifteenMinutesInSeconds = 15 * 60;

    if (elapsedSeconds < fifteenMinutesInSeconds) {
      const remainingSeconds = fifteenMinutesInSeconds - elapsedSeconds;
      return {
        time: remainingSeconds,
        isCountUp: false,
        isOverdue: false,
      };
    } else {
      const overtimeSeconds = elapsedSeconds - fifteenMinutesInSeconds;
      return {
        time: overtimeSeconds,
        isCountUp: true,
        isOverdue: true,
      };
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const timeDisplay = getTimeDisplay();

  return (
    <>
      <motion.div
        key={appointment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: movingItemId === appointment.id ? 0.5 : 1,
          y: 0,
          scale: movingItemId === appointment.id ? 0.95 : 1,
        }}
        exit={{ opacity: 0, x: status === "completed" ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg shadow-sm flex flex-col gap-1 p-3 mb-3 border-l-4 ${
          currentStatus.borderColor
        } hover:shadow-md transition-shadow ${
          timeDisplay
            ? timeDisplay.isOverdue
              ? "bg-red-100 text-red-700"
              : timeDisplay.time <= 300
              ? "bg-orange-100 text-orange-700"
              : "bg-white"
            : "bg-white"
        }`}
      >
        <div className="flex justify-between">
          <div>
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <FiUser className="mr-1 h-3 w-3" />
              {appointment.customer.fName} {appointment.customer.lName}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {showInfoButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => {
                  setIsInfoDialogOpen(true);
                }}
              >
                <FiSettings className="h-3 w-3" />
              </Button>
            )}
            {/* Camera icon button for photo upload (all statuses except completed) */}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <FaCar className="mr-1 h-3 w-3" />
            {appointment.car.brand.name} {appointment.car.model.name}
          </div>
          {status !== "completed" && (
            <button
              className="h-5 w-5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors flex items-center justify-center"
              onClick={() => setIsPhotoDialogOpen(true)}
              disabled={!!movingItemId}
              title="Upload Photos"
            >
              <FiCamera className="h-3 w-3" />
            </button>
          )}
        </div>
        {appointment.OTP && (
          <div className="flex text-[0.65rem] font-bold text-gray-600 px-1.5 py-0.5 rounded">
            OTP: {appointment.OTP}
          </div>
        )}
        <div className="flex justify-between items-center mt-1">
          {timeDisplay ? (
            <span
              className={`text-[0.65rem] px-1.5 py-0.5 rounded ${
                timeDisplay.isOverdue
                  ? "bg-red-100 text-red-700"
                  : timeDisplay.time <= 300
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {timeDisplay.isCountUp ? "+" : ""}
              {formatCountdown(timeDisplay.time)}
            </span>
          ) : (
            <span className="text-[0.65rem] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              {currentStatus.timePrefix}
              {formatTime(
                status === "scheduled"
                  ? appointment.createdAt
                  : appointment.updatedAt
              )}
            </span>
          )}
          <span className="text-[0.65rem] text-gray-500">
            {appointment.service.name}
          </span>
        </div>

        {appointment.deliverTime && (
          <div className="mt-1 text-[0.65rem] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
            Delivered at: {appointment.deliverTime}
          </div>
        )}

        <div className="mt-2 flex space-x-1.5">
          {currentStatus.hasNext ? (
            <button
              className={`flex-1 py-0.5 ${currentStatus.buttonColor} text-xs rounded transition-colors flex items-center justify-center`}
              onClick={() =>
                handleStatusChangeClick(status, currentStatus.nextStatus)
              }
              disabled={!!movingItemId}
            >
              {movingItemId === appointment.id ? (
                <span className="inline-flex items-center justify-center">
                  <FaDotCircle className="mr-1 h-2.5 w-2.5" />
                  Moving...
                </span>
              ) : (
                <>
                  {currentStatus.icon}
                  {currentStatus.actionText}
                </>
              )}
            </button>
          ) : (
            openDetailsDrawer && (
              <button
                className={`flex-1 py-0.5 ${currentStatus.buttonColor} text-xs rounded transition-colors flex items-center justify-center`}
                onClick={() => openDetailsDrawer(appointment)}
              >
                {currentStatus.icon}
                {currentStatus.actionText}
              </button>
            )
          )}
          {/* Show Add Worker button for all non-completed tickets */}
          {status !== "completed" && (
            <button
              className="py-0.5 px-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center justify-center"
              onClick={() => setIsWorkerDialogOpen(true)}
              disabled={!!movingItemId}
            >
              <FiUserPlus className="mr-1 h-2.5 w-2.5" />
              Add Worker
            </button>
          )}
        </div>
      </motion.div>

      <TicketInfoDialog
        isOpen={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        appointment={appointment}
      />

      <WorkerAssignmentDialog
        isOpen={isWorkerDialogOpen}
        onOpenChange={setIsWorkerDialogOpen}
        appointment={appointment}
        onSuccess={onRefresh}
      />

      <PhotoUploadDialog
        isOpen={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        appointment={appointment}
        onRefresh={onRefresh}
      />
    </>
  );
}
