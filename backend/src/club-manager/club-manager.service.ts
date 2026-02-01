import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { ClubsService } from '../clubs/clubs.service';
import { ClubStatsDto } from './dto/club-stat.dto';
import { MembershipsService } from '../memberships/memberships.service';
import { Status } from '../common/enums';
import { TransactionsService } from '../transactions/transaction.service';
import { UpdateClubSettingsDto } from './dto/update-club-settings.dto';
import { GetMembersQueryDto } from './dto/get-members-query.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { MembersStatsDto } from './dto/members-stats.dto';

@Injectable()
export class ClubManagerService {
  constructor(
    private readonly clubService: ClubsService,
    private readonly eventsService: EventsService,
    private readonly membershipsService: MembershipsService,
    private readonly transactionsService: TransactionsService,
  ) { }

  // ========================
  // DASHBOARD STATS
  // ========================
  async getDashboardStats(clubId: number): Promise<ClubStatsDto> {
    const [
      clubStats,
      pendingCount,
      upcomingEventsCount,
      totalEventsCount,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      this.clubService.getClubStats2(clubId),
      this.membershipsService.countByClubAndStatus(clubId, Status.PENDING),
      this.eventsService.countUpcomingByClub(clubId),
      this.eventsService.countEventsByClub(clubId),
      this.transactionsService.getTotalRevenueForClub(clubId),
      this.transactionsService.getMonthlyRevenueForClub(clubId),
    ]);

    return {
      ...clubStats,
      pendingRequests: pendingCount,
      upcomingEvents: upcomingEventsCount,
      totalEvents: totalEventsCount,
      totalRevenue: totalRevenue,
      monthlyRevenue: monthlyRevenue,
    };
  }

  // ========================
  // CLUB SETTINGS
  // ========================
  async updateClubSettings(
    clubId: number,
    updateSettingsDto: UpdateClubSettingsDto,
  ) {
    return this.clubService.updateClubSettings(clubId, updateSettingsDto);
  }

  // ========================
  // MEMBERS MANAGEMENT
  // ========================

  // ✅ OBTENIR TOUS LES MEMBRES
  async getMembers(clubId: number, query: GetMembersQueryDto) {
    return this.membershipsService.getMembersPaginated(clubId, query);
  }

  // ✅ OBTENIR LES MEMBRES DU BUREAU - NOUVELLE MÉTHODE
  async getBureauMembers(clubId: number, query: GetMembersQueryDto) {
    return this.membershipsService.getBureauMembersPaginated(clubId, query);
  }

  // ✅ OBTENIR LES STATISTIQUES DES MEMBRES
  async getMembersStats(clubId: number): Promise<MembersStatsDto> {
    const [
      totalMembers,
      bureauMembers,
      regularMembers,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    ] = await Promise.all([
      this.membershipsService.countByClub(clubId),
      this.membershipsService.countByClubAndRoleNot(clubId, 'MEMBER'),
      this.membershipsService.countByClubAndRole(clubId, 'MEMBER'),
      this.membershipsService.countByClubAndStatus(clubId, Status.PENDING),
      this.membershipsService.countByClubAndStatus(clubId, Status.APPROVED),
      this.membershipsService.countByClubAndStatus(clubId, Status.REJECTED),
    ]);

    return {
      totalMembers,
      bureauMembers,
      regularMembers,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    };
  }

  // ✅ ASSIGNER UN RÔLE À UN MEMBRE
  async assignRole(membershipId: number, assignRoleDto: AssignRoleDto) {
    return this.membershipsService.updateRole(membershipId, assignRoleDto.role);
  }

  // ✅ RETIRER UN MEMBRE
  async removeMember(membershipId: number) {
    return this.membershipsService.removeMembership(membershipId);
  }

  // ========================
  // APPLICATIONS MANAGEMENT
  // ========================

  // ✅ OBTENIR LES DEMANDES D'ADHÉSION
  async getApplications(clubId: number, query: GetApplicationsQueryDto) {
    return this.membershipsService.getApplicationsPaginated(clubId, query);
  }

  // ✅ METTRE À JOUR LE STATUT D'UNE APPLICATION
  async updateApplicationStatus(id: number, status: Status) {
    return this.membershipsService.updateStatus(id, status);
  }

  // ========================
  // DASHBOARD DATA
  // ========================
  async getPendingRequests(clubId: number) {
    return this.membershipsService.getPendingApplicationsForDashboard(clubId);
  }

  async getRecentMembers(clubId: number) {
    return this.membershipsService.getRecentMembers(clubId);
  }

  async getUpcomingEvents(clubId: number) {
    return this.eventsService.getUpcomingEventsForDashboard(clubId);
  }

  async getMyRole(clubId: number, userId: number): Promise<{ role: string }> {
    const result = await this.membershipsService.findByUserAndClub(userId, clubId);
    if (!result.exists || !result.membership) {
      return { role: 'MEMBER' };
    }
    return { role: result.membership.role };
  }
}
