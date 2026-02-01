import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository, SelectQueryBuilder } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { EventStatus, RegistrationStatus } from '../common/enums';
import { Registration } from './entities/registration.entity';
import { PaginatedResult } from '../common/pagination/pagination.dto';
import { UserEventDto } from './dto/user-event.dto';
import { EventMapper } from './mapper/event.mapper';
import { DashboardEventDto } from '../club-manager/dto/dashboard-event.dto';
import { Transaction } from '../transactions/entities/transaction.entity';

/**
 * Service pour la gestion des événements
 */
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
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
      queryBuilder.andWhere('event.club_Id = :clubId', { clubId });
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

    const totalRevenue =
      confirmedRegistrations * Number(event.subscriptionFees);
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
    await this.transactionRepository.delete({ event: { id } });
    await this.eventRepository.remove(event);
  }

  /**
   * Dupliquer un événement
   */
  /**
   * Dupliquer un événement
   */
  async duplicateEvent(id: number): Promise<Event> {
    // Récupérer l'événement original avec ses relations
    const originalEvent = await this.eventRepository.findOne({
      where: { id },
      relations: ['club'],
    });

    if (!originalEvent) {
      throw new NotFoundException(`Événement avec l'ID ${id} introuvable`);
    }

    // Créer une copie
    const duplicatedEvent = this.eventRepository.create({
      title: `${originalEvent.title} (Copie)`,
      description: originalEvent.description,
      coverImage: originalEvent.coverImage,
      startDate: new Date(originalEvent.startDate),
      endDate: new Date(originalEvent.endDate),
      address: originalEvent.address,
      capacity: originalEvent.capacity,
      memberOnly: originalEvent.memberOnly,
      status: EventStatus.UPCOMING,
      sPaid: originalEvent.sPaid,
      subscriptionFees: originalEvent.subscriptionFees,
      club: originalEvent.club, // ← Relation club au lieu de clubId
    });

    return await this.eventRepository.save(duplicatedEvent);
  }

  /**
   * Récupérer les inscriptions d'un événement
   */
  async getEventRegistrations(eventId: number): Promise<any[]> {
    const registrations = await this.registrationRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      status: reg.status || 'registered',
      date: reg.createdAt,
      user: {
        id: reg.user.id,
        name: reg.user.name,
        email: reg.user.email,
      },
    }));
  }

  async isRegistered(userId: number, eventId: number): Promise<boolean> {
    const registration = await this.registrationRepository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
    });
    return !!registration;
  }
  async findUserEvents(
    userId: number,
    filter: FilterEventDto,
    registeredOnly: boolean = false,
  ): Promise<PaginatedResult<UserEventDto>> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .leftJoinAndSelect('event.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'paymentUser');

    if (registeredOnly) {
      query.innerJoinAndSelect(
        'event.registrations',
        'registrations',
        'registrations.user.id = :userId',
        { userId },
      );
    } else {
      query.leftJoinAndSelect(
        'event.registrations',
        'registrations',
        'registrations.user.id = :userId',
        { userId },
      );
    }

    query.leftJoinAndSelect('registrations.user', 'user');

    this.applyFilters(query, filter);
    this.applySorting(query, filter);

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const [events, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: events.map((event) => EventMapper.toUserEventDto(event, userId)),
      total,
      page,
      limit,
    };
  }
  async getEventDetails(
    eventId: number,
    userId: number,
  ): Promise<UserEventDto> {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .leftJoinAndSelect('event.payments', 'payments')
      .leftJoinAndSelect('payments.user', 'paymentUser')
      .leftJoinAndSelect(
        'event.registrations',
        'registrations',
        'registrations.user.id = :userId',
        { userId },
      )
      .leftJoinAndSelect('registrations.user', 'user')
      .where('event.id = :eventId', { eventId })
      .getOne();

    if (event) {
      console.log(
        `Event Details Loaded: ${event.title}, Regs: ${event.registrations?.length}`,
      );
    }

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} introuvable`);
    }

    return EventMapper.toUserEventDto(event, userId);
  }

  private applyFilters(
    query: SelectQueryBuilder<Event>,
    filter: FilterEventDto,
  ): void {
    if (filter.status) {
      query.andWhere('event.status = :status', { status: filter.status });
    }

    if (filter.type) {
      query.andWhere('event.sPaid = :type', { type: filter.type });
    }

    if (filter.clubId) {
      query.andWhere('event.club_Id = :clubId', { clubId: filter.clubId });
    }

    if (filter.search) {
      query.andWhere(
        '(event.title LIKE :search OR event.description LIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.startDateFrom) {
      query.andWhere('event.startDate >= :startDateFrom', {
        startDateFrom: new Date(filter.startDateFrom),
      });
    }

    if (filter.startDateTo) {
      query.andWhere('event.startDate <= :startDateTo', {
        startDateTo: new Date(filter.startDateTo),
      });
    }
  }

  private applySorting(
    query: SelectQueryBuilder<Event>,
    filter: FilterEventDto,
  ): void {
    const sortColumnMap: Record<string, string> = {
      date: 'event.startDate',
      title: 'event.title',
      registrations: 'COUNT(registrations.id)',
    };

    const orderBy = filter.sortBy
      ? sortColumnMap[filter.sortBy]
      : 'event.startDate';

    const order: 'ASC' | 'DESC' =
      (filter.order?.toUpperCase() as 'ASC' | 'DESC') || 'ASC';

    if (filter.sortBy === 'registrations') {
      query.groupBy('event.id').addGroupBy('club.id').orderBy(orderBy, order);
    } else {
      query.orderBy(orderBy, order);
    }
  }
  async getUpcomingEventsForDashboard(
    clubId: number,
  ): Promise<DashboardEventDto[]> {
    const events = await this.eventRepository.find({
      where: {
        club: { id: clubId },
        startDate: MoreThan(new Date()),
      },
      order: { startDate: 'ASC' },
      take: 5,
    });

    return events.map((e) => ({
      id: e.id,
      name: e.title,
      startDate: e.startDate,
    }));
  }

  async countUpcomingByClub(clubId: number): Promise<number> {
    return this.eventRepository.count({
      where: {
        club: { id: clubId },
        startDate: MoreThan(new Date()),
      },
    });
  }
  async countEventsByClub(clubId: number): Promise<number> {
    return this.eventRepository.count({
      where: {
        club: { id: clubId },
      },
    });
  }

  async cancelRegistration(eventId: number, userId: number): Promise<void> {
    const registration = await this.registrationRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
    });

    if (!registration) {
      throw new NotFoundException('Inscription non trouvée');
    }

    // You can either delete it or mark it as CANCELLED
    // If you delete it:
    await this.registrationRepository.remove(registration);

    // If you prefer to keep history:
    // registration.status = RegistrationStatus.CANCELLED;
    // await this.registrationRepository.save(registration);
  }
}
