/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserSalesReport = {
    /**
     * User ID
     */
    userId: string;
    /**
     * User full name
     */
    userName: string;
    /**
     * User role
     */
    userRole: string;
    /**
     * Services sold
     */
    services: {
        count?: number;
        total?: number;
    };
    /**
     * Add-ons sold
     */
    addOns: {
        count?: number;
        total?: number;
    };
    /**
     * Sales commission from add-ons (5% of total add-on sales)
     */
    addOnCommission: number;
};

