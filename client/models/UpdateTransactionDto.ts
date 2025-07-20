/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateTransactionDto = {
    /**
     * Transaction ID to update
     */
    id: string;
    /**
     * New status for the transaction
     */
    status?: UpdateTransactionDto.status;
    /**
     * ID of the technician making this update (for audit logging)
     */
    updatedByTechnicianId?: string;
};
export namespace UpdateTransactionDto {
    /**
     * New status for the transaction
     */
    export enum status {
        SCHEDULED = 'scheduled',
        STAGE_ONE = 'stageOne',
        STAGE_TWO = 'stageTwo',
        STAGE_THREE = 'stageThree',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
    }
}

