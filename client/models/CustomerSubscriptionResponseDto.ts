/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionResponseDto } from './SubscriptionResponseDto';
export type CustomerSubscriptionResponseDto = {
    id: string;
    customerId: string;
    carId: string;
    subscriptionId: string;
    qrCodeId: string;
    qrCode: string;
    isActive: boolean;
    purchaseDate: string;
    activationDate?: string;
    expiryDate?: string;
    totalPrice: number;
    subscription: SubscriptionResponseDto;
    remainingServices: Array<string>;
};

