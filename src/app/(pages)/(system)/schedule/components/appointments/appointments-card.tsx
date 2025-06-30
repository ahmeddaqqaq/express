"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiSettings, FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  AppointmentCardProps,
  AppointmentStatus,
  statusConfigs,
} from "./types";
import { FaCar, FaDotCircle } from "react-icons/fa";
import { AppointmentDialog } from "./appointment-dialog";

export function AppointmentsCard({
  appointment,
  status,
  movingItemId,
  handleStatusChange,
  formatTime,
  openDetailsDrawer,
}: AppointmentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    from: AppointmentStatus;
    to: AppointmentStatus;
  } | null>(null);
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
    if (
      (from === "scheduled" && to === "stageOne") ||
      (from === "stageOne" && to === "stageTwo") ||
      (from === "stageTwo" && to === "stageThree")
    ) {
      setPendingStatusChange({ from, to });
      setIsDialogOpen(true);
    } else {
      await handleStatusChange(appointment.id, from, to);
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
        className={`rounded-lg shadow-sm p-3 mb-3 border-l-4 ${
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
        <div className="flex justify-between ">
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
              className="h-5 w-5"
              onClick={() => {
                setIsDialogOpen(true);
              }}
            >
              <FiSettings className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <FaCar className="mr-1 h-3 w-3" />
          {appointment.car.brand.name} {appointment.car.model.name}
        </div>
        <div className="flex justify-between items-center mt-1">
          {/* Updated time display with countdown/count-up */}
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
        </div>
      </motion.div>

      <AppointmentDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
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
            setIsDialogOpen(false);
          }
        }}
        movingItemId={movingItemId}
        status={status}
      />
    </>
  );
}
