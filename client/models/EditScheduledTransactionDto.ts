/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EditScheduledTransactionDto = {
    /**
     * Transaction ID to edit (works for all statuses with restrictions)
     */
    id: string;
    /**
     * New service ID (only allowed for scheduled transactions)
     */
    serviceId?: string;
    /**
     * Array of addon IDs to replace current addons (allowed for all statuses)
     */
    addOnsIds?: Array<string>;
    /**
     * Updated delivery time (only allowed for scheduled transactions)
     */
    deliverTime?: string;
    /**
     * Updated notes (allowed for all statuses)
     */
    notes?: string;
    /**
     * Sales person ID for addon sales tracking (allowed for all statuses, required when adding new addons)
     */
    salesPersonId?: string;
};

