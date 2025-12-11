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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { EventStatus } from '../common/enums';

/**
 * Controller pour la gestion des événements
 * Route de base: /api/events
 */
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * POST /api/events
   * Créer un nouvel événement
   */
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
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
   * Récupérer les statistiques d'un événement
   */
  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventStats(id);
  }

  /**
   * PATCH /api/events/:id
   * Mettre à jour un événement
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  /**
   * PATCH /api/events/:id/status
   * Mettre à jour le statut d'un événement
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
   * Supprimer un événement
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
