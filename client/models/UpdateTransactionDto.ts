/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateTransactionDto = {
    id: string;
    status?: UpdateTransactionDto.status;
    /**
     * IDs of images to attach
     */
    imageIds?: Array<string>;
    /**
     * IDs of technicians to assign to this transaction
     */
    technicianIds?: Array<string>;
};
export namespace UpdateTransactionDto {
    export enum status {
        SCHEDULED = 'scheduled',
        STAGE_ONE = 'stageOne',
        STAGE_TWO = 'stageTwo',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
    }
}

