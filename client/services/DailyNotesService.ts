/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDailyNoteDto } from '../models/CreateDailyNoteDto';
import type { DailyNoteResponse } from '../models/DailyNoteResponse';
import type { DailyNotesListResponse } from '../models/DailyNotesListResponse';
import type { UpdateDailyNoteDto } from '../models/UpdateDailyNoteDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DailyNotesService {
    /**
     * Create a new daily note
     * @returns DailyNoteResponse Daily note created successfully
     * @throws ApiError
     */
    public static dailyNoteControllerCreate({
        requestBody,
    }: {
        requestBody: CreateDailyNoteDto,
    }): CancelablePromise<DailyNoteResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/daily-notes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - Invalid data`,
                404: `Images not found`,
            },
        });
    }
    /**
     * Get daily notes with optional filtering
     * @returns DailyNotesListResponse Daily notes retrieved successfully
     * @throws ApiError
     */
    public static dailyNoteControllerFindAll({
        date,
        startDate,
        endDate,
        createdById,
        page,
        limit,
    }: {
        /**
         * Filter by specific date (YYYY-MM-DD)
         */
        date?: string,
        /**
         * Filter by date range - start date (YYYY-MM-DD)
         */
        startDate?: string,
        /**
         * Filter by date range - end date (YYYY-MM-DD)
         */
        endDate?: string,
        /**
         * Filter by user who created the note
         */
        createdById?: string,
        /**
         * Page number (default: 1)
         */
        page?: string,
        /**
         * Number of items per page (default: 10)
         */
        limit?: string,
    }): CancelablePromise<DailyNotesListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/daily-notes',
            query: {
                'date': date,
                'startDate': startDate,
                'endDate': endDate,
                'createdById': createdById,
                'page': page,
                'limit': limit,
            },
        });
    }
    /**
     * Create a daily note with image uploads
     * @returns DailyNoteResponse Daily note with images created successfully
     * @throws ApiError
     */
    public static dailyNoteControllerCreateWithImages({
        formData,
    }: {
        /**
         * Daily note with images
         */
        formData: {
            /**
             * The content of the daily note
             */
            note: string;
            /**
             * Image files to attach (max 10)
             */
            images?: Array<Blob>;
        },
    }): CancelablePromise<DailyNoteResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/daily-notes/with-images',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad request - Invalid data`,
            },
        });
    }
    /**
     * Get daily notes for a specific date
     * @returns DailyNoteResponse Daily notes for the specified date
     * @throws ApiError
     */
    public static dailyNoteControllerFindByDate({
        date,
    }: {
        date: string,
    }): CancelablePromise<Array<DailyNoteResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/daily-notes/by-date/{date}',
            path: {
                'date': date,
            },
        });
    }
    /**
     * Get a daily note by ID
     * @returns DailyNoteResponse Daily note retrieved successfully
     * @throws ApiError
     */
    public static dailyNoteControllerFindOne({
        id,
    }: {
        id: string,
    }): CancelablePromise<DailyNoteResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/daily-notes/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Daily note not found`,
            },
        });
    }
    /**
     * Update a daily note
     * @returns DailyNoteResponse Daily note updated successfully
     * @throws ApiError
     */
    public static dailyNoteControllerUpdate({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateDailyNoteDto,
    }): CancelablePromise<DailyNoteResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/daily-notes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden - can only edit own notes`,
                404: `Daily note not found`,
            },
        });
    }
    /**
     * Soft delete a daily note
     * @returns any Daily note deleted successfully
     * @throws ApiError
     */
    public static dailyNoteControllerRemove({
        id,
    }: {
        id: string,
    }): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/daily-notes/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden - can only delete own notes`,
                404: `Daily note not found`,
            },
        });
    }
    /**
     * Update a daily note with new image uploads
     * @returns DailyNoteResponse Daily note with images updated successfully
     * @throws ApiError
     */
    public static dailyNoteControllerUpdateWithImages({
        id,
        formData,
    }: {
        id: string,
        /**
         * Updated daily note with images
         */
        formData: {
            /**
             * The updated content of the daily note
             */
            note?: string;
            /**
             * Whether to replace existing images or add to them
             */
            replaceImages?: boolean;
            /**
             * Image files to attach (max 10)
             */
            images?: Array<Blob>;
        },
    }): CancelablePromise<DailyNoteResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/daily-notes/{id}/with-images',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                403: `Forbidden - can only edit own notes`,
                404: `Daily note not found`,
            },
        });
    }
}
