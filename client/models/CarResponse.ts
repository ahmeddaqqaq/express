/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BrandResponse } from './BrandResponse';
import type { ModelResponse } from './ModelResponse';
export type CarResponse = {
    id: string;
    brandId: string;
    customerId: string;
    modelId: string;
    brand: BrandResponse;
    model: ModelResponse;
    year: string;
    plateNumber: string;
    color: string;
    createdAt: string;
    updatedAt: string;
};

