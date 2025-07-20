"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionResponse } from "../../../../../../../client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhaseTechnicianAssignment } from "./phase-technician-assignment";
import { PhaseImagesDisplay } from "./phase-images-display";
import { ImageUpload } from "./image-upload";
import { UploadedFile } from "./types";
import { useState } from "react";

interface CardActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
  defaultTab?: "images" | "technicians";
  onSuccess?: () => void;
}

export function CardActionDialog({
  isOpen,
  onOpenChange,
  appointment,
  defaultTab = "images",
  onSuccess,
}: CardActionDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const isScheduled = appointment.status === "scheduled";
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {isScheduled ? "Manage Scheduled Order" : "Manage Phase Order"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {isScheduled ? (
            // For scheduled orders, show only image upload
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add Images for Scheduled Order
              </h3>
              <ImageUpload
                appointment={appointment}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
              />
            </div>
          ) : (
            // For phase orders, show tabs for images and technician assignment
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="technicians">Assign Technician</TabsTrigger>
              </TabsList>
              
              <TabsContent value="images" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Add Images for Current Phase
                  </h3>
                  <ImageUpload
                    appointment={appointment}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      View All Phase Images
                    </h3>
                    <PhaseImagesDisplay appointment={appointment} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="technicians" className="mt-4">
                <PhaseTechnicianAssignment 
                  appointment={appointment} 
                  onSuccess={() => {
                    onSuccess?.();
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
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