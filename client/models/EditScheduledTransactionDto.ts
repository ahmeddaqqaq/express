/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EditScheduledTransactionDto = {
    /**
     * Transaction ID to edit (must be in scheduled status)
     */
    id: string;
    /**
     * New service ID
     */
    serviceId?: string;
    /**
     * Array of addon IDs to replace current addons
     */
    addOnsIds?: Array<string>;
    /**
     * Updated delivery time
     */
    deliverTime?: string;
    /**
     * Updated notes
     */
    notes?: string;
};

