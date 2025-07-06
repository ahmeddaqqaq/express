/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCarDto } from '../models/CreateCarDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CarService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static carControllerCreate({
        requestBody,
    }: {
        requestBody: CreateCarDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/car/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static carControllerFindMany(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/car/findMany',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static carControllerUpdate({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: CreateCarDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/car/update/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static carControllerDelete({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/car/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}
