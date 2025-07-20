/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CalculateTotalDto = {
    /**
     * Service ID to calculate price for
     */
    serviceId: string;
    /**
     * Car ID to determine car type for pricing
     */
    carId: string;
    /**
     * Array of add-on service IDs to include in total (optional)
     */
    addOnsIds?: Array<string>;
};

