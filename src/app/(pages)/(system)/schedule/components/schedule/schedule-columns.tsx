import { AnimatePresence } from "framer-motion";
import { FiClock, FiCheckCircle, FiSettings } from "react-icons/fi";
import { TransactionResponse } from "../../../../../../../client";
import { AppointmentsCard } from "../appointments/appointments-card";

interface ScheduleColumnsProps {
  scheduled: TransactionResponse[];
  stageOne: TransactionResponse[];
  stageTwo: TransactionResponse[];
  stageThree: TransactionResponse[];
  completed: TransactionResponse[];
  movingItemId: string | null;
  handleStatusChange: (
    id: string,
    from: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed",
    to: "scheduled" | "stageOne" | "stageTwo" | "stageThree" | "completed"
  ) => Promise<void>;
  formatTime: (dateString: string) => string;
  openDetailsDrawer: (transaction: TransactionResponse) => void;
}

export function ScheduleColumns({
  scheduled,
  stageOne,
  stageTwo,
  stageThree,
  completed,
  movingItemId,
  handleStatusChange,
  formatTime,
  openDetailsDrawer,
}: ScheduleColumnsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Scheduled Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FiClock className="mr-2 text-blue-500" />
            Scheduled
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {scheduled.length}
          </span>
        </div>

        <AnimatePresence>
          {scheduled.map((appointment) => (
            <AppointmentsCard
              key={appointment.id}
              appointment={appointment}
              status="scheduled"
              movingItemId={movingItemId}
              handleStatusChange={handleStatusChange}
              formatTime={formatTime}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Stage One Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FiSettings className="mr-2 text-purple-500" />
            Phase One
          </h2>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {stageOne.length}
          </span>
        </div>

        <AnimatePresence>
          {stageOne.map((appointment) => (
            <AppointmentsCard
              key={appointment.id}
              appointment={appointment}
              status="stageOne"
              movingItemId={movingItemId}
              handleStatusChange={handleStatusChange}
              formatTime={formatTime}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Stage Two Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FiSettings className="mr-2 text-orange-500" />
            Phase Two
          </h2>
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {stageTwo.length}
          </span>
        </div>

        <AnimatePresence>
          {stageTwo.map((appointment) => (
            <AppointmentsCard
              key={appointment.id}
              appointment={appointment}
              status="stageTwo"
              movingItemId={movingItemId}
              handleStatusChange={handleStatusChange}
              formatTime={formatTime}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Stage Three Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FiSettings className="mr-2 text-orange-500" />
            Phase Three
          </h2>
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {stageThree.length}
          </span>
        </div>

        <AnimatePresence>
          {stageThree.map((appointment) => (
            <AppointmentsCard
              key={appointment.id}
              appointment={appointment}
              status="stageThree"
              movingItemId={movingItemId}
              handleStatusChange={handleStatusChange}
              formatTime={formatTime}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Completed Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FiCheckCircle className="mr-2 text-green-500" />
            Completed
          </h2>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {completed.length}
          </span>
        </div>
        <AnimatePresence>
          {completed.map((appointment) => (
            <AppointmentsCard
              key={appointment.id}
              appointment={appointment}
              status="completed"
              movingItemId={movingItemId}
              handleStatusChange={handleStatusChange}
              formatTime={formatTime}
              openDetailsDrawer={openDetailsDrawer}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
