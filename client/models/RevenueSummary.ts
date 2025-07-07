/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddOnRevenue } from './AddOnRevenue';
import type { ServiceRevenue } from './ServiceRevenue';
export type RevenueSummary = {
    totalRevenue: number;
    serviceRevenue: number;
    addOnRevenue: number;
    services: Array<ServiceRevenue>;
    addOns: Array<AddOnRevenue>;
};

