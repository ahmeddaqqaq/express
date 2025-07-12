/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImageService {
    /**
     * Upload an image
     * @returns any Image uploaded successfully
     * @throws ApiError
     */
    public static imageControllerUploadImage({
        formData,
    }: {
        /**
         * Image file upload
         */
        formData: {
            file?: Blob;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/images/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Bad request`,
            },
        });
    }
    /**
     * Get all images with optional stage filtering
     * @returns any Images retrieved successfully
     * @throws ApiError
     */
    public static imageControllerFetchAll({
        uploadedAtStage,
    }: {
        /**
         * Filter images by upload stage
         */
        uploadedAtStage?: 'scheduled' | 'stageOne' | 'stageTwo' | 'stageThree' | 'completed' | 'cancelled',
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/images',
            query: {
                'uploadedAtStage': uploadedAtStage,
            },
        });
    }
    /**
     * Serve image with proper CORS headers
     * @returns any Image served successfully
     * @throws ApiError
     */
    public static imageControllerServeImage({
        key,
    }: {
        key: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/images/serve/{key}',
            path: {
                'key': key,
            },
            errors: {
                404: `Image not found`,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static imageControllerDeleteImage({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/images/{id}',
            path: {
                'id': id,
            },
        });
    }
}
