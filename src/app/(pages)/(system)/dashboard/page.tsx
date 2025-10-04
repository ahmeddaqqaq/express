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
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { getCurrentBusinessDate } from "@/lib/date-utils";
import {
  CardStatsResponse,
  RevenueSummary,
  StatisticsService,
  SubscriptionStatisticsResponse,
  UserAddOnSalesResponse,
} from "../../../../../client";

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

export default function Dashboard() {
  const [stats, setStats] = useState<CardStatsResponse>();
  const [revenue, setRevenue] = useState<RevenueSummary>();
  const [subscriptionStats, setSubscriptionStats] =
    useState<SubscriptionStatisticsResponse>();
  const [userAddOnSales, setUserAddOnSales] =
    useState<UserAddOnSalesResponse[]>();
  const [timeRange, setTimeRange] = useState<"day" | "month" | "year" | "all">(
    "day"
  );
  const currentBusinessDate = getCurrentBusinessDate();

  useEffect(() => {
    async function fetchAllData() {
      try {
        console.log("Fetching data for business date:", currentBusinessDate);

        const [cardStats, revenueData, subscriptionData, addOnSalesData] =
          await Promise.all([
            StatisticsService.statisticsControllerGetCardStats({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetRevenueStatistics({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetSubscriptionStatistics({
              range: timeRange,
            }),
            StatisticsService.statisticsControllerGetUserAddOnSales({
              range: timeRange,
            }),
          ]);

        setStats(cardStats as unknown as CardStatsResponse);
        setRevenue(revenueData as unknown as RevenueSummary);
        setSubscriptionStats(
          subscriptionData as unknown as SubscriptionStatisticsResponse
        );
        setUserAddOnSales(
          addOnSalesData as unknown as UserAddOnSalesResponse[]
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
              Express Wash Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <FiActivity className="h-4 w-4" />
              Business Date: {currentBusinessDate.toLocaleDateString()}
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

        {/* All Stats Grid - 4 Columns */}
        <MotionDiv
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Customer & Transaction Stats */}
          {stats && (
            <>
              <EnhancedStatCard
                title="Active Customers"
                value={stats.activeCustomers?.toLocaleString() || "0"}
                change={stats.newCustomers || 0}
                icon={<FiUsers className="h-5 w-5" />}
                description="Total active customers"
              />
              <EnhancedStatCard
                title="New Customers"
                value={stats.newCustomers?.toLocaleString() || "0"}
                change={stats.newCustomers || 0}
                icon={<FiTrendingUp className="h-5 w-5" />}
                description={`New in ${timeRange}`}
              />
              <EnhancedStatCard
                title="Scheduled"
                value={stats.scheduledTransactions?.toLocaleString() || "0"}
                change={stats.scheduledTransactions || 0}
                icon={<FaCalendarAlt className="h-5 w-5" />}
                description="Scheduled services"
              />
              <EnhancedStatCard
                title="In Progress"
                value={stats.inProgressTransaction?.toLocaleString() || "0"}
                change={stats.inProgressTransaction || 0}
                icon={<FiActivity className="h-5 w-5" />}
                description="Currently active"
              />
              <EnhancedStatCard
                title="Completed"
                value={stats.completedTransactions?.toLocaleString() || "0"}
                change={stats.completedTransactions || 0}
                icon={<FiCheckCircle className="h-5 w-5" />}
                description="Successfully completed"
              />
            </>
          )}

          {/* Revenue Cards */}
          {revenue && (
            <>
              <EnhancedStatCard
                title="Service Revenue"
                value={`$${(revenue.serviceRevenue || 0).toLocaleString()}`}
                change={revenue.serviceRevenue || 0}
                icon={<FiDollarSign className="h-5 w-5" />}
                description={`${
                  revenue.services?.length || 0
                } different services`}
                isCurrency
              />
              <EnhancedStatCard
                title="Add-On Revenue"
                value={`$${(revenue.addOnRevenue || 0).toLocaleString()}`}
                change={revenue.addOnRevenue || 0}
                icon={<FiTrendingUp className="h-5 w-5" />}
                description={`${revenue.addOns?.length || 0} different add-ons`}
                isCurrency
              />
              <EnhancedStatCard
                title="Total Revenue"
                value={`$${(revenue.totalRevenue || 0).toLocaleString()}`}
                change={revenue.totalRevenue || 0}
                icon={<FiDollarSign className="h-5 w-5" />}
                description="Combined earnings"
                isCurrency
              />
            </>
          )}

          {/* Subscription Stats */}
          {subscriptionStats && (
            <>
              <EnhancedStatCard
                title="Total Subscriptions"
                value={
                  subscriptionStats.totalSubscriptions?.toLocaleString() || "0"
                }
                change={subscriptionStats.totalSubscriptions || 0}
                icon={<FiAward className="h-5 w-5" />}
                description="All subscriptions"
              />
              <EnhancedStatCard
                title="Active Subscriptions"
                value={
                  subscriptionStats.activeSubscriptions?.toLocaleString() || "0"
                }
                change={subscriptionStats.activeSubscriptions || 0}
                icon={<FiCheckCircle className="h-5 w-5" />}
                description="Currently active"
              />
              <EnhancedStatCard
                title="Activated"
                value={
                  subscriptionStats.activatedSubscriptions?.toLocaleString() ||
                  "0"
                }
                change={subscriptionStats.activatedSubscriptions || 0}
                icon={<FiTrendingUp className="h-5 w-5" />}
                description="Been activated"
              />
              <EnhancedStatCard
                title="Expired"
                value={
                  subscriptionStats.expiredSubscriptions?.toLocaleString() ||
                  "0"
                }
                change={subscriptionStats.expiredSubscriptions || 0}
                icon={<FiTrendingDown className="h-5 w-5" />}
                description="Expired subscriptions"
              />
              <EnhancedStatCard
                title="Pending Activation"
                value={
                  subscriptionStats.pendingActivation?.toLocaleString() || "0"
                }
                change={subscriptionStats.pendingActivation || 0}
                icon={<FiClock className="h-5 w-5" />}
                description="Awaiting activation"
              />
            </>
          )}

          {/* User Add-On Sales */}
          {userAddOnSales &&
            userAddOnSales.map((user, index) => (
              <EnhancedStatCard
                key={index}
                title={user.userName || "Unknown"}
                value={`$${user.totalAddOnRevenue?.toLocaleString() || "0"}`}
                change={user.totalAddOnRevenue || 0}
                icon={<FiUsers className="h-5 w-5" />}
                description={`${user.addOnCount || 0} add-ons sold`}
                isCurrency
              />
            ))}
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
  description,
  isCurrency = false,
}: {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  description: string;
  isCurrency?: boolean;
}) {
  const isPositive = change >= 0;

  return (
    <MotionCard
      variants={cardVariants}
      className="border bg-white dark:bg-gray-950"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="text-3xl font-bold">{value}</div>
          </div>
          <div className="p-3 rounded-full bg-muted">{icon}</div>
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
