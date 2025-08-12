/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSalesDto } from '../models/CreateSalesDto';
import type { SalesManyResponse } from '../models/SalesManyResponse';
import type { SalesResponse } from '../models/SalesResponse';
import type { UpdateSalesDto } from '../models/UpdateSalesDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SalesService {
    /**
     * Create a new sales person
     * @returns SalesResponse Sales person created successfully
     * @throws ApiError
     */
    public static salesControllerCreate({
        requestBody,
    }: {
        requestBody: CreateSalesDto,
    }): CancelablePromise<SalesResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/sales',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Sales person with this mobile number already exists`,
            },
        });
    }
    /**
     * Get all sales persons with filters
     * @returns SalesManyResponse Sales persons retrieved successfully
     * @throws ApiError
     */
    public static salesControllerFindMany({
        search,
        isActive,
        skip,
        take,
    }: {
        /**
         * Search by name or mobile
         */
        search?: string,
        /**
         * Filter by active status
         */
        isActive?: boolean,
        skip?: number,
        take?: number,
    }): CancelablePromise<SalesManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/sales',
            query: {
                'search': search,
                'isActive': isActive,
                'skip': skip,
                'take': take,
            },
        });
    }
    /**
     * Update a sales person
     * @returns SalesResponse Sales person updated successfully
     * @throws ApiError
     */
    public static salesControllerUpdate({
        requestBody,
    }: {
        requestBody: UpdateSalesDto,
    }): CancelablePromise<SalesResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/sales',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Sales person not found`,
                409: `Sales person with this mobile number already exists`,
            },
        });
    }
    /**
     * Get a sales person by ID
     * @returns SalesResponse Sales person retrieved successfully
     * @throws ApiError
     */
    public static salesControllerFindOne({
        id,
    }: {
        id: string,
    }): CancelablePromise<SalesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/sales/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Sales person not found`,
            },
        });
    }
    /**
     * Delete a sales person
     * @returns any Sales person deleted successfully
     * @throws ApiError
     */
    public static salesControllerDelete({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/sales/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Sales person not found`,
                409: `Cannot delete sales person with active assignments`,
            },
        });
    }
}
