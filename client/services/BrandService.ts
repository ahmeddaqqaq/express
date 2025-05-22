/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BrandManyResponse } from '../models/BrandManyResponse';
import type { CreateBrandDto } from '../models/CreateBrandDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BrandService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static brandControllerCreate({
        requestBody,
    }: {
        requestBody: CreateBrandDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/brand/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns BrandManyResponse
     * @throws ApiError
     */
    public static brandControllerFindMany({
        skip,
        take,
        search,
    }: {
        skip?: number,
        take?: number,
        search?: string,
    }): CancelablePromise<BrandManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/brand/findMany',
            query: {
                'skip': skip,
                'take': take,
                'search': search,
            },
        });
    }
}
