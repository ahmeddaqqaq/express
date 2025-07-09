"use client";

import React, { ReactNode, useEffect, useState } from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiAward,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FaCalendarAlt } from "react-icons/fa";
import {
  CardStatsResponse,
  CompletionRatioResponse,
  RevenueSummary,
  StatisticsService,
  TopCustomer,
  PeakAnalysisResponse,
  TechnicianUtilizationResponse,
  ServiceStageBottleneckResponse,
} from "../../../../../client";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Dashboard() {
  const [stats, setStats] = useState<CardStatsResponse>();
  const [ratio, setRatio] = useState<CompletionRatioResponse>();
  const [revenue, setRevenue] = useState<RevenueSummary>();
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>();
  const [peakAnalysis, setPeakAnalysis] = useState<PeakAnalysisResponse>();
  const [technicianUtilization, setTechnicianUtilization] = useState<TechnicianUtilizationResponse[]>();
  const [stageBottlenecks, setStageBottlenecks] = useState<ServiceStageBottleneckResponse[]>();
  const [timeRange, setTimeRange] = useState<"day" | "month" | "year" | "all">(
    "day"
  );

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [cardStats, completionRatio, revenueData, topCustomersData, peakAnalysisData, technicianUtilizationData, stageBottlenecksData] =
          await Promise.all([
            StatisticsService.statisticsControllerGetCardStats({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetRatio({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetRevenueStatistics({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetTopCustomers({
              range: timeRange,
              limit: 5,
            }),
            StatisticsService.statisticsControllerGetPeakAnalysis({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetTechnicianUtilization({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetServiceStageBottlenecks({
              range: timeRange,
            }),
          ]);

        setStats(cardStats as unknown as CardStatsResponse);
        setRatio(completionRatio as unknown as CompletionRatioResponse);
        setRevenue(revenueData as unknown as RevenueSummary);
        setTopCustomers(topCustomersData as unknown as TopCustomer[]);
        setPeakAnalysis(peakAnalysisData as unknown as PeakAnalysisResponse);
        setTechnicianUtilization(technicianUtilizationData as unknown as TechnicianUtilizationResponse[]);
        setStageBottlenecks(stageBottlenecksData as unknown as ServiceStageBottleneckResponse[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchAllData();
  }, [timeRange]);

  const handleTimeRangeChange = (range: "day" | "month" | "year" | "all") => {
    setTimeRange(range);
  };

  // Prepare data for charts
  const serviceRevenueData =
    revenue?.services.map((service) => ({
      name: service.serviceName,
      value: service.totalRevenue,
    })) || [];

  const addOnRevenueData =
    revenue?.addOns.map((addOn) => ({
      name: addOn.addOnName,
      value: addOn.totalRevenue,
    })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Express Wash</h1>
          <p className="text-gray-500">Dashboard Overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {(["day", "month", "year", "all"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={stats.activeCustomers?.toLocaleString() || "0"}
            change={stats.newCustomersToday || 0}
            icon={<FiUsers className="text-gray-600" />}
          />
          <StatCard
            title="Scheduled Services"
            value={stats.scheduledTransactions?.toLocaleString() || "0"}
            change={stats.inProgressTransaction || 0}
            icon={<FaCalendarAlt className="text-gray-600" />}
          />
          <StatCard
            title="Services Completed"
            value={stats.completedTransactions?.toLocaleString() || "0"}
            change={stats.completedTransactionsToday || 0}
            icon={<FiCheckCircle className="text-gray-600" />}
          />
          {revenue && (
            <StatCard
              title="Total Revenue"
              value={`$${revenue.totalRevenue?.toLocaleString() || "0"}`}
              change={
                (revenue.serviceRevenue || 0) + (revenue.addOnRevenue || 0)
              }
              icon={<FiDollarSign className="text-gray-600" />}
              isCurrency
            />
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Service Revenue */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Service Revenue</h2>
          <div className="h-64">
            {serviceRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceRevenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {serviceRevenueData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </Card>

        {/* Add-On Revenue */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Add-On Revenue</h2>
          <div className="h-64 overflow-y-auto">
            <div className="space-y-4">
              {addOnRevenueData.length > 0 ? (
                addOnRevenueData.map((addOn, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="font-medium">{addOn.name}</span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      ${addOn.value.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No add-on data available
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Completion Rate */}
        {ratio && (
          <Card className="p-4">
            <h2 className="font-medium mb-4">Service Completion</h2>
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="text-4xl font-light">
                  {ratio.completionRatio?.toFixed(1) || "0.0"}%
                </div>
                <p className="text-gray-500">of services completed on time</p>
                <div className="w-full bg-gray-100 rounded-full h-2 max-w-xs mx-auto">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${ratio.completionRatio || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Customers */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Top 5 Customers</h2>
          <div className="space-y-2">
            {topCustomers?.length ? (
              topCustomers.slice(0, 5).map((customer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiAward className="text-gray-600 text-xs" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {customer.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.mobileNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ${customer.totalSpent?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.transactionCount || 0} services
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No customer data available
              </div>
            )}
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            {revenue ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiCheckCircle className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Service Revenue</p>
                      <p className="text-sm text-gray-500">
                        {revenue.services?.length || 0} different services
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">
                      ${(revenue.serviceRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FiTrendingUp className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Add-On Revenue</p>
                      <p className="text-sm text-gray-500">
                        {revenue.addOns?.length || 0} different add-ons
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      ${(revenue.addOnRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FiDollarSign className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Total Revenue</p>
                      <p className="text-sm text-gray-500">Combined earnings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600">
                      ${(revenue.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Operational Insights */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Operational Insights</h2>
        
        {/* Peak Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Peak Hours */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Peak Hours</h3>
            <div className="h-64">
              {peakAnalysis?.peakHours?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakAnalysis.peakHours.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, "Transactions"]}
                      labelFormatter={(label) => `${label}:00`}
                    />
                    <Bar dataKey="transactionCount" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No peak hours data available
                </div>
              )}
            </div>
          </Card>

          {/* Peak Days */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Peak Days</h3>
            <div className="h-64">
              {peakAnalysis?.peakDays?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakAnalysis.peakDays}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dayName" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Transactions"]} />
                    <Bar dataKey="transactionCount" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No peak days data available
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Technician Utilization */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Technician Utilization</h3>
          <div className="space-y-3">
            {technicianUtilization?.length ? (
              technicianUtilization.map((tech, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {tech.technicianName?.split(' ').map(n => n[0]).join('') || 'T'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{tech.technicianName}</p>
                      <p className="text-sm text-gray-500">
                        {tech.totalTransactions} total • {tech.completedTransactions} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">
                      {tech.completionRate?.toFixed(1) || 0}%
                    </p>
                    <p className="text-sm text-gray-500">completion rate</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No technician data available
              </div>
            )}
          </div>
        </Card>

        {/* Service Stage Bottlenecks */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Service Stage Bottlenecks</h3>
          <div className="space-y-3">
            {stageBottlenecks?.length ? (
              stageBottlenecks.map((stage, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 font-medium">
                        {stage.stage?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium capitalize">{stage.stage}</p>
                      <p className="text-sm text-gray-500">
                        {stage.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-orange-600">
                      {stage.averageTimeInStage?.toFixed(1) || 0}h
                    </p>
                    <p className="text-sm text-gray-500">avg time</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No bottleneck data available
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  isCurrency = false,
}: {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  isCurrency?: boolean;
}) {
  const isPositive = change >= 0;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-light mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div
        className={`flex items-center mt-3 text-sm ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <FiTrendingUp className="mr-1" />
        ) : (
          <FiTrendingDown className="mr-1" />
        )}
        {!isCurrency && change > 0 ? "+" : ""}
        {isCurrency ? `$${change.toLocaleString()}` : change.toLocaleString()}
        {!isCurrency ? " Today" : ""}
      </div>
    </Card>
  );
}
