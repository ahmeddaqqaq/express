/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddOnsResponse } from './AddOnsResponse';
import type { CarResponse } from './CarResponse';
import type { CustomerResponse } from './CustomerResponse';
import type { ImageResponse } from './ImageResponse';
import type { InvoiceResponse } from './InvoiceResponse';
import type { ServiceResponse } from './ServiceResponse';
import type { UserInfoResponse } from './UserInfoResponse';
export type TransactionResponse = {
    id: string;
    status: TransactionResponse.status;
    isPaid: boolean;
    isPulled: boolean;
    customerId: string;
    carId: string;
    customer: CustomerResponse;
    car: CarResponse;
    service: ServiceResponse;
    addOns: Array<AddOnsResponse>;
    invoice: InvoiceResponse;
    images: Array<ImageResponse>;
    createdByUser: UserInfoResponse;
    assignments: Array<{
        id?: string;
        technicianId?: string;
        transactionId?: string;
        phase?: string;
        assignedAt?: string;
        startedAt?: string | null;
        completedAt?: string | null;
        isActive?: boolean;
        technician?: Record<string, any>;
    }>;
    deliverTime: string;
    notes: string;
    OTP: string;
    createdAt: string;
    updatedAt: string;
};
export namespace TransactionResponse {
    export enum status {
        SCHEDULED = 'scheduled',
        STAGE_ONE = 'stageOne',
        STAGE_TWO = 'stageTwo',
        STAGE_THREE = 'stageThree',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
    }
}

