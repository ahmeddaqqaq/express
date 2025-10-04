/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerVisitsResponse } from '../models/CustomerVisitsResponse';
import type { DailyReportResponseDto } from '../models/DailyReportResponseDto';
import type { DailySubscriptionRevenueResponse } from '../models/DailySubscriptionRevenueResponse';
import type { SubscriptionServicesUsageResponse } from '../models/SubscriptionServicesUsageResponse';
import type { SubscriptionStatisticsResponse } from '../models/SubscriptionStatisticsResponse';
import type { UserAddOnSalesResponse } from '../models/UserAddOnSalesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetCardStats({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/cardStats',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetRatio({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/completionRatios',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetRevenueStatistics({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/revenue',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetTopCustomers({
        range = 'all',
        customStart,
        customEnd,
        limit,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
        /**
         * Number of top customers to return (default: 5)
         */
        limit?: number,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/topCustomers',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
                'limit': limit,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetPeakAnalysis({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/peakAnalysis',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetTechnicianUtilization({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/technicianUtilization',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetServiceStageBottlenecks({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/stageBottlenecks',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns UserAddOnSalesResponse Returns user add-on sales statistics
     * @throws ApiError
     */
    public static statisticsControllerGetUserAddOnSales({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<Array<UserAddOnSalesResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/userAddOnSales',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns DailyReportResponseDto Returns comprehensive daily report with technician shifts, cash summary, and user sales
     * @throws ApiError
     */
    public static statisticsControllerGetDailyReport({
        date,
    }: {
        /**
         * Date for the daily report in YYYY-MM-DD format
         */
        date: string,
    }): CancelablePromise<DailyReportResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/dailyReport',
            query: {
                'date': date,
            },
        });
    }
    /**
     * @returns any Returns detailed sales report showing who sold what
     * @throws ApiError
     */
    public static statisticsControllerGetDetailedSalesReport({
        startDate,
        endDate,
        includeIncomplete,
    }: {
        /**
         * Start date for the report (YYYY-MM-DD)
         */
        startDate?: string,
        /**
         * End date for the report (YYYY-MM-DD)
         */
        endDate?: string,
        /**
         * Include sales from incomplete transactions
         */
        includeIncomplete?: boolean,
    }): CancelablePromise<Array<{
        id?: string;
        transactionId?: string;
        saleType?: 'SERVICE' | 'ADDON';
        itemName?: string;
        price?: number;
        quantity?: number;
        totalAmount?: number;
        soldAt?: string;
        sellerType?: 'USER' | 'SALES_PERSON';
        sellerName?: string;
        sellerRole?: string;
        transactionStatus?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/detailedSalesReport',
            query: {
                'startDate': startDate,
                'endDate': endDate,
                'includeIncomplete': includeIncomplete,
            },
        });
    }
    /**
     * @returns CustomerVisitsResponse Returns number of completed visits for a specific customer
     * @throws ApiError
     */
    public static statisticsControllerGetNumberOfVisitsPerCustomer({
        customerId,
    }: {
        customerId: string,
    }): CancelablePromise<CustomerVisitsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/customer/{customerId}/visits',
            path: {
                'customerId': customerId,
            },
        });
    }
    /**
     * @returns SubscriptionStatisticsResponse Returns subscription statistics including total, active, activated, and expired counts
     * @throws ApiError
     */
    public static statisticsControllerGetSubscriptionStatistics({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<SubscriptionStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/subscriptions/stats',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns DailySubscriptionRevenueResponse Returns daily subscription revenue data with date and revenue amount
     * @throws ApiError
     */
    public static statisticsControllerGetDailySubscriptionRevenue({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<Array<DailySubscriptionRevenueResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/subscriptions/daily-revenue',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
    /**
     * @returns SubscriptionServicesUsageResponse Returns subscription services usage statistics showing allocated, used, and unused counts
     * @throws ApiError
     */
    public static statisticsControllerGetSubscriptionServicesUsage({
        range = 'all',
        customStart,
        customEnd,
    }: {
        range?: 'day' | 'month' | 'year' | 'all',
        customStart?: string,
        customEnd?: string,
    }): CancelablePromise<Array<SubscriptionServicesUsageResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/subscriptions/services-usage',
            query: {
                'range': range,
                'customStart': customStart,
                'customEnd': customEnd,
            },
        });
    }
}
