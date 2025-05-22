/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddOnsManyResponse } from '../models/AddOnsManyResponse';
import type { CreateAddOnDto } from '../models/CreateAddOnDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AddOnsService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static addOnsControllerCreate({
        requestBody,
    }: {
        requestBody: CreateAddOnDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/add-ons/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AddOnsManyResponse
     * @throws ApiError
     */
    public static addOnsControllerFindMany({
        skip,
        take,
        search,
    }: {
        skip?: number,
        take?: number,
        search?: string,
    }): CancelablePromise<AddOnsManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/add-ons/findMany',
            query: {
                'skip': skip,
                'take': take,
                'search': search,
            },
        });
    }
}
