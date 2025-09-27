/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyNoteResponse } from './DailyNoteResponse';
export type DailyNotesListResponse = {
    /**
     * List of daily notes
     */
    data: Array<DailyNoteResponse>;
    /**
     * Total number of notes matching the filter
     */
    total: number;
    /**
     * Number of notes per page
     */
    limit: number;
    /**
     * Current page number
     */
    page: number;
};

