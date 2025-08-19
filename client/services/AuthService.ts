/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeleteUserDto } from '../models/DeleteUserDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';
import type { SigninDto } from '../models/SigninDto';
import type { SignupDto } from '../models/SignupDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { UserInfoResponse } from '../models/UserInfoResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * Create a new user account with mobile number, password, and role
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static authControllerSignup({
        requestBody,
    }: {
        requestBody: SignupDto,
    }): CancelablePromise<{
        /**
         * JWT access token
         */
        access_token?: string;
        /**
         * JWT refresh token
         */
        refresh_token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                409: `Mobile number already in use`,
            },
        });
    }
    /**
     * Sign in user
     * Authenticate user with mobile number and password. Sets httpOnly cookies for tokens.
     * @returns any User signed in successfully
     * @throws ApiError
     */
    public static authControllerSignin({
        requestBody,
    }: {
        requestBody: SigninDto,
    }): CancelablePromise<{
        message?: string;
        /**
         * JWT access token (also set as httpOnly cookie)
         */
        access_token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/signin',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Refresh access token
     * Generate new access and refresh tokens using existing refresh token from cookies. This endpoint is also automatically called by middleware when refresh token is present without access token.
     * @returns any Tokens refreshed successfully
     * @throws ApiError
     */
    public static authControllerRefresh(): CancelablePromise<{
        message?: string;
        /**
         * New JWT access token (also set as httpOnly cookie)
         */
        access_token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/refresh',
            errors: {
                401: `Refresh token not found or invalid`,
            },
        });
    }
    /**
     * Logout user
     * Clear authentication cookies and sign out the user
     * @returns any User logged out successfully
     * @throws ApiError
     */
    public static authControllerLogout(): CancelablePromise<{
        message?: string;
    }> {
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
    /**
     * Delete a user (Admin only)
     * @returns any User deactivated successfully
     * @throws ApiError
     */
    public static authControllerDeleteUser({
        requestBody,
    }: {
        requestBody: DeleteUserDto,
    }): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/auth/delete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - Admin role required`,
                404: `User not found`,
            },
        });
    }
    /**
     * Reset user password (Admin only)
     * Allows an admin to reset a user's password by providing their mobile number and new password
     * @returns any Password reset successfully
     * @throws ApiError
     */
    public static authControllerResetPassword({
        requestBody,
    }: {
        requestBody: ResetPasswordDto,
    }): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - Admin role required`,
                404: `User not found`,
            },
        });
    }
    /**
     * Update current user profile
     * Allows a user to update their name and/or mobile number
     * @returns UserInfoResponse User updated successfully
     * @throws ApiError
     */
    public static authControllerUpdateUser({
        requestBody,
    }: {
        requestBody: UpdateUserDto,
    }): CancelablePromise<UserInfoResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/express/auth/update',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                409: `Mobile number already in use`,
            },
        });
    }
    /**
     * Get all users with supervisor role
     * @returns any Supervisor users retrieved successfully
     * @throws ApiError
     */
    public static authControllerGetSupervisors(): CancelablePromise<Array<{
        userId?: string;
        name?: string;
        mobileNumber?: string;
        role?: 'SUPERVISOR';
        isActive?: boolean;
        createdAt?: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/auth/supervisors',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
