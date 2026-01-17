import { Club } from './club.model';
export interface DashboardResponse {
  stats: DashboardStats;

}

export interface DashboardStats {
  clubsCount: number;
  upcomingEventsCount: number;
  participationRate: number;
  monthlyExpenses: number;
}
export interface DashboardMember extends DashboardResponse {
  upcomingEvents: UpcomingEvent[];
  recommendedClubs: Club[];
}

export interface UpcomingEvent {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  address?: string;
  clubName: string;
  clubLogo?: string;
  subscriptionFees: number;
  registrationStatus: string;
  paymentStatus: string;
  formattedDate?: string;
  formattedTime?: string;
  isFree?: boolean;
}
