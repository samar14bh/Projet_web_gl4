import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateApplicationDto } from '../memberships/dto/create-application.dto';
import { CreateMembershipDto } from '../memberships/dto/create-membership.dto';
import { ApplicationResponseDto } from '../memberships/dto/application-response.dto';
import { Membership } from '../memberships/entities/membership.entity';
import { MemberRole } from '../common/enums/member-role.enum';
import {MembershipClubDto} from "../memberships/dto/membership-club.dto";

/**
 * Controller pour gérer les adhésions (memberships) et les candidatures (applications)
 */
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  /**
   * POST /memberships/applications
   * Créer une nouvelle candidature pour rejoindre un club
   */
  @Post('create-application')
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    console.log('Received createApplicationDto:', createApplicationDto);
    const application =
      await this.membershipsService.createApplication(createApplicationDto);
    return application;
  }

  /**
   * POST /memberships
   * Créer une adhésion directement (sans candidature)
   * Utilisé par les admins pour ajouter directement des membres
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMembership(
    @Body() createMembershipDto: CreateMembershipDto,
  ): Promise<Membership> {
    return await this.membershipsService.createMembership(createMembershipDto);
  }

  /**
   * GET /memberships/clubs/:clubId/applications
   * Récupérer toutes les candidatures d'un club
   * Query params: status (optional) - filter by application status
   */

  @Get('users/:userId/applications')
  async getUserApplications(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ApplicationResponseDto[]> {
    const applications =
      await this.membershipsService.getUserApplications(userId);
    return applications;
  }

  /**
   * GET /memberships/clubs/:clubId/members
   * Récupérer tous les membres d'un club
   */
  @Get('clubs/:clubId/members')
  async getClubMembers(
    @Param('clubId', ParseIntPipe) clubId: number,
  ): Promise<Membership[]> {
    return await this.membershipsService.getClubMembers(clubId);
  }

  /**
   * PATCH /memberships/:membershipId/role
   * Mettre à jour le rôle d'un membre
   */
  @Patch(':membershipId/role')
  async updateMemberRole(
    @Param('membershipId', ParseIntPipe) membershipId: number,
    @Body('role') role: MemberRole,
  ): Promise<Membership> {
    return await this.membershipsService.updateMemberRole(membershipId, role);
  }

  /**
   * DELETE /memberships/:membershipId
   * Supprimer un membre d'un club
   */
  @Delete(':membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('membershipId', ParseIntPipe) membershipId: number,
  ): Promise<void> {
    await this.membershipsService.removeMember(membershipId);
  }

  @Get('applications/:applicationId')
  async getApplicationResponse(
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<ApplicationResponseDto> {
    const application =
      await this.membershipsService.getApplicationResponse(applicationId);
    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }
    return application;
  }

  @Delete('applications/:applicationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApplication(
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ): Promise<void> {
    await this.membershipsService.deleteApplication(applicationId);
  }

 
 
    /**
     * DELETE /memberships/:membershipId
     * Supprimer un membre d'un club
     */
    @Delete(':membershipId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeMember(
        @Param('membershipId', ParseIntPipe) membershipId: number,
    ): Promise<void> {
        await this.membershipsService.removeMember(membershipId);
    }



    @Get('applications/:applicationId')
    async getApplicationResponse(
        @Param('applicationId', ParseIntPipe) applicationId: number,
    ): Promise<ApplicationResponseDto> {
        const application = await this.membershipsService.getApplicationResponse(applicationId);
        if (!application) {
            throw new NotFoundException(`Application with ID ${applicationId} not found`);
        }
        return application;
    }

    @Delete('applications/:applicationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteApplication(
        @Param('applicationId', ParseIntPipe) applicationId: number,
    ): Promise<void> {
        await this.membershipsService.deleteApplication(applicationId);
    }


    @Get('special-memberships/users/:userId')
    async getClubSpecialMemberships(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<MembershipClubDto[]> {
        return await this.membershipsService.getAllClubSpecialMemberships(userId);
    }


}
