/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTransactionDto } from '../models/CreateTransactionDto';
import type { UpdateTransactionDto } from '../models/UpdateTransactionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionService {
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerCreate({
        requestBody,
    }: {
        requestBody: CreateTransactionDto,
    }): CancelablePromise<void> {
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
    public static transactionControllerFindScheduled(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findScheduled',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindStageOne(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageOne',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindStageTwo(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageTwo',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindStageThree(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageThree',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerFindCompleted(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findCompleted',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transactionControllerUpdate({
        requestBody,
    }: {
        requestBody: UpdateTransactionDto,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/transaction/update',
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
}
