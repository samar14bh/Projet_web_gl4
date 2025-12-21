/**
 * Payment related interfaces
 */

export interface Payment {
    id: number;
    amount: number;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED';
    type: 'membership' | 'event';
    membership?: {
        id: number;
        club: {
            id: number;
            name: string;
            logo: string;
        };
    };
    event?: {
        id: number;
        title: string;
        coverImage: string;
    };
}

export interface PaymentStats {
    totalSpentThisMonth: number;
    totalSpentThisYear: number;
    activeMemberships: number;
}

export interface PaymentHistoryResponse {
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
