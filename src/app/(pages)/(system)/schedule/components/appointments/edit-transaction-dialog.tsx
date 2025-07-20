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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ServiceResponse,
  ServiceService,
  AddOnsResponse,
  AddOnsService,
  TransactionResponse,
  TransactionService,
} from "../../../../../../../client";
import { ServiceSearchField } from "../service-search-field";
import { AddOnsField } from "../add-ons-field";

const editTransactionSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  addOnsIds: z.array(z.string()).optional(),
  deliverTime: z.string().optional(),
  notes: z.string().optional(),
});

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
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [addOns, setAddOns] = useState<AddOnsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditTransactionFormData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      serviceId: appointment.service.id,
      addOnsIds: appointment.addOns.map(addOn => addOn.id),
      deliverTime: appointment.deliverTime || "",
      notes: appointment.notes || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadServices();
      loadAddOns();
      // Reset form with current appointment data when dialog opens
      form.reset({
        serviceId: appointment.service.id,
        addOnsIds: appointment.addOns.map(addOn => addOn.id),
        deliverTime: appointment.deliverTime || "",
        notes: appointment.notes || "",
      });
    }
  }, [isOpen, appointment, form]);

  const loadServices = async () => {
    try {
      const resp = (await ServiceService.serviceControllerFindMany()) as unknown as ServiceResponse[];
      setServices(resp);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const loadAddOns = async () => {
    try {
      const response = await AddOnsService.addOnsControllerFindMany({});
      setAddOns(response.data);
    } catch (error) {
      console.error("Error fetching add-ons:", error);
    }
  };

  const onSubmit = async (data: EditTransactionFormData) => {
    setIsLoading(true);
    try {
      await TransactionService.transactionControllerEditScheduled({
        requestBody: {
          id: appointment.id,
          serviceId: data.serviceId,
          addOnsIds: data.addOnsIds || [],
          deliverTime: data.deliverTime,
          notes: data.notes,
        },
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction. Please try again.");
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
              {/* Service Selection */}
              <ServiceSearchField services={services} />

              {/* Add-ons Selection */}
              <AddOnsField addOns={addOns} />

              {/* Delivery Time */}
              <FormField
                control={form.control}
                name="deliverTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 2:00 PM"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
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