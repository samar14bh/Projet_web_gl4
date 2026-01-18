/**
 * Club manager related interfaces
 */

export interface ClubStats {
    totalMembers: number;
    activeMembers: number;
    pendingRequests: number;
    totalRevenue: number;
    monthlyRevenue: number;
    upcomingEvents: number;
    totalEvents: number;
}

export interface Member {
    id: number;
    name: string;
    lastName: string;
    email: string;
    role: string;
    dateDebut: string;
    dateFin: string;
    status?: 'active' | 'pending' | 'suspended' | 'cancelled';
}
