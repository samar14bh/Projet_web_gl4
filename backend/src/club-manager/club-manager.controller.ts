import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClubManagerService } from './club-manager.service';
import { Status } from '../common/enums';
import { UpdateClubSettingsDto } from './dto/update-club-settings.dto';
import { GetMembersQueryDto } from './dto/get-members-query.dto';
import { GetApplicationsQueryDto } from './dto/get-applications-query.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@UseGuards(JwtAuthGuard)
@Controller('club-manager')
export class ClubManagerController {
  constructor(private readonly service: ClubManagerService) { }

  // ========================
  // DASHBOARD
  // ========================
  @Get(':clubId/dashboard/stats')
  getStats(@Param('clubId') clubId: number) {
    return this.service.getDashboardStats(+clubId);
  }

  @Get(':clubId/dashboard/pending-members')
  getPending(@Param('clubId') clubId: number) {
    return this.service.getPendingRequests(+clubId);
  }

  @Get(':clubId/dashboard/recent-members')
  getRecentMembers(@Param('clubId') clubId: number) {
    return this.service.getRecentMembers(+clubId);
  }

  @Get(':clubId/dashboard/upcoming-events')
  getEvents(@Param('clubId') clubId: number) {
    return this.service.getUpcomingEvents(+clubId);
  }

  @Get(':clubId/my-role')
  getMyRole(@Param('clubId') clubId: number, @Req() req) {
    return this.service.getMyRole(+clubId, req.user.userId);
  }

  // ========================
  // CLUB SETTINGS
  // ========================
  @Patch(':clubId/settings')
  updateClubSettings(
    @Param('clubId') clubId: number,
    @Body() updateSettingsDto: UpdateClubSettingsDto,
  ) {
    return this.service.updateClubSettings(+clubId, updateSettingsDto);
  }

  // ========================
  // MEMBERS MANAGEMENT
  // ========================

  // ✅ OBTENIR TOUS LES MEMBRES
  @Get(':clubId/members')
  getMembers(
    @Param('clubId') clubId: number,
    @Query() query: GetMembersQueryDto,
  ) {
    return this.service.getMembers(+clubId, query);
  }

  // ✅ OBTENIR LES MEMBRES DU BUREAU - NOUVEL ENDPOINT
  @Get(':clubId/members/bureau')
  getBureauMembers(
    @Param('clubId') clubId: number,
    @Query() query: GetMembersQueryDto,
  ) {
    return this.service.getBureauMembers(+clubId, query);
  }

  // ✅ OBTENIR LES STATISTIQUES DES MEMBRES
  @Get(':clubId/members/stats')
  getMembersStats(@Param('clubId') clubId: number) {
    return this.service.getMembersStats(+clubId);
  }

  // ✅ ASSIGNER UN RÔLE À UN MEMBRE
  @Patch('members/:membershipId/role')
  assignRole(
    @Param('membershipId') membershipId: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.service.assignRole(+membershipId, assignRoleDto);
  }

  // ✅ RETIRER UN MEMBRE
  @Delete('members/:membershipId')
  removeMember(@Param('membershipId') membershipId: number) {
    return this.service.removeMember(+membershipId);
  }

  // ========================
  // APPLICATIONS MANAGEMENT
  // ========================

  // ✅ OBTENIR LES DEMANDES D'ADHÉSION
  @Get(':clubId/applications')
  getApplications(
    @Param('clubId') clubId: number,
    @Query() query: GetApplicationsQueryDto,
  ) {
    return this.service.getApplications(+clubId, query);
  }

  // ✅ METTRE À JOUR LE STATUT D'UNE APPLICATION
  @Patch('applications/:id/status')
  updateStatus(@Param('id') id: number, @Body() body: { status: Status }) {
    return this.service.updateApplicationStatus(+id, body.status);
  }
}
