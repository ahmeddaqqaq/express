/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SignupDto = {
    /**
     * Username
     */
    name: string;
    /**
     * Mobile number
     */
    mobileNumber: string;
    /**
     * Password for the account (min 6 characters)
     */
    password: string;
    /**
     * Role of the user
     */
    role: SignupDto.role;
};
export namespace SignupDto {
    /**
     * Role of the user
     */
    export enum role {
        ADMIN = 'ADMIN',
        SUPERVISOR = 'SUPERVISOR',
    }
}

