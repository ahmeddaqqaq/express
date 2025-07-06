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
     * @returns void
     * @throws ApiError
     */
    public static technicianControllerCreate({
        requestBody,
    }: {
        requestBody: CreateTechnicianDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/technician/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns TechnicianManyResponse
     * @throws ApiError
     */
    public static technicianControllerFindMany({
        search,
        skip,
        take,
    }: {
        search?: string,
        skip?: number,
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
     * @returns any
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
        });
    }
    /**
     * @returns any
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
        });
    }
    /**
     * @returns any
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
        });
    }
    /**
     * @returns any
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
        });
    }
    /**
     * @returns any
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
        });
    }
    /**
     * @returns any
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
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static technicianControllerGetDailyWorkingHours({
        id,
        date,
    }: {
        id: string,
        date: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/technician/{id}/daily-working-hours',
            path: {
                'id': id,
            },
            query: {
                'date': date,
            },
        });
    }
    /**
     * @returns any
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
        });
    }
    /**
     * @returns any
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
        });
    }
}
