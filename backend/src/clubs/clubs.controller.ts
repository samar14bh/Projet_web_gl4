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
import { Club } from './entities/club.entity';

/**
 * Controller pour la gestion des clubs
 * Route de base: /api/clubs
 */
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

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
   * GET /api/clubs/stats
   * Récupérer les statistiques globales des clubs
   */
  @Get('stats')
  getStats() {
    return this.clubsService.getStats();
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

 @Get('top')
  async findTopClubs(@Query('limit', ParseIntPipe) limit = 5): Promise<Club[]> {
    return this.clubsService.findTopClubsByMembers(limit);
  }

}
