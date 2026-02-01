import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { MemberRole } from '../common/enums/member-role.enum';
import { Document as ClubDocument } from '../documents/entities/document.entity';
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

import { Application } from 'src/memberships/entities/application.entity';
import { Status } from 'src/common/enums';
import { User } from '../users/entities/user.entity';
import { UpdateClubSettingsDto } from '../club-manager/dto/update-club-settings.dto';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ClubDocument)
    private readonly documentRepository: Repository<ClubDocument>,

  ) { }


  /**
   * Créer un nouveau club
   */
  async create(createClubDto: CreateClubDto): Promise<Club> {

    const { categoryId, ...clubData } = createClubDto;

    const club = this.clubRepository.create({
      ...clubData,
      creationDate: new Date(),
      isActive: true,
      category: { id: categoryId },
    });

    return await this.clubRepository.save(club);
  }

  /**
   * Récupérer tous les clubs avec filtres et pagination
   */
  async findAll(filters: FilterClubDto) {
    const { status, categoryId, search, sortBy, sortOrder, page, limit } =
      filters;

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
  async update(
    id: number,
    dto: UpdateClubDto,
    logo?: string,
    coverImage?: string,
  ) {
    const club = await this.clubRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    const updateData: any = {
      ...dto,
    };

    // 🔥 FIX DATE MYSQL
    if (dto.creationDate) {
      updateData.creationDate = dto.creationDate.split('T')[0]; // YYYY-MM-DD
    }

    // Logo
    if (logo) {
      updateData.logo = logo;
    }

    // Cover
    if (coverImage) {
      updateData.coverImage = coverImage;
    }

    // ⚠️ Category relation (IMPORTANT)
    if (dto.categoryId) {
      updateData.category = { id: dto.categoryId };
      delete updateData.categoryId;
    }

    await this.clubRepository.update(id, updateData);

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
    const club = await this.clubRepository.findOne({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${id} introuvable`);
    }

    // 🗑️ Supprimer toutes les dépendances AVANT de supprimer le club
    await this.transactionRepository.delete({ club: { id } });
    await this.applicationRepository.delete({ club: { id } });
    await this.membershipRepository.delete({ club: { id } });
    await this.eventRepository.delete({ club: { id } });
    await this.documentRepository.delete({ club: { id } });

    // 🧹 Supprimer les fichiers
    await this.deleteFile(club.logo);
    await this.deleteFile(club.coverImage);

    // 🗑️ Supprimer le club
    await this.clubRepository.remove(club);
  }


  /**
   * Récupérer les statistiques globales des clubs
   */
  async getStats() {
    const total = await this.clubRepository.count();
    const active = await this.clubRepository.count({
      where: { isActive: true },
    });
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
  async getUserClubs(
    userId: number,
    filters: FilterClubDto,
  ): Promise<PaginatedResult<any>> {
    const {
      status,
      categoryId,
      search,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.clubRepository
      .createQueryBuilder('club')
      .innerJoin('club.memberships', 'membership')
      .andWhere('membership.user_id = :userId', { userId })
      .leftJoinAndSelect('club.category', 'category');

    if (status && status !== ClubStatus.ALL) {
      queryBuilder.andWhere('club.isActive = :isActive', {
        isActive: status === ClubStatus.ACTIVE,
      });
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

    queryBuilder.orderBy(
      'club.name',
      (sortOrder?.toUpperCase() as any) || 'ASC',
    );

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

  async getClubDetailedStats(clubId: number) {
    // Vérifier que le club existe
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${clubId} introuvable`);
    }

    // Membres actifs (APPROVED ou CONFIRMED)
    const activeMembers = await this.applicationRepository
      .createQueryBuilder('application')
      .where('application.club = :clubId', { clubId })
      .andWhere('application.status IN (:...statuses)', {
        statuses: ['APPROVED', 'CONFIRMED'],
      })
      .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', {
        now: new Date(),
      })
      .getCount();

    // Total membres
    const totalMembers = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club = :clubId', { clubId })
      .getCount();

    // Demandes en attente
    const pendingRequests = await this.applicationRepository
      .createQueryBuilder('application')
      .where('application.club = :clubId', { clubId })
      .andWhere('application.status = :status', { status: 'PENDING' })
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

    const { page = 1, limit = 10 } = filters;

    const queryBuilder = this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .where('membership.club_id = :clubId', { clubId });

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
  async getClubStats(clubId: number) {
    // Nombre de membres
    const members = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', {
        now: new Date(),
      })
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
        roles: ['PRESIDENT', 'TREASURER', 'SECRETARY', 'RH'],
      })
      .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', {
        now: new Date(),
      })
      .getMany();

    return managedMemberships.map((m) => m.club);
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
      throw new NotFoundException(`Club with id  ${clubId} not found `);
    }

    const membership = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere('membership.user_id = :userId', { userId })
      .andWhere(
        '(membership.date_fin IS NULL OR membership.date_fin >= :now)',
        {
          now: new Date(),
        },
      )
      .getOne();

    if (membership) {
      return 'MEMBER';
    }

    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.club', 'club')
      .innerJoin('application.user', 'user')
      .where('club.id = :clubId', { clubId })
      .andWhere('user.id = :userId', { userId })
      .orderBy('application.created_at', 'DESC')
      .getOne();

    if (application) {
      if (Status.PENDING) {
        return 'PENDING';
      } else if (Status.REJECTED) {
        return 'REJECTED';
      }
    }

    return 'NOT_MEMBER';
  }

