/**
 * Payment State Interfaces
 * Consolidates state definitions for Payment pages and components
 */

export interface MyPaymentsState {
    loading: boolean;
    error: string | null;
    downloading: boolean;
    payments: any[];
    paymentStats: any;
    // Pagination
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
}

export interface PaymentPageState {
    paymentType: 'membership' | 'event';
    clubId: number | null;
    eventId: number | null;
    membershipId: number | null;
    clubDetails: any;
    eventDetails: any;
    membershipDiscount: number;
    loading: boolean;
    error: string | null;
    stripe: any;
}

export interface PaymentSuccessState {
    paymentId: number | null;
    paymentType: 'membership' | 'event';
    paymentDetails: any;
    loading: boolean;
}

export interface PaymentFormState {
    processing: boolean;
    elementsReady: boolean;
    formError: string | null;
    cardError: string | null;
}
