/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ServiceCarTypeRevenueResponse = {
    /**
     * Service ID
     */
    serviceId: string;
    /**
     * Service name
     */
    serviceName: string;
    /**
     * Car type
     */
    carType: string;
    /**
     * Total completed transactions for this service-carType combination
     */
    completedCount: number;
    /**
     * Total revenue generated from this service-carType combination
     */
    totalRevenue: number;
};

