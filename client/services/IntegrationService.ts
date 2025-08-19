/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IntegrationService {
    /**
     * Get all pos tickets
     * @returns any Returns services and add-ons mapped to POS format
     * @throws ApiError
     */
    public static integrationControllerFindMany(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/Integration/findMany',
        });
    }
    /**
     * Mark transaction as paid by order number
     * @returns any Transaction marked as paid successfully
     * @throws ApiError
     */
    public static integrationControllerMarkTransactionAsPaid({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/Integration/mark-paid/{orderId}',
            path: {
                'orderId': orderId,
            },
            errors: {
                400: `Transaction is already marked as paid`,
                404: `Order not found`,
            },
        });
    }
    /**
     * Mark transaction as pulled by order number
     * @returns any Transaction marked as pulled successfully
     * @throws ApiError
     */
    public static integrationControllerMarkTransactionAsPulled({
        orderId,
    }: {
        orderId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/Integration/mark-pulled/{orderId}',
            path: {
                'orderId': orderId,
            },
            errors: {
                400: `Transaction is already marked as pulled`,
                404: `Order not found`,
            },
        });
    }
}
