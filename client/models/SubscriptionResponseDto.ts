/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionPriceResponseDto } from './SubscriptionPriceResponseDto';
import type { SubscriptionServiceResponseDto } from './SubscriptionServiceResponseDto';
export type SubscriptionResponseDto = {
    id: string;
    name: string;
    description?: string;
    endDate?: string;
    maxUsesPerService?: number;
    isActive: boolean;
    services: Array<SubscriptionServiceResponseDto>;
    prices: Array<SubscriptionPriceResponseDto>;
    createdAt: string;
    updatedAt: string;
};

