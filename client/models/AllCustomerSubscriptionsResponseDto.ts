/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CarInfoDto } from './CarInfoDto';
import type { CustomerInfoDto } from './CustomerInfoDto';
import type { RemainingServiceDto } from './RemainingServiceDto';
import type { SubscriptionBasicInfoDto } from './SubscriptionBasicInfoDto';
import type { SubscriptionDatesDto } from './SubscriptionDatesDto';
import type { SubscriptionPricingDto } from './SubscriptionPricingDto';
import type { SubscriptionStatusDto } from './SubscriptionStatusDto';
export type AllCustomerSubscriptionsResponseDto = {
    id: string;
    qrCode?: string;
    isActivated: boolean;
    customer: CustomerInfoDto;
    subscription: SubscriptionBasicInfoDto;
    car: CarInfoDto;
    remainingServices: Array<RemainingServiceDto>;
    totalServicesRemaining: number;
    status: SubscriptionStatusDto;
    pricing: SubscriptionPricingDto;
    dates: SubscriptionDatesDto;
};

