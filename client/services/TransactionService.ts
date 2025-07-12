/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CalculateTotalDto } from '../models/CalculateTotalDto';
import type { CreateTransactionDto } from '../models/CreateTransactionDto';
import type { TransactionResponse } from '../models/TransactionResponse';
import type { UpdateTransactionDto } from '../models/UpdateTransactionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionService {
    /**
     * Create a new transaction
     * @returns TransactionResponse Transaction created successfully
     * @throws ApiError
     */
    public static transactionControllerCreate({
        requestBody,
    }: {
        requestBody: CreateTransactionDto,
    }): CancelablePromise<TransactionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/transaction/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindMany({
        search,
        skip,
        take,
    }: {
        search?: string,
        skip?: number,
        take?: number,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findMany',
            query: {
                'search': search,
                'skip': skip,
                'take': take,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindScheduled({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format)
         */
        date?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findScheduled',
            query: {
                'date': date,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindStageOne({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format)
         */
        date?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageOne',
            query: {
                'date': date,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindStageTwo({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format)
         */
        date?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageTwo',
            query: {
                'date': date,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindStageThree({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format)
         */
        date?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageThree',
            query: {
                'date': date,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindCompleted({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format)
         */
        date?: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findCompleted',
            query: {
                'date': date,
            },
        });
    }
    /**
     * Update transaction status and details
     * @returns TransactionResponse Transaction updated successfully
     * @throws ApiError
     */
    public static transactionControllerUpdate({
        requestBody,
    }: {
        requestBody: UpdateTransactionDto,
    }): CancelablePromise<TransactionResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/transaction/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerCalculateTotal({
        requestBody,
    }: {
        requestBody: CalculateTotalDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/transaction/calculate-total',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Upload image to transaction
     * @returns any
     * @throws ApiError
     */
    public static transactionControllerUploadImage({
        id,
        formData,
    }: {
        id: string,
        /**
         * Image file upload
         */
        formData: {
            file?: Blob;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/transaction/{id}/upload',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Get transaction images filtered by stage
     * @returns any Images retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerGetTransactionImages({
        id,
        stage,
    }: {
        id: string,
        /**
         * Filter images by upload stage
         */
        stage?: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled',
    }): CancelablePromise<Array<{
        id?: string;
        key?: string;
        url?: string;
        isActive?: boolean;
        uploadedAtStage?: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
        createdAt?: string;
        updatedAt?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/{id}/images',
            path: {
                'id': id,
            },
            query: {
                'stage': stage,
            },
        });
    }
    /**
     * Get transaction images grouped by upload stage
     * @returns any Images grouped by stage retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerGetTransactionImagesGrouped({
        id,
    }: {
        id: string,
    }): CancelablePromise<Record<string, Array<{
        id?: string;
        key?: string;
        url?: string;
        isActive?: boolean;
        uploadedAtStage?: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
        createdAt?: string;
        updatedAt?: string;
    }>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/{id}/images/grouped',
            path: {
                'id': id,
            },
        });
    }
}
