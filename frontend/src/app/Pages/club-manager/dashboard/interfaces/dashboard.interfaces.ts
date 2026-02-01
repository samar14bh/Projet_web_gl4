/**
 * Dashboard Interfaces
 * Centralized type definitions for the Club Manager Dashboard
 */

/**
 * Main dashboard state
 */
export interface DashboardState {
  clubId: number | null;
  loading: boolean;
}

/**
 * Club header information displayed in hero section
 */
export interface ClubHeaderState {
  clubName: string;
  clubLogo: string;
  clubCoverImage: string;
  totalMembers: number;
  totalEvents: number;
  pendingRequests: number;
}

/**
 * Club statistics for the stats grid
 */
export interface ClubStatsState {
  activeMembers: number;
  totalMembers: number;
  upcomingEvents: number;
  pendingRequests: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

/**
 * Member model
 */
export interface Member {
  id: number;
  name: string;
  lastName: string;
  email: string;
  joinDate: string;
  status?: string;
  image?: string;
}

/**
 * Event model
 */
export interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
