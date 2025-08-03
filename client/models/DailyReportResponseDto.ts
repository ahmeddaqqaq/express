/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CashSummary } from './CashSummary';
import type { SupervisorSalesReport } from './SupervisorSalesReport';
import type { TechnicianShiftReport } from './TechnicianShiftReport';
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
     * Supervisor sales for add-ons
     */
    supervisorSales: Array<SupervisorSalesReport>;
    /**
     * Report generation timestamp
     */
    generatedAt: string;
};

