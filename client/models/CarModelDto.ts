/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CarModelDto = {
    id: string;
    name: string;
    type: CarModelDto.type;
};
export namespace CarModelDto {
    export enum type {
        BIKE = 'Bike',
        SEDAN = 'Sedan',
        CROSSOVER = 'Crossover',
        SUV = 'SUV',
        VAN = 'VAN',
    }
}

