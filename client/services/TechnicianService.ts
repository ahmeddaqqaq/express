/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTechnicianDto } from '../models/CreateTechnicianDto';
import type { TechnicianManyResponse } from '../models/TechnicianManyResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TechnicianService {
    /**
     * Create a new technician
     * Create a new technician with first name, last name, and active status
     * @returns any Technician created successfully
     * @throws ApiError
     */
    public static technicianControllerCreate({
        requestBody,
    }: {
        requestBody: CreateTechnicianDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation failed`,
            },
        });
    }
    /**
     * Find technicians with pagination
     * Get a paginated list of technicians with their work statistics and latest actions
     * @returns TechnicianManyResponse
     * @throws ApiError
     */
    public static technicianControllerFindMany({
        search,
        skip,
        take,
    }: {
        /**
         * Search by technician name
         */
        search?: string,
        /**
         * Number of records to skip for pagination
         */
        skip?: number,
        /**
         * Number of records to return (max 100)
         */
        take?: number,
    }): CancelablePromise<TechnicianManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/technician/findMany',
            query: {
                'search': search,
                'skip': skip,
                'take': take,
            },
        });
    }
    /**
     * Get technicians with active shifts
     * Get all technicians who have active shifts or overtime for today (for ticket assignment)
     * @returns any Active shift technicians retrieved successfully
     * @throws ApiError
     */
    public static technicianControllerGetActiveShiftTechnicians(): CancelablePromise<Array<{
        id?: string;
        fName?: string;
        lName?: string;
        status?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/technician/active-shifts',
        });
    }
    /**
     * Start technician shift
     * Start a new work shift for the technician
     * @returns any Shift started successfully
     * @throws ApiError
     */
    public static technicianControllerStartShift({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/start-shift',
            path: {
                'id': id,
            },
            errors: {
                400: `Shift already started or validation error`,
                404: `Technician not found`,
            },
        });
    }
    /**
     * End technician shift
     * End the current work shift for the technician
     * @returns any Shift ended successfully
     * @throws ApiError
     */
    public static technicianControllerEndShift({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/end-shift',
            path: {
                'id': id,
            },
            errors: {
                400: `No active shift or validation error`,
                404: `Technician not found`,
            },
        });
    }
    /**
     * Start technician break
     * Start a break during active shift
     * @returns any Break started successfully
     * @throws ApiError
     */
    public static technicianControllerStartBreak({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/start-break',
            path: {
                'id': id,
            },
            errors: {
                400: `No active shift or break already started`,
                404: `Technician not found`,
            },
        });
    }
    /**
     * End technician break
     * End the current break during active shift
     * @returns any Break ended successfully
     * @throws ApiError
     */
    public static technicianControllerEndBreak({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/end-break',
            path: {
                'id': id,
            },
            errors: {
                400: `No active break or validation error`,
                404: `Technician not found`,
            },
        });
    }
    /**
     * Start technician overtime
     * Start overtime work during active shift
     * @returns any Overtime started successfully
     * @throws ApiError
     */
    public static technicianControllerStartOvertime({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/start-overtime',
            path: {
                'id': id,
            },
            errors: {
                400: `No active shift or overtime already started`,
                404: `Technician not found`,
            },
        });
    }
    /**
     * End technician overtime
     * End the current overtime work during active shift
     * @returns any Overtime ended successfully
     * @throws ApiError
     */
    public static technicianControllerEndOvertime({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/end-overtime',
            path: {
                'id': id,
            },
            errors: {
                400: `No active overtime or validation error`,
                404: `Technician not found`,
            },
        });
    }
    /**
     * Get technician daily working hours
     * Get detailed working hours breakdown for a specific date
     * @returns any Working hours retrieved successfully
     * @throws ApiError
     */
    public static technicianControllerGetDailyWorkingHours({
        id,
        date,
    }: {
        id: string,
        /**
         * Date to get working hours for (YYYY-MM-DD format)
         */
        date: string,
    }): CancelablePromise<{
        date?: string;
        shiftTime?: string;
        breakTime?: string;
        overtimeTime?: string;
        totalWorkingTime?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/technician/{id}/daily-working-hours',
            path: {
                'id': id,
            },
            query: {
                'date': date,
            },
            errors: {
                404: `Technician not found`,
            },
        });
    }
    /**
     * Update technician details
     * Update technician information (name, status, etc.)
     * @returns any Technician updated successfully
     * @throws ApiError
     */
    public static technicianControllerUpdate({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: CreateTechnicianDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/express/technician/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Technician not found`,
            },
        });
    }
    /**
     * Delete technician
     * Remove a technician from the system
     * @returns any Technician deleted successfully
     * @throws ApiError
     */
    public static technicianControllerDelete({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/technician/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Technician not found`,
            },
        });
    }
    /**
     * Start work on transaction phase
     * Record when a technician starts working on a specific transaction phase
     * @returns any Work started successfully
     * @throws ApiError
     */
    public static technicianControllerStartWorkOnTransaction({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            transactionId: string;
            phase: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/start-work',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Technician or transaction not found`,
            },
        });
    }
    /**
     * Complete work on transaction phase
     * Record when a technician completes work on a specific transaction phase
     * @returns any Work completed successfully
     * @throws ApiError
     */
    public static technicianControllerCompleteWorkOnTransaction({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            transactionId: string;
            phase: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/{id}/complete-work',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Technician or transaction not found`,
            },
        });
    }
    /**
     * Get technician assignments by technician ID
     * @returns any Technician assignments retrieved successfully
     * @throws ApiError
     */
    public static technicianControllerGetTechnicianAssignments({
        id,
        isActive,
    }: {
        id: string,
        /**
         * Filter by active assignments
         */
        isActive?: boolean,
    }): CancelablePromise<Array<{
        id?: string;
        technicianId?: string;
        transactionId?: string;
        phase?: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
        assignedAt?: string;
        startedAt?: string | null;
        completedAt?: string | null;
        isActive?: boolean;
        transaction?: {
            id?: string;
            status?: string;
            customer?: {
                fName?: string;
                lName?: string;
            };
        };
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/technician/{id}/assignments',
            path: {
                'id': id,
            },
            query: {
                'isActive': isActive,
            },
        });
    }
    /**
     * Get technician audit logs
     * Get paginated audit logs for a specific technician showing all their activities
     * @returns any Audit logs retrieved successfully
     * @throws ApiError
     */
    public static technicianControllerGetTechnicianAuditLogs({
        id,
        skip,
        take,
    }: {
        id: string,
        /**
         * Number of records to skip
         */
        skip?: number,
        /**
         * Number of records to return
         */
        take?: number,
    }): CancelablePromise<{
        data?: Array<{
            id?: string;
            action?: string;
            timestamp?: string;
            phase?: string | null;
            description?: string | null;
            metadata?: Record<string, any> | null;
        }>;
        total?: number;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/technician/{id}/audit-logs',
            path: {
                'id': id,
            },
            query: {
                'skip': skip,
                'take': take,
            },
            errors: {
                404: `Technician not found`,
            },
        });
    }
}
