import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { EventStatus, RegistrationStatus } from '../common/enums';

/**
 * Service pour la gestion des événements
 */
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  /**
   * Créer un nouvel événement
   */
  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Validation des dates
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début',
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      startDate,
      endDate,
    });

    return await this.eventRepository.save(event);
  }

  /**
   * Récupérer tous les événements avec filtres et pagination
   */
  async findAll(filters: FilterEventDto): Promise<{
    data: Event[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      status,
      type,
      clubId,
      search,
      startDateFrom,
      startDateTo,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .leftJoinAndSelect('event.registrations', 'registrations');

    // Filtres
    if (status) {
      queryBuilder.andWhere('event.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('event.sPaid = :type', { type });
    }

    if (clubId) {
      queryBuilder.andWhere('event.clubId = :clubId', { clubId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(event.title LIKE :search OR event.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDateFrom) {
      queryBuilder.andWhere('event.startDate >= :startDateFrom', {
        startDateFrom: new Date(startDateFrom),
      });
    }

    if (startDateTo) {
      queryBuilder.andWhere('event.startDate <= :startDateTo', {
        startDateTo: new Date(startDateTo),
      });
    }

    // Tri
    if (sortBy === 'date') {
      queryBuilder.orderBy(
        'event.startDate',
        order.toUpperCase() as 'ASC' | 'DESC',
      );
    } else if (sortBy === 'title') {
      queryBuilder.orderBy(
        'event.title',
        order.toUpperCase() as 'ASC' | 'DESC',
      );
    } else if (sortBy === 'registrations') {
      queryBuilder
        .loadRelationCountAndMap(
          'event.registrationCount',
          'event.registrations',
        )
        .orderBy(
          'event.registrationCount',
          order.toUpperCase() as 'ASC' | 'DESC',
        );
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer un événement par son ID
   */
  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['club', 'registrations', 'registrations.user'],
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    return event;
  }

  /**
   * Récupérer les statistiques d'un événement
   */
  async getEventStats(id: number): Promise<{
    totalRegistrations: number;
    confirmedRegistrations: number;
    waitlistRegistrations: number;
    cancelledRegistrations: number;
    totalRevenue: number;
    capacityUsage: number;
  }> {
    const event = await this.findOne(id);

    const totalRegistrations = event.registrations?.length || 0;
    const confirmedRegistrations =
      event.registrations?.filter(
        (r) => r.status === RegistrationStatus.REGISTERED,
      ).length || 0;
    const waitlistRegistrations =
      event.registrations?.filter(
        (r) => r.status === RegistrationStatus.WAITLIST,
      ).length || 0;
    const cancelledRegistrations =
      event.registrations?.filter(
        (r) => r.status === RegistrationStatus.CANCELLED,
      ).length || 0;

    const totalRevenue =  confirmedRegistrations * Number(event.subscriptionFees);
    const capacityUsage = event.capacity
      ? (confirmedRegistrations / event.capacity) * 100
      : 0;

    return {
      totalRegistrations,
      confirmedRegistrations,
      waitlistRegistrations,
      cancelledRegistrations,
      totalRevenue,
      capacityUsage,
    };
  }

  /**
   * Mettre à jour un événement
   */
  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    // Validation des dates si modifiées
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : event.startDate;
      const endDate = updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : event.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException(
          'La date de fin doit être postérieure à la date de début',
        );
      }
    }

    Object.assign(event, updateEventDto);

    if (updateEventDto.startDate) {
      event.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate) {
      event.endDate = new Date(updateEventDto.endDate);
    }

    return await this.eventRepository.save(event);
  }

  /**
   * Mettre à jour le statut d'un événement
   */
  async updateStatus(id: number, status: EventStatus): Promise<Event> {
    const event = await this.findOne(id);
    event.status = status;
    return await this.eventRepository.save(event);
  }

  /**
   * Supprimer un événement
   */
  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }
}
