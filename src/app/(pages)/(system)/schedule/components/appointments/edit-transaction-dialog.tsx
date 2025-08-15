"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AddOnsResponse,
  AddOnsService,
  TransactionResponse,
  TransactionService,
} from "../../../../../../../client";
import { AddOnsField } from "../add-ons-field";
import { SalesSearchField } from "../sales-search-field";
import { getErrorMessage } from "@/lib/error-handler";
import { SalesService, SalesResponse } from "../../../../../../../client";

const editTransactionSchema = z.object({
  addOnsIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  salesPersonId: z.string().optional(),
}).refine(
  (data) => {
    if (data.addOnsIds && data.addOnsIds.length > 0) {
      return data.salesPersonId && data.salesPersonId.trim() !== "";
    }
    return true;
  },
  {
    message: "Sales person is required when add-ons are selected",
    path: ["salesPersonId"],
  }
);

type EditTransactionFormData = z.infer<typeof editTransactionSchema>;

interface EditTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
  onSuccess?: () => void;
}

export function EditTransactionDialog({
  isOpen,
  onOpenChange,
  appointment,
  onSuccess,
}: EditTransactionDialogProps) {
  const [addOns, setAddOns] = useState<AddOnsResponse[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditTransactionFormData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      addOnsIds: appointment.addOns.map(addOn => addOn.id),
      notes: appointment.notes || "",
      salesPersonId: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadAddOns();
      loadSalesPersons();
      // Reset form with current appointment data when dialog opens
      form.reset({
        addOnsIds: appointment.addOns.map(addOn => addOn.id),
        notes: appointment.notes || "",
        salesPersonId: "",
      });
    }
  }, [isOpen, appointment, form]);

  const loadAddOns = async () => {
    try {
      const response = await AddOnsService.addOnsControllerFindMany({});
      setAddOns(response.data);
    } catch (error) {
      // Error fetching add-ons - handle silently
    }
  };

  const loadSalesPersons = async () => {
    try {
      const response = await SalesService.salesControllerFindMany({
        skip: 0,
        take: 100,
        isActive: true,
      });
      setSalesPersons(response.data);
    } catch (error) {
      // Error fetching sales persons - handle silently
    }
  };


  const onSubmit = async (data: EditTransactionFormData) => {
    setIsLoading(true);
    try {
      // Update transaction with notes, add-ons, and sales person
      await TransactionService.transactionControllerEditScheduled({
        requestBody: {
          id: appointment.id,
          serviceId: appointment.service.id, // Keep the existing service
          addOnsIds: data.addOnsIds || [],
          deliverTime: appointment.deliverTime, // Keep the existing delivery time
          notes: data.notes,
          salesPersonId: data.salesPersonId, // Include sales person for addon tracking
        },
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Order - {appointment.customer.fName} {appointment.customer.lName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <AddOnsField addOns={addOns} />

              {(form.watch("addOnsIds")?.length || 0) > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Sales Person Assignment
                  </h4>
                  <p className="text-xs text-blue-700 mb-3">
                    Select who sold these add-ons to track sales commission
                  </p>
                  <SalesSearchField
                    sales={salesPersons}
                    fieldName="salesPersonId"
                    label="Sales Person"
                    placeholder="Select who added the add-ons..."
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes or instructions..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Updating..." : "Update Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}