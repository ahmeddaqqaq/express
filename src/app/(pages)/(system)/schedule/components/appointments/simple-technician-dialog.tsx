"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  TechnicianResponse,
  TechnicianService,
  TransactionResponse,
  TransactionService,
  AssignTechnicianToPhaseDto
} from "../../../../../../../client";

const formSchema = z.object({
  technicianId: z.string().min(1, "Please select a technician"),
});

interface SimpleTechnicianDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
  onSuccess?: () => void;
}

export function SimpleTechnicianDialog({
  isOpen,
  onOpenChange,
  appointment,
  onSuccess,
}: SimpleTechnicianDialogProps) {
  const [technicians, setTechnicians] = useState<TechnicianResponse[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicianId: "",
    },
  });

  // Get current phase from appointment status
  const getCurrentPhase = () => {
    switch (appointment.status) {
      case "stageOne": return "stageOne";
      case "stageTwo": return "stageTwo";
      case "stageThree": return "stageThree";
      default: return null;
    }
  };

  const currentPhase = getCurrentPhase();

  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
      fetchCurrentAssignment();
    }
  }, [isOpen, appointment.id]);

  const fetchTechnicians = async () => {
    try {
      const resp = await TechnicianService.technicianControllerFindMany({
        search: "",
        skip: 0,
        take: 100,
      });
      setTechnicians(resp.data);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      toast.error("Failed to load technicians");
    }
  };

  const fetchCurrentAssignment = async () => {
    try {
      const assignments = await TransactionService.transactionControllerGetTransactionAssignments({
        id: appointment.id
      });
      const current = assignments.find(a => a.phase === currentPhase && a.isActive);
      setCurrentAssignment(current);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const assignTechnician = async (values: z.infer<typeof formSchema>) => {
    if (!currentPhase) return;
    
    setIsAssigning(true);
    try {
      await TransactionService.transactionControllerAssignTechnicianToPhase({
        requestBody: {
          transactionId: appointment.id,
          technicianId: values.technicianId,
          phase: currentPhase as AssignTechnicianToPhaseDto.phase,
        },
      });

      toast.success("Technician assigned successfully");
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to assign technician", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case "stageOne": return "Phase 1";
      case "stageTwo": return "Phase 2";
      case "stageThree": return "Phase 3";
      default: return "Current Phase";
    }
  };

  if (!currentPhase) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Assign Technician to {getPhaseLabel()}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* Current Assignment */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Current Assignment</h4>
            {currentAssignment ? (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                  {currentAssignment.technician?.fName?.charAt(0)}{currentAssignment.technician?.lName?.charAt(0)}
                </div>
                <span className="text-sm">
                  {currentAssignment.technician?.fName} {currentAssignment.technician?.lName}
                </span>
                <span className="text-xs text-gray-500">
                  (Assigned {new Date(currentAssignment.assignedAt).toLocaleDateString()})
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">No technician assigned</span>
            )}
          </div>

          {/* Assignment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(assignTechnician)} className="space-y-4">
              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Technician for {getPhaseLabel()}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a technician" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.fName} {technician.lName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAssigning}>
                  {isAssigning ? "Assigning..." : "Assign Technician"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}