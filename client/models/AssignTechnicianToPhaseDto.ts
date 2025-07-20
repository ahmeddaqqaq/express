/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AssignTechnicianToPhaseDto = {
    /**
     * Transaction ID
     */
    transactionId: string;
    /**
     * Technician ID to assign
     */
    technicianId: string;
    /**
     * Phase to assign technician to
     */
    phase: AssignTechnicianToPhaseDto.phase;
};
export namespace AssignTechnicianToPhaseDto {
    /**
     * Phase to assign technician to
     */
    export enum phase {
        STAGE_ONE = 'stageOne',
        STAGE_TWO = 'stageTwo',
        STAGE_THREE = 'stageThree',
    }
}

