import { Controller, Get, Body, Patch, Param, Query, Post } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { Status } from 'src/common/enums';

@Controller('memberships')
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    create(@Body() createMembershipDto: CreateMembershipDto) {
        return this.membershipsService.create(createMembershipDto);
    }

    @Get()
    findAll(
        @Query('clubId') clubId?: number,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.membershipsService.findAll({ clubId, status, page, limit });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.membershipsService.findOne(+id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.membershipsService.updateStatus(+id, Status[status]);
    }

    @Get('check/status')
    async checkMembership(
        @Query('userId') userId: number,
        @Query('clubId') clubId: number,
    ) {
        const membership = await this.membershipsService.findByUserAndClub(userId, clubId);
        if (!membership) {
            return { exists: false };
        }
        return { exists: true, membership };
    }
}
