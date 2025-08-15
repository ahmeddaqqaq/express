/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignTechnicianToPhaseDto } from '../models/AssignTechnicianToPhaseDto';
import type { CalculateTotalDto } from '../models/CalculateTotalDto';
import type { CancelTransactionDto } from '../models/CancelTransactionDto';
import type { CreateTransactionDto } from '../models/CreateTransactionDto';
import type { EditScheduledTransactionDto } from '../models/EditScheduledTransactionDto';
import type { TransactionManyResponse } from '../models/TransactionManyResponse';
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
     * Find transactions with pagination and filtering
     * Get a paginated list of transactions with optional search and date filtering. If no date is provided, returns all transactions.
     * @returns TransactionManyResponse Transactions retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerFindMany({
        search,
        date,
        skip,
        take,
    }: {
        /**
         * Search by customer mobile number, plate number, or transaction ID
         */
        search?: string,
        /**
         * Filter transactions by date (YYYY-MM-DD format). If not provided, returns all transactions.
         */
        date?: string,
        skip?: number,
        take?: number,
    }): CancelablePromise<TransactionManyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findMany',
            query: {
                'search': search,
                'date': date,
                'skip': skip,
                'take': take,
            },
            errors: {
                400: `Bad request - invalid pagination or filter parameters`,
            },
        });
    }
    /**
     * Find scheduled transactions
     * Get all transactions in scheduled status, optionally filtered by creation date
     * @returns TransactionResponse Scheduled transactions retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerFindScheduled({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format) to filter by creation date
         */
        date?: string,
    }): CancelablePromise<Array<TransactionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findScheduled',
            query: {
                'date': date,
            },
            errors: {
                400: `Bad request - invalid date format`,
            },
        });
    }
    /**
     * Find transactions in stage one
     * Get all transactions currently in stageOne status, optionally filtered by date
     * @returns TransactionResponse Stage one transactions retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerFindStageOne({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format) to filter by creation date
         */
        date?: string,
    }): CancelablePromise<Array<TransactionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageOne',
            query: {
                'date': date,
            },
            errors: {
                400: `Bad request - invalid date format`,
            },
        });
    }
    /**
     * Find transactions in stage two
     * Get all transactions currently in stageTwo status, optionally filtered by date
     * @returns TransactionResponse Stage two transactions retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerFindStageTwo({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format) to filter by creation or update date
         */
        date?: string,
    }): CancelablePromise<Array<TransactionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageTwo',
            query: {
                'date': date,
            },
            errors: {
                400: `Bad request - invalid date format`,
            },
        });
    }
    /**
     * Find transactions in stage three
     * Get all transactions currently in stageThree status, optionally filtered by date
     * @returns TransactionResponse Stage three transactions retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerFindStageThree({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format) to filter by creation or update date
         */
        date?: string,
    }): CancelablePromise<Array<TransactionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findInProgressStageThree',
            query: {
                'date': date,
            },
            errors: {
                400: `Bad request - invalid date format`,
            },
        });
    }
    /**
     * Find completed transactions
     * Get all completed transactions, optionally filtered by completion date
     * @returns TransactionResponse Completed transactions retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerFindCompleted({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format) to filter by completion date
         */
        date?: string,
    }): CancelablePromise<Array<TransactionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findCompleted',
            query: {
                'date': date,
            },
            errors: {
                400: `Bad request - invalid date format`,
            },
        });
    }
    /**
     * Find cancelled transactions
     * Get all cancelled transactions, optionally filtered by cancellation date
     * @returns TransactionResponse Cancelled transactions retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerFindCancelled({
        date,
    }: {
        /**
         * Date filter (YYYY-MM-DD format) to filter by cancellation date
         */
        date?: string,
    }): CancelablePromise<Array<TransactionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/findCancelled',
            query: {
                'date': date,
            },
            errors: {
                400: `Bad request - invalid date format`,
            },
        });
    }
    /**
     * Cancel a scheduled transaction
     * Cancel a transaction that is currently in scheduled status with optional notes
     * @returns TransactionResponse Transaction cancelled successfully
     * @throws ApiError
     */
    public static transactionControllerCancelTransaction({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: CancelTransactionDto,
    }): CancelablePromise<TransactionResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/transaction/cancel/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - transaction is not in scheduled status`,
                404: `Transaction not found`,
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
            errors: {
                400: `Bad request - validation failed or invalid phase progression`,
                404: `Transaction not found`,
            },
        });
    }
    /**
     * Edit transaction details
     * Edit transaction details. For scheduled transactions: all fields can be edited. For other statuses: only notes, add-ons, and sales person can be edited.
     * @returns TransactionResponse Transaction edited successfully
     * @throws ApiError
     */
    public static transactionControllerEditScheduled({
        requestBody,
    }: {
        requestBody: EditScheduledTransactionDto,
    }): CancelablePromise<TransactionResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/transaction/edit-scheduled',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - trying to edit restricted fields for non-scheduled transaction or invalid data`,
                404: `Transaction, service, or addon not found`,
            },
        });
    }
    /**
     * Calculate total price for transaction
     * Calculate total price based on service type, car type, and selected addons
     * @returns any Total calculated successfully
     * @throws ApiError
     */
    public static transactionControllerCalculateTotal({
        requestBody,
    }: {
        requestBody: CalculateTotalDto,
    }): CancelablePromise<{
        /**
         * Total price including service and addons
         */
        total?: number;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/transaction/calculate-total',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Car, service, or addon not found`,
            },
        });
    }
    /**
     * Upload image to transaction
     * Upload an image file to a transaction. Image will be tagged with current transaction status/phase.
     * @returns any Image uploaded successfully
     * @throws ApiError
     */
    public static transactionControllerUploadImage({
        id,
        formData,
    }: {
        id: string,
        /**
         * Image file upload (JPEG, PNG, etc.)
         */
        formData: {
            /**
             * Image file to upload
             */
            file: Blob;
        },
    }): CancelablePromise<{
        id?: string;
        status?: string;
        images?: Array<{
            id?: string;
            key?: string;
            url?: string;
            uploadedAtStage?: string;
            createdAt?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/transaction/{id}/upload',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad request - invalid file type or no file provided`,
                404: `Transaction not found`,
            },
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
    /**
     * Assign multiple technicians to a specific phase of a transaction
     * @returns any Technicians assigned successfully
     * @throws ApiError
     */
    public static transactionControllerAssignTechnicianToPhase({
        requestBody,
    }: {
        requestBody: AssignTechnicianToPhaseDto,
    }): CancelablePromise<Array<{
        id?: string;
        technicianId?: string;
        transactionId?: string;
        phase?: 'stageOne' | 'stageTwo' | 'stageThree';
        assignedAt?: string;
        technician?: {
            id?: string;
            fName?: string;
            lName?: string;
        };
    }>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/transaction/assign-technician',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid phase, technicians already assigned, or no technician IDs provided`,
            },
        });
    }
    /**
     * Get all technician assignments for a transaction
     * @returns any Assignments retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerGetTransactionAssignments({
        id,
    }: {
        id: string,
    }): CancelablePromise<Array<{
        id?: string;
        technicianId?: string;
        transactionId?: string;
        phase?: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled';
        assignedAt?: string;
        startedAt?: string | null;
        completedAt?: string | null;
        isActive?: boolean;
        technician?: {
            id?: string;
            fName?: string;
            lName?: string;
        };
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/{id}/assignments',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get technician assignments for a specific phase
     * @returns any Phase assignments retrieved successfully
     * @throws ApiError
     */
    public static transactionControllerGetPhaseAssignments({
        id,
        phase,
    }: {
        id: string,
        /**
         * Phase to get assignments for
         */
        phase: 'stageOne' | 'stageTwo' | 'stageThree',
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/transaction/{id}/assignments/{phase}',
            path: {
                'id': id,
            },
            query: {
                'phase': phase,
            },
        });
    }
}
