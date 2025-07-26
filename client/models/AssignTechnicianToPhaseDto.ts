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
     * Array of technician IDs to assign
     */
    technicianIds: Array<string>;
    /**
     * Phase to assign technicians to
     */
    phase: AssignTechnicianToPhaseDto.phase;
};
export namespace AssignTechnicianToPhaseDto {
    /**
     * Phase to assign technicians to
     */
    export enum phase {
        STAGE_ONE = 'stageOne',
        STAGE_TWO = 'stageTwo',
        STAGE_THREE = 'stageThree',
    }
}

