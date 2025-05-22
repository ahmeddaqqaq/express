/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CarResponse } from './CarResponse';
export type CustomerResponse = {
    id: string;
    fName: string;
    lName: string;
    mobileNumber: string;
    count: number;
    cars: Array<CarResponse>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

