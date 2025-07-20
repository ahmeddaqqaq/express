/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SignupDto = {
    /**
     * Full name of the user
     */
    name: string;
    /**
     * Jordanian mobile number (must start with 07)
     */
    mobileNumber: string;
    /**
     * Password for the account (minimum 6 characters)
     */
    password: string;
    /**
     * Role of the user in the system
     */
    role: SignupDto.role;
};
export namespace SignupDto {
    /**
     * Role of the user in the system
     */
    export enum role {
        ADMIN = 'ADMIN',
        SUPERVISOR = 'SUPERVISOR',
    }
}

