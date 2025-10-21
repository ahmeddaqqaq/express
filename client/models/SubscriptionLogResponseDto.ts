/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserInfoDto } from './UserInfoDto';
export type SubscriptionLogResponseDto = {
    id: string;
    customerSubscriptionId: string;
    action: SubscriptionLogResponseDto.action;
    purchasedBy?: UserInfoDto;
    purchasedAt?: string;
    activatedBy?: UserInfoDto;
    activatedAt?: string;
    createdAt: string;
    updatedAt: string;
};
export namespace SubscriptionLogResponseDto {
    export enum action {
        PURCHASED = 'PURCHASED',
        ACTIVATED = 'ACTIVATED',
    }
}

