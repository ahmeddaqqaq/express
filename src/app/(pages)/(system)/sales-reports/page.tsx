"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FiSearch, FiDownload, FiUser, FiDollarSign, FiFilter } from "react-icons/fi";
import { format } from "date-fns";
import { getCurrentBusinessDate, formatDateForAPI } from "@/lib/date-utils";
import { StatisticsService } from "../../../../../client";
import { generateSalesReportPDF } from "./utils/pdf-generator";
import { toast } from "sonner";

interface DetailedSaleRecord {
  id: string;
  transactionId: string;
  saleType: 'SERVICE' | 'ADDON';
  itemName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  soldAt: string;
  sellerType: 'USER' | 'SALES_PERSON';
  sellerName: string;
  sellerRole: string;
  transactionStatus: string;
}

export default function SalesReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [endDate, setEndDate] = useState<Date | undefined>(getCurrentBusinessDate());
  const [includeIncomplete, setIncludeIncomplete] = useState(false);
  const [salesData, setSalesData] = useState<DetailedSaleRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DetailedSaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSellerType, setSelectedSellerType] = useState<'all' | 'USER' | 'SALES_PERSON'>('all');
  const [selectedSaleType, setSelectedSaleType] = useState<'all' | 'SERVICE' | 'ADDON'>('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    try {
      const startDateString = formatDateForAPI(startDate);
      const endDateString = formatDateForAPI(endDate);
      
      const data = await StatisticsService.statisticsControllerGetDetailedSalesReport({
        startDate: startDateString,
        endDate: endDateString,
        includeIncomplete,
      });
      
      setSalesData(data as DetailedSaleRecord[]);
      setFilteredData(data as DetailedSaleRecord[]);
      toast.success("Sales report generated successfully!");
    } catch (error) {
      toast.error("Failed to generate sales report");
      console.error("Error generating sales report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search and filters
  const applyFilters = () => {
    let filtered = salesData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        record =>
          record.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Seller type filter
    if (selectedSellerType !== 'all') {
      filtered = filtered.filter(record => record.sellerType === selectedSellerType);
    }

    // Sale type filter
    if (selectedSaleType !== 'all') {
      filtered = filtered.filter(record => record.saleType === selectedSaleType);
    }

    setFilteredData(filtered);
  };

  // Apply filters whenever search term or filters change
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedSellerType, selectedSaleType, salesData]);

  const handleDownloadPDF = async () => {
    if (!startDate || !endDate || filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    setIsGeneratingPDF(true);
    try {
      await generateSalesReportPDF(
        filteredData,
        summary,
        startDate,
        endDate,
        includeIncomplete
      );
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate summary statistics
  const summary = filteredData.reduce(
    (acc, record) => {
      acc.totalRevenue += record.totalAmount;
      acc.totalItems += record.quantity;
      
      if (record.saleType === 'SERVICE') {
        acc.serviceRevenue += record.totalAmount;
        acc.serviceCount += record.quantity;
      } else {
        acc.addonRevenue += record.totalAmount;
        acc.addonCount += record.quantity;
      }

      if (record.sellerType === 'USER') {
        acc.supervisorRevenue += record.totalAmount;
      } else {
        acc.salesPersonRevenue += record.totalAmount;
      }

      return acc;
    },
    {
      totalRevenue: 0,
      totalItems: 0,
      serviceRevenue: 0,
      serviceCount: 0,
      addonRevenue: 0,
      addonCount: 0,
      supervisorRevenue: 0,
      salesPersonRevenue: 0,
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4b3526]">Sales Reports</h1>
          <p className="text-gray-600 mt-2">
            Detailed sales attribution showing who sold what and when
          </p>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiFilter className="h-5 w-5" />
            Report Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                className="rounded-md border w-fit"
                disabled={(date) => date > getCurrentBusinessDate()}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                className="rounded-md border w-fit"
                disabled={(date) => date > getCurrentBusinessDate()}
              />
            </div>
            
            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-incomplete"
                  checked={includeIncomplete}
                  onCheckedChange={setIncludeIncomplete}
                />
                <Label htmlFor="include-incomplete" className="text-sm">
                  Include incomplete transactions
                </Label>
              </div>
              
              <Button
                onClick={handleGenerateReport}
                disabled={!startDate || !endDate || isLoading}
                className="w-full bg-[#4b3526] hover:bg-[#5a4233]"
              >
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
              
              {salesData.length > 0 && (
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF || filteredData.length === 0}
                  variant="outline"
                  className="w-full"
                >
                  <FiDownload className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {salesData.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${summary.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <FiDollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Services</p>
                    <p className="text-xl font-bold text-blue-600">
                      {summary.serviceCount} sold
                    </p>
                    <p className="text-sm text-gray-500">
                      ${summary.serviceRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">S</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Add-ons</p>
                    <p className="text-xl font-bold text-green-600">
                      {summary.addonCount} sold
                    </p>
                    <p className="text-sm text-gray-500">
                      ${summary.addonRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">A</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {summary.totalItems}
                    </p>
                  </div>
                  <FiUser className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by seller, item, or transaction ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedSellerType}
                    onChange={(e) => setSelectedSellerType(e.target.value as any)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Sellers</option>
                    <option value="USER">Supervisors/Admins</option>
                    <option value="SALES_PERSON">Sales Persons</option>
                  </select>
                  
                  <select
                    value={selectedSaleType}
                    onChange={(e) => setSelectedSaleType(e.target.value as any)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Sales Types</option>
                    <option value="SERVICE">Services</option>
                    <option value="ADDON">Add-ons</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Sales Records ({filteredData.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Seller</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {format(new Date(record.soldAt), "MMM dd, HH:mm")}
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{record.sellerName}</div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                record.sellerType === 'SALES_PERSON' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {record.sellerType === 'SALES_PERSON' ? 'Sales Person' : record.sellerRole}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={record.saleType === 'SERVICE' ? 'default' : 'secondary'}
                            className={record.saleType === 'SERVICE' ? 'bg-blue-600' : 'bg-green-600'}
                          >
                            {record.saleType}
                          </Badge>
                        </td>
                        <td className="p-2 font-medium">{record.itemName}</td>
                        <td className="p-2">{record.quantity}</td>
                        <td className="p-2">${record.price.toFixed(2)}</td>
                        <td className="p-2 font-semibold">${record.totalAmount.toFixed(2)}</td>
                        <td className="p-2">
                          <Badge 
                            variant={record.transactionStatus === 'completed' ? 'default' : 'secondary'}
                            className={
                              record.transactionStatus === 'completed' 
                                ? 'bg-green-600' 
                                : 'bg-yellow-600'
                            }
                          >
                            {record.transactionStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No sales records found for the selected criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}