"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
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
  phase: z.enum(['stageOne', 'stageTwo', 'stageThree'], {
    required_error: "Please select a phase",
  }),
});

interface PhaseTechnicianAssignmentProps {
  appointment: TransactionResponse;
  onSuccess?: () => void;
}

export function PhaseTechnicianAssignment({
  appointment,
  onSuccess,
}: PhaseTechnicianAssignmentProps) {
  const [technicians, setTechnicians] = useState<TechnicianResponse[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicianId: "",
      phase: "stageOne",
    },
  });

  useEffect(() => {
    fetchTechnicians();
    fetchAssignments();
  }, [appointment.id]);

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

  const fetchAssignments = async () => {
    try {
      const resp = await TransactionService.transactionControllerGetTransactionAssignments({
        id: appointment.id
      });
      setAssignments(resp);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const assignTechnician = async (values: z.infer<typeof formSchema>) => {
    setIsAssigning(true);
    try {
      await TransactionService.transactionControllerAssignTechnicianToPhase({
        requestBody: {
          transactionId: appointment.id,
          technicianId: values.technicianId,
          phase: values.phase as AssignTechnicianToPhaseDto.phase,
        },
      });

      toast.success("Technician assigned successfully");
      await fetchAssignments();
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to assign technician", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getAssignedTechnician = (phase: string) => {
    return assignments.find(a => a.phase === phase && a.isActive);
  };

  const phaseLabels = {
    stageOne: 'Phase 1',
    stageTwo: 'Phase 2', 
    stageThree: 'Phase 3'
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        Phase Technician Assignment
      </h3>

      {/* Current Assignments */}
      <div className="mb-6 space-y-3">
        <h4 className="font-medium text-gray-700">Current Assignments</h4>
        {Object.entries(phaseLabels).map(([phase, label]) => {
          const assignment = getAssignedTechnician(phase);
          return (
            <div key={phase} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="font-medium">{label}</span>
              {assignment ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                    {assignment.technician?.fName?.charAt(0)}{assignment.technician?.lName?.charAt(0)}
                  </div>
                  <span className="text-sm">
                    {assignment.technician?.fName} {assignment.technician?.lName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Not assigned</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(assignTechnician)} className="space-y-4">
          <FormField
            control={form.control}
            name="phase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phase</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a phase" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="stageOne">Phase 1</SelectItem>
                    <SelectItem value="stageTwo">Phase 2</SelectItem>
                    <SelectItem value="stageThree">Phase 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technicianId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technician</FormLabel>
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

          <Button type="submit" disabled={isAssigning} className="w-full">
            {isAssigning ? "Assigning..." : "Assign Technician"}
          </Button>
        </form>
      </Form>
    </div>
  );
}