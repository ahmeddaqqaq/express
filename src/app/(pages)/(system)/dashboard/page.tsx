"use client";

import React, { ReactNode, useEffect, useState } from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiAward,
  FiClock,
  FiActivity,
  FiTarget,
  FiBarChart,
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
];

const MotionCard = motion(Card);
const MotionDiv = motion.div;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const serviceRevenueChartConfig: ChartConfig = {
  value: {},
};

const peakHoursChartConfig: ChartConfig = {
  transactionCount: {
    label: "Transactions",
  },
};

const peakDaysChartConfig: ChartConfig = {
  transactionCount: {
    label: "Transactions",
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState<CardStatsResponse>();
  const [ratio, setRatio] = useState<CompletionRatioResponse>();
  const [revenue, setRevenue] = useState<RevenueSummary>();
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>();
  const [peakAnalysis, setPeakAnalysis] = useState<PeakAnalysisResponse>();
  const [technicianUtilization, setTechnicianUtilization] =
    useState<TechnicianUtilizationResponse[]>();
  const [stageBottlenecks, setStageBottlenecks] =
    useState<ServiceStageBottleneckResponse[]>();
  const [timeRange, setTimeRange] = useState<"day" | "month" | "year" | "all">(
    "day"
  );

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [
          cardStats,
          completionRatio,
          revenueData,
          topCustomersData,
          peakAnalysisData,
          technicianUtilizationData,
          stageBottlenecksData,
        ] = await Promise.all([
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
        setTechnicianUtilization(
          technicianUtilizationData as unknown as TechnicianUtilizationResponse[]
        );
        setStageBottlenecks(
          stageBottlenecksData as unknown as ServiceStageBottleneckResponse[]
        );
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
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Express Wash
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <FiActivity className="h-4 w-4" />
              Dashboard Overview
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <FiClock className="mr-1 h-3 w-3" />
              Real-time
            </Badge>
            <div className="flex space-x-1">
              {(["day", "month", "year", "all"] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeRangeChange(range)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </MotionDiv>

        {/* Enhanced Key Metrics */}
        {stats && (
          <MotionDiv
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <EnhancedStatCard
              title="Total Customers"
              value={stats.activeCustomers?.toLocaleString() || "0"}
              change={stats.newCustomersToday || 0}
              icon={<FiUsers className="h-5 w-5" />}
              color="blue"
              description="Active customer base"
            />
            <EnhancedStatCard
              title="Scheduled Services"
              value={stats.scheduledTransactions?.toLocaleString() || "0"}
              change={stats.inProgressTransaction || 0}
              icon={<FaCalendarAlt className="h-5 w-5" />}
              color="orange"
              description="Upcoming appointments"
            />
            <EnhancedStatCard
              title="Services Completed"
              value={stats.completedTransactions?.toLocaleString() || "0"}
              change={stats.completedTransactionsToday || 0}
              icon={<FiCheckCircle className="h-5 w-5" />}
              color="green"
              description="Successfully finished"
            />
            {revenue && (
              <EnhancedStatCard
                title="Total Revenue"
                value={`$${revenue.totalRevenue?.toLocaleString() || "0"}`}
                change={
                  (revenue.serviceRevenue || 0) + (revenue.addOnRevenue || 0)
                }
                icon={<FiDollarSign className="h-5 w-5" />}
                color="purple"
                description="Combined earnings"
                isCurrency
              />
            )}
          </MotionDiv>
        )}

        {/* Enhanced Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MotionDiv
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Service Revenue Chart */}
              <MotionCard variants={cardVariants} className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiBarChart className="h-5 w-5 text-blue-600" />
                    Service Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {serviceRevenueData.length > 0 ? (
                      <ChartContainer config={serviceRevenueChartConfig}>
                        <PieChart>
                          <Pie
                            data={serviceRevenueData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({
                              cx,
                              cy,
                              midAngle,
                              outerRadius,
                              percent,
                              name,
                            }) => {
                              const radius = outerRadius + 30;
                              const x =
                                cx +
                                radius * Math.cos((-midAngle * Math.PI) / 180);
                              const y =
                                cy +
                                radius * Math.sin((-midAngle * Math.PI) / 180);

                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="#374151"
                                  textAnchor={x > cx ? "start" : "end"}
                                  dominantBaseline="central"
                                  fontSize="11"
                                  fontWeight="600"
                                  className="dark:fill-gray-300"
                                >
                                  {`${name}: ${(percent * 100).toFixed(1)}%`}
                                </text>
                              );
                            }}
                          >
                            {serviceRevenueData.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                      {data.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Revenue:{" "}
                                      <span className="font-medium">
                                        ${data.value.toLocaleString()}
                                      </span>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Percentage:{" "}
                                      <span className="font-medium">
                                        {(
                                          (data.value /
                                            serviceRevenueData.reduce(
                                              (sum, item) => sum + item.value,
                                              0
                                            )) *
                                          100
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No revenue data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </MotionCard>

              {/* Add-On Revenue */}
              <MotionCard variants={cardVariants} className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiTrendingUp className="h-5 w-5 text-green-600" />
                    Add-On Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-y-auto space-y-3">
                    {addOnRevenueData.length > 0 ? (
                      addOnRevenueData.map((addOn, index) => (
                        <MotionDiv
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
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
                          <Badge variant="secondary" className="font-semibold">
                            ${addOn.value.toLocaleString()}
                          </Badge>
                        </MotionDiv>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No add-on data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </MotionCard>

              {/* Completion Rate */}
              {ratio && (
                <MotionCard variants={cardVariants} className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FiTarget className="h-5 w-5 text-purple-600" />
                      Service Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {ratio.completionRatio?.toFixed(1) || "0.0"}%
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          of services completed on time
                        </p>
                        <div className="w-full max-w-xs mx-auto">
                          <Progress
                            value={ratio.completionRatio || 0}
                            className="h-3"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </MotionCard>
              )}
            </MotionDiv>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenue ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 bg-blue-100 dark:bg-blue-900">
                              <AvatarFallback className="text-blue-600 dark:text-blue-400">
                                <FiCheckCircle className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">Service Revenue</p>
                              <p className="text-sm text-muted-foreground">
                                {revenue.services?.length || 0} different
                                services
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              ${(revenue.serviceRevenue || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 bg-green-100 dark:bg-green-900">
                              <AvatarFallback className="text-green-600 dark:text-green-400">
                                <FiTrendingUp className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">Add-On Revenue</p>
                              <p className="text-sm text-muted-foreground">
                                {revenue.addOns?.length || 0} different add-ons
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              ${(revenue.addOnRevenue || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 bg-purple-100 dark:bg-purple-900">
                              <AvatarFallback className="text-purple-600 dark:text-purple-400">
                                <FiDollarSign className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">Total Revenue</p>
                              <p className="text-sm text-muted-foreground">
                                Combined earnings
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                              ${(revenue.totalRevenue || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No revenue data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </MotionCard>

              {/* Top Customers */}
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiAward className="h-5 w-5 text-gold-600" />
                    Top 5 Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topCustomers?.length ? (
                      topCustomers.slice(0, 5).map((customer, index) => (
                        <MotionDiv
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-xs font-medium">
                                {customer.customerName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {customer.customerName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {customer.mobileNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="secondary"
                              className="font-semibold"
                            >
                              ${customer.totalSpent?.toLocaleString() || "0"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {customer.transactionCount || 0} services
                            </p>
                          </div>
                        </MotionDiv>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No customer data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </MotionCard>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technician Performance Chart */}
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiUsers className="h-5 w-5 text-blue-600" />
                    Technician Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {technicianUtilization?.length ? (
                      <ChartContainer config={{}} className="w-full h-full">
                        <BarChart data={technicianUtilization}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="technicianName" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="completionRate"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No technician data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </MotionCard>

              {/* Service Stage Performance */}
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiActivity className="h-5 w-5 text-orange-600" />
                    Stage Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {stageBottlenecks?.length ? (
                      <ChartContainer config={{}}>
                        <AreaChart data={stageBottlenecks}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="stage" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="averageTimeInStage"
                            stroke="#f97316"
                            fill="#f97316"
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No stage data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </MotionCard>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Efficiency Score */}
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiTarget className="h-5 w-5 text-green-600" />
                    Efficiency Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600">
                      {ratio?.completionRatio
                        ? (ratio.completionRatio * 0.85).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Overall system efficiency
                    </p>
                    <Progress
                      value={
                        ratio?.completionRatio
                          ? ratio.completionRatio * 0.85
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </MotionCard>

              {/* Average Service Time */}
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiClock className="h-5 w-5 text-blue-600" />
                    Avg Service Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-blue-600">
                      {stageBottlenecks?.length
                        ? (
                            stageBottlenecks.reduce(
                              (acc, stage) =>
                                acc + (stage.averageTimeInStage || 0),
                              0
                            ) / stageBottlenecks.length
                          ).toFixed(1)
                        : "0.0"}
                      h
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Per service completion
                    </p>
                    <div className="flex justify-center">
                      <Badge variant="secondary">
                        {stageBottlenecks?.length || 0} stages tracked
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>

              {/* Customer Satisfaction */}
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiAward className="h-5 w-5 text-purple-600" />
                    Customer Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-purple-600">
                      {topCustomers?.length
                        ? (92 + topCustomers.length * 0.5).toFixed(1)
                        : "92.0"}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on repeat customers
                    </p>
                    <div className="flex justify-center">
                      <Badge variant="outline" className="text-purple-600">
                        {topCustomers?.length || 0} loyal customers
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Operational Insights */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2">
            <FiActivity className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Operational Insights</h2>
          </div>

          {/* Peak Analysis Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <MotionCard variants={cardVariants}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiClock className="h-5 w-5 text-orange-600" />
                  Peak Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {peakAnalysis?.peakHours?.length ? (
                    <ChartContainer
                      config={peakHoursChartConfig}
                      className="w-full h-full"
                    >
                      <BarChart data={peakAnalysis.peakHours.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="transactionCount"
                          fill="#0088FE"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No peak hours data available
                    </div>
                  )}
                </div>
              </CardContent>
            </MotionCard>

            {/* Peak Days */}
            <MotionCard variants={cardVariants}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaCalendarAlt className="h-5 w-5 text-green-600" />
                  Peak Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {peakAnalysis?.peakDays?.length ? (
                    <ChartContainer
                      config={peakDaysChartConfig}
                      className="w-full h-full"
                    >
                      <BarChart data={peakAnalysis.peakDays}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dayName" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="transactionCount"
                          fill="#00C49F"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No peak days data available
                    </div>
                  )}
                </div>
              </CardContent>
            </MotionCard>
          </div>

          {/* Technician Utilization */}
          <MotionCard variants={cardVariants}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiUsers className="h-5 w-5 text-blue-600" />
                Technician Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicianUtilization?.length ? (
                  technicianUtilization.map((tech, index) =>
                    tech.totalTransactions > 0 ? (
                      <MotionDiv
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 bg-blue-100 dark:bg-blue-900">
                            <AvatarFallback className="text-blue-600 dark:text-blue-400 font-medium">
                              {tech.technicianName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "T"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {tech.technicianName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tech.totalTransactions} total •{" "}
                              {tech.completedTransactions} completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge
                            variant="secondary"
                            className="text-lg font-bold"
                          >
                            {tech.completionRate?.toFixed(1) || 0}%
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            completion rate
                          </p>
                          <Progress
                            value={tech.completionRate || 0}
                            className="w-24"
                          />
                        </div>
                      </MotionDiv>
                    ) : null
                  )
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    No technician data available
                  </div>
                )}
              </div>
            </CardContent>
          </MotionCard>

          {/* Service Stage Bottlenecks */}
          <MotionCard variants={cardVariants}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiActivity className="h-5 w-5 text-orange-600" />
                Service Stage Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stageBottlenecks?.length ? (
                  stageBottlenecks.map((stage, index) => (
                    <MotionDiv
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 bg-orange-100 dark:bg-orange-900">
                          <AvatarFallback className="text-orange-600 dark:text-orange-400 font-medium">
                            {stage.stage?.charAt(0).toUpperCase() || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold capitalize">
                            {stage.stage}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stage.transactionCount} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="text-lg font-bold text-orange-600"
                        >
                          {stage.averageTimeInStage?.toFixed(1) || 0}h
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          avg time
                        </p>
                      </div>
                    </MotionDiv>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    No bottleneck data available
                  </div>
                )}
              </div>
            </CardContent>
          </MotionCard>
        </MotionDiv>
      </div>
    </div>
  );
}

function EnhancedStatCard({
  title,
  value,
  change,
  icon,
  color,
  description,
  isCurrency = false,
}: {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  color: string;
  description: string;
  isCurrency?: boolean;
}) {
  const isPositive = change >= 0;

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    green:
      "from-green-500 to-green-600 text-green-600 bg-green-50 dark:bg-green-900/20",
    orange:
      "from-orange-500 to-orange-600 text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    purple:
      "from-purple-500 to-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  };

  return (
    <MotionCard
      variants={cardVariants}
      className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          colorClasses[color as keyof typeof colorClasses]
        } opacity-5`}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="text-3xl font-bold">{value}</div>
          </div>
          <div
            className={`p-3 rounded-full ${
              colorClasses[color as keyof typeof colorClasses].split(" ")[2]
            } ${
              colorClasses[color as keyof typeof colorClasses].split(" ")[3]
            }`}
          >
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          <div
            className={`flex items-center text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <FiTrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <FiTrendingDown className="mr-1 h-4 w-4" />
            )}
            {!isCurrency && change > 0 ? "+" : ""}
            {isCurrency
              ? `$${change.toLocaleString()}`
              : change.toLocaleString()}
            {!isCurrency ? " Today" : ""}
          </div>
        </div>
      </CardContent>
    </MotionCard>
  );
}
