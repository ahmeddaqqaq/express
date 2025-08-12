/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateTransactionDto = {
    /**
     * Customer ID who owns the car
     */
    customerId: string;
    /**
     * Car ID to be serviced
     */
    carId: string;
    /**
     * Array of add-on service IDs (optional)
     */
    addOnsIds?: Array<string>;
    /**
     * Additional notes for the transaction (optional)
     */
    note?: string;
    /**
     * ID of the supervisor creating this transaction
     */
    createdById?: string;
    /**
     * Expected delivery time (optional)
     */
    deliverTime?: string;
    /**
     * Service type ID to be performed
     */
    serviceId: string;
};

