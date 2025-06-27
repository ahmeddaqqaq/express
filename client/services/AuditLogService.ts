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
}
