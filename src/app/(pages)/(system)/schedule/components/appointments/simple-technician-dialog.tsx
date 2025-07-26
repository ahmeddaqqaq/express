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
import { Checkbox } from "@/components/ui/checkbox";
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
  technicianIds: z.array(z.string()).min(1, "Please select at least one technician"),
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
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicianIds: [],
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
      fetchCurrentAssignments();
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

  const fetchCurrentAssignments = async () => {
    try {
      const assignments = await TransactionService.transactionControllerGetTransactionAssignments({
        id: appointment.id
      });
      const current = assignments.filter(a => a.phase === currentPhase && a.isActive);
      setCurrentAssignments(current);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const assignTechnicians = async (values: z.infer<typeof formSchema>) => {
    if (!currentPhase) return;
    
    setIsAssigning(true);
    try {
      await TransactionService.transactionControllerAssignTechnicianToPhase({
        requestBody: {
          transactionId: appointment.id,
          technicianIds: values.technicianIds,
          phase: currentPhase as AssignTechnicianToPhaseDto.phase,
        },
      });

      toast.success(`${values.technicianIds.length} technician${values.technicianIds.length > 1 ? 's' : ''} assigned successfully`);
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to assign technicians", {
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
            Assign Technicians to {getPhaseLabel()}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* Current Assignments */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Current Assignments</h4>
            {currentAssignments.length > 0 ? (
              <div className="space-y-2">
                {currentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                      {assignment.technician?.fName?.charAt(0)}{assignment.technician?.lName?.charAt(0)}
                    </div>
                    <span className="text-sm">
                      {assignment.technician?.fName} {assignment.technician?.lName}
                    </span>
                    <span className="text-xs text-gray-500">
                      (Assigned {new Date(assignment.assignedAt).toLocaleDateString()})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">No technicians assigned</span>
            )}
          </div>

          {/* Assignment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(assignTechnicians)} className="space-y-4">
              <FormField
                control={form.control}
                name="technicianIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Technicians for {getPhaseLabel()}</FormLabel>
                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
                      {technicians.map((technician) => (
                        <FormField
                          key={technician.id}
                          control={form.control}
                          name="technicianIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={technician.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(technician.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, technician.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== technician.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal cursor-pointer">
                                    {technician.fName} {technician.lName}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
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
                  {isAssigning ? "Assigning..." : "Assign Technicians"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}