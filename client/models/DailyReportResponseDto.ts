/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CashSummary } from './CashSummary';
import type { TechnicianShiftReport } from './TechnicianShiftReport';
import type { UserSalesReport } from './UserSalesReport';
export type DailyReportResponseDto = {
    /**
     * Report date
     */
    date: string;
    /**
     * Technician shift information
     */
    technicianShifts: Array<TechnicianShiftReport>;
    /**
     * Cash summary for the day
     */
    cashSummary: CashSummary;
    /**
     * User sales for add-ons
     */
    userSales: Array<UserSalesReport>;
    /**
     * Report generation timestamp
     */
    generatedAt: string;
};

