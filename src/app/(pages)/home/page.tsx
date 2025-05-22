"use client";

import React, { ReactNode, useEffect, useState } from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaCalendar, FaCalendarAlt, FaCar } from "react-icons/fa";
import {
  CardStatsResponse,
  CompletionRatioResponse,
  StatisticsService,
} from "../../../../client";

export default function Dashboard() {
  const [stats, setStats] = useState<CardStatsResponse>();
  const [ratio, setRatio] = useState<CompletionRatioResponse>();
  // Minimal mock data
  const stat = {
    customers: 1243,
    newCustomers: 18,
    revenue: 87640,
    revenueChange: 12.4,
    services: 3576,
    todayServices: 42,
    completionRate: 92,
  };

  const weeklyData = [
    { day: "Mon", services: 56 },
    { day: "Tue", services: 63 },
    { day: "Wed", services: 75 },
    { day: "Thu", services: 78 },
    { day: "Fri", services: 94 },
    { day: "Sat", services: 112 },
    { day: "Sun", services: 86 },
  ];

  const vehicleTypes = [
    { brand: "Toyota", percentage: 42 },
    { brand: "Honda", percentage: 33 },
    { brand: "Ford", percentage: 25 },
  ];

  useEffect(() => {
    async function fetchCardData() {
      const resp = await StatisticsService.statisticsControllerGetCardStats();

      setStats(resp as unknown as CardStatsResponse);
    }

    async function completionRatio() {
      const resp = await StatisticsService.statisticsControllerGetRatio();
      setRatio(resp as unknown as CompletionRatioResponse);
    }
    completionRatio();
    fetchCardData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Express Wash</h1>
          <p className="text-gray-500">Today's overview</p>
        </div>
        <Button variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Key Metrics - Minimalist */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Customers"
            value={`${stats.activeCustomers}`}
            change={stats.newCustomersToday}
            icon={<FiUsers className="text-gray-600" />}
          />
          <StatCard
            title="Scheduled Services"
            value={`${stats.scheduledTransactions.toLocaleString()}`}
            change={stats.inProgressTransaction}
            icon={<FaCalendarAlt className="text-gray-600" />}
            isCurrency
          />
          <StatCard
            title="Services Completed"
            value={`${stats.completedTransactions}`}
            change={stats.completedTransactionsToday}
            icon={<FiCheckCircle className="text-gray-600" />}
          />
        </div>
      )}

      {/* Simple Bar Chart */}
      <Card className="p-4">
        <h2 className="font-medium mb-4">Weekly Service Volume</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="services"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Distribution */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Vehicle Brands</h2>
          <div className="space-y-3">
            {vehicleTypes.map((brand, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <FaCar className="mr-2 text-gray-500" />
                    {brand.brand}
                  </span>
                  <span>{brand.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full"
                    style={{ width: `${brand.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Completion Rate */}
        {ratio && (
          <Card className="p-4">
            <h2 className="font-medium mb-4">Service Completion</h2>
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="text-4xl font-light">
                  {ratio.completionRatio}%
                </div>
                <p className="text-gray-500">of services completed on time</p>
                <div className="w-full bg-gray-100 rounded-full h-2 max-w-xs mx-auto">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${ratio.completionRatio}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
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
    <Card className="p-4">
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
        {isCurrency ? `${change}` : change}
        {!isCurrency ? " Today" : " In-Progress"}
      </div>
    </Card>
  );
}
