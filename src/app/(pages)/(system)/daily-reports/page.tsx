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
              className="rounded-md border"
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
                          <th className="text-left p-2">Shift Time</th>
                          <th className="text-left p-2">Break Time</th>
                          <th className="text-left p-2">Overtime</th>
                          <th className="text-left p-2">Working Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.technicianShifts.map((shift) => (
                          <tr key={shift.technicianId} className="border-b">
                            <td className="p-2">{shift.technicianName}</td>
                            <td className="p-2">{shift.totalShiftTime}</td>
                            <td className="p-2">{shift.totalBreakTime}</td>
                            <td className="p-2">{shift.totalOvertimeTime}</td>
                            <td className="p-2 font-semibold">{shift.totalWorkingTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Supervisor Sales */}
                <div>
                  <h4 className="font-semibold mb-3 text-[#4b3526]">Supervisor Add-on Sales</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Supervisor</th>
                          <th className="text-left p-2">Add-ons Sold</th>
                          <th className="text-left p-2">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.supervisorSales.map((sale) => (
                          <tr key={sale.supervisorId} className="border-b">
                            <td className="p-2">{sale.supervisorName}</td>
                            <td className="p-2">{sale.addOnCount}</td>
                            <td className="p-2 font-semibold">${sale.totalAddOnRevenue.toFixed(2)}</td>
                          </tr>
                        ))}
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