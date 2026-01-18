import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ClubManagerService } from './club-manager.service';

@Controller('club-manager')
export class ClubManagerController {
  constructor(private readonly clubManagerService: ClubManagerService) {}

  @Get('stats/:clubId')
  getClubStats(@Param('clubId') clubId: number) {
    return this.clubManagerService.getClubStats(clubId);
  }

  @Get('pending-requests/:clubId')
  getPendingRequests(@Param('clubId') clubId: number) {
    return this.clubManagerService.getPendingRequests(clubId);
  }

  @Get('upcoming-events/:clubId')
  getUpcomingEvents(@Param('clubId') clubId: number) {
    return this.clubManagerService.getUpcomingEvents(clubId);
  }

  @Post('approve-member')
  approveMember(@Body() body: { memberId: number }) {
    return this.clubManagerService.approveMember(body.memberId);
  }

  @Post('reject-member')
  rejectMember(@Body() body: { memberId: number }) {
    return this.clubManagerService.rejectMember(body.memberId);
  }

  @Put('clubs/:id')
  updateClubInfo(@Param('id') id: number, @Body() body: any) {
    return this.clubManagerService.updateClubInfo(id, body);
  }

  @Put('clubs/:id/pricing')
  updateClubPricing(@Param('id') id: number, @Body() body: any) {
    return this.clubManagerService.updateClubPricing(id, body);
  }

  @Put('clubs/:id/settings')
  updateClubSettings(@Param('id') id: number, @Body() body: any) {
    return this.clubManagerService.updateClubSettings(id, body);
  }

  @Get('members/:clubId')
  getMembers(@Param('clubId') clubId: number, @Query() query: any) {
    return this.clubManagerService.getMembers(clubId, query);
  }

  @Get('member-requests/:clubId')
  getMemberRequests(@Param('clubId') clubId: number) {
    return this.clubManagerService.getMemberRequests(clubId);
  }

  @Post('members/:memberId/promote')
  promoteMember(@Param('memberId') memberId: number) {
    return this.clubManagerService.promoteMember(memberId);
  }

  @Delete('members/:memberId')
  removeMember(@Param('memberId') memberId: number) {
    return this.clubManagerService.removeMember(memberId);
  }

  @Post('members/:memberId/suspend')
  suspendMember(@Param('memberId') memberId: number) {
    return this.clubManagerService.suspendMember(memberId);
  }

  @Post('members/bulk-message')
  sendBulkMessage(@Body() body: { memberIds: number[]; message: string }) {
    return this.clubManagerService.sendBulkMessage(
      body.memberIds,
      body.message,
    );
  }

  @Get('members/:memberId/payment-history')
  getMemberPaymentHistory(@Param('memberId') memberId: number) {
    return this.clubManagerService.getMemberPaymentHistory(memberId);
  }

  @Get('members/:clubId/export')
  exportMembers(@Param('clubId') clubId: number) {
    return this.clubManagerService.exportMembers(clubId);
  }
}
