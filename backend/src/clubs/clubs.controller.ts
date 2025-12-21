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
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto, FilterClubDto } from './dto';
import { PaginatedResult } from '../common/pagination/pagination.dto';

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
   * GET /api/clubs/user-clubs
   * Récupérer les clubs pour les utilisateurs (paginés et filtrés)
   */
  @Get('user-clubs/:userId')
  getUserClubs(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filters: FilterClubDto
  ): Promise<PaginatedResult<any>> {
    return this.clubsService.getUserClubs(userId, filters);
  }

  /**
   * GET /api/clubs/stats
   * Récupérer les statistiques globales des clubs
   */
  @Get('stats')
  getStats() {
    return this.clubsService.getStats();
  }

  /**
   * GET /api/clubs/:id/membership/:userId
   * Récupérer les détails d'adhésion d'un utilisateur à un club
   */
  @Get(':id/membership/:userId')
  getClubMembershipDetails(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.clubsService.getClubMembershipDetails(userId, id);
  }

  /**
   * DELETE /api/clubs/:id/leave/:userId
   * Quitter un club
   */
  @Delete(':id/leave/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveClub(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.clubsService.leaveClub(userId, id);
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
