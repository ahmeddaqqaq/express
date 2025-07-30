import { AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiX } from "react-icons/fi";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { TransactionResponse } from "../../../../../../../client";
import { AppointmentsCard } from "../appointments/appointments-card";

interface CompletedTicketsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  completed: TransactionResponse[];
  cancelled: TransactionResponse[];
  movingItemId: string | null;
  handleStatusChange: (
    id: string,
    from: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed",
    to: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed"
  ) => Promise<void>;
  formatTime: (dateString: string) => string;
}

export function CompletedTicketsDrawer({
  isOpen,
  onOpenChange,
  completed,
  cancelled,
  movingItemId,
  handleStatusChange,
  formatTime,
}: CompletedTicketsDrawerProps) {
  return (
    <Drawer open={isOpen} direction="right" onOpenChange={onOpenChange}>
      <DrawerContent className="h-[100vh] w-[400px]">
        <div className="mx-auto w-full max-w-md h-full flex flex-col">
          <DrawerHeader className="border-b shrink-0">
            <DrawerTitle className="text-xl font-bold flex items-center">
              <FiCheckCircle className="mr-2 text-green-500" />
              Completed & Cancelled Tickets
            </DrawerTitle>
            <DrawerDescription>
              {completed.length} completed, {cancelled.length} cancelled tickets today
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto flex-1">
            {/* Completed Orders Section */}
            {completed.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <h3 className="font-semibold text-green-700">Completed ({completed.length})</h3>
                </div>
                <AnimatePresence>
                  {completed.map((appointment) => (
                    <AppointmentsCard
                      key={appointment.id}
                      appointment={appointment}
                      status="completed"
                      movingItemId={movingItemId}
                      handleStatusChange={handleStatusChange}
                      formatTime={formatTime}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Cancelled Orders Section */}
            {cancelled.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <FiX className="w-4 h-4 mr-2 text-red-600" />
                  <h3 className="font-semibold text-red-700">Cancelled ({cancelled.length})</h3>
                </div>
                <AnimatePresence>
                  {cancelled.map((appointment) => (
                    <div key={appointment.id} className="relative">
                      <div className="absolute inset-0 bg-red-50 rounded-lg border-l-4 border-red-500 opacity-90"></div>
                      <div className="relative bg-red-50 border-l-4 border-red-500 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <FiX className="w-4 h-4 mr-2 text-red-600" />
                            <span className="text-sm font-medium text-red-800">CANCELLED</span>
                          </div>
                          <span className="text-xs text-red-600">
                            {formatTime(appointment.updatedAt)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 mb-1">
                          {appointment.customer.fName} {appointment.customer.lName}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {appointment.car.brand.name} {appointment.car.model.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {appointment.service.name}
                        </div>
                        {appointment.notes && (
                          <div className="text-xs text-red-700 bg-red-100 p-2 rounded border-l-2 border-red-300">
                            <span className="font-medium">Reason: </span>
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {completed.length === 0 && cancelled.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FiCheckCircle className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-center">No completed or cancelled tickets today</p>
              </div>
            )}
          </div>

          <DrawerFooter className="shrink-0 border-t">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}