/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSuperVisorDto } from '../models/CreateSuperVisorDto';
import type { SupervisorManyResponse } from '../models/SupervisorManyResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SupervisorService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static supervisorControllerCreate({
        requestBody,
    }: {
        requestBody: CreateSuperVisorDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/supervisor/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns SupervisorManyResponse
     * @throws ApiError
     */
    public static supervisorControllerFindMany({
        search,
        skip,
        take,
    }: {
        search?: string,
        skip?: number,
        take?: number,
    }): CancelablePromise<SupervisorManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/supervisor/findMany',
            query: {
                'search': search,
                'skip': skip,
                'take': take,
            },
        });
    }
}
