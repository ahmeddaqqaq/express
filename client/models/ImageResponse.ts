/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ImageResponse = {
    id: string;
    key: string;
    url: string;
    isActive: boolean;
    uploadedAtStage?: ImageResponse.uploadedAtStage;
    createdAt: string;
    updatedAt: string;
};
export namespace ImageResponse {
    export enum uploadedAtStage {
        SCHEDULED = 'scheduled',
        STAGE_ONE = 'stageOne',
        STAGE_TWO = 'stageTwo',
        STAGE_THREE = 'stageThree',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
    }
}