async getRecommendations(
  userId: number,
  limit: number = 3
): Promise<any[]> {

  if (!userId || isNaN(userId)) {
    return [];
  }
  const memberships = await this.membershipRepository.find({
    where: { user: { id: userId } },
    relations: ['club', 'club.category'],
  });

  const joinedClubIds = memberships
    .map(m => m.club?.id)
    .filter((id): id is number => typeof id === 'number');

  const preferredCategoryIds = [
    ...new Set(
      memberships
        .map(m => m.club?.category?.id)
        .filter((id): id is number => typeof id === 'number')
    ),
  ];
  let query = this.clubRepository
    .createQueryBuilder('club')
    .leftJoin('club.category', 'category')
    .leftJoin('club.memberships', 'membership')
    .leftJoin('club.events', 'event')  
    .select([
      'club.id AS id',
      'club.name AS name',
      'club.description AS description',
      'club.logo AS logo',
      'club.cover_image AS coverImage',
      'club.creation_date AS creationDate',
      'club.membership_fee_amount AS membershipFeeAmount',  
      'club.isActive AS isActive',
      'category.id AS categoryId',  
      'category.name AS categoryName',
      'COUNT(DISTINCT membership.id) AS members',
      'COUNT(DISTINCT event.id) AS events',
    ])
    .where('club.isActive = :isActive', { isActive: true })
    .groupBy('club.id')
    .addGroupBy('category.id')
    .addGroupBy('category.name');

  if (joinedClubIds.length > 0) {
    query.andWhere('club.id NOT IN (:...joinedIds)', {
      joinedIds: joinedClubIds,
    });
  }

  if (preferredCategoryIds.length > 0) {
    query.andWhere('category.id IN (:...catIds)', {
      catIds: preferredCategoryIds,
    });
  }

  let results = await query.limit(limit).getRawMany();
  if (results.length === 0) {
    results = await this.clubRepository
      .createQueryBuilder('club')
      .leftJoin('club.category', 'category')
      .leftJoin('club.memberships', 'membership')
      .leftJoin('club.events', 'event')
      .select([
        'club.id AS id',
        'club.name AS name',
        'club.description AS description',
        'club.logo AS logo',
        'club.cover_image AS coverImage',
        'club.creation_date AS creationDate',
        'club.membership_fee_amount AS membershipFeeAmount',
        'club.isActive AS isActive',
        'category.id AS categoryId',
        'category.name AS categoryName',
        'COUNT(DISTINCT membership.id) AS members',
        'COUNT(DISTINCT event.id) AS events',
      ])
      .where('club.isActive = true')
      .andWhere(joinedClubIds.length > 0 
        ? 'club.id NOT IN (:...joinedIds)' 
        : '1=1', 
        { joinedIds: joinedClubIds }
      )
      .groupBy('club.id')
      .addGroupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('members', 'DESC')  
      .limit(limit)
      .getRawMany();
  }
  return results.map(club => ({
    id: Number(club.id),
    name: club.name,
    description: club.description,
    logo: club.logo,
    coverImage: club.coverImage,
    creationDate: club.creationDate,
    membershipFeeAmount: Number(club.membershipFeeAmount) || 0,
    isActive: club.isActive,
    categoryId: Number(club.categoryId),
    categoryName: club.categoryName,
    members: Number(club.members) || 0,
    events: Number(club.events) || 0,
  }));
}

  async getClubStats2(clubId: number) {
    const totalMembers = await this.membershipRepository.count({
      where: { club: { id: clubId } },
    });



    const activeMembers = await this.membershipRepository.count({
      where: { club: { id: clubId }, dateFin: IsNull() },
    });

    return {
      totalMembers,
      activeMembers,
    };
  }
  private async deleteFile(filePath?: string) {
    if (!filePath) return;
    const fullPath = join(process.cwd(), filePath);

    if (existsSync(fullPath)) {
      try {
        await unlink(fullPath);
      } catch (err) {
        console.error('Erreur suppression fichier:', fullPath, err);
      }
    }
  }

