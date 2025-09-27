/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubscriptionPriceDto = {
    /**
     * Car type for pricing
     */
    carType: SubscriptionPriceDto.carType;
    /**
     * Price for this car type
     */
    price: number;
    /**
     * POS service ID for this car type
     */
    posServiceId: number;
};
export namespace SubscriptionPriceDto {
    /**
     * Car type for pricing
     */
    export enum carType {
        BIKE = 'Bike',
        SEDAN = 'Sedan',
        CROSSOVER = 'Crossover',
        SUV = 'SUV',
        VAN = 'VAN',
    }
}

