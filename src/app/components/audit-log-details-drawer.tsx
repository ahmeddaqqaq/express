"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiActivity,
  FiClock,
  FiMapPin,
  FiTag,
  FiInfo,
  FiRefreshCw,
  FiUsers,
  FiTool,
} from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { AuditLogService, AuditLogResponse } from "../../../client";
import { toast } from "sonner";

interface AuditLogDetailsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  auditLog: AuditLogResponse | null;
}

interface DetailedAuditLog {
  id: string;
  technician: {
    id: string;
    fName: string;
    lName: string;
    email?: string;
    phone?: string;
  };
  action: string;
  timeStamp: string;
  transactionId?: string;
  details?: {
    previousStatus?: string;
    newStatus?: string;
    phase?: string;
    duration?: string;
    notes?: string;
    workDescription?: string;
  };
  transaction?: {
    id: string;
    customer: {
      fName: string;
      lName: string;
    };
    car: {
      brand: { name: string };
      model: { name: string };
    };
    service: {
      name: string;
    };
  };
}

export function AuditLogDetailsDrawer({
  isOpen,
  onOpenChange,
  auditLog,
}: AuditLogDetailsDrawerProps) {
  const [detailedLog, setDetailedLog] = useState<DetailedAuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [relatedLogs, setRelatedLogs] = useState<AuditLogResponse[]>([]);

  useEffect(() => {
    if (isOpen && auditLog) {
      fetchDetailedLog();
    }
  }, [isOpen, auditLog]);

  const fetchDetailedLog = async () => {
    if (!auditLog) return;

    setIsLoading(true);
    try {
      // For now, we'll use the basic log data and enhance it
      // In a real implementation, you might have a separate endpoint for detailed logs
      const enhanced: DetailedAuditLog = {
        ...auditLog,
        details: {
          // Mock additional details - replace with actual API call if available
          workDescription: getWorkDescription(auditLog.action),
          notes: getActionNotes(auditLog.action),
        },
      };

      setDetailedLog(enhanced);

      // If there's a transaction ID, fetch related logs
      if (enhanced.transactionId) {
        try {
          const related = await AuditLogService.auditLogControllerGetTransactionLogs({
            transactionId: enhanced.transactionId,
          });
          setRelatedLogs(related.filter((log: AuditLogResponse) => log.id !== auditLog.id));
        } catch (error) {
          console.warn("Could not fetch related logs:", error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch detailed audit log:", error);
      toast.error("Failed to load audit log details", {
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkDescription = (action: string): string => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("assign")) return "Technician was assigned to this transaction";
    if (actionLower.includes("start")) return "Work phase was initiated";
    if (actionLower.includes("complete")) return "Work phase was completed successfully";
    if (actionLower.includes("update")) return "Transaction status was updated";
    return "Action performed on transaction";
  };

  const getActionNotes = (action: string): string => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("assign")) return "Automatic assignment based on availability and skills";
    if (actionLower.includes("start")) return "Phase timer started, work progress tracking initiated";
    if (actionLower.includes("complete")) return "Quality check passed, ready for next phase";
    return "System action completed successfully";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes("assign")) return <FiUsers className="h-5 w-5 text-blue-500" />;
    if (action.toLowerCase().includes("start")) return <FiActivity className="h-5 w-5 text-green-500" />;
    if (action.toLowerCase().includes("complete")) return <FiTool className="h-5 w-5 text-purple-500" />;
    return <FiActivity className="h-5 w-5 text-gray-500" />;
  };

  const getActionBadgeColor = (action: string) => {
    if (action.toLowerCase().includes("assign")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (action.toLowerCase().includes("start")) return "bg-green-100 text-green-800 border-green-200";
    if (action.toLowerCase().includes("complete")) return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (!auditLog) return null;

  const timestamp = formatTimestamp(auditLog.timeStamp);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FiInfo className="h-6 w-6 text-blue-600" />
            Audit Log Details
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading details...
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Action Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
            >
              <div className="flex items-center gap-3 mb-3">
                {getActionIcon(auditLog.action)}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{auditLog.action}</h3>
                  <p className="text-sm text-gray-600">{detailedLog?.details?.workDescription}</p>
                </div>
                <Badge className={`border ${getActionBadgeColor(auditLog.action)}`}>
                  {auditLog.action.split(' ')[0]}
                </Badge>
              </div>
            </motion.div>

            {/* Timestamp Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border p-4"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiClock className="h-4 w-4 text-gray-600" />
                Timestamp
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{timestamp.fullDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{timestamp.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Relative:</span>
                  <span className="font-medium text-blue-600">{timestamp.relative}</span>
                </div>
              </div>
            </motion.div>

            {/* Technician Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border p-4"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiUser className="h-4 w-4 text-gray-600" />
                Technician
              </h4>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {auditLog.technician.fName.charAt(0)}{auditLog.technician.lName.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {auditLog.technician.fName} {auditLog.technician.lName}
                  </div>
                  <div className="text-sm text-gray-600">Technician ID: {auditLog.technician.id}</div>
                </div>
              </div>
            </motion.div>

            {/* Action Details */}
            {detailedLog?.details && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg border p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiTag className="h-4 w-4 text-gray-600" />
                  Additional Details
                </h4>
                <div className="space-y-3 text-sm">
                  {detailedLog.details.notes && (
                    <div>
                      <span className="text-gray-600 block mb-1">Notes:</span>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded text-xs">
                        {detailedLog.details.notes}
                      </p>
                    </div>
                  )}
                  {detailedLog.details.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{detailedLog.details.duration}</span>
                    </div>
                  )}
                  {detailedLog.details.phase && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phase:</span>
                      <span className="font-medium">{detailedLog.details.phase}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Transaction Details */}
            {detailedLog?.transaction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg border p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiMapPin className="h-4 w-4 text-gray-600" />
                  Transaction Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">
                      {detailedLog.transaction.customer.fName} {detailedLog.transaction.customer.lName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">
                      {detailedLog.transaction.car.brand.name} {detailedLog.transaction.car.model.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{detailedLog.transaction.service.name}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Related Actions */}
            {relatedLogs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg border p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiActivity className="h-4 w-4 text-gray-600" />
                  Related Actions ({relatedLogs.length})
                </h4>
                <div className="space-y-2">
                  {relatedLogs.slice(0, 5).map((log) => {
                    const relatedTimestamp = formatTimestamp(log.timeStamp);
                    return (
                      <div key={log.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                        {getActionIcon(log.action)}
                        <div className="flex-1">
                          <div className="font-medium">{log.action}</div>
                          <div className="text-xs text-gray-500">
                            {log.technician.fName} {log.technician.lName} • {relatedTimestamp.relative}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {relatedLogs.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      And {relatedLogs.length - 5} more actions...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}