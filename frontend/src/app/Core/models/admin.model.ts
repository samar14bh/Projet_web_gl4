/**
 * Modèles pour le module Admin Dashboard
 */

export interface GlobalStats {
  totalClubs: number;
  activeClubs: number;
  totalMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
  pendingApprovals: number;
  newMembersThisMonth: number;
}

export interface TopClub {
  id: number;
  name: string;
  logo: string;
  members: number;
  events: number;
  revenue: number;
  growth: string;
}

export enum ActivityType {
  CLUB_CREATED = 'club_created',
  EVENT_CREATED = 'event_created',
  MEMBER_JOINED = 'member_joined',
  PAYMENT_RECEIVED = 'payment_received',
  APPROVAL_PENDING = 'approval_pending',
}

export interface RecentActivity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  icon: string;
  color: 'success' | 'primary' | 'info' | 'warning' | 'danger';
}

export interface MembershipTrendData {
  month: string;
  count: number;
}

export interface EventsTrendData {
  month: string;
  count: number;
}

export interface RevenueTrendData {
  month: string;
  amount: number;
}

export interface Alert {
  id: number;
  type: 'success' | 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  action: string;
  link: string;
}

export interface ClubCategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface AdminDashboardData {
  globalStats: GlobalStats;
  topClubs: TopClub[];
  recentActivities: RecentActivity[];
  membershipTrend: MembershipTrendData[];
  eventsTrend: EventsTrendData[];
  revenueTrend: RevenueTrendData[];
  alerts: Alert[];
  clubsByCategory: ClubCategoryDistribution[];
}
