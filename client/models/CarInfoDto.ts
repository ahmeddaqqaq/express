/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CarBrandDto } from './CarBrandDto';
import type { CarModelDto } from './CarModelDto';
export type CarInfoDto = {
    id: string;
    plateNumber: string;
    brand: CarBrandDto;
    model: CarModelDto;
    year?: number;
    color?: string;
};

