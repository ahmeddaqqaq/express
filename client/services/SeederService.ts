/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SeederService {
    /**
     * @returns any
     * @throws ApiError
     */
    public static seederControllerSeedFromFile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/seeder/seed-from-file',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static seederControllerSeedFromUpload(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/seeder/seed-from-upload',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static seederControllerGetBrands({
        name,
    }: {
        name: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/seeder/brands',
            query: {
                'name': name,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static seederControllerGetStats(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/seeder/stats',
        });
    }
}
