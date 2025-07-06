"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiUser, FiMail } from "react-icons/fi";
import { FaCar, FaIdCard } from "react-icons/fa";
import { GiCarDoor } from "react-icons/gi";
import { IoMdColorPalette } from "react-icons/io";
import { BsCalendarDate } from "react-icons/bs";
import { TransactionResponse } from "../../../../../../../client";

interface TicketInfoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
}

export default function TicketInfoDialog({
  isOpen,
  onOpenChange,
  appointment,
}: TicketInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Information Section */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm flex items-center">
              <FiUser className="mr-2 h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <FiUser className="mr-2 h-4 w-4 opacity-70" />
                <span>
                  {appointment.customer.fName} {appointment.customer.lName}
                </span>
              </div>
              <div className="flex items-center">
                <FiMail className="mr-2 h-4 w-4 opacity-70" />
                <span>{appointment.customer.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* Car Information Section */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm flex items-center">
              <FaCar className="mr-2 h-4 w-4" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <FaCar className="mr-2 h-4 w-4 opacity-70" />
                <span>
                  {appointment.car.brand.name} {appointment.car.model.name}
                </span>
              </div>
              <div className="flex items-center">
                <FaIdCard className="mr-2 h-4 w-4 opacity-70" />
                <span>{appointment.car.plateNumber}</span>
              </div>
              <div className="flex items-center">
                <GiCarDoor className="mr-2 h-4 w-4 opacity-70" />
                <span>{appointment.car.year}</span>
              </div>
              <div className="flex items-center">
                <IoMdColorPalette className="mr-2 h-4 w-4 opacity-70" />
                <span>{appointment.car.color}</span>
              </div>
            </div>
          </div>

          {/* Service Information Section */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm flex items-center">
              <BsCalendarDate className="mr-2 h-4 w-4" />
              Service Information
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="col-span-2 flex items-center">
                <span className="font-medium mr-2">Service:</span>
                <span>{appointment.service.name}</span>
              </div>
              {appointment.notes && (
                <div className="col-span-2">
                  <p className="font-medium">Notes:</p>
                  <p className="text-sm text-gray-600">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {appointment.OTP && (
            <div className="p-3 bg-gray-100 rounded-md text-center">
              <p className="text-sm font-medium">One-Time Password</p>
              <p className="text-2xl font-bold">{appointment.OTP}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
