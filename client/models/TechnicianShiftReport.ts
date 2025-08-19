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
     * Shift start time in HH:MM:SS format
     */
    shiftStartTime: string;
    /**
     * Shift end time in HH:MM:SS format
     */
    shiftEndTime: string;
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
     * Overtime compensation in dollars (overtime minutes * $0.025 per minute)
     */
    overtimeCompensation: number;
    /**
     * Whether technician worked on this date
     */
    worked: boolean;
};

