export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  pendingRequests: number;
  totalRevenue: number;
  monthlyRevenue: number;
  upcomingEvents: number;
}

export interface DashboardMember {
  id: number;
  name: string;
  lastName: string;
  email: string;
  joinDate: string;
  image?: string;
}

export interface DashboardEvent {
  id: number;
  name: string;
  startDate: string;
}
