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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PaginatedResult } from '../common/pagination/pagination.dto';
import { extname } from 'path';

import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto, FilterClubDto } from './dto';
import { Club } from './entities/club.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: './uploads/clubs',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Seulement JPG, JPEG, PNG'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body() body: any,
    @UploadedFiles() files: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
  ) {
    console.log(body);
    // Convertir les types correctement
    const createClubDto: CreateClubDto = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      contactEmail: body.contactEmail,
      categoryId: parseInt(body.categoryId, 10),
      isPublic: body.isPublic === 'true',
      membershipFeeAmount: parseFloat(body.membershipFeeAmount),
      creationDate: body.creationDate,
    };

    // Ajouter les chemins des images
    if (files?.logo?.[0]) {
      createClubDto.logo = `/uploads/clubs/${files.logo[0].filename}`;
    }
    if (files?.coverImage?.[0]) {
      createClubDto.coverImage = `/uploads/clubs/${files.coverImage[0].filename}`;
    }

    return this.clubsService.create(createClubDto);
  }
  /**
   * PUT /api/clubs/:id
   * Mettre à jour un club avec upload de fichiers
   */
  @Patch(':id/update-with-files')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: './uploads/clubs',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Seulement JPG, JPEG, PNG'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  updateWithFiles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
  ) {
    const updateClubDto: UpdateClubDto = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      contactEmail: body.contactEmail,
      categoryId: parseInt(body.categoryId, 10),
      isPublic: body.isPublic === 'true',
      membershipFeeAmount: parseFloat(body.membershipFeeAmount),
      creationDate: body.creationDate,
    };

    // Ajouter les nouvelles images si présentes
    if (files?.logo?.[0]) {
      updateClubDto.logo = `/uploads/clubs/${files.logo[0].filename}`;
    }
    if (files?.coverImage?.[0]) {
      updateClubDto.coverImage = `/uploads/clubs/${files.coverImage[0].filename}`;
    }

    return this.clubsService.update(id, updateClubDto);
  }
  /**
   * GET /api/clubs/:clubId/president
   * Récupérer le président actuel du club
   */
  @Get(':clubId/president')
  async getClubPresident(
    @Param('clubId', ParseIntPipe) clubId: number,
  ) {
    return this.clubsService.getClubPresident(clubId);
  }

  /**
   * POST /api/clubs/:clubId/president
   * Assigner un nouveau président au club
   */
  @Post(':clubId/president')
  async assignPresident(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.clubsService.assignPresident(clubId, userId);
  }

  /**
   * DELETE /api/clubs/:clubId/president
   * Supprimer le président actuel du club
   */
  @Delete(':clubId/president')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePresident(
    @Param('clubId', ParseIntPipe) clubId: number,
  ) {
    return this.clubsService.removePresident(clubId);
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
  @Get('status/:clubId/:userId')
  async getUserClubStatus2(
      @Param('clubId', ParseIntPipe) clubId: number,
      @Param('userId', ParseIntPipe) userId: number,
  ): Promise<string> {
    return this.clubsService.getUserClubStatus(clubId, userId);
  }
}
