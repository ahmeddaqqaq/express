/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCustomerDto } from '../models/CreateCustomerDto';
import type { CustomersManyResponse } from '../models/CustomersManyResponse';
import type { UpdateCustomerDto } from '../models/UpdateCustomerDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomerService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static customerControllerCreate({
        requestBody,
    }: {
        requestBody: CreateCustomerDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/customer/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns CustomersManyResponse
     * @throws ApiError
     */
    public static customerControllerFindMany({
        skip,
        take,
        search,
    }: {
        skip?: number,
        take?: number,
        search?: string,
    }): CancelablePromise<CustomersManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/customer/findMany',
            query: {
                'skip': skip,
                'take': take,
                'search': search,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static customerControllerFindOne({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/customer/{id}',
            query: {
                'id': id,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static customerControllerUpdate({
        requestBody,
    }: {
        requestBody: UpdateCustomerDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/customer/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
