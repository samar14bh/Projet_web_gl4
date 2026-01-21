import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { EventStatus } from '../common/enums';
import { PaginatedResult } from "../common/pagination/pagination.dto";
import { UserEventDto } from "./dto/user-event.dto";
import { FileFieldsInterceptor } from '@nestjs/platform-express';

/**
 * Controller pour la gestion des événements
 * Route de base: /api/events
 */
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }
  /**
   * POST /api/events
   * Créer un nouvel événement
   */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImage', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `coverImage-${uniqueSuffix}${ext}`);
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
    @UploadedFiles() files: { coverImage?: Express.Multer.File[] },
  ) {
    const createEventDto: CreateEventDto = {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      address: body.address,
      capacity: body.capacity ? parseInt(body.capacity, 10) : undefined,
      memberOnly: body.memberOnly === 'true',
      status: body.status,
      sPaid: body.sPaid,
      subscriptionFees: parseFloat(body.subscriptionFees),
      clubId: parseInt(body.clubId, 10),
    };

    // Ajouter le chemin de l'image si uploadée
    if (files?.coverImage?.[0]) {
      createEventDto.coverImage = `/uploads/events/${files.coverImage[0].filename}`;
    }

    return this.eventsService.create(createEventDto);
  }

  /**
   * GET /api/events
   * Récupérer tous les événements avec filtres
   */
  @Get()
  findAll(@Query() filters: FilterEventDto) {
    return this.eventsService.findAll(filters);
  }

  // --- CUSTOM USER ROUTES (Must be above :id) ---

  /**
   * GET /api/events/is-registered
   */
  @Get('is-registered')
  async isRegistered(
    @Query('userId') userId: number,
    @Query('eventId') eventId: number,
  ) {
    const isRegistered = await this.eventsService.isRegistered(
      Number(userId),
      Number(eventId),
    );

    return { isRegistered };
  }

  /**
   * GET /api/events/user-events/:userId
   */
  @Get('user-events/:userId')
  async getUserEvents(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filter: FilterEventDto,
  ): Promise<PaginatedResult<UserEventDto>> {
    return this.eventsService.findUserEvents(userId, filter, true);
  }

  /**
   * GET /api/events/user-event-details/:userId
   */
  @Get('user-event-details/:userId')
  async getUserEventDetails(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('eventId', ParseIntPipe) eventId: number,
  ): Promise<UserEventDto> {
    return this.eventsService.getEventDetails(eventId, userId);
  }

  /**
   * GET /api/events/discovery/:userId
   */
  @Get('discovery/:userId')
  async getEventsDiscovery(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filter: FilterEventDto,
  ): Promise<PaginatedResult<UserEventDto>> {
    return this.eventsService.findUserEvents(userId, filter, false);
  }



  /**
   * GET /api/events/:id
   * Récupérer un événement par son ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  /**
   * GET /api/events/:id/stats
   */
  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventStats(id);
  }

  /**
   * PATCH /api/events/:id/update-with-file
   * Mettre à jour un événement avec upload de fichier
   */
  @Patch(':id/update-with-file')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImage', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `coverImage-${uniqueSuffix}${ext}`);
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
  updateWithFile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[] },
  ) {
    const updateEventDto: UpdateEventDto = {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      address: body.address,
      capacity: body.capacity ? parseInt(body.capacity, 10) : undefined,
      memberOnly: body.memberOnly === 'true',
      status: body.status,
      sPaid: body.sPaid,
      subscriptionFees: parseFloat(body.subscriptionFees),
    };

    // Ajouter la nouvelle image si uploadée
    if (files?.coverImage?.[0]) {
      updateEventDto.coverImage = `/uploads/events/${files.coverImage[0].filename}`;
    }

    return this.eventsService.update(id, updateEventDto);
  }

  /**
   * PATCH /api/events/:id/status
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: EventStatus,
  ) {
    return this.eventsService.updateStatus(id, status);
  }

  /**
   * DELETE /api/events/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }

  /**
   * POST /api/events/:id/duplicate
   */
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.eventsService.duplicateEvent(+id);
  }

  /**
   * GET /api/events/:id/registrations
   */
  @Get(':id/registrations')
  getRegistrations(@Param('id') id: string) {
    return this.eventsService.getEventRegistrations(+id);
  }
}
