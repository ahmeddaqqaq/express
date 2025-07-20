/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuditLogManyResponse } from '../models/AuditLogManyResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuditLogService {
    /**
     * @returns AuditLogManyResponse
     * @throws ApiError
     */
    public static auditLogControllerFindMany({
        skip,
        take,
        search,
    }: {
        skip?: number,
        take?: number,
        search?: string,
    }): CancelablePromise<AuditLogManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/audit-log/findMany',
            query: {
                'skip': skip,
                'take': take,
                'search': search,
            },
        });
    }
    /**
     * Get audit logs for a specific transaction
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerGetTransactionLogs({
        transactionId,
    }: {
        transactionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/audit-log/transaction/{transactionId}',
            path: {
                'transactionId': transactionId,
            },
        });
    }
    /**
     * Get audit logs for a specific technician
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerGetTechnicianLogs({
        technicianId,
        skip,
        take,
    }: {
        technicianId: string,
        skip?: number,
        take?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/audit-log/technician/{technicianId}',
            path: {
                'technicianId': technicianId,
            },
            query: {
                'skip': skip,
                'take': take,
            },
        });
    }
    /**
     * Get complete work history for a transaction
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerGetTransactionWorkHistory({
        transactionId,
    }: {
        transactionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/audit-log/transaction/{transactionId}/work-history',
            path: {
                'transactionId': transactionId,
            },
        });
    }
    /**
     * Get technician assignments for a transaction
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerGetTransactionAssignments({
        transactionId,
    }: {
        transactionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/audit-log/transaction/{transactionId}/assignments',
            path: {
                'transactionId': transactionId,
            },
        });
    }
    /**
     * Get assignments for a technician
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerGetTechnicianAssignments({
        technicianId,
        isActive,
    }: {
        technicianId: string,
        isActive?: boolean,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/audit-log/technician/{technicianId}/assignments',
            path: {
                'technicianId': technicianId,
            },
            query: {
                'isActive': isActive,
            },
        });
    }
    /**
     * Assign technician to transaction phase
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerAssignTechnician(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/audit-log/assign-technician',
        });
    }
    /**
     * Start work on transaction phase
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerStartWork(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/audit-log/start-work',
        });
    }
    /**
     * Complete work on transaction phase
     * @returns any
     * @throws ApiError
     */
    public static auditLogControllerCompleteWork(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/audit-log/complete-work',
        });
    }
}
