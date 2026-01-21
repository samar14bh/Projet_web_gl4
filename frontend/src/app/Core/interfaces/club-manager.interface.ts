// club-manager.interface.ts
import { DashboardMember } from './club-dashboard.interface';

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
  joinDate: string;
  endDate?: string;
  image?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'CANCELLED';
}

export interface MemberResponse {
  data: Member[];
  total: number;
  page: number;
  limit: number;
}

export interface MembersStats {
  totalMembers: number;
  bureauMembers: number;
  regularMembers: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export interface Application {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED';
  adminResponse?: string;
  whyJoin: string;
  previousClub?: string;
  goalsInClub: string;
  phoneNumber: string;
  skills?: string;
  expectations?: string;
  availability?: string;
  additionalComments?: string;
  isMemberOfOtherClub: boolean;
  userId: number;
  userName: string;
  userLastName: string;
  userEmail: string;
  userImage?: string;
  clubId: number;
  clubName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationResponse {
  data: Application[];
  total: number;
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Club {
  id: number;
  name: string;
  description?: string;
  contactEmail: string;
  logo?: string;
  coverImage?: string;
  isPublic: boolean;
  membershipFeeAmount: number;
  approvalRequired: boolean;
  isActive: boolean;
  creationDate: string;
  category?: Category;
}

export interface ClubSettings {
  isPublic: boolean;
  membershipFeeAmount: number;
  approvalRequired: boolean;
}

export enum MemberRole {
  MEMBER = 'MEMBER',
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE-PRESIDENT',
  TREASURER = 'TREASURER',
  SECRETARY = 'SECRETARY',
  RH = 'RH',
}
