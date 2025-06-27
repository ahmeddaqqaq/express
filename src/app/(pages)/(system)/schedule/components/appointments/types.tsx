import { FiClock, FiSettings, FiCheckCircle } from "react-icons/fi";
import { TransactionResponse } from "../../../../../../../client";

export type AppointmentStatus =
  | "scheduled"
  | "stageOne"
  | "stageTwo"
  | "stageThree"
  | "completed";

interface StatusConfigBase {
  borderColor: string;
  buttonColor: string;
  icon: React.ReactNode;
  actionText: string;
  timePrefix: string;
}

interface StatusConfigWithNext extends StatusConfigBase {
  nextStatus: AppointmentStatus;
  hasNext: true;
}

interface StatusConfigWithoutNext extends StatusConfigBase {
  hasNext: false;
}

export type StatusConfig = StatusConfigWithNext | StatusConfigWithoutNext;

export interface AppointmentCardProps {
  appointment: TransactionResponse;
  status: AppointmentStatus;
  movingItemId: string | null;
  handleStatusChange: (
    id: string,
    from: AppointmentStatus,
    to: AppointmentStatus
  ) => Promise<void>;
  formatTime: (dateString: string) => string;
  openDetailsDrawer?: (data: TransactionResponse) => void;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export const statusConfigs: Record<AppointmentStatus, StatusConfig> = {
  scheduled: {
    borderColor: "border-blue-500",
    buttonColor: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    icon: <FiClock className="mr-1" />,
    actionText: "Start Phase 1",
    nextStatus: "stageOne",
    timePrefix: "",
    hasNext: true,
  },
  stageOne: {
    borderColor: "border-purple-500",
    buttonColor: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
    icon: <FiSettings className="mr-1" />,
    actionText: "Move to Phase 2",
    nextStatus: "stageTwo",
    timePrefix: "Started at ",
    hasNext: true,
  },
  stageTwo: {
    borderColor: "border-orange-500",
    buttonColor: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    icon: <FiSettings className="mr-1" />,
    actionText: "Move to Phase 3",
    nextStatus: "stageThree",
    timePrefix: "Started at ",
    hasNext: true,
  },
  stageThree: {
    borderColor: "border-orange-500",
    buttonColor: "bg-green-50 text-green-600 hover:bg-green-100",
    icon: <FiSettings className="mr-1" />,
    actionText: "Complete",
    nextStatus: "completed",
    timePrefix: "Started at ",
    hasNext: true,
  },
  completed: {
    borderColor: "border-green-500",
    buttonColor: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    icon: <FiCheckCircle className="mr-1" />,
    actionText: "Details",
    timePrefix: "Completed at ",
    hasNext: false,
  },
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
