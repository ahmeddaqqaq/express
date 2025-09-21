/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionPriceDto } from './SubscriptionPriceDto';
import type { SubscriptionServiceDto } from './SubscriptionServiceDto';
export type UpdateSubscriptionDto = {
    /**
     * Subscription name
     */
    name: string;
    /**
     * Subscription description
     */
    description?: string;
    /**
     * Subscription end date (optional)
     */
    endDate?: string;
    /**
     * Maximum uses per service (optional)
     */
    maxUsesPerService?: number;
    /**
     * Services included in subscription
     */
    services: Array<SubscriptionServiceDto>;
    /**
     * Pricing per car type
     */
    prices: Array<SubscriptionPriceDto>;
};

