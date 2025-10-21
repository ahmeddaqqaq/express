"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiCalendar, FiCheckCircle, FiX } from "react-icons/fi";
import { QrCode } from "lucide-react";
import {
  TransactionResponse,
  TransactionService,
  ReservationsService,
  ReservationResponseDto,
  CustomerService,
} from "../../../../../client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getCurrentBusinessDate,
  getBusinessDayString,
  getBusinessDayInfo,
} from "@/lib/date-utils";
import { AddTicketDialog } from "./components/schedule/add-ticket-dialog";
import { ScheduleColumns } from "./components/schedule/schedule-columns";
import { CompletedTicketsDrawer } from "./components/schedule/completed-tickets-drawer";
import ScanQrDialog from "./components/scan-qr-dialog";
import SubscriptionDialog from "./components/subscription-dialog";
import { FaTicket } from "react-icons/fa6";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSearchField } from "./components/customer-search-field";

const scheduleFormSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  datetime: z.string().min(1, "Please select a date and time"),
  notes: z.string().optional(),
});

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState<string>(
    getBusinessDayString()
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    getCurrentBusinessDate()
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [scheduled, setScheduled] = useState<TransactionResponse[]>([]);
  const [stageOne, setStageOne] = useState<TransactionResponse[]>([]);
  const [stageTwo, setStageTwo] = useState<TransactionResponse[]>([]);
  const [stageThree, setStageThree] = useState<TransactionResponse[]>([]);
  const [completed, setCompleted] = useState<TransactionResponse[]>([]);
  const [cancelled, setCancelled] = useState<TransactionResponse[]>([]);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompletedDrawerOpen, setIsCompletedDrawerOpen] = useState(false);
  const [isScanQrDialogOpen, setIsScanQrDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bookings, setBookings] = useState<ReservationResponseDto[]>([]);
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isScanFromBookingOpen, setIsScanFromBookingOpen] = useState(false);
  const [isAddBookingDialogOpen, setIsAddBookingDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
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

  const handleSuccess = () => {
    console.log("handleSuccess called, refreshing kanban...");
    setRefreshKey((prev) => prev + 1);
  };

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const resp = await ReservationsService.reservationControllerFindAll({});
      setBookings(resp);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

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

  const onScheduleSubmit = async (
    values: z.infer<typeof scheduleFormSchema>
  ) => {
    try {
      await ReservationsService.reservationControllerCreate({
        requestBody: {
          customerId: values.customerId,
          datetime: values.datetime,
          notes: values.notes || "",
        },
      });

      setIsAddBookingDialogOpen(false);
      scheduleForm.reset();
      fetchBookings();
      toast.success("Booking scheduled successfully!");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage =
        error?.body?.message ||
        error?.message ||
        "Failed to create booking. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleBookingScanSuccess = async () => {
    if (selectedBookingId) {
      try {
        await ReservationsService.reservationControllerUpdate({
          id: selectedBookingId,
          requestBody: {
            markAsDone: true,
          },
        });
        toast.success("Booking marked as completed!");
        fetchBookings();
        setSelectedBookingId(null);
      } catch (error: any) {
        console.error("Error marking booking as done:", error);
        const errorMessage =
          error?.body?.message ||
          error?.message ||
          "Failed to mark booking as completed";
        toast.error(errorMessage);
      }
    }
    handleSuccess();
  };

  useEffect(() => {
    fetchCustomers();
  }, [customerSearchQuery, customerCurrentPage]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setIsLoading(true);

        const [
          scheduledRes,
          stageOneRes,
          stageTwoRes,
          stageThreeRes,
          completedRes,
          cancelledRes,
        ] = await Promise.all([
          TransactionService.transactionControllerFindScheduled({
            date: currentDate,
          }) as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageOne({
            date: currentDate,
          }) as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageTwo({
            date: currentDate,
          }) as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageThree({
            date: currentDate,
          }) as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindCompleted({
            date: currentDate,
          }) as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindCancelled({
            date: currentDate,
          }) as unknown as TransactionResponse[],
        ]);

        setScheduled(scheduledRes);
        setStageOne(stageOneRes);
        setStageTwo(stageTwoRes);
        setStageThree(stageThreeRes);
        setCompleted(completedRes);
        setCancelled(cancelledRes);

        // Calculate subscription count from all stages including completed
        const subscriptionTotal = [
          ...scheduledRes,
          ...stageOneRes,
          ...stageTwoRes,
          ...stageThreeRes,
          ...completedRes,
        ].filter((a) => a.isSubscription).length;
        setSubscriptionCount(subscriptionTotal);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setScheduled([]);
        setStageOne([]);
        setStageTwo([]);
        setStageThree([]);
        setCancelled([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, [refreshKey, currentDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(format(date, "yyyy-MM-dd"));
      setIsCalendarOpen(false);
    }
  };

  // Auto-refresh at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      timeZone: "Asia/Amman",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleStatusChange = async (
    id: string,
    from: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed",
    to: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed"
  ) => {
    setMovingItemId(id);

    try {
      // Remove from current stage
      if (from === "scheduled") {
        setScheduled(scheduled.filter((item) => item.id !== id));
      } else if (from === "stageOne") {
        setStageOne(stageOne.filter((item) => item.id !== id));
      } else if (from === "stageTwo") {
        setStageTwo(stageTwo.filter((item) => item.id !== id));
      } else if (from === "stageThree") {
        setStageThree(stageThree.filter((item) => item.id !== id));
      } else if (from === "completed") {
        setCompleted(completed.filter((item) => item.id !== id));
      }

      // Update status in backend
      await TransactionService.transactionControllerUpdate({
        requestBody: {
          id,
          status:
            to === "scheduled"
              ? TransactionResponse.status.SCHEDULED
              : to === "stageOne"
              ? TransactionResponse.status.STAGE_ONE
              : to === "stageTwo"
              ? TransactionResponse.status.STAGE_TWO
              : to === "stageThree"
              ? TransactionResponse.status.STAGE_THREE
              : to === "completed"
              ? TransactionResponse.status.COMPLETED
              : TransactionResponse.status.STAGE_THREE,
        },
      });

      // Fetch updated list for the new stage with current date filter (only if not completed)
      if (to !== "completed") {
        const updatedList = (await (to === "scheduled"
          ? TransactionService.transactionControllerFindScheduled({
              date: currentDate,
            })
          : to === "stageOne"
          ? TransactionService.transactionControllerFindStageOne({
              date: currentDate,
            })
          : to === "stageTwo"
          ? TransactionService.transactionControllerFindStageTwo({
              date: currentDate,
            })
          : to === "stageThree"
          ? TransactionService.transactionControllerFindStageThree({
              date: currentDate,
            })
          : TransactionService.transactionControllerFindStageThree({
              date: currentDate,
            }))) as unknown as TransactionResponse[];

        // Update the new stage state
        if (to === "scheduled") {
          setScheduled(updatedList);
        } else if (to === "stageOne") {
          setStageOne(updatedList);
        } else if (to === "stageTwo") {
          setStageTwo(updatedList);
        } else if (to === "stageThree") {
          setStageThree(updatedList);
        }
      }
      // If completed, transaction is removed from all columns and not added anywhere
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert changes if there's an error
      if (from === "scheduled") {
        setScheduled((prev) => [
          ...prev,
          scheduled.find((item) => item.id === id)!,
        ]);
      } else if (from === "stageOne") {
        setStageOne((prev) => [
          ...prev,
          stageOne.find((item) => item.id === id)!,
        ]);
      } else if (from === "stageTwo") {
        setStageTwo((prev) => [
          ...prev,
          stageTwo.find((item) => item.id === id)!,
        ]);
      } else if (from === "stageThree") {
        setStageThree((prev) => [
          ...prev,
          stageThree.find((item) => item.id === id)!,
        ]);
      } else if (from === "completed") {
        setCompleted((prev) => [
          ...prev,
          completed.find((item) => item.id === id)!,
        ]);
      }
    } finally {
      setMovingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {currentDate === getBusinessDayString() && (
            <div
              className={`text-sm px-2 py-1 rounded-full font-medium ${
                getBusinessDayInfo().isOvernightPeriod
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {getBusinessDayInfo().displayText}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-72 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <FiCalendar className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d, yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateSelect(getCurrentBusinessDate())}
                      className="text-xs"
                    >
                      Business Day
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        handleDateSelect(yesterday);
                      }}
                      className="text-xs"
                    >
                      Yesterday
                    </Button>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex gap-3">
          <Drawer
            open={isBookingDrawerOpen}
            onOpenChange={setIsBookingDrawerOpen}
            direction="left"
          >
            <DrawerTrigger asChild>
              <Button variant="outline" onClick={fetchBookings}>
                <FiCalendar className="w-4 h-4 mr-2" />
                <span>BOOKINGS</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full flex flex-col">
              <DrawerHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <DrawerTitle>Scheduled Bookings</DrawerTitle>
                    <DrawerDescription>
                      View all scheduled bookings
                    </DrawerDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddBookingDialogOpen(true)}
                  >
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>
              </DrawerHeader>
              <div className="flex-1 px-4 pb-4 overflow-y-auto">
                {isLoadingBookings ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4b3526]"></div>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border bg-white">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            {booking.customer.firstName}{" "}
                            {booking.customer.lastName}
                          </CardTitle>
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
                                <span className="text-green-600 font-medium">
                                  Completed
                                </span>
                              ) : (
                                <span className="text-orange-600 font-medium">
                                  Pending
                                </span>
                              )}
                            </p>
                          </div>
                          {!booking.markAsDone && (
                            <Button
                              onClick={() => {
                                setSelectedBookingId(booking.id);
                                setIsScanFromBookingOpen(true);
                              }}
                              className="w-full"
                              size="sm"
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Scan QR
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No bookings found</p>
                  </div>
                )}
              </div>
            </DrawerContent>
          </Drawer>
          <Button onClick={() => setIsSubscriptionDialogOpen(true)}>
            <FiPlus />
            <span>SUBSCRIPTION</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCompletedDrawerOpen(true)}
            className="flex items-center gap-2"
          >
            <FiCheckCircle className="w-4 h-4 text-green-600" />
            <span>({completed.filter((a) => !a.isSubscription).length})</span>
            |
            <FiX className="w-4 h-4 text-red-600" />
            <span>({cancelled.length})</span>
            |
            <FaTicket className="w-4 h-4 text-amber-900" />
            <span>({subscriptionCount})</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsScanQrDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FiPlus className="w-5 h-5 text-white" />
                <span className="font-medium text-white">ADD TICKET</span>
              </Button>
            </DialogTrigger>
            <AddTicketDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onSuccess={handleSuccess}
            />
          </Dialog>
        </div>
      </div>

      <ScheduleColumns
        scheduled={scheduled}
        stageOne={stageOne}
        stageTwo={stageTwo}
        stageThree={stageThree}
        movingItemId={movingItemId}
        handleStatusChange={handleStatusChange}
        formatTime={formatTime}
        onRefresh={handleSuccess}
      />

      <CompletedTicketsDrawer
        isOpen={isCompletedDrawerOpen}
        onOpenChange={setIsCompletedDrawerOpen}
        completed={completed}
        cancelled={cancelled}
        movingItemId={movingItemId}
        handleStatusChange={handleStatusChange}
        formatTime={formatTime}
      />

      <ScanQrDialog
        open={isScanQrDialogOpen}
        onOpenChange={setIsScanQrDialogOpen}
        onSuccess={handleSuccess}
      />

      <ScanQrDialog
        open={isScanFromBookingOpen}
        onOpenChange={setIsScanFromBookingOpen}
        onSuccess={handleBookingScanSuccess}
      />

      <SubscriptionDialog
        open={isSubscriptionDialogOpen}
        onOpenChange={setIsSubscriptionDialogOpen}
      />

      <Dialog
        open={isAddBookingDialogOpen}
        onOpenChange={setIsAddBookingDialogOpen}
      >
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
                  onClick={() => setIsAddBookingDialogOpen(false)}
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
  );
}
