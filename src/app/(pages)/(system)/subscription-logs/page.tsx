"use client";

import { useEffect, useState } from "react";
import { SubscriptionService, SubscriptionLogResponseDto } from "../../../../../client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function SubscriptionLogsPage() {
  const [logs, setLogs] = useState<SubscriptionLogResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await SubscriptionService.subscriptionControllerGetSubscriptionLogs({
        skip,
        take: itemsPerPage,
      });
      setLogs(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching subscription logs:", error);
      toast.error("Failed to load subscription logs");
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "PURCHASED":
        return "bg-blue-100 text-blue-800";
      case "ACTIVATED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4b3526]">Subscription Logs</h1>
          <p className="text-gray-600 mt-2">
            View all subscription purchase and activation history
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Total logs: <span className="font-semibold">{total}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4b3526]"></div>
            </div>
          ) : logs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Action</th>
                      <th className="text-left p-3 font-semibold">Purchased By</th>
                      <th className="text-left p-3 font-semibold">Purchased At</th>
                      <th className="text-left p-3 font-semibold">Activated By</th>
                      <th className="text-left p-3 font-semibold">Activated At</th>
                      <th className="text-left p-3 font-semibold">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3">
                          {log.purchasedBy ? (
                            <div>
                              <p className="font-medium">
                                {log.purchasedBy.firstName} {log.purchasedBy.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{log.purchasedBy.email}</p>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3">{formatDate(log.purchasedAt)}</td>
                        <td className="p-3">
                          {log.activatedBy ? (
                            <div>
                              <p className="font-medium">
                                {log.activatedBy.firstName} {log.activatedBy.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{log.activatedBy.email}</p>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3">{formatDate(log.activatedAt)}</td>
                        <td className="p-3">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, total)} of {total} logs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <FiChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <FiChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No subscription logs found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
