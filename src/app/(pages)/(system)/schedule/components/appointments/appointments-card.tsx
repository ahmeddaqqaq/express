"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FiSettings,
  FiUser,
  FiUserPlus,
  FiDollarSign,
  FiEdit,
  FiInfo,
  FiX,
  FiImage,
  FiClock,
  FiTruck,
  FiArrowRight,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  TransactionService,
  CustomerService,
} from "../../../../../../../client";
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
import { getErrorMessage } from "@/lib/error-handler";

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
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState("");
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    from: AppointmentStatus;
    to: AppointmentStatus;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [timerActive, setTimerActive] = useState(false);
  const [assignedTechnician, setAssignedTechnician] = useState<any>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [isTogglingBlacklist, setIsTogglingBlacklist] = useState(false);

  const currentStatus = statusConfigs[status];
  const showInfoButton = true; // Show on all statuses

  useEffect(() => {
    // Get the current phase's technician assignment
    const getCurrentPhaseAssignment = () => {
      const phaseMap = {
        scheduled: "scheduled",
        stageOne: "stageOne",
        stageTwo: "stageTwo",
        stageThree: "stageThree",
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
        const images =
          await TransactionService.transactionControllerGetTransactionImages({
            id: appointment.id,
            stage: "scheduled",
          });

        if (!images || images.length === 0) {
          alert("Please upload at least one image before moving to Phase 1.");
          return;
        }

        await handleStatusChange(appointment.id, from, to);
      } catch (error) {
        console.error("Error checking images:", error);
        alert(getErrorMessage(error));
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

  const handleCancelClick = () => {
    setCancelNotes("");
    setIsCancelConfirmOpen(true);
  };

  const handleCancelConfirm = async () => {
    // Validate that notes are provided
    if (!cancelNotes.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    setIsCancelling(true);
    setIsCancelConfirmOpen(false);

    try {
      await TransactionService.transactionControllerCancelTransaction({
        id: appointment.id,
        requestBody: {
          notes: cancelNotes.trim(),
        },
      });

      // Reset the notes
      setCancelNotes("");

      // Refresh the page data
      onRefresh?.();
    } catch (error: any) {
      console.error("Error cancelling transaction:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBlacklistToggle = async () => {
    setIsTogglingBlacklist(true);
    try {
      await CustomerService.customerControllerToggleBlacklist({
        requestBody: {
          id: appointment.customer.id,
        },
      });
      onRefresh?.();
    } catch (error) {
      console.error("Error toggling blacklist:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsTogglingBlacklist(false);
    }
  };

  const timeDisplay = getTimeDisplay();

  // Determine card background color based on technician assignment and time constraints
  const getCardBackgroundColor = () => {
    // Red background: overdue (existing logic)
    if (timeDisplay?.isOverdue) {
      return "bg-gradient-to-r from-red-50 to-red-100";
    }
    // Yellow background: time warning (existing logic)
    if (timeDisplay && timeDisplay.time <= 300) {
      return "bg-gradient-to-r from-orange-50 to-orange-100";
    }
    // Green background: technician assigned to current phase
    if (assignedTechnician) {
      return "bg-gradient-to-r from-green-50 to-emerald-50";
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
        className={`rounded-xl shadow-sm p-3 mb-2.5 border-l-4 md:border-l-6 ${
          currentStatus.borderColor
        } hover:shadow-lg transition-all ${getCardBackgroundColor()}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative">
          {/* Left Section - Main Information */}
          <div className="col-span-1 lg:col-span-7">
            {/* Customer Row with Badges and Blacklist Button */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center text-sm md:text-base font-semibold text-gray-800">
                <FiUser className="mr-1.5 h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                {appointment.customer.fName} {appointment.customer.lName}
              </div>
              {appointment.customer.isBlacklisted && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[0.65rem] md:text-xs font-bold rounded-full animate-pulse">
                  BLACKLISTED
                </span>
              )}
              {/* Blacklist Toggle Button */}
              {appointment.customer.isBlacklisted ? (
                <button
                  className="px-2 py-0.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[0.6rem] rounded-full transition-all font-medium"
                  onClick={handleBlacklistToggle}
                  disabled={isTogglingBlacklist}
                >
                  {isTogglingBlacklist ? "..." : "Remove"}
                </button>
              ) : (
                <button
                  className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 text-[0.6rem] rounded-full transition-all"
                  onClick={handleBlacklistToggle}
                  disabled={isTogglingBlacklist}
                >
                  {isTogglingBlacklist ? "..." : "Blacklist"}
                </button>
              )}
            </div>

            {/* OTP Display (only for completed) - Positioned absolutely */}
            {appointment.OTP && status === "completed" && (
              <div className="absolute bottom-3 right-3 bg-gradient-to-br from-gray-900 to-gray-700 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl text-center shadow-lg z-10">
                <div className="text-[0.55rem] md:text-xs text-gray-300 uppercase tracking-wider mb-0.5">
                  OTP Code
                </div>
                <div className="text-lg md:text-xl font-bold tracking-wider font-mono">
                  {appointment.OTP}
                </div>
              </div>
            )}

            {/* Notes Warning - Clear and Flashing */}
            {appointment.notes &&
              appointment.notes.trim() !== "" &&
              appointment.notes !== "No Notes" && (
                <div className="mb-2">
                  <div className="bg-amber-100 border-2 border-amber-400 text-amber-800 px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm animate-pulse items-center gap-2 inline-flex">
                    <span>⚠️ NOTES </span>
                  </div>
                </div>
              )}

            {/* Vehicle Info with Bigger Logo */}
            <div className="flex items-center gap-3 mb-2">
              {appointment.car.brand.logoUrl ? (
                <img
                  src={appointment.car.brand.logoUrl}
                  alt={appointment.car.brand.name}
                  className="h-12 w-12 md:h-16 md:w-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
              ) : null}
              <FaCar
                className={`h-8 w-8 md:h-10 md:w-10 text-gray-500 ${
                  appointment.car.brand.logoUrl ? "hidden" : ""
                }`}
              />
              <div className="flex-1">
                <div className="text-sm md:text-base lg:text-lg font-semibold text-gray-800">
                  {appointment.car.brand.name} {appointment.car.model.name}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  Service: {appointment.service.name}
                </div>
              </div>
            </div>

            {/* Status Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2">
              {assignedTechnician && (
                <div className="flex items-center text-[0.65rem] md:text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  <FiUser className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  {assignedTechnician.fName} {assignedTechnician.lName}
                </div>
              )}

              {timeDisplay ? (
                <div
                  className={`flex items-center text-[0.65rem] md:text-xs px-2 py-0.5 rounded-full font-bold ${
                    timeDisplay.isOverdue
                      ? "bg-red-100 text-red-700 animate-pulse"
                      : timeDisplay.time <= 300
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <FiClock className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  {timeDisplay.isCountUp ? "+" : ""}
                  {formatCountdown(timeDisplay.time)}
                </div>
              ) : (
                <div className="flex items-center text-[0.65rem] md:text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  <FiClock className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  {currentStatus.timePrefix}
                  {formatTime(
                    status === "scheduled"
                      ? appointment.createdAt
                      : appointment.updatedAt
                  )}
                </div>
              )}

              {appointment.isPaid && (
                <div className="flex items-center text-[0.65rem] md:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  <FiDollarSign className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  PAID
                </div>
              )}

              {appointment.isPulled && (
                <div className="flex items-center text-[0.65rem] md:text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                  <FiTruck className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  PULLED
                </div>
              )}

              {appointment.deliverTime && (
                <div className="flex items-center text-[0.65rem] md:text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  <FiTruck className="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  {appointment.deliverTime}
                </div>
              )}
            </div>

            {/* Add-ons with intense flashing animation */}
            {appointment.addOns && appointment.addOns.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {appointment.addOns.map((addOn, index) => (
                  <span
                    key={addOn.id}
                    className="text-sm md:text-base bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900 px-2 py-1.5 rounded-lg font-bold shadow-lg animate-pulse border-2 border-blue-400"
                    style={{
                      animationDelay: `${index * 0.3}s`,
                      animationDuration: "2s",
                    }}
                  >
                    {addOn.name}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Info */}
            {appointment.createdByUser && (
              <div className="text-[0.65rem] text-gray-500 flex items-center">
                <FiUser className="mr-1 h-2.5 w-2.5" />
                Created by {appointment.createdByUser.name || "Unknown"}
              </div>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-3.5 sm:gap-1.5">
            {/* Info Button */}
            <div className="flex justify-end mb-1">
              {showInfoButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-lg ${
                    status === "completed"
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-600"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
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
                    <FiInfo className="h-4 w-4" />
                  ) : (
                    <FiSettings className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Action Buttons based on status */}
            {status === "scheduled" ? (
              <>
                {/* Primary Action - Start Phase 1 */}
                <Button
                  variant="default"
                  size="icon"
                  className={`w-full h-12 sm:h-8 ${currentStatus.buttonColor} rounded-lg transition-all shadow-sm hover:shadow`}
                  onClick={() =>
                    handleStatusChangeClick(
                      status,
                      currentStatus.hasNext ? currentStatus.nextStatus : status
                    )
                  }
                  disabled={!!movingItemId}
                >
                  {movingItemId === appointment.id ? (
                    <FaDotCircle className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <FiArrowRight className="h-5 w-5 sm:h-4 sm:w-4" />
                  )}
                </Button>

                {/* Secondary Actions - Images and Edit */}
                <Button
                  variant="default"
                  size="icon"
                  className="w-full h-12 sm:h-8 bg-emerald-400 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm hover:shadow"
                  onClick={() => setIsImageDialogOpen(true)}
                  disabled={!!movingItemId}
                >
                  <FiImage className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  className="w-full h-12 sm:h-8 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-all shadow-sm hover:shadow"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={!!movingItemId}
                >
                  <FiEdit className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>

                {/* Cancel Button - Smaller */}
                <button
                  className="w-full py-4 px-5 sm:py-1 sm:px-2 bg-red-400 hover:bg-red-500 text-white text-base sm:text-[0.65rem] rounded-lg transition-all flex items-center justify-center shadow-sm hover:shadow"
                  onClick={handleCancelClick}
                  disabled={!!movingItemId || isCancelling}
                >
                  {isCancelling ? (
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-2.5 sm:w-2.5 border-t-2 border-white"></div>
                  ) : (
                    <>
                      <FiX className="mr-0.5 h-3 w-3 sm:h-2.5 sm:w-2.5" />
                      Cancel
                    </>
                  )}
                </button>
              </>
            ) : status === "stageOne" ||
              status === "stageTwo" ||
              status === "stageThree" ? (
              <>
                {/* Primary Action - Move to Next Phase */}
                <Button
                  variant="default"
                  size="icon"
                  className={`w-full h-12 sm:h-8 ${currentStatus.buttonColor} rounded-lg transition-all shadow-sm hover:shadow`}
                  onClick={() =>
                    currentStatus.hasNext
                      ? handleStatusChangeClick(
                          status,
                          currentStatus.nextStatus
                        )
                      : handleStatusChangeClick(status, "completed")
                  }
                  disabled={!!movingItemId}
                >
                  {movingItemId === appointment.id ? (
                    <FaDotCircle className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <FiArrowRight className="h-5 w-5 sm:h-4 sm:w-4" />
                  )}
                </Button>

                {/* Secondary Actions */}
                <Button
                  variant="default"
                  size="icon"
                  className="w-full h-12 sm:h-8 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-all shadow-sm hover:shadow"
                  onClick={() => setIsTechnicianDialogOpen(true)}
                  disabled={!!movingItemId}
                >
                  <FiUserPlus className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  className="w-full h-12 sm:h-8 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-all shadow-sm hover:shadow"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={!!movingItemId}
                >
                  <FiEdit className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
              </>
            ) : null}
          </div>
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <FiX className="mr-2 h-5 w-5" />
              Cancel Order
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to cancel this order for{" "}
              <strong>
                {appointment.customer.fName} {appointment.customer.lName}
              </strong>
              ?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                <div className="flex items-center">
                  Vehicle:
                  {appointment.car.brand.logoUrl && (
                    <img
                      src={appointment.car.brand.logoUrl}
                      alt={appointment.car.brand.name}
                      className="ml-1 mr-1 h-4 w-4 object-contain inline"
                    />
                  )}
                  {appointment.car.brand.name} {appointment.car.model.name}
                </div>
                Service: {appointment.service.name}
              </span>
              <br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
            <div className="mt-4 space-y-2">
              <Label
                htmlFor="cancel-notes"
                className="text-sm font-medium text-gray-700"
              >
                Reason for cancellation *
              </Label>
              <Textarea
                id="cancel-notes"
                placeholder="Please provide a reason for cancelling this order..."
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isCancelling}
              />
              {!cancelNotes.trim() && (
                <p className="text-xs text-red-600">This field is required</p>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling || !cancelNotes.trim()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <FiX className="mr-2 h-4 w-4" />
                  Cancel Order
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
