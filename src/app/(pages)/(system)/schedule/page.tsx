"use client";

import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { TransactionResponse, TransactionService } from "../../../../../client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { AddTicketDialog } from "./components/schedule/add-ticket-dialog";
import { TransactionDetailsDrawer } from "./components/schedule/transaction-detail-drawer";
import { ScheduleColumns } from "./components/schedule/schedule-columns";

export default function Schedule() {
  const [scheduled, setScheduled] = useState<TransactionResponse[]>([]);
  const [stageOne, setStageOne] = useState<TransactionResponse[]>([]);
  const [stageTwo, setStageTwo] = useState<TransactionResponse[]>([]);
  const [stageThree, setStageThree] = useState<TransactionResponse[]>([]);
  const [completed, setCompleted] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        ] = await Promise.all([
          TransactionService.transactionControllerFindScheduled() as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageOne() as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageTwo() as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageThree() as unknown as TransactionResponse[], // Add this line
          TransactionService.transactionControllerFindCompleted() as unknown as TransactionResponse[],
        ]);

        setScheduled(scheduledRes);
        setStageOne(stageOneRes);
        setStageTwo(stageTwoRes);
        setStageThree(stageThreeRes); // Add this line
        setCompleted(completedRes);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setScheduled([]);
        setStageOne([]);
        setStageTwo([]);
        setStageThree([]); // Add this line
        setCompleted([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, [refreshKey]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleStatusChange = async (
    id: string,
    from: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed", // Add stageThree
    to: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed" // Add stageThree
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
        // Add this condition
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
              : to === "stageThree" // Add this condition
              ? TransactionResponse.status.STAGE_THREE
              : TransactionResponse.status.COMPLETED,
        },
      });

      // Fetch updated list for the new stage
      const updatedList = (await (to === "scheduled"
        ? TransactionService.transactionControllerFindScheduled()
        : to === "stageOne"
        ? TransactionService.transactionControllerFindStageOne()
        : to === "stageTwo"
        ? TransactionService.transactionControllerFindStageTwo()
        : to === "stageThree" // Add this condition
        ? TransactionService.transactionControllerFindStageThree()
        : TransactionService.transactionControllerFindCompleted())) as unknown as TransactionResponse[];

      // Update the new stage state
      if (to === "scheduled") {
        setScheduled(updatedList);
      } else if (to === "stageOne") {
        setStageOne(updatedList);
      } else if (to === "stageTwo") {
        setStageTwo(updatedList);
      } else if (to === "stageThree") {
        // Add this condition
        setStageThree(updatedList);
      } else if (to === "completed") {
        setCompleted(updatedList);
      }
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
        // Add this condition
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

  function openDetailsDrawer(transaction: TransactionResponse) {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold text-gray-800">Bookings</div>
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

      <ScheduleColumns
        scheduled={scheduled}
        stageOne={stageOne}
        stageTwo={stageTwo}
        stageThree={stageThree}
        completed={completed}
        movingItemId={movingItemId}
        handleStatusChange={handleStatusChange}
        formatTime={formatTime}
        openDetailsDrawer={openDetailsDrawer}
      />
      <TransactionDetailsDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        transaction={selectedTransaction}
        formatTime={formatTime}
      />
    </div>
  );
}

// "use client";

// import Schedules from "./components/schedule/schedule";

// export default function Schedule() {
//   return <Schedules />;
// }
