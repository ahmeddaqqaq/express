/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateServiceDto } from '../models/CreateServiceDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ServiceService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static serviceControllerCreate({
        requestBody,
    }: {
        requestBody: CreateServiceDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/service/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static serviceControllerFindMany(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/service/findMany',
        });
    }
}
