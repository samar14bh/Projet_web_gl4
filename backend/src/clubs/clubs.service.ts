import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import {
  CreateClubDto,
  UpdateClubDto,
  FilterClubDto,
  ClubStatus,
  ClubSortBy,
} from './dto';
import { Membership } from '../memberships/entities/membership.entity';
import { Event } from '../events/entities/event.entity';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { Application } from 'src/memberships/entities/application.entity';
import { Status } from 'src/common/enums';

/**
 * Service pour gérer les clubs
 */
@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,

  ) { }

  /**
   * Créer un nouveau club
   */
  async create(createClubDto: CreateClubDto): Promise<Club> {
    // Générer le slug à partir du nom
    const slug = this.generateSlug(createClubDto.name);

    const club = this.clubRepository.create({
      ...createClubDto,
      slug,
      creationDate: new Date(),
      isActive: true,
    });

    return await this.clubRepository.save(club);
  }

  /**
   * Récupérer tous les clubs avec filtres et pagination
   */
  async findAll(filters: FilterClubDto) {
    const { status, categoryId, search, sortBy, sortOrder, page, limit } = filters;

    const queryBuilder = this.clubRepository
      .createQueryBuilder('club')
      .leftJoinAndSelect('club.category', 'category');

    // Filtre par statut
    if (status && status !== ClubStatus.ALL) {
      const isActive = status === ClubStatus.ACTIVE;
      queryBuilder.andWhere('club.isActive = :isActive', { isActive });
    }

    // Filtre par catégorie
    if (categoryId) {
      queryBuilder.andWhere('club.category_id = :categoryId', { categoryId });
    }

    // Filtre par recherche
    if (search) {
      queryBuilder.andWhere(
        '(club.name LIKE :search OR club.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Tri
    switch (sortBy) {
      case ClubSortBy.NAME:
        queryBuilder.orderBy(
          'club.name',
          sortOrder!.toUpperCase() as 'ASC' | 'DESC',
        );
        break;
      case ClubSortBy.CREATED_AT:
        queryBuilder.orderBy(
          'club.creationDate',
          sortOrder!.toUpperCase() as 'ASC' | 'DESC',
        );
        break;
      // Pour members et events, on les triera côté application après avoir récupéré les stats
      default:
        queryBuilder.orderBy('club.name', 'ASC');
    }

    // Pagination
    const skip = (page! - 1) * limit!;
    queryBuilder.skip(skip).take(limit);

    // Exécuter la requête
    const [clubs, total] = await queryBuilder.getManyAndCount();

    // Enrichir chaque club avec ses statistiques
    const enrichedClubs = await Promise.all(
      clubs.map(async (club) => {
        const stats = await this.getClubStats(club.id);
        return {
          ...club,
          categoryName: club.category?.name,
          members: stats.members,
          events: stats.events,
          revenue: stats.revenue,
        };
      }),
    );

    // Tri par membres ou événements si nécessaire
    if (sortBy === ClubSortBy.MEMBERS || sortBy === ClubSortBy.EVENTS) {
      enrichedClubs.sort((a, b) => {
        const field = sortBy === ClubSortBy.MEMBERS ? 'members' : 'events';
        return sortOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
      });
    }

    return {
      data: enrichedClubs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit!),
    };
  }

  /**
   * Récupérer un club par son ID
   */
  async findOne(id: number): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${id} introuvable`);
    }

    // Ajouter les statistiques
    const stats = await this.getClubStats(id);

    return {
      ...club,
      categoryName: club.category?.name,
      members: stats.members,
      events: stats.events,
      revenue: stats.revenue,
    } as any;
  }

  /**
   * Mettre à jour un club
   */
  /**
   * Mettre à jour un club
   */
  async update(id: number, updateClubDto: UpdateClubDto): Promise<any> {
    // Vérifier existence
    const exists = await this.clubRepository.findOne({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Club avec l'ID ${id} introuvable`);
    }

    // Si le nom change, régénérer le slug
    if (updateClubDto.name && updateClubDto.name !== exists.name) {
      updateClubDto['slug'] = this.generateSlug(updateClubDto.name);
    }

    // UPDATE direct
    await this.clubRepository.update(id, updateClubDto);

    // Retourner le club enrichi
    return this.findOne(id);
  }

  /**
   * Activer/Désactiver un club
   */
  /**
   * Activer/Désactiver un club
   */
  async toggleStatus(id: number, isActive: boolean): Promise<any> {
    // Vérifier existence
    const exists = await this.clubRepository.findOne({ where: { id } });

    if (!exists) {
      throw new NotFoundException(`Club avec l'ID ${id} introuvable`);
    }

    // UPDATE direct sans charger les relations
    await this.clubRepository.update(id, { isActive });

    // Retourner le club enrichi
    return this.findOne(id);
  }

  /**
   * Supprimer un club
   */
  async remove(id: number): Promise<void> {
    const club = await this.findOne(id);
    await this.clubRepository.remove(club);
  }

  /**
   * Récupérer les statistiques globales des clubs
   */
  async getStats() {
    const total = await this.clubRepository.count();
    const active = await this.clubRepository.count({ where: { isActive: true } });
    const inactive = total - active;

    // Total des membres (utilisateurs uniques)
    const totalMembersResult = await this.membershipRepository
      .createQueryBuilder('membership')
      .select('COUNT(DISTINCT membership.user_id)', 'count')
      .getRawOne();
    const totalMembers = parseInt(totalMembersResult?.count || '0');

    // Total des événements
    const totalEvents = await this.eventRepository.count();

    // Revenus totaux
    const totalRevenueResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type: TransactionType.REVENUE })
      .getRawOne();
    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');

    return {
      total,
      active,
      inactive,
      totalMembers,
      totalEvents,
      totalRevenue,
    };
  }

  /**
   * Récupérer les statistiques détaillées d'un club pour le dashboard
   */
  async getClubDetailedStats(clubId: number) {
    // Vérifier que le club existe
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${clubId} introuvable`);
    }

    // Membres actifs (APPROVED ou CONFIRMED)
    const activeMembers = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club = :clubId', { clubId })
      .andWhere('membership.status IN (:...statuses)', { statuses: ['APPROVED', 'CONFIRMED'] })
      .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', { now: new Date() })
      .getCount();

    // Total membres
    const totalMembers = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club = :clubId', { clubId })
      .getCount();

    // Demandes en attente
    const pendingRequests = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club = :clubId', { clubId })
      .andWhere('membership.status = :status', { status: 'PENDING' })
      .getCount();

    // Événements à venir
    const upcomingEvents = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.club = :clubId', { clubId })
      .andWhere('event.startDate >= :now', { now: new Date() })
      .getCount();

    // Total événements
    const totalEvents = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.club = :clubId', { clubId })
      .getCount();

    // Revenus total
    const totalRevenueResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.clubId = :clubId', { clubId })
      .andWhere('transaction.type = :type', { type: TransactionType.REVENUE })
      .getRawOne();
    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');

    // Revenus du mois en cours
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.clubId = :clubId', { clubId })
      .andWhere('transaction.type = :type', { type: TransactionType.REVENUE })
      .andWhere('transaction.date >= :firstDay', { firstDay: firstDayOfMonth })
      .getRawOne();
    const monthlyRevenue = parseFloat(monthlyRevenueResult?.total || '0');

    return {
      activeMembers,
      totalMembers,
      pendingRequests,
      upcomingEvents,
      totalEvents,
      totalRevenue,
      monthlyRevenue,
    };
  }

  /**
   * Récupérer les membres d'un club avec filtres
   */
  async getClubMembers(
    clubId: number,
    filters: { status?: string; page?: number; limit?: number },
  ) {
    // Vérifier que le club existe
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${clubId} introuvable`);
    }

    const { status, page = 1, limit = 10 } = filters;

    const queryBuilder = this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .where('membership.club_id = :clubId', { clubId });

    if (status) {
      queryBuilder.andWhere('membership.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('membership.dateDebut', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    // Formatter les données pour le frontend
    const formattedData = data.map((membership) => ({
      id: membership.id,
      name: membership.user?.name || '',
      lastName: membership.user?.lastName || '',
      email: membership.user?.email || '',
      status: membership.status,
      role: membership.role,
      dateDebut: membership.dateDebut,
      dateFin: membership.dateFin,
    }));

    return {
      data: formattedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer les statistiques d'un club
   */
  private async getClubStats(clubId: number) {
    // Nombre de membres
    const members = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', { now: new Date() })
      .getCount();

    // Nombre d'événements
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.club_id = :clubId', { clubId })
      .getCount();

    // Revenus
    const revenueResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.club_id = :clubId', { clubId })
      .andWhere('transaction.type = :type', { type: TransactionType.REVENUE })
      .getRawOne();
    const revenue = parseFloat(revenueResult?.total || '0');

    return { members, events, revenue };
  }

  /**
   * Récupérer les clubs gérés par un utilisateur
   */
  async findManagedClubs(userId: number) {
    const managedMemberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.club', 'club')
      .where('membership.user_id = :userId', { userId })
      .andWhere('membership.role IN (:...roles)', {
        roles: ['PRESIDENT', 'TREASURER', 'SECRETARY', 'RH']
      })
      .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', {
        now: new Date()
      })
      .getMany();

    return managedMemberships.map(m => m.club);
  }

  /**
   * Générer un slug à partir d'un nom
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
      .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
  }

  async findTopClubsByMembers(limit = 5): Promise<any[]> {
    const qb = this.clubRepository
      .createQueryBuilder('club')
      .leftJoin('club.category', 'category')
      .leftJoin('club.memberships', 'membership')
      .leftJoin('club.events', 'event')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(DISTINCT membership.id)', 'members')
      .addSelect('COUNT(DISTINCT event.id)', 'events')
      .where('club.isActive = :isActive', { isActive: true })
      .groupBy('club.id')
      .addGroupBy('category.name')
      .orderBy('members', 'DESC')
      .limit(limit);

    const { entities, raw } = await qb.getRawAndEntities();

    return entities.map((club, index) => ({
      ...club,
      categoryName: raw[index].categoryName ?? null,
      members: Number(raw[index].members) || 0,
      events: Number(raw[index].events) || 0,
    }));
  }

  async getUserClubStatus(clubId: number, userId: number): Promise<string> {
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${clubId} introuvable`);
    }

    const membership = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere('membership.user_id = :userId', { userId })
      .andWhere('(membership.date_fin IS NULL OR membership.date_fin >= :now)', {
        now: new Date()
      })
      .getOne();

    if (membership) {
      return `Membre ${membership.role.toLowerCase()}`;
    }

    const expiredMembership = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere('membership.user_id = :userId', { userId })
      .andWhere('membership.date_fin < :now', { now: new Date() })
      .getOne();

    if (expiredMembership) {
      return "Ancien membre";
    }

    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.membership', 'membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere('membership.user_id = :userId', { userId })
      .orderBy('application.created_at', 'DESC')
      .getOne();

    if (application) {
      switch (application.status) {
        case Status.PENDING:
          return "Candidature en attente";
        case Status.APPROVED:
          return "Candidature approuvée";
        case Status.REJECTED:
          return "Candidature rejetée";
        case Status.CONFIRMED:
          return "Candidature confirmée";
        default:
          return "Candidature en cours";
      }
    }

    return "Non membre";
  }
}
