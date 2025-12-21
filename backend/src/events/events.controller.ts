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
  HttpStatus, Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { EventStatus } from '../common/enums';
import { PaginatedResult } from "../common/pagination/pagination.dto";
import { UserEventDto } from "./dto/user-event.dto";

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
   * PATCH /api/events/:id
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
