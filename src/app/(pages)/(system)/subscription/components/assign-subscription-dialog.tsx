"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  CustomerService,
  SubscriptionService,
  CustomerResponse,
  SubscriptionResponseDto,
} from "../../../../../../client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerSearchField } from "../../schedule/components/customer-search-field";
import { CarSearchField } from "../../schedule/components/car-search-field";

interface AssignSubscriptionDialogProps {
  subscriptions: SubscriptionResponseDto[];
  onSuccess?: () => void;
}

export default function AssignSubscriptionDialog({
  subscriptions,
  onSuccess,
}: AssignSubscriptionDialogProps) {
  const methods = useForm({
    defaultValues: {
      customerId: "",
      carId: "",
      subscriptionId: "",
    },
  });

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customerItemsPerPage] = useState(5);
  const [customerTotalCount, setCustomerTotalCount] = useState(0);

  // Fetch customers with search and pagination
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const skip = (customerCurrentPage - 1) * customerItemsPerPage;
        const resp = await CustomerService.customerControllerFindMany({
          skip,
          take: customerItemsPerPage,
          search: customerSearchQuery || "",
        });
        setCustomers(resp.data);
        setCustomerTotalCount(resp.rows || resp.data.length);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
        setCustomerTotalCount(0);
      }
    };
    fetchCustomers();
  }, [customerSearchQuery, customerCurrentPage]);

  const [open, setOpen] = useState(false);

  const assignSubscription = async (values: any) => {
    try {
      await SubscriptionService.subscriptionControllerPurchaseSubscription({
        requestBody: {
          subscriptionId: values.subscriptionId,
          customerId: values.customerId,
          carId: values.carId,
        },
      });

      // Close dialog first
      setOpen(false);

      // Reset form
      methods.reset();

      // Trigger table refresh
      onSuccess?.();

      // Show success message
      alert("Subscription assigned successfully!");
    } catch (error) {
      console.error("Error assigning subscription:", error);
      alert("Failed to assign subscription.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Assign Subscription</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Subscription</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(assignSubscription)}
              className="space-y-4"
            >
              {/* Customer Selection */}
              <CustomerSearchField
                customers={customers}
                searchQuery={customerSearchQuery}
                onSearchChange={setCustomerSearchQuery}
                currentPage={customerCurrentPage}
                totalCount={customerTotalCount}
                itemsPerPage={customerItemsPerPage}
                onPageChange={setCustomerCurrentPage}
              />

              {/* Car Selection */}
              <CarSearchField customers={customers} />

              {/* Subscription Selection */}
              <FormField
                control={methods.control}
                name="subscriptionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subscription..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptions.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Assign</Button>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
