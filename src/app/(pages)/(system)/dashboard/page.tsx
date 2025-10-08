"use client";

import React, { ReactNode, useEffect, useState } from "react";
import {
  FiUsers,
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
import { motion } from "framer-motion";
import { getCurrentBusinessDate } from "@/lib/date-utils";
import {
  CardStatsResponse,
  RevenueSummary,
  StatisticsService,
  SubscriptionStatisticsResponse,
  SubscriptionServicesUsageResponse,
} from "../../../../../client";
import { FaCheckCircle } from "react-icons/fa";

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
  const [subscriptionStatsAllTime, setSubscriptionStatsAllTime] =
    useState<SubscriptionStatisticsResponse>();
  const [subscriptionServicesUsage, setSubscriptionServicesUsage] =
    useState<SubscriptionServicesUsageResponse[]>();

  const [timeRange, setTimeRange] = useState<"day" | "month" | "year" | "all">(
    "day"
  );
  const currentBusinessDate = getCurrentBusinessDate();

  useEffect(() => {
    async function fetchAllData() {
      try {
        console.log("Fetching data for business date:", currentBusinessDate);

        const [cardStats, revenueData, subscriptionData] = await Promise.all([
          StatisticsService.statisticsControllerGetCardStats({
            range: timeRange,
          }),
          StatisticsService.statisticsControllerGetRevenueStatistics({
            range: timeRange,
          }),
          StatisticsService.statisticsControllerGetSubscriptionStatistics({
            range: timeRange,
          }),
        ]);

        setStats(cardStats as unknown as CardStatsResponse);
        setRevenue(revenueData as unknown as RevenueSummary);
        setSubscriptionStats(
          subscriptionData as unknown as SubscriptionStatisticsResponse
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchAllData();
  }, [timeRange]);

  useEffect(() => {
    async function fetchSubscriptionAllTimeData() {
      try {
        const [subscriptionDataAllTime, servicesUsageData] = await Promise.all([
          StatisticsService.statisticsControllerGetSubscriptionStatistics({
            range: "all",
          }),
          StatisticsService.statisticsControllerGetSubscriptionServicesUsage({
            range: "all",
          }),
        ]);

        console.log("Subscription Data All Time:", subscriptionDataAllTime);
        console.log("Services Usage Data:", servicesUsageData);

        setSubscriptionStatsAllTime(
          subscriptionDataAllTime as unknown as SubscriptionStatisticsResponse
        );
        setSubscriptionServicesUsage(
          servicesUsageData as unknown as SubscriptionServicesUsageResponse[]
        );
      } catch (error) {
        console.error("Error fetching subscription all-time data:", error);
      }
    }

    fetchSubscriptionAllTimeData();
  }, []);

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
              Radiant Car Wash
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

        {/* General Stats */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">General Stats</h2>
          <MotionDiv
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
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
              </>
            )}

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
                  description={`${
                    revenue.addOns?.length || 0
                  } different add-ons`}
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

            {subscriptionStats && (
              <EnhancedStatCard
                title="Subscriptions"
                isSubscription={true}
                value={
                  subscriptionStats.totalSubscriptions?.toLocaleString() || "0"
                }
                change={subscriptionStats.totalSubscriptions || 0}
                icon={<FiAward className="h-5 w-5" />}
                description={`${timeRange} subscriptions`}
              />
            )}
          </MotionDiv>
        </div>

        {/* Subscription Stats */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Subscription Stats (All Time)</h2>
          <MotionDiv
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {subscriptionStatsAllTime && (
              <>
                <EnhancedStatCard
                  title="Total Subscriptions"
                  isSubscription={true}
                  value={
                    subscriptionStatsAllTime.totalSubscriptions?.toLocaleString() ||
                    "0"
                  }
                  change={subscriptionStatsAllTime.totalSubscriptions || 0}
                  icon={<FiAward className="h-5 w-5" />}
                  description="All subscriptions"
                />
                <EnhancedStatCard
                  title="Active Subscriptions"
                  isSubscription={true}
                  value={
                    subscriptionStatsAllTime.activeSubscriptions?.toLocaleString() ||
                    "0"
                  }
                  change={subscriptionStatsAllTime.activeSubscriptions || 0}
                  icon={<FaCheckCircle className="h-5 w-5" />}
                  description="Currently active"
                />
                <EnhancedStatCard
                  title="Activated"
                  isSubscription={true}
                  value={
                    subscriptionStatsAllTime.activatedSubscriptions?.toLocaleString() ||
                    "0"
                  }
                  change={subscriptionStatsAllTime.activatedSubscriptions || 0}
                  icon={<FiTrendingUp className="h-5 w-5" />}
                  description="Been activated"
                />
                <EnhancedStatCard
                  title="Expired"
                  isSubscription={true}
                  value={
                    subscriptionStatsAllTime.expiredSubscriptions?.toLocaleString() ||
                    "0"
                  }
                  change={subscriptionStatsAllTime.expiredSubscriptions || 0}
                  icon={<FiTrendingDown className="h-5 w-5" />}
                  description="Expired subscriptions"
                />
                <EnhancedStatCard
                  title="Pending Activation"
                  isSubscription={true}
                  value={
                    subscriptionStatsAllTime.pendingActivation?.toLocaleString() ||
                    "0"
                  }
                  change={subscriptionStatsAllTime.pendingActivation || 0}
                  icon={<FiClock className="h-5 w-5" />}
                  description="Awaiting activation"
                />
              </>
            )}

            {subscriptionServicesUsage &&
              subscriptionServicesUsage.map((service, index) => (
                <Card key={index} className="border bg-white dark:bg-gray-950">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {service.serviceName}
                        </CardTitle>
                        <div className="text-3xl font-bold">
                          {service.subscriptionCount}
                        </div>
                      </div>
                      <div className="p-3 rounded-full bg-muted">
                        <FiAward className="h-5 w-5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Total Allocated: {service.totalAllocated}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">
                          Used: {service.totalUsed}
                        </span>
                        <span className="text-orange-600">
                          Unused: {service.totalUnused}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (service.totalUsed / service.totalAllocated) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </MotionDiv>
        </div>
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
  isSubscription = false,
}: {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  description: string;
  isCurrency?: boolean;
  isSubscription?: boolean;
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
      {isSubscription ? (
        <div />
      ) : (
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
      )}
    </MotionCard>
  );
}
