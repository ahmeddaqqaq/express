"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      technicianIds: [],
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

  const assignTechnicians = async (values: z.infer<typeof formSchema>) => {
    setIsAssigning(true);
    try {
      await TransactionService.transactionControllerAssignTechnicianToPhase({
        requestBody: {
          transactionId: appointment.id,
          technicianIds: values.technicianIds,
          phase: values.phase as AssignTechnicianToPhaseDto.phase,
        },
      });

      toast.success(`${values.technicianIds.length} technician${values.technicianIds.length > 1 ? 's' : ''} assigned successfully`);
      await fetchAssignments();
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to assign technicians", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getAssignedTechnicians = (phase: string) => {
    return assignments.filter(a => a.phase === phase && a.isActive);
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
          const phaseAssignments = getAssignedTechnicians(phase);
          return (
            <div key={phase} className="p-3 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{label}</span>
                <span className="text-xs text-gray-500">({phaseAssignments.length} assigned)</span>
              </div>
              {phaseAssignments.length > 0 ? (
                <div className="space-y-1">
                  {phaseAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-2">
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
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">No technicians assigned</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(assignTechnicians)} className="space-y-4">
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
            name="technicianIds"
            render={() => (
              <FormItem>
                <FormLabel>Technicians</FormLabel>
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

          <Button type="submit" disabled={isAssigning} className="w-full">
            {isAssigning ? "Assigning..." : "Assign Technicians"}
          </Button>
        </form>
      </Form>
    </div>
  );
}