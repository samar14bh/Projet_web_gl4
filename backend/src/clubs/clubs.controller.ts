import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto, FilterClubDto } from './dto';
import { Club } from './entities/club.entity';

/**
 * Controller pour la gestion des clubs
 * Route de base: /api/clubs
 */
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) { }

  /**
   * POST /api/clubs
   * Créer un nouveau club
   */
  @Post()
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubsService.create(createClubDto);
  }

  /**
   * GET /api/clubs
   * Récupérer tous les clubs avec filtres et pagination
   */
  @Get()
  findAll(@Query() filters: FilterClubDto) {
    return this.clubsService.findAll(filters);
  }

  /**
   * GET /api/clubs/managed/:userId
   * Récupérer les clubs gérés par un utilisateur
   */
  @Get('managed/:userId')
  async findManagedClubs(@Param('userId', ParseIntPipe) userId: number) {
    return this.clubsService.findManagedClubs(userId);
  }

  /**
   * GET /api/clubs/stats
   * Récupérer les statistiques globales des clubs
   */
  @Get(':clubId/user/:userId/status')
  async getUserClubStatus(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<string> {
    return this.clubsService.getUserClubStatus(clubId, userId);
  }
  @Get('stats')
  getStats() {
    return this.clubsService.getStats();
  }
  @Get('top')
  async findTopClubs(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ): Promise<Club[]> {
    return this.clubsService.findTopClubsByMembers(limit);
  }

  /**
   * GET /api/clubs/:id
   * Récupérer un club par son ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(+id);
  }

  /**
   * GET /api/clubs/:id/stats
   * Récupérer les statistiques détaillées d'un club (pour dashboard)
   */
  @Get(':id/stats')
  getClubStats(@Param('id') id: string) {
    return this.clubsService.getClubDetailedStats(+id);
  }

  /**
   * GET /api/clubs/:id/members
   * Récupérer les membres d'un club
   */
  @Get(':id/members')
  getClubMembers(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.clubsService.getClubMembers(+id, { status, page, limit });
  }

  /**
   * PATCH /api/clubs/:id
   * Mettre à jour un club
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto) {
    return this.clubsService.update(+id, updateClubDto);
  }

  /**
   * PATCH /api/clubs/:id/status
   * Activer/Désactiver un club
   */
  @Patch(':id/status')
  toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.clubsService.toggleStatus(+id, isActive);
  }

  /**
   * DELETE /api/clubs/:id
   * Supprimer un club
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.clubsService.remove(+id);
  }



}