async getUserClubMembershipStatus(clubId: number, userId: number): Promise<string> {
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

  /**
   * Récupérer le président actuel du club
   */
  async getClubPresident(clubId: number) {
    const president = await this.membershipRepository.findOne({
      where: {
        club: { id: clubId },
        role: MemberRole.PRESIDENT,
      },
      relations: ['user'],
    });

    if (!president) {
      return null;
    }

    return {
      id: president.id,
      userId: president.user.id,
      userName: `${president.user.name} ${president.user.lastName}`,
      userEmail: president.user.email,
      userImage: president.user.image,
      dateDebut: president.dateDebut,
    };
  }

  /**
   * Assigner un nouveau président au club
   */
  async assignPresident(clubId: number, userId: number) {
    // Vérifier que le club existe
    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club avec ID ${clubId} introuvable`);
    }

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${userId} introuvable`);
    }

    // Supprimer l'ancien président s'il existe
    const oldPresident = await this.membershipRepository.findOne({
      where: {
        club: { id: clubId },
        role: MemberRole.PRESIDENT,
      },
    });

    if (oldPresident) {
      await this.membershipRepository.remove(oldPresident);
    }

    // Vérifier si l'utilisateur est déjà membre
    let membership = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
      },
    });

    if (membership) {
      // L'utilisateur est déjà membre, on change juste son rôle
      membership.role = MemberRole.PRESIDENT;
    } else {
      // L'utilisateur n'est pas membre, on crée une nouvelle adhésion
      membership = this.membershipRepository.create({
        user,
        club,
        role: MemberRole.PRESIDENT,
        dateDebut: new Date(),
      });
    }

    await this.membershipRepository.save(membership);

    return {
      message: 'Président assigné avec succès',
      president: {
        id: membership.id,
        userId: user.id,
        userName: `${user.name} ${user.lastName}`,
        userEmail: user.email,
      },
    };
  }


  /**
   * Supprimer le président actuel du club
   */
  async removePresident(clubId: number) {
    const president = await this.membershipRepository.findOne({
      where: {
        club: { id: clubId },
        role: MemberRole.PRESIDENT,
      },
    });

    if (!president) {
      throw new NotFoundException('Aucun président trouvé pour ce club');
    }

    await this.membershipRepository.remove(president);

    return { message: 'Président supprimé avec succès' };
  }
  async updateClubSettings(
    clubId: number,
    updateSettingsDto: UpdateClubSettingsDto,
  ): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['category'], // Charger la catégorie
    });

    if (!club) {
      throw new NotFoundException(`Club avec l'ID ${clubId} introuvable`);
    }

    // Mettre à jour seulement les propriétés autorisées
    if (updateSettingsDto.isPublic !== undefined) {
      club.isPublic = updateSettingsDto.isPublic;
    }

    if (updateSettingsDto.membershipFeeAmount !== undefined) {
      club.membershipFeeAmount = updateSettingsDto.membershipFeeAmount;
    }

    if (updateSettingsDto.approvalRequired !== undefined) {
      club.approvalRequired = updateSettingsDto.approvalRequired;
    }

    return await this.clubRepository.save(club);
  }
}
