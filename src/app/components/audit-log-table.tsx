"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiUser,
  FiActivity,
  FiChevronRight,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AuditLogService, AuditLogResponse, AuditLogManyResponse } from "../../../client";
import { toast } from "sonner";
import { AuditLogDetailsDrawer } from "./audit-log-details-drawer";

interface AuditLogTableProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogTable({ isOpen, onOpenChange }: AuditLogTableProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [pagination, setPagination] = useState({
    skip: 0,
    take: 50,
    total: 0,
  });

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const response: AuditLogManyResponse = await AuditLogService.auditLogControllerFindMany({
        skip: pagination.skip,
        take: pagination.take,
        search: searchTerm || undefined,
      });

      setAuditLogs(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.rows,
      }));
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      toast.error("Failed to load audit logs", {
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen, pagination.skip, pagination.take]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        setPagination(prev => ({ ...prev, skip: 0 }));
        fetchAuditLogs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleRowClick = (log: AuditLogResponse) => {
    setSelectedLog(log);
    setIsDetailsDrawerOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes("assign")) return <FiUser className="h-4 w-4 text-blue-500" />;
    if (action.toLowerCase().includes("start")) return <FiActivity className="h-4 w-4 text-green-500" />;
    if (action.toLowerCase().includes("complete")) return <FiActivity className="h-4 w-4 text-purple-500" />;
    return <FiActivity className="h-4 w-4 text-gray-500" />;
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes("assign")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (action.toLowerCase().includes("start")) return "bg-green-50 text-green-700 border-green-200";
    if (action.toLowerCase().includes("complete")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const handleNextPage = () => {
    if (pagination.skip + pagination.take < pagination.total) {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.take }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.skip > 0) {
      setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.take) }));
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl">
              <FiClock className="h-6 w-6 text-blue-600" />
              Audit Log
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by technician name or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={fetchAuditLogs}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                <FiRefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Audit Logs Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[100px]">Time</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <FiRefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading audit logs...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log, index) => {
                        const timestamp = formatTimestamp(log.timeStamp);
                        return (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleRowClick(log)}
                          >
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{timestamp.time}</div>
                                <div className="text-gray-500 text-xs">{timestamp.date}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                                  {log.technician.fName.charAt(0)}{log.technician.lName.charAt(0)}
                                </div>
                                <div className="text-sm">
                                  <div className="font-medium">{log.technician.fName} {log.technician.lName}</div>
                                  <div className="text-gray-500 text-xs">Technician</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getActionIcon(log.action)}
                                <span className={`px-2 py-1 rounded-full text-xs border ${getActionColor(log.action)}`}>
                                  {log.action}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <FiChevronRight className="h-4 w-4 text-gray-400" />
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && auditLogs.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-500">
                  Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.take, pagination.total)} of {pagination.total} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={pagination.skip === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={pagination.skip + pagination.take >= pagination.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Audit Log Details Drawer */}
      <AuditLogDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onOpenChange={setIsDetailsDrawerOpen}
        auditLog={selectedLog}
      />
    </>
  );
}