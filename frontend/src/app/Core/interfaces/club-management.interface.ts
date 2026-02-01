/**
 * Core interfaces for Manage Club page state management
 */

export interface ManageClubState {
    clubId: number | null;
    activeTab: string;
    saving: boolean;
}

export interface ClubInfoState {
    name: string;
    description: string;
    email: string;
    logo: string;
    coverImage: string;
    categoryId: number | null;
    categoryName: string;
    categoryIcon: string;
    isPublic: boolean;
    membershipFee: number;
    approvalRequired: boolean;
    isActive: boolean;
    creationDate: string;
}

export interface ClubStatsState {
    totalMembers: number;
    totalEvents: number;
    pendingRequests: number;
    monthlyRevenue: number;
}

export interface NotificationState {
    type: 'success' | 'error' | null;
    message: string;
}
