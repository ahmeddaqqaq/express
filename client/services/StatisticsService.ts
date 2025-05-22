/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetCardStats(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/cardStats',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static statisticsControllerGetRatio(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/statistics/completionRatios',
        });
    }
}
