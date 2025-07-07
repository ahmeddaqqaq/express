/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SigninDto } from '../models/SigninDto';
import type { SignupDto } from '../models/SignupDto';
import type { UserInfoResponse } from '../models/UserInfoResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static authControllerSignup({
        requestBody,
    }: {
        requestBody: SignupDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerSignin({
        requestBody,
    }: {
        requestBody: SigninDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/signin',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Refresh access token
     * @returns any Tokens refreshed successfully
     * @throws ApiError
     */
    public static authControllerRefresh(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/refresh',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/logout',
        });
    }
    /**
     * Get current user information
     * @returns UserInfoResponse User information retrieved successfully
     * @throws ApiError
     */
    public static authControllerGetCurrentUser(): CancelablePromise<UserInfoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/auth/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
