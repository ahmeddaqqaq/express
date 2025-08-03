/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TechnicianShiftReport = {
    /**
     * Technician ID
     */
    technicianId: string;
    /**
     * Technician full name
     */
    technicianName: string;
    /**
     * Total shift time in HH:MM:SS format
     */
    totalShiftTime: string;
    /**
     * Total break time in HH:MM:SS format
     */
    totalBreakTime: string;
    /**
     * Total overtime in HH:MM:SS format
     */
    totalOvertimeTime: string;
    /**
     * Total working time (shift + overtime - break) in HH:MM:SS format
     */
    totalWorkingTime: string;
    /**
     * Whether technician worked on this date
     */
    worked: boolean;
};

