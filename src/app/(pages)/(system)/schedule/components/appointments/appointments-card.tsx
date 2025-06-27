"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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

  const currentStatus = statusConfigs[status];
  const showInfoButton =
    status === "stageOne" || status === "stageTwo" || status === "stageThree";

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
        className={`bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 ${currentStatus.borderColor} hover:shadow-md transition-shadow`}
      >
        <div className="flex justify-between">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <FiUser className="mr-1" />
              {appointment.customer.fName} {appointment.customer.lName}
            </div>
          </div>
          {showInfoButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setIsDialogOpen(true);
              }}
            >
              <FiSettings className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FaCar className="mr-1" />
          {appointment.car.brand.name} {appointment.car.model.name}
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {currentStatus.timePrefix}
            {formatTime(
              status === "scheduled"
                ? appointment.createdAt
                : appointment.updatedAt
            )}
          </span>
          <span className="text-xs text-gray-500">
            {appointment.service.name}
          </span>
        </div>

        {appointment.deliverTime && (
          <div className="mt-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
            Delivered at: {appointment.deliverTime}
          </div>
        )}

        <div className="mt-3 flex space-x-2">
          {currentStatus.hasNext ? (
            <button
              className={`flex-1 py-1 ${currentStatus.buttonColor} text-sm rounded transition-colors flex items-center justify-center`}
              onClick={() =>
                handleStatusChangeClick(status, currentStatus.nextStatus)
              }
              disabled={!!movingItemId}
            >
              {movingItemId === appointment.id ? (
                <span className="inline-flex items-center justify-center">
                  <FaDotCircle className="mr-1" />
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
                className={`flex-1 py-1 ${currentStatus.buttonColor} text-sm rounded transition-colors flex items-center justify-center`}
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
