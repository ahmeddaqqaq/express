/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivateSubscriptionDto } from '../models/ActivateSubscriptionDto';
import type { AllCustomerSubscriptionsResponseDto } from '../models/AllCustomerSubscriptionsResponseDto';
import type { AssignQRCodeDto } from '../models/AssignQRCodeDto';
import type { CreateSubscriptionDto } from '../models/CreateSubscriptionDto';
import type { CustomerSubscriptionResponseDto } from '../models/CustomerSubscriptionResponseDto';
import type { PurchaseSubscriptionDto } from '../models/PurchaseSubscriptionDto';
import type { SubscriptionResponseDto } from '../models/SubscriptionResponseDto';
import type { UpdateSubscriptionDto } from '../models/UpdateSubscriptionDto';
import type { UseServiceDto } from '../models/UseServiceDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionService {
    /**
     * Create a new subscription template
     * @returns SubscriptionResponseDto
     * @throws ApiError
     */
    public static subscriptionControllerCreate({
        requestBody,
    }: {
        requestBody: CreateSubscriptionDto,
    }): CancelablePromise<SubscriptionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/subscription/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - Invalid data`,
            },
        });
    }
    /**
     * Purchase a subscription for a customer
     * @returns any Subscription purchased successfully
     * @throws ApiError
     */
    public static subscriptionControllerPurchaseSubscription({
        requestBody,
    }: {
        requestBody: PurchaseSubscriptionDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/subscription/purchase',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid purchase data`,
                404: `Customer, Car, or Subscription not found`,
            },
        });
    }
    /**
     * Activate a purchased subscription with QR code
     * @returns any Subscription activated successfully
     * @throws ApiError
     */
    public static subscriptionControllerActivateSubscription({
        requestBody,
    }: {
        requestBody: ActivateSubscriptionDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/subscription/activate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Customer subscription or QR code not found`,
                409: `QR code already in use`,
            },
        });
    }
    /**
     * Assign QR code to a customer subscription
     * @returns any QR code assigned successfully
     * @throws ApiError
     */
    public static subscriptionControllerAssignQrCode({
        requestBody,
    }: {
        requestBody: AssignQRCodeDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/subscription/assign-qr-code',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Customer subscription or QR code not found`,
                409: `QR code already in use`,
            },
        });
    }
    /**
     * Get all customer subscriptions
     * @returns AllCustomerSubscriptionsResponseDto List of all customer subscriptions
     * @throws ApiError
     */
    public static subscriptionControllerGetAllCustomerSubscriptions(): CancelablePromise<Array<AllCustomerSubscriptionsResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/customer-subscriptions',
        });
    }
    /**
     * Get all purchased subscriptions pending activation
     * @returns any List of subscriptions waiting for QR code activation
     * @throws ApiError
     */
    public static subscriptionControllerGetPendingActivations(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/pending-activations',
        });
    }
    /**
     * Get all subscriptions for a customer
     * @returns CustomerSubscriptionResponseDto
     * @throws ApiError
     */
    public static subscriptionControllerGetCustomerSubscriptions({
        customerId,
    }: {
        customerId: string,
    }): CancelablePromise<Array<CustomerSubscriptionResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/customer/{customerId}',
            path: {
                'customerId': customerId,
            },
        });
    }
    /**
     * Use a service from subscription via QR code
     * @returns any Service used successfully
     * @throws ApiError
     */
    public static subscriptionControllerUseService({
        requestBody,
    }: {
        requestBody: UseServiceDto,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/subscription/use-service',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Service not available or no remaining uses`,
                404: `QR code or service not found`,
            },
        });
    }
    /**
     * Generate new QR codes
     * @returns any QR codes generated successfully
     * @throws ApiError
     */
    public static subscriptionControllerGenerateQrCodes({
        count,
    }: {
        /**
         * Number of QR codes to generate (default: 1)
         */
        count?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/express/subscription/qr/generate',
            query: {
                'count': count,
            },
        });
    }
    /**
     * Get all available (unused) QR codes
     * @returns any List of available QR codes
     * @throws ApiError
     */
    public static subscriptionControllerGetAvailableQrCodes(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/qr/available',
        });
    }
    /**
     * Get all QR codes with their usage status
     * @returns any List of all QR codes
     * @throws ApiError
     */
    public static subscriptionControllerGetAllQrCodes(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/qr/all',
        });
    }
    /**
     * Find QR code by code string
     * @returns any QR code details
     * @throws ApiError
     */
    public static subscriptionControllerFindQrByCode({
        code,
    }: {
        code: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/qr/find/{code}',
            path: {
                'code': code,
            },
            errors: {
                404: `QR code not found`,
            },
        });
    }
    /**
     * Get subscription details by QR code
     * @returns any Subscription details
     * @throws ApiError
     */
    public static subscriptionControllerGetSubscriptionByQr({
        qrCode,
    }: {
        qrCode: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/qr/{qrCode}',
            path: {
                'qrCode': qrCode,
            },
            errors: {
                404: `No active subscription found for QR code`,
            },
        });
    }
    /**
     * Get subscription template by ID
     * @returns SubscriptionResponseDto
     * @throws ApiError
     */
    public static subscriptionControllerFindOne({
        id,
    }: {
        id: string,
    }): CancelablePromise<SubscriptionResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Subscription not found`,
            },
        });
    }
    /**
     * Update subscription template
     * @returns SubscriptionResponseDto
     * @throws ApiError
     */
    public static subscriptionControllerUpdate({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateSubscriptionDto,
    }): CancelablePromise<SubscriptionResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/express/subscription/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Subscription not found`,
            },
        });
    }
    /**
     * Delete subscription template
     * @returns any Subscription deleted successfully
     * @throws ApiError
     */
    public static subscriptionControllerRemove({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/express/subscription/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Cannot delete subscription with active customers`,
                404: `Subscription not found`,
            },
        });
    }
    /**
     * Get all active subscription templates
     * @returns SubscriptionResponseDto
     * @throws ApiError
     */
    public static subscriptionControllerFindAll(): CancelablePromise<Array<SubscriptionResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/express/subscription',
        });
    }
}
