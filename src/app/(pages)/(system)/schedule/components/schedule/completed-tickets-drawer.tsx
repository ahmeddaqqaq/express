import { AnimatePresence } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
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
  movingItemId: string | null;
  handleStatusChange: (
    id: string,
    from: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed",
    to: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed"
  ) => Promise<void>;
  formatTime: (dateString: string) => string;
  openDetailsDrawer: (transaction: TransactionResponse) => void;
}

export function CompletedTicketsDrawer({
  isOpen,
  onOpenChange,
  completed,
  movingItemId,
  handleStatusChange,
  formatTime,
  openDetailsDrawer,
}: CompletedTicketsDrawerProps) {
  return (
    <Drawer open={isOpen} direction="right" onOpenChange={onOpenChange}>
      <DrawerContent className="h-[100vh] w-[400px]">
        <div className="mx-auto w-full max-w-md h-full flex flex-col">
          <DrawerHeader className="border-b shrink-0">
            <DrawerTitle className="text-xl font-bold flex items-center">
              <FiCheckCircle className="mr-2 text-green-500" />
              Completed Tickets
            </DrawerTitle>
            <DrawerDescription>
              {completed.length} completed tickets today
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto flex-1">
            <AnimatePresence>
              {completed.map((appointment) => (
                <AppointmentsCard
                  key={appointment.id}
                  appointment={appointment}
                  status="completed"
                  movingItemId={movingItemId}
                  handleStatusChange={handleStatusChange}
                  formatTime={formatTime}
                  openDetailsDrawer={openDetailsDrawer}
                />
              ))}
            </AnimatePresence>
            
            {completed.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FiCheckCircle className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-center">No completed tickets today</p>
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