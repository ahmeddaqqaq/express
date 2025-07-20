"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiSettings, FiUser, FiUserPlus, FiDollarSign, FiEdit, FiInfo } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { TransactionService } from "../../../../../../../client";
import {
  AppointmentCardProps,
  AppointmentStatus,
  statusConfigs,
} from "./types";
import { FaCar, FaDotCircle } from "react-icons/fa";
import { AppointmentDialog } from "./appointment-dialog";
import TicketInfoDialog from "./ticket-info-dialog";
import { TransactionDetailDrawer } from "./transaction-detail-drawer";
import { SimpleImageDialog } from "./simple-image-dialog";
import { SimpleTechnicianDialog } from "./simple-technician-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";

export function AppointmentsCard({
  appointment,
  status,
  movingItemId,
  handleStatusChange,
  formatTime,
  onRefresh,
}: AppointmentCardProps) {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isTechnicianDialogOpen, setIsTechnicianDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    from: AppointmentStatus;
    to: AppointmentStatus;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [timerActive, setTimerActive] = useState(false);
  const [assignedTechnician, setAssignedTechnician] = useState<any>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  const currentStatus = statusConfigs[status];
  const showInfoButton = true; // Show on all statuses

  useEffect(() => {
    // Get the current phase's technician assignment
    const getCurrentPhaseAssignment = () => {
      const phaseMap = {
        scheduled: 'scheduled',
        stageOne: 'stageOne',
        stageTwo: 'stageTwo',
        stageThree: 'stageThree'
      };
      
      const currentPhase = phaseMap[status as keyof typeof phaseMap];
      if (!currentPhase) return null;
      
      return appointment.assignments?.find(
        (assignment) => assignment.phase === currentPhase && assignment.isActive
      );
    };

    const assignment = getCurrentPhaseAssignment();
    setAssignedTechnician(assignment?.technician || null);
    
    // Only start timer if technician is assigned to current phase
    if (assignment && assignment.assignedAt) {
      setTimerActive(true);
      setTimerStartTime(new Date(assignment.assignedAt).getTime());
    } else {
      setTimerActive(false);
      setTimerStartTime(null);
    }
  }, [status, appointment.assignments]);

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
    if (
      (from === "stageOne" && to === "stageTwo") ||
      (from === "stageTwo" && to === "stageThree") ||
      (from === "stageThree" && to === "completed")
    ) {
      setPendingStatusChange({ from, to });
      setIsStatusDialogOpen(true);
    } else if (from === "scheduled" && to === "stageOne") {
      // Check if transaction has images before moving to stage 1 using API
      try {
        const images = await TransactionService.transactionControllerGetTransactionImages({
          id: appointment.id,
          stage: "scheduled"
        });
        
        if (!images || images.length === 0) {
          alert("Please upload at least one image before moving to Phase 1");
          return;
        }
        
        await handleStatusChange(appointment.id, from, to);
      } catch (error) {
        console.error("Error checking images:", error);
        alert("Error checking images. Please try again.");
        return;
      }
    } else {
      // Direct transitions without dialog (if any)
      await handleStatusChange(appointment.id, from, to);
    }
  };

  const getTimeDisplay = () => {
    if (!timerActive || !timerStartTime) return null;

    const elapsedSeconds = Math.floor((currentTime - timerStartTime) / 1000);
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

  // Determine card background color based on technician assignment and time constraints
  const getCardBackgroundColor = () => {
    // Red background: overdue (existing logic)
    if (timeDisplay?.isOverdue) {
      return "bg-red-100 text-red-700";
    }
    // Yellow background: time warning (existing logic)
    if (timeDisplay && timeDisplay.time <= 300) {
      return "bg-orange-100 text-orange-700";
    }
    // Green background: technician assigned to current phase
    if (assignedTechnician) {
      return "bg-green-50 text-green-700";
    }
    // White background: no technician assigned
    return "bg-white";
  };

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
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg shadow-sm p-3 mb-3 border-l-4 ${
          currentStatus.borderColor
        } hover:shadow-md transition-shadow ${getCardBackgroundColor()}`}
      >
        <div className="flex justify-between">
          <div>
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <FiUser className="mr-1 h-3 w-3" />
              {appointment.customer.fName} {appointment.customer.lName}
            </div>
          </div>
          {showInfoButton && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${status === "completed" ? "bg-blue-50 hover:bg-blue-100" : ""}`}
              onClick={() => {
                if (status === "completed") {
                  setIsTransactionDrawerOpen(true);
                } else {
                  setIsInfoDialogOpen(true);
                }
              }}
              title="View Details"
            >
              {status === "completed" ? (
                <FiInfo className="h-4 w-4 text-blue-600" />
              ) : (
                <FiSettings className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <FaCar className="mr-1 h-3 w-3" />
          {appointment.car.brand.name} {appointment.car.model.name}
        </div>
        {assignedTechnician && (
          <div className="flex items-center text-xs text-green-600 mb-1">
            <FiUser className="mr-1 h-3 w-3" />
            Assigned: {assignedTechnician.fName} {assignedTechnician.lName}
          </div>
        )}
        {appointment.OTP && (
          <div className="flex text-[0.65rem] font-bold text-gray-600 px-1.5 py-0.5 rounded">
            OTP: {appointment.OTP}
          </div>
        )}
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center gap-2">
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
            {/* Payment indicator for finished orders */}
            {status === "stageThree" && appointment.isPaid && (
              <span className="text-[0.65rem] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center">
                <FiDollarSign className="mr-1 h-2.5 w-2.5" />
                PAID
              </span>
            )}
          </div>
          <span className="text-[0.65rem] text-gray-500">
            {appointment.service.name}
          </span>
        </div>

        {appointment.deliverTime && (
          <div className="mt-1 text-[0.65rem] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
            Delivered at: {appointment.deliverTime}
          </div>
        )}

        <div className="mt-2 flex flex-col space-y-1">
          {/* Scheduled column - Move to Phase 1, Add Images, and Edit */}
          {status === "scheduled" ? (
            <>
              <button
                className={`py-0.5 ${currentStatus.buttonColor} text-xs rounded transition-colors flex items-center justify-center`}
                onClick={() =>
                  handleStatusChangeClick(status, currentStatus.hasNext ? currentStatus.nextStatus : status)
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
                    Move to Phase 1
                  </>
                )}
              </button>
              <div className="flex space-x-1">
                <button
                  className="flex-1 py-0.5 px-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors flex items-center justify-center"
                  onClick={() => setIsImageDialogOpen(true)}
                  disabled={!!movingItemId}
                >
                  <FiSettings className="mr-1 h-2.5 w-2.5" />
                  Add Images
                </button>
                <button
                  className="py-0.5 px-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors flex items-center justify-center"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={!!movingItemId}
                  title="Edit Order"
                >
                  <FiEdit className="h-2.5 w-2.5" />
                </button>
              </div>
            </>
          ) : status === "stageOne" || status === "stageTwo" || status === "stageThree" ? (
            /* Phase columns - Assign Technician and Move to Next Phase */
            <>
              <button
                className="py-0.5 px-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors flex items-center justify-center"
                onClick={() => setIsTechnicianDialogOpen(true)}
                disabled={!!movingItemId}
              >
                <FiUserPlus className="mr-1 h-2.5 w-2.5" />
                Assign
              </button>
              <button
                className={`flex-1 py-0.5 ${currentStatus.buttonColor} text-xs rounded transition-colors flex items-center justify-center`}
                onClick={() =>
                  currentStatus.hasNext ? handleStatusChangeClick(status, currentStatus.nextStatus) : 
                  handleStatusChangeClick(status, "completed") // For stageThree, move to completed
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
                    {status === "stageOne" ? "To Phase 2" : status === "stageTwo" ? "To Phase 3" : "Finish"}
                  </>
                )}
              </button>
            </>
          ) : null}
        </div>
      </motion.div>

      <TicketInfoDialog
        isOpen={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        appointment={appointment}
      />

      <TransactionDetailDrawer
        isOpen={isTransactionDrawerOpen}
        onOpenChange={setIsTransactionDrawerOpen}
        appointment={appointment}
      />

      <AppointmentDialog
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        appointment={appointment}
        pendingStatusChange={pendingStatusChange}
        onConfirmStatusChange={async () => {
          if (pendingStatusChange) {
            await handleStatusChange(
              appointment.id,
              pendingStatusChange.from,
              pendingStatusChange.to
            );
            setPendingStatusChange(null);
            setIsStatusDialogOpen(false);
            onRefresh?.(); // Trigger refresh after status change
          }
        }}
        movingItemId={movingItemId}
        status={status}
      />

      <SimpleImageDialog
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        appointment={appointment}
      />

      <SimpleTechnicianDialog
        isOpen={isTechnicianDialogOpen}
        onOpenChange={setIsTechnicianDialogOpen}
        appointment={appointment}
        onSuccess={onRefresh}
      />

      <EditTransactionDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        appointment={appointment}
        onSuccess={onRefresh}
      />
    </>
  );
}
