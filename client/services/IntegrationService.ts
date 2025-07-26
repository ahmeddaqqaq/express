/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IntegrationService {
    /**
     * Get all services and add-ons for POS integration
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
     * Get all POS orders
     * @returns any Returns all POS orders with transaction details
     * @throws ApiError
     */
    public static integrationControllerGetAllPosOrders(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/Integration/pos-orders',
        });
    }
    /**
     * Get POS order by transaction ID
     * @returns any Returns POS order for specific transaction
     * @throws ApiError
     */
    public static integrationControllerGetPosOrderByTransaction({
        transactionId,
    }: {
        transactionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/Integration/pos-orders/transaction/{transactionId}',
            path: {
                'transactionId': transactionId,
            },
            errors: {
                404: `POS order not found`,
            },
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
}
