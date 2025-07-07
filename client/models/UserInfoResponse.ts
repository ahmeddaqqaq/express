/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserInfoResponse = {
    /**
     * User ID
     */
    userId: string;
    /**
     * User name
     */
    name: string;
    /**
     * User mobile number
     */
    mobileNumber: string;
    /**
     * User role
     */
    role: UserInfoResponse.role;
    /**
     * Whether user is active
     */
    isActive: boolean;
    /**
     * User creation date
     */
    createdAt: string;
};
export namespace UserInfoResponse {
    /**
     * User role
     */
    export enum role {
        ADMIN = 'ADMIN',
        SUPERVISOR = 'SUPERVISOR',
    }
}

