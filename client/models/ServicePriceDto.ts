/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ServicePriceDto = {
    carType: ServicePriceDto.carType;
    price: number;
    posServiceId: number;
};
export namespace ServicePriceDto {
    export enum carType {
        BIKE = 'Bike',
        SEDAN = 'Sedan',
        CROSSOVER = 'Crossover',
        SUV = 'SUV',
        VAN = 'VAN',
    }
}

