/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubscriptionServicesUsageResponse = {
    /**
     * Service ID
     */
    serviceId: string;
    /**
     * Service name
     */
    serviceName: string;
    /**
     * Total number of service allocations across all subscriptions
     */
    totalAllocated: number;
    /**
     * Total number of services used
     */
    totalUsed: number;
    /**
     * Total number of unused services
     */
    totalUnused: number;
    /**
     * Number of subscriptions including this service
     */
    subscriptionCount: number;
};

