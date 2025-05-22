/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImagesService {
    /**
     * Get image details
     * @returns any
     * @throws ApiError
     */
    public static imageControllerGetImages(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/images',
        });
    }
    /**
     * Get image details
     * @returns any
     * @throws ApiError
     */
    public static imageControllerGetImage({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/images/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Delete an image
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
    /**
     * Assign image to brand as logo
     * @returns any
     * @throws ApiError
     */
    public static imageControllerAssignToBrand(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/images/assign-to-brand',
        });
    }
    /**
     * Assign images to transaction
     * @returns any
     * @throws ApiError
     */
    public static imageControllerAssignToTransaction(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/images/assign-to-transaction',
        });
    }
    /**
     * Upload an image
     * @returns any
     * @throws ApiError
     */
    public static imageControllerUploadImage({
        formData,
    }: {
        formData: {
            image?: Blob;
        },
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/images/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
