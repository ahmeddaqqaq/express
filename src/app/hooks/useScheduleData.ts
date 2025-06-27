import { useState, useEffect } from "react";
import { TransactionResponse, TransactionService } from "../../../client";

export function useScheduleData() {
  const [scheduled, setScheduled] = useState<TransactionResponse[]>([]);
  const [stageOne, setStageOne] = useState<TransactionResponse[]>([]);
  const [stageTwo, setStageTwo] = useState<TransactionResponse[]>([]);
  const [completed, setCompleted] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [scheduledRes, stageOneRes, stageTwoRes, completedRes] =
        await Promise.all([
          TransactionService.transactionControllerFindScheduled() as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageOne() as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindStageTwo() as unknown as TransactionResponse[],
          TransactionService.transactionControllerFindCompleted() as unknown as TransactionResponse[],
        ]);

      setScheduled(scheduledRes);
      setStageOne(stageOneRes);
      setStageTwo(stageTwoRes);
      setCompleted(completedRes);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setScheduled([]);
      setStageOne([]);
      setStageTwo([]);
      setCompleted([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    scheduled,
    stageOne,
    stageTwo,
    completed,
    isLoading,
    refreshScheduleData: fetchAllData,
    setScheduled,
    setStageOne,
    setStageTwo,
    setCompleted,
  };
}
