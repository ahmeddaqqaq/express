"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  TechnicianResponse,
  TechnicianService,
  TransactionResponse,
  TransactionService,
} from "../../../../../../../client";
import { TechnicianSearchField } from "../technician-search-field";

const formSchema = z.object({
  technicianId: z
    .array(z.string())
    .min(1, "At least one technician is required"),
});

interface TechnicianAssignmentProps {
  appointment: TransactionResponse;
}

export function TechnicianAssignment({
  appointment,
}: TechnicianAssignmentProps) {
  const [technicians, setTechnicians] = useState<TechnicianResponse[]>([]);
  const [technicianSearchQuery, setTechnicianSearchQuery] = useState("");
  const [technicianCurrentPage, setTechnicianCurentPage] = useState(1);
  const [technicianTotalCount, setTechnicianTotalCount] = useState(0);
  const [isAssigningTechnicians, setIsAssigningTechnicians] = useState(false);
  const technicianItemsPerPage = 5;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicianId: [],
    },
  });

  async function assignTechnicians(values: z.infer<typeof formSchema>) {
    setIsAssigningTechnicians(true);
    try {
      await TransactionService.transactionControllerUpdate({
        requestBody: {
          id: appointment.id,
          technicianIds: values.technicianId,
        },
      });

      toast.success("Technicians assigned successfully");
      await fetchTechnicians();
    } catch (error) {
      toast.error("Failed to assign technicians", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsAssigningTechnicians(false);
    }
  }

  async function fetchTechnicians() {
    try {
      const skip = (technicianCurrentPage - 1) * technicianItemsPerPage;
      const resp = await TechnicianService.technicianControllerFindMany({
        search: technicianSearchQuery || "",
        skip,
        take: technicianItemsPerPage,
      });
      setTechnicians(resp.data);
      setTechnicianTotalCount(resp.rows || resp.data.length);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      toast.error("Failed to load technicians");
    }
  }

  useEffect(() => {
    fetchTechnicians();
  }, [technicianSearchQuery, technicianCurrentPage]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(assignTechnicians)}
        className="space-y-6"
      >
        <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Assign Crew
          </h3>

          <TechnicianSearchField
            technicians={technicians}
            searchQuery={technicianSearchQuery}
            onSearchChange={setTechnicianSearchQuery}
            currentPage={technicianCurrentPage}
            totalCount={technicianTotalCount}
            itemsPerPage={technicianItemsPerPage}
            onPageChange={setTechnicianCurentPage}
          />

          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={isAssigningTechnicians}>
              {isAssigningTechnicians ? "Assigning..." : "Assign Technicians"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
