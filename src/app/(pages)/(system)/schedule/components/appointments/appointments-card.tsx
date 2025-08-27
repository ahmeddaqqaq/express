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
        className={`rounded-xl shadow-sm p-3 mb-2 border border-gray-200 hover:shadow-md transition-all ${getCardBackgroundColor()} ${
          currentStatus.borderColor.includes("blue")
            ? "border-l-blue-500"
            : currentStatus.borderColor.includes("purple")
            ? "border-l-purple-500"
            : currentStatus.borderColor.includes("orange")
            ? "border-l-orange-500"
            : currentStatus.borderColor.includes("green")
            ? "border-l-green-500"
            : ""
        } border-l-4`}
      >
        <div className="flex flex-col space-y-2 relative">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Customer Info */}
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-1.5 rounded-full flex-shrink-0">
                  <FiUser className="h-3 w-3 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {appointment.customer.fName} {appointment.customer.lName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate break-all">
                    {appointment.customer.mobileNumber}
                  </p>
                </div>
              </div>

              {/* Customer Status Badges */}
              {appointment.customer.isBlacklisted && (
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {appointment.customer.isBlacklisted && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[0.6rem] font-bold rounded-full animate-pulse flex-shrink-0">
                      BLACKLISTED
                    </span>
                  )}
                  {/* Blacklist Toggle Button */}
                  {appointment.customer.isBlacklisted ? (
                    <button
                      className="px-2 py-0.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[0.6rem] rounded-full transition-all font-medium flex-shrink-0"
                      onClick={handleBlacklistToggle}
                      disabled={isTogglingBlacklist}
                    >
                      {isTogglingBlacklist ? "..." : "Remove"}
                    </button>
                  ) : (
                    <button
                      className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 text-[0.6rem] rounded-full transition-all flex-shrink-0"
                      onClick={handleBlacklistToggle}
                      disabled={isTogglingBlacklist}
                    >
                      {isTogglingBlacklist ? "..." : "Blacklist"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions Menu */}
            {showInfoButton && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full flex-shrink-0 ${
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
                  <FiInfo className="h-3 w-3" />
                ) : (
                  <FiSettings className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>

          {/* OTP Display (only for completed) - Positioned absolutely */}
          {appointment.OTP && status === "completed" && (
            <div className="absolute top-2 right-2 bg-gradient-to-br from-gray-900 to-gray-700 text-white px-2 py-1 rounded-lg text-center shadow-md z-10 max-w-[80px] overflow-hidden">
              <div className="text-[0.6rem] text-gray-300 uppercase tracking-wider">
                OTP
              </div>
              <div className="text-sm font-bold tracking-wider font-mono truncate">
                {appointment.OTP}
              </div>
            </div>
          )}

          {/* Notes Warning */}
          {appointment.notes &&
            appointment.notes.trim() !== "" &&
            appointment.notes !== "No Notes" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1.5 rounded-lg">
                <div className="flex items-center gap-1">
                  <span className="text-amber-600 text-xs">⚠️</span>
                  <span className="font-medium text-xs">Has notes</span>
                </div>
              </div>
            )}

          {/* Vehicle & Service Card */}
          <div className="bg-gray-50 rounded-lg p-2 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              {/* Vehicle Logo */}
              <div className="flex-shrink-0">
                {appointment.car.brand.logoUrl ? (
                  <img
                    src={appointment.car.brand.logoUrl}
                    alt={appointment.car.brand.name}
                    className="h-8 w-8 object-contain rounded bg-white p-0.5"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                ) : null}
                <FaCar
                  className={`h-8 w-8 text-gray-400 ${
                    appointment.car.brand.logoUrl ? "hidden" : ""
                  }`}
                />
              </div>

              {/* Vehicle & Service Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {appointment.car.brand.name} {appointment.car.model.name}
                </h4>
                <p className="text-xs text-gray-600 truncate break-words">
                  {appointment.service.name}
                </p>
                <p className="text-[0.6rem] text-gray-500 mt-0.5 truncate">
                  {appointment.car.year} • {appointment.car.color}
                </p>
              </div>
            </div>
          </div>

          {/* Status & Info Section */}
          <div className="space-y-1.5">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-1">
              {assignedTechnician && (
                <div className="flex items-center text-[0.6rem] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                  <FiUser className="mr-1 h-2 w-2 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">
                    {assignedTechnician.fName} {assignedTechnician.lName}
                  </span>
                </div>
              )}

              {timeDisplay ? (
                <div
                  className={`flex items-center text-[0.6rem] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    timeDisplay.isOverdue
                      ? "bg-red-100 text-red-700 animate-pulse"
                      : timeDisplay.time <= 300
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <FiClock className="mr-1 h-2 w-2 flex-shrink-0" />
                  {timeDisplay.isCountUp ? "+" : ""}
                  {formatCountdown(timeDisplay.time)}
                </div>
              ) : (
                <div className="flex items-center text-[0.6rem] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  <FiClock className="mr-1 h-2 w-2 flex-shrink-0" />
                  <span className="truncate">
                    {currentStatus.timePrefix}
                    {formatTime(
                      status === "scheduled"
                        ? appointment.createdAt
                        : appointment.updatedAt
                    )}
                  </span>
                </div>
              )}

              {appointment.isPaid && (
                <div className="flex items-center text-[0.6rem] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                  <FiDollarSign className="mr-1 h-2 w-2 flex-shrink-0" />
                  PAID
                </div>
              )}

              {appointment.isPulled && (
                <div className="flex items-center text-[0.6rem] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                  <FiTruck className="mr-1 h-2 w-2 flex-shrink-0" />
                  PULLED
                </div>
              )}

              {appointment.deliverTime && (
                <div className="flex items-center text-[0.6rem] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                  <FiTruck className="mr-1 h-2 w-2 flex-shrink-0" />
                  <span className="truncate max-w-[60px]">{appointment.deliverTime}</span>
                </div>
              )}
            </div>

            {/* Add-ons */}
            {appointment.addOns && appointment.addOns.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {appointment.addOns.map((addOn, index) => (
                  <div
                    key={addOn.id}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded text-[0.6rem] font-semibold shadow-sm animate-pulse flex-shrink-0"
                    style={{
                      animationDelay: `${index * 0.3}s`,
                      animationDuration: "2s",
                    }}
                  >
                    <span className="truncate max-w-[100px]">{addOn.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Meta Info */}
            {appointment.createdByUser && (
              <div className="text-[0.6rem] text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded overflow-hidden">
                <FiUser className="mr-1 h-2 w-2 flex-shrink-0" />
                <span className="truncate">
                  Created by {appointment.createdByUser.name || "Unknown"}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-1">
            {/* Primary Action Button */}
            {(status === "scheduled" ||
              status === "stageOne" ||
              status === "stageTwo" ||
              status === "stageThree") && (
              <Button
                variant="default"
                className={`flex-1 min-w-0 h-8 ${currentStatus.buttonColor} rounded-lg font-medium text-xs shadow-sm hover:shadow transition-all`}
                onClick={() =>
                  status === "scheduled"
                    ? handleStatusChangeClick(
                        status,
                        currentStatus.hasNext
                          ? currentStatus.nextStatus
                          : status
                      )
                    : currentStatus.hasNext
                    ? handleStatusChangeClick(status, currentStatus.nextStatus)
                    : handleStatusChangeClick(status, "completed")
                }
                disabled={!!movingItemId}
              >
                {movingItemId === appointment.id ? (
                  <>
                    <FaDotCircle className="h-3 w-3 animate-spin mr-1" />
                    <span className="truncate">Moving...</span>
                  </>
                ) : (
                  <>
                    <FiArrowRight className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {status === "scheduled"
                        ? "Phase 1"
                        : status === "stageOne"
                        ? "Phase 2"
                        : status === "stageTwo"
                        ? "Phase 3"
                        : "Complete"}
                    </span>
                  </>
                )}
              </Button>
            )}

            {/* Secondary Action Buttons */}
            {(status === "scheduled" ||
              status === "stageOne" ||
              status === "stageTwo" ||
              status === "stageThree") && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-emerald-400 hover:bg-emerald-500 text-white border-0 rounded-lg shadow-sm hover:shadow flex-shrink-0"
                  onClick={() => setIsImageDialogOpen(true)}
                  disabled={!!movingItemId}
                  title="Add Images"
                >
                  <FiImage className="h-3 w-3" />
                </Button>

                {(status === "stageOne" ||
                  status === "stageTwo" ||
                  status === "stageThree") && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-blue-400 hover:bg-blue-500 text-white border-0 rounded-lg shadow-sm hover:shadow flex-shrink-0"
                    onClick={() => setIsTechnicianDialogOpen(true)}
                    disabled={!!movingItemId}
                    title="Assign Technician"
                  >
                    <FiUserPlus className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-orange-400 hover:bg-orange-500 text-white border-0 rounded-lg shadow-sm hover:shadow flex-shrink-0"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={!!movingItemId}
                  title="Edit Order"
                >
                  <FiEdit className="h-3 w-3" />
                </Button>
              </>
            )}

            {/* Cancel Button */}
            {status === "scheduled" && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-red-400 hover:bg-red-500 text-white border-0 rounded-lg shadow-sm hover:shadow flex-shrink-0"
                onClick={handleCancelClick}
                disabled={!!movingItemId || isCancelling}
                title="Cancel Order"
              >
                {isCancelling ? (
                  <div className="animate-spin rounded-full h-2.5 w-2.5 border-t-2 border-white"></div>
                ) : (
                  <FiX className="h-3 w-3" />
                )}
              </Button>
            )}
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
