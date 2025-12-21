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
import { PaginatedResult } from '../common/pagination/pagination.dto';

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
   * Récupérer les clubs pour les utilisateurs (paginés et filtrés)
   */
  async getUserClubs(userId: number, filters: FilterClubDto): Promise<PaginatedResult<any>> {
    const { status, categoryId, search, sortBy, sortOrder, page = 1, limit = 10 } = filters;

    const queryBuilder = this.clubRepository
      .createQueryBuilder('club')
      .innerJoin('club.memberships', 'membership')
      .andWhere('membership.user_id = :userId', { userId })
      .leftJoinAndSelect('club.category', 'category');

    if (status && status !== ClubStatus.ALL) {
      queryBuilder.andWhere('club.isActive = :isActive', { isActive: status === ClubStatus.ACTIVE });
    } else {
      queryBuilder.andWhere('club.isActive = :isActive', { isActive: true });
    }

    if (categoryId) {
      queryBuilder.andWhere('club.category_id = :categoryId', { categoryId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(club.name LIKE :search OR club.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('club.name', sortOrder?.toUpperCase() as any || 'ASC');

    const skip = (Math.max(1, page) - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [clubs, total] = await queryBuilder.getManyAndCount();

    const enrichedData = await Promise.all(
      clubs.map(async (club) => {
        const stats = await this.getClubStats(club.id);
        return {
          ...club,
          categoryName: club.category?.name,
          members: stats.members,
          events: stats.events,
          revenue: stats.revenue,
          isMember: true,
        };
      }),
    );

    return {
      data: enrichedData,
      total,
      page: Number(page),
      limit: Number(limit),
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


  async getClubMembershipDetails(userId: number, clubId: number) {
    const club = await this.findOne(clubId);
    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${clubId} introuvable`);
    }

    const membership = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
      },
    });

    return {
      club,
      membership,
    };
  }

  async leaveClub(userId: number, clubId: number): Promise<void> {
    const membership = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
      },
    });

    if (!membership) {
      throw new NotFoundException(`Vous n'êtes pas membre de ce club`);
    }

    await this.membershipRepository.remove(membership);
  }
}
