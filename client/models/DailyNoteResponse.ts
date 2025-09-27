/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageResponse } from './ImageResponse';
import type { UserInfoResponse } from './UserInfoResponse';
export type DailyNoteResponse = {
    /**
     * Unique identifier for the daily note
     */
    id: string;
    /**
     * The content of the daily note
     */
    note: string;
    /**
     * ID of the user who created this note
     */
    createdById: string;
    /**
     * Information about the user who created this note
     */
    createdBy: UserInfoResponse;
    /**
     * Whether the note is active (soft delete)
     */
    isActive: boolean;
    /**
     * Date and time when the note was created
     */
    createdAt: string;
    /**
     * Date and time when the note was last updated
     */
    updatedAt: string;
    /**
     * Images attached to this daily note
     */
    images: Array<ImageResponse>;
};

