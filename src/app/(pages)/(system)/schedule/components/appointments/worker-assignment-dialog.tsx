"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionResponse } from "../../../../../../../client";
import { PhaseTechnicianAssignment } from "./phase-technician-assignment";
import { PhaseImagesDisplay } from "./phase-images-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <Tabs defaultValue="technicians" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="technicians">Technician Assignment</TabsTrigger>
              <TabsTrigger value="images">Phase Images</TabsTrigger>
            </TabsList>
            
            <TabsContent value="technicians" className="mt-4">
              <PhaseTechnicianAssignment 
                appointment={appointment} 
                onSuccess={() => {
                  onSuccess?.();
                }}
              />
            </TabsContent>
            
            <TabsContent value="images" className="mt-4">
              <PhaseImagesDisplay 
                appointment={appointment}
              />
            </TabsContent>
          </Tabs>
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