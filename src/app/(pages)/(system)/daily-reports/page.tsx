"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiDownload, FiCalendar } from "react-icons/fi";
import { format } from "date-fns";
import { getCurrentBusinessDate, formatDateForAPI } from "@/lib/date-utils";
import { StatisticsService } from "../../../../../client";
import type { DailyReportResponseDto } from "../../../../../client";
import { generatePDF } from "./utils/pdf-generator";
import { toast } from "sonner";

// Utility function to format time duration (assumes input is in minutes or time string)
const formatTimeDuration = (input: number | string | null): string => {
  if (input === null || input === undefined) return "-";
  
  // If it's a string that looks like HH:MM, return as is
  if (typeof input === "string" && input.includes(":")) {
    return input;
  }
  
  // Convert to number if it's a string
  const minutes = typeof input === "string" ? parseInt(input, 10) : input;
  
  if (isNaN(minutes)) return input?.toString() || "-";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};

// Utility function to format time string (HH:MM format)
const formatTime = (timeString: string | null): string => {
  if (!timeString) return "-";
  
  // If it's already in HH:MM format, return as is
  if (timeString.includes(":")) {
    return timeString;
  }
  
  // If it's a timestamp, extract time
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return timeString;
  }
};

export default function DailyReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getCurrentBusinessDate());
  const [reportData, setReportData] = useState<DailyReportResponseDto | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setIsGenerating(true);
    try {
      const dateString = formatDateForAPI(selectedDate);
      const data = await StatisticsService.statisticsControllerGetDailyReport({
        date: dateString,
      });
      setReportData(data);
      toast.success("Report generated successfully!");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportData || !selectedDate) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDF(reportData, selectedDate);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4b3526]">Daily Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate comprehensive daily reports for business analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Selection Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiCalendar className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              disabled={(date) => date > getCurrentBusinessDate()}
            />
            <div className="space-y-2">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedDate || isGenerating}
                className="w-full bg-[#4b3526] hover:bg-[#5a4233]"
              >
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
              {reportData && (
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  variant="outline"
                  className="w-full"
                >
                  <FiDownload className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Preview Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {!reportData ? (
              <div className="text-center py-12 text-gray-500">
                <FiCalendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a date and generate a report to see the preview</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="border-b pb-4">
                  <h3 className="text-xl font-semibold">
                    Daily Report - {format(selectedDate!, "MMMM dd, yyyy")}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Generated at: {new Date(reportData.generatedAt).toLocaleString()}
                  </p>
                </div>

                {/* Cash Summary */}
                <div>
                  <h4 className="font-semibold mb-3 text-[#4b3526]">Cash Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Services Cash</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${reportData.cashSummary.servicesCash.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Add-ons Cash</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ${reportData.cashSummary.addOnsCash.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Cash</p>
                      <p className="text-lg font-semibold text-purple-600">
                        ${reportData.cashSummary.totalCash.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Transactions</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {reportData.cashSummary.transactionCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technician Shifts */}
                <div>
                  <h4 className="font-semibold mb-3 text-[#4b3526]">Technician Shifts</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Technician</th>
                          <th className="text-left p-2">Start Time</th>
                          <th className="text-left p-2">End Time</th>
                          <th className="text-left p-2">Break Time</th>
                          <th className="text-left p-2">Overtime</th>
                          <th className="text-left p-2">Working Time</th>
                          <th className="text-left p-2">OT Compensation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.technicianShifts.map((shift) => (
                          <tr key={shift.technicianId} className="border-b">
                            <td className="p-2 font-medium">{shift.technicianName}</td>
                            <td className="p-2">{formatTime(shift.shiftStartTime)}</td>
                            <td className="p-2">{formatTime(shift.shiftEndTime)}</td>
                            <td className="p-2">{formatTimeDuration(shift.totalBreakTime)}</td>
                            <td className="p-2">{formatTimeDuration(shift.totalOvertimeTime)}</td>
                            <td className="p-2 font-semibold">{formatTimeDuration(shift.totalWorkingTime)}</td>
                            <td className="p-2 text-green-600 font-semibold">
                              ${(shift.overtimeCompensation || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sales Attribution */}
                <div>
                  <h4 className="font-semibold mb-3 text-[#4b3526]">Sales Attribution</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Person</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Services</th>
                          <th className="text-left p-2">Add-ons</th>
                          <th className="text-left p-2">Commission</th>
                          <th className="text-left p-2">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.userSales.map((sale) => (
                          <tr key={sale.userId} className="border-b">
                            <td className="p-2 font-medium">{sale.userName}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sale.userRole === 'SALES_PERSON' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {sale.userRole === 'SALES_PERSON' ? 'Sales Person' : sale.userRole}
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="text-xs text-gray-600">
                                {sale.services.count || 0} sold
                              </div>
                              <div className="font-semibold">
                                ${(sale.services.total || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-xs text-gray-600">
                                {sale.addOns.count || 0} sold
                              </div>
                              <div className="font-semibold">
                                ${(sale.addOns.total || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="p-2 text-orange-600 font-semibold">
                              ${(sale.addOnCommission || 0).toFixed(2)}
                            </td>
                            <td className="p-2 font-bold text-purple-600">
                              ${((sale.services.total || 0) + (sale.addOns.total || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        {reportData.userSales.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-gray-500">
                              No sales data available for this date
                            </td>
                          </tr>
                        )}
                        {/* Summary Row */}
                        {reportData.userSales.length > 0 && (
                          <tr className="bg-gray-100 font-bold">
                            <td className="p-2">TOTAL</td>
                            <td className="p-2"></td>
                            <td className="p-2">
                              <div className="text-xs">
                                {reportData.userSales.reduce((sum, sale) => sum + (sale.services.count || 0), 0)} sold
                              </div>
                              <div className="text-green-600">
                                ${reportData.userSales.reduce((sum, sale) => sum + (sale.services.total || 0), 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-xs">
                                {reportData.userSales.reduce((sum, sale) => sum + (sale.addOns.count || 0), 0)} sold
                              </div>
                              <div className="text-blue-600">
                                ${reportData.userSales.reduce((sum, sale) => sum + (sale.addOns.total || 0), 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="p-2 text-orange-600">
                              ${reportData.userSales.reduce((sum, sale) => sum + (sale.addOnCommission || 0), 0).toFixed(2)}
                            </td>
                            <td className="p-2 text-purple-600">
                              ${reportData.userSales.reduce((sum, sale) => 
                                sum + (sale.services.total || 0) + (sale.addOns.total || 0), 0).toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}