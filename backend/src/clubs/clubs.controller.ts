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
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto, FilterClubDto } from './dto';
import { Club } from './entities/club.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

/**
 * Controller pour la gestion des clubs
 * Route de base: /api/clubs
 */
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}
  @Get('recommendations')
@UseGuards(JwtAuthGuard)
async getRecommendations(
  @Req() req: any,
  @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
) {
  // Ensure the userId exists in the request object
  console.log('👤 User from request:', req.user);
  const rawUserId = req.user?.userId;
  
  if (rawUserId === undefined || rawUserId === null) {
    throw new UnauthorizedException('User ID not found in token');
  }

  const userId = Number(rawUserId);

  if (isNaN(userId)) {
    throw new BadRequestException('Invalid User ID format');
  }
  
  return this.clubsService.getRecommendations(userId, limit);
}


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

