/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateModelDto } from '../models/CreateModelDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModelService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static modelControllerCreate({
        requestBody,
    }: {
        requestBody: CreateModelDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/model/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static modelControllerFindMany(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/model/findMany',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static modelControllerUpdate({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: CreateModelDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/model/update/{id}',
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
    public static modelControllerDelete({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/model/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
}
