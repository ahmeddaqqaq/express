"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiMoreVertical } from "react-icons/fi";
import {
  ReservationResponseDto,
  ReservationsService,
  CustomerService,
} from "../../../../../client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSearchField } from "../schedule/components/customer-search-field";

const scheduleFormSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  datetime: z.string().min(1, "Please select a date and time"),
  notes: z.string().optional(),
});

const updateFormSchema = z.object({
  datetime: z.string().min(1, "Please select a date and time"),
  notes: z.string().optional(),
});

export default function Bookings() {
  const [bookings, setBookings] = useState<ReservationResponseDto[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<ReservationResponseDto | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customerTotalCount, setCustomerTotalCount] = useState(0);
  const customerItemsPerPage = 10;

  const scheduleForm = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      customerId: "",
      datetime: "",
      notes: "",
    },
  });

  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      datetime: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [customerSearchQuery, customerCurrentPage]);

  async function fetchBookings() {
    setIsLoading(true);
    try {
      const resp = await ReservationsService.reservationControllerFindAll({});
      setBookings(resp);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCustomers() {
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
  }

  async function onScheduleSubmit(values: z.infer<typeof scheduleFormSchema>) {
    try {
      await ReservationsService.reservationControllerCreate({
        requestBody: {
          customerId: values.customerId,
          datetime: values.datetime,
          notes: values.notes || "",
        },
      });

      setIsScheduleDialogOpen(false);
      scheduleForm.reset();
      fetchBookings();
      toast.success("Booking scheduled successfully!");
    } catch (error: any) {
      console.error("Error creating booking:", error);

      // Extract error message from API response
      const errorMessage =
        error?.body?.message ||
        error?.message ||
        "Failed to create booking. Please try again.";

      toast.error(errorMessage);
    }
  }

  async function onUpdateSubmit(values: z.infer<typeof updateFormSchema>) {
    if (!selectedBooking) return;

    try {
      await ReservationsService.reservationControllerUpdate({
        id: selectedBooking.id,
        requestBody: {
          datetime: values.datetime,
          notes: values.notes,
        },
      });

      setIsUpdateDialogOpen(false);
      updateForm.reset();
      fetchBookings();
      toast.success("Booking updated successfully!");
    } catch (error: any) {
      console.error("Error updating booking:", error);

      const errorMessage =
        error?.body?.message ||
        error?.message ||
        "Failed to update booking. Please try again.";

      toast.error(errorMessage);
    }
  }

  async function handleDeactivate() {
    if (!selectedBooking) return;

    try {
      await ReservationsService.reservationControllerDelete({
        id: selectedBooking.id,
      });

      setIsDeactivateDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings();
      toast.success("Booking deactivated successfully!");
    } catch (error: any) {
      console.error("Error deactivating booking:", error);

      const errorMessage =
        error?.body?.message ||
        error?.message ||
        "Failed to deactivate booking. Please try again.";

      toast.error(errorMessage);
    }
  }

  async function handleMarkAsDone(bookingId: string) {
    try {
      await ReservationsService.reservationControllerUpdate({
        id: bookingId,
        requestBody: {
          markAsDone: true,
        },
      });

      fetchBookings();
      toast.success("Booking marked as done!");
    } catch (error: any) {
      console.error("Error marking as done:", error);

      const errorMessage =
        error?.body?.message ||
        error?.message ||
        "Failed to mark booking as done. Please try again.";

      toast.error(errorMessage);
    }
  }

  function openUpdateDialog(booking: ReservationResponseDto) {
    setSelectedBooking(booking);
    updateForm.reset({
      datetime: booking.datetime,
      notes: booking.notes || "",
    });
    setIsUpdateDialogOpen(true);
  }

  function openDeactivateDialog(booking: ReservationResponseDto) {
    setSelectedBooking(booking);
    setIsDeactivateDialogOpen(true);
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scheduled Bookings</h1>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="w-5 h-5 text-white mr-2" />
              <span className="font-medium text-white">SCHEDULE</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Booking</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new booking
              </DialogDescription>
            </DialogHeader>
            <Form {...scheduleForm}>
              <form
                onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)}
                className="space-y-4"
              >
                <CustomerSearchField
                  customers={customers}
                  searchQuery={customerSearchQuery}
                  onSearchChange={setCustomerSearchQuery}
                  currentPage={customerCurrentPage}
                  totalCount={customerTotalCount}
                  itemsPerPage={customerItemsPerPage}
                  onPageChange={setCustomerCurrentPage}
                />
                <FormField
                  control={scheduleForm.control}
                  name="datetime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <Input type="datetime-local" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={scheduleForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <Textarea {...field} placeholder="Add any notes..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsScheduleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Booking</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bookings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4b3526]"></div>
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border bg-white">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {booking.customer?.fName} {booking.customer?.lName}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FiMoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openUpdateDialog(booking)}>
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeactivateDialog(booking)}
                        className="text-red-600"
                      >
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {new Date(booking.datetime).toLocaleString()}
                  </p>
                </div>
                {booking.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm">
                    {booking.markAsDone ? (
                      <span className="text-green-600 font-medium">Completed</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Pending</span>
                    )}
                  </p>
                </div>
                {!booking.markAsDone && (
                  <Button
                    onClick={() => handleMarkAsDone(booking.id)}
                    className="w-full"
                    variant="outline"
                  >
                    Mark as Done
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookings found</p>
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking</DialogTitle>
            <DialogDescription>
              Update the booking details below
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={updateForm.control}
                name="datetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <Input type="datetime-local" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <Textarea {...field} placeholder="Add any notes..." />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Booking</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the booking. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
