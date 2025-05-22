"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiCheckCircle, FiX, FiXCircle } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

export function NotificationsComponent({
  messages,
  removeMessage,
}: {
  messages: {
    title: string;
    status: string;
    id: string | undefined;
  }[];
  removeMessage: (id: string | undefined) => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "error":
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case "loading":
        return <FaSpinner size="sm" />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute bottom-7 start-16 z-[400] flex flex-col">
      <AnimatePresence>
        {messages.map(({ title, status, id }) => (
          <motion.div
            initial={{ opacity: 0, translateY: 25, marginTop: -50 }}
            animate={{ opacity: 1, translateY: 0, marginTop: 8 }}
            exit={{ opacity: 0, translateY: -25 }}
            transition={{ duration: 0.15, ease: "linear" }}
            key={id}
            className="flex w-[384px] justify-between rounded-lg bg-white p-3 shadow-sm"
          >
            <div className="flex flex-row items-center gap-x-3">
              {getStatusIcon(status)}
              <div className="text-sm">{title}</div>
            </div>
            {status !== "loading" && (
              <button onClick={() => removeMessage(id)}>
                <FiX className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
