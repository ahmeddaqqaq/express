/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ModelResponse = {
    id: string;
    name: string;
    brandId: string;
    carType: ModelResponse.carType;
    createdAt: string;
    updatedAt: string;
};
export namespace ModelResponse {
    export enum carType {
        BIKE = 'Bike',
        SEDAN = 'Sedan',
        CROSSOVER = 'Crossover',
        SUV = 'SUV',
        VAN = 'VAN',
    }
}

