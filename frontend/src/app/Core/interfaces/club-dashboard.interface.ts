/**
 * Main dashboard component state
 */
export interface DashboardState {
  clubId: number | null;
  loading: boolean;
}

/**
 * Club header information displayed in the hero section
 */
export interface ClubHeaderState {
  clubName: string;
  clubLogo: string;
  clubCoverImage: string;
  categoryId: number | null;
  categoryName: string;
  categoryIcon: string;
  totalMembers: number;
  totalEvents: number;
  pendingRequests: number;
}

/**
 * Club statistics for the dashboard
 */
export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  pendingRequests: number;
  totalRevenue: number;
  monthlyRevenue: number;
  upcomingEvents: number;
}

/**
 * Dashboard member data
 */
export interface DashboardMember {
  id: number;
  name: string;
  lastName: string;
  email: string;
  joinDate: string;
  image?: string;
}

/**
 * Dashboard event data
 */
export interface DashboardEvent {
  id: number;
  name: string;
  startDate: string;
}
