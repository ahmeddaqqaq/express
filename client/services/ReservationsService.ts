/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateReservationDto } from '../models/CreateReservationDto';
import type { ReservationResponseDto } from '../models/ReservationResponseDto';
import type { UpdateReservationDto } from '../models/UpdateReservationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReservationsService {
    /**
     * Create a new reservation
     * Creates a reservation for a customer. Customer must have an active subscription.
     * @returns ReservationResponseDto Reservation created successfully
     * @throws ApiError
     */
    public static reservationControllerCreate({
        requestBody,
    }: {
        requestBody: CreateReservationDto,
    }): CancelablePromise<ReservationResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/reservations',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Customer does not have an active subscription`,
                404: `Customer not found`,
            },
        });
    }
    /**
     * Get all reservations
     * Retrieves all active reservations that are not marked as done. Optionally filter by date.
     * @returns ReservationResponseDto List of reservations
     * @throws ApiError
     */
    public static reservationControllerFindAll({
        date,
    }: {
        /**
         * Filter reservations by date (YYYY-MM-DD)
         */
        date?: string,
    }): CancelablePromise<Array<ReservationResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/reservations',
            query: {
                'date': date,
            },
        });
    }
    /**
     * Get a reservation by ID
     * @returns ReservationResponseDto Reservation details
     * @throws ApiError
     */
    public static reservationControllerFindOne({
        id,
    }: {
        id: string,
    }): CancelablePromise<ReservationResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/reservations/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Reservation not found`,
            },
        });
    }
    /**
     * Update a reservation
     * Updates reservation details including datetime, notes, or mark as done status
     * @returns ReservationResponseDto Reservation updated successfully
     * @throws ApiError
     */
    public static reservationControllerUpdate({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateReservationDto,
    }): CancelablePromise<ReservationResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/reservations/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Reservation not found`,
            },
        });
    }
    /**
     * Delete a reservation
     * Soft deletes a reservation by setting isActive to false
     * @returns any Reservation deleted successfully
     * @throws ApiError
     */
    public static reservationControllerDelete({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/reservations/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Reservation not found`,
            },
        });
    }
}
