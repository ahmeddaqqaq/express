"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionResponse } from "../../../../../../../client";
import { TechnicianAssignment } from "./technician-assignment";

interface WorkerAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
  onSuccess?: () => void;
}

export function WorkerAssignmentDialog({
  isOpen,
  onOpenChange,
  appointment,
  onSuccess,
}: WorkerAssignmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Assign Workers
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <TechnicianAssignment 
            appointment={appointment} 
            onSuccess={() => {
              onSuccess?.();
              onOpenChange(false);
            }}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}