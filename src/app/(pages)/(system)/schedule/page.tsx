"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { TransactionResponse, TransactionService } from "../../../../../client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getCurrentBusinessDate, getBusinessDayString, getBusinessDayInfo } from "@/lib/date-utils";
import { AddTicketDialog } from "./components/schedule/add-ticket-dialog";
import { ScheduleColumns } from "./components/schedule/schedule-columns";
import { CompletedTicketsDrawer } from "./components/schedule/completed-tickets-drawer";

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState<string>(
    getBusinessDayString()
  );
  const [selectedDate, setSelectedDate] = useState<Date>(getCurrentBusinessDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [scheduled, setScheduled] = useState<TransactionResponse[]>([]);
  const [stageOne, setStageOne] = useState<TransactionResponse[]>([]);
  const [stageTwo, setStageTwo] = useState<TransactionResponse[]>([]);
  const [stageThree, setStageThree] = useState<TransactionResponse[]>([]);
  const [completed, setCompleted] = useState<TransactionResponse[]>([]);
  const [cancelled, setCancelled] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompletedDrawerOpen, setIsCompletedDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Amman',
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true
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
          <div className="text-2xl font-bold text-gray-800">
            Tickets ({format(new Date(currentDate), "MMMM d, yyyy")})
          </div>
          {currentDate === getBusinessDayString() && (
            <div className={`text-sm px-2 py-1 rounded-full font-medium ${
              getBusinessDayInfo().isOvernightPeriod 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {getBusinessDayInfo().displayText}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-60 justify-start text-left font-normal",
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
          <Button
            variant="outline"
            onClick={() => setIsCompletedDrawerOpen(true)}
            className="flex items-center gap-2"
          >
            <FiCheckCircle className="w-4 h-4 text-green-600" />
            <span>
              Completed ({completed.length}) | Cancelled ({cancelled.length})
            </span>
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
    </div>
  );
}
