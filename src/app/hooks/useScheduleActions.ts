import { useState } from "react";
import { TransactionResponse, TransactionService } from "../../../client";

interface UseScheduleActionsProps {
  refreshScheduleData: () => Promise<void>;
}

export function useScheduleActions({
  refreshScheduleData,
}: UseScheduleActionsProps) {
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  const handleStatusChange = async (
    id: string,
    from: "scheduled" | "stageOne" | "stageTwo" | "completed",
    to: "scheduled" | "stageOne" | "stageTwo" | "completed"
  ) => {
    setMovingItemId(id);

    try {
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
              : TransactionResponse.status.COMPLETED,
        },
      });

      // Refresh all data after status change
      await refreshScheduleData();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setMovingItemId(null);
    }
  };

  return {
    movingItemId,
    handleStatusChange,
  };
}
