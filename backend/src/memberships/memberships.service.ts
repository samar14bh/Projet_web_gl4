import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { Application } from './entities/application.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { MemberRole, Status } from '../common/enums';
import { DashboardMemberDto } from '../club-manager/dto/dashboard-member.dto';
import { MemberResponseDto } from '../club-manager/dto/member-response.dto';
import { GetMembersQueryDto } from '../club-manager/dto/get-members-query.dto';
import { GetApplicationsQueryDto } from '../club-manager/dto/get-applications-query.dto';

/**
 * Service de Gestion des Adhésions
 *
 * LOGIQUE IMPORTANTE:
 * - Les applications contiennent le statut (PENDING, APPROVED, REJECTED)
 * - Les memberships enregistrent l'adhésion effective (dateDebut, dateFin, role)
 * - Quand une application est APPROVED -> créer/mettre à jour la membership
 * - Quand une application est REJECTED -> supprimer/annuler la membership
 */
@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) { }

  /**
   * Créer une nouvelle adhésion
   */
  async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
    const membership = this.membershipRepository.create(createMembershipDto);
    return await this.membershipRepository.save(membership);
  }

  /**
   * Récupérer les membres avec filtrage par statut
   *
   * IMPORTANT: Filtre par le statut de l'APPLICATION, pas du membership
   * Les statuts possibles: PENDING, APPROVED, REJECTED
   */
  async findAll(filters: {
    clubId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { clubId, status, page = 1, limit = 10 } = filters;

    // Construire la requête sur les applications
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('application.club', 'club')
      .leftJoinAndSelect('application.membership', 'membership');

    // Filtrer par club
    if (clubId) {
      queryBuilder.andWhere('application.club_id = :clubId', { clubId });
    }

    // Filtrer par statut de l'application
    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('application.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((app) => ({
        id: app.id,
        name: app.user.name,
        lastName: app.user.lastName,
        email: app.user.email,
        status: app.status,
        // Date d'adhésion si membership existe, sinon date de création
        createdAt: app.membership?.createdAt || app.createdAt,
        dateDebut: app.membership?.dateDebut || app.createdAt,
        // Autres infos utiles
        userId: app.user.id,
        clubId: app.club.id,
        membershipId: app.membership?.id,
        role: app.membership?.role,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer une adhésion spécifique
   */
  async findOne(id: number): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: ['user', 'club', 'applications'],
    });

    if (!membership) {
      throw new NotFoundException(`Adhésion avec l'ID ${id} non trouvée`);
    }

    return membership;
  }

  /**
   * Mettre à jour le statut d'une application (demande d'adhésion)
   *
   * LOGIQUE:
   * - APPROVED: Créer/activer la membership
   * - REJECTED: Supprimer/désactiver la membership
   * - PENDING: Maintenir en attente
   */
  async updateStatus(
    applicationId: number,
    status: Status,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['user', 'club', 'membership'],
    });

    if (!application) {
      throw new NotFoundException(
        `Application avec l'ID ${applicationId} non trouvée`,
      );
    }

    // Mettre à jour le statut de l'application
    application.status = status;

    // Si l'application est approuvée
    if (status === Status.APPROVED) {
      // Vérifier si une membership existe déjà
      if (!application.membership) {
        // Créer une nouvelle membership
        const newMembership = this.membershipRepository.create({
          user: { id: application.user.id },
          club: { id: application.club.id },
          dateDebut: new Date(),
          role: MemberRole.MEMBER, // Utiliser l'enum MemberRole
        });
        application.membership =
          await this.membershipRepository.save(newMembership);
      }
    }
    // Si l'application est rejetée
    else if (status === Status.REJECTED) {
      // Supprimer la membership associée si elle existe
      if (application.membership) {
        await this.membershipRepository.remove(application.membership);
        application.membership = null as any;
      }
    }

    // Sauvegarder les changements
    return await this.applicationRepository.save(application);
  }

  /**
   * Vérifier l'adhésion d'un utilisateur à un club
   *
   * Retourne:
   * - exists: true si l'utilisateur a une application approuvée
   * - membership: les détails de l'adhésion
   * - status: le statut de l'application
   */
  async findByUserAndClub(
    userId: number,
    clubId: number,
  ): Promise<{
    exists: boolean;
    membership?: Membership;
    status?: Status;
    application?: Application;
  }> {
    // Chercher l'application (qui contient le statut)
    const application = await this.applicationRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
      },
      relations: ['membership', 'user', 'club'],
    });

    if (!application) {
      return { exists: false };
    }

    // Retourner les infos de l'application et membership
    return {
      exists: application.status === Status.APPROVED,
      membership: application.membership || undefined,
      status: application.status,
      application: application,
    };
  }

  /**
   * ✅ OBTENIR UNE ADHÉSION DIRECTEMENT (Version src/memberships)
   * Utile pour les rôles internes (Président, etc.) qui n'ont pas forcément d'application
   */
  async findMembershipByUserAndClub(
    userId: number,
    clubId: number,
  ): Promise<Membership | null> {
    const membership = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId }
      },
    });

    if (membership) {
      // Vérifier si l'adhésion est encore valide (dateFin est null ou dans le futur)
      const now = new Date();
      if (membership.dateFin && membership.dateFin < now) {
        return null;
      }
    }

    return membership;
  }

  /**
   * Obtenir les détails d'une membership avec son application
   */
  async getMembershipWithApplication(membershipId: number) {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
      relations: ['user', 'club', 'applications'],
    });

    if (!membership) {
      throw new NotFoundException(
        `Membership avec l'ID ${membershipId} non trouvée`,
      );
    }

    // Récupérer l'application associée
    const application = await this.applicationRepository.findOne({
      where: { membership: { id: membershipId } },
      relations: ['user', 'club'],
    });

    return {
      membership,
      application,
    };
  }

  /**
   * Nettoyer les erreurs
   */
  clearError() {
    // Pour une utilisation optionnelle
  }
  async getRecentMembers(clubId: number): Promise<DashboardMemberDto[]> {
    const memberships = await this.membershipRepository.find({
      where: {
        club: { id: clubId },
        dateFin: IsNull(),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });
    return memberships.map((m) => ({
      id: m.id,
      name: m.user.name,
      lastName: m.user.lastName,
      email: m.user.email,
      joinDate: m.createdAt,
    }));
  }

  async countActiveMembers(clubId: number): Promise<number> {
    return this.membershipRepository.count({
      where: {
        club: { id: clubId },
        dateFin: IsNull(),
      },
    });
  }
  async countPendingByClub(clubId: number): Promise<number> {
    return this.applicationRepository.count({
      where: {
        club: { id: clubId },
        status: Status.PENDING,
      },
    });
  }

  async getPendingApplicationsForDashboard(
    clubId: number,
  ): Promise<DashboardMemberDto[]> {
    const applications = await this.applicationRepository.find({
      where: {
        club: { id: clubId },
        status: Status.PENDING,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return applications.map((app) => ({
      id: app.id,
      name: app.user.name,
      lastName: app.user.lastName,
      email: app.user.email,
      joinDate: app.createdAt,
      image: app.user.image,
    }));
  }
  // Obtenir les membres avec pagination et filtres - PAGINATION INTÉGRÉE
  async getMembersPaginated(clubId: number, query: GetMembersQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoinAndSelect('membership.club', 'club')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere(
        '(membership.date_fin IS NULL OR membership.date_fin >= :today)',
        { today: new Date() },
      );

    // Filtrer par rôle si spécifié
    if (query.role) {
      queryBuilder.andWhere('membership.role = :role', { role: query.role });
    }

    // Recherche par nom ou email
    if (query.search) {
      queryBuilder.andWhere(
        '(user.name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Appliquer le tri et la pagination
    queryBuilder.orderBy('membership.id', 'DESC').skip(skip).take(limit);

    // Exécuter la requête
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((m) => this.mapToMemberResponse(m)),
      total,
      page,
      limit,
    };
  }

  // Compter les membres actifs d'un club
  async countByClub(clubId: number): Promise<number> {
    return this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere(
        '(membership.date_fin IS NULL OR membership.date_fin >= :today)',
        { today: new Date() },
      )
      .getCount();
  }

  // Compter les membres avec un rôle spécifique
  async countByClubAndRole(clubId: number, role: string): Promise<number> {
    return this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere(
        '(membership.date_fin IS NULL OR membership.date_fin >= :today)',
        { today: new Date() },
      )
      .andWhere('membership.role = :role', { role })
      .getCount();
  }

  // Compter les membres du bureau (tous sauf role 'member')
  async countByClubAndRoleNot(clubId: number, role: string): Promise<number> {
    return this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere(
        '(membership.date_fin IS NULL OR membership.date_fin >= :today)',
        { today: new Date() },
      )
      .andWhere('membership.role != :role', { role })
      .getCount();
  }

  // Mettre à jour le rôle d'un membre
  async updateRole(membershipId: number, role?: string) {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
      relations: ['user', 'club'],
    });

    if (!membership) {
      throw new Error('Membership not found');
    }

    membership.role = (role as any) || MemberRole.MEMBER;
    await this.membershipRepository.save(membership);

    return this.mapToMemberResponse(membership);
  }

  // Retirer un membre (définir date de fin)
  async removeMembership(membershipId: number) {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new Error('Membership not found');
    }

    membership.dateFin = new Date();
    await this.membershipRepository.save(membership);

    return { message: 'Member removed successfully' };
  }

  // Mapper vers DTO de réponse
  private mapToMemberResponse(membership: Membership): MemberResponseDto {
    return {
      id: membership.id,
      name: membership.user?.name || '',
      lastName: membership.user?.lastName || '',
      email: membership.user?.email || '',
      role: membership.role || 'member',
      joinDate: membership.dateDebut?.toString() || '',
      endDate: membership.dateFin?.toString(),
      image: membership.user?.image,
      status:
        membership.dateFin && new Date(membership.dateFin) < new Date()
          ? 'CANCELLED'
          : 'ACTIVE',
    };
  }
  // Obtenir les applications avec pagination et filtres - PAGINATION INTÉGRÉE
  async getApplicationsPaginated(
    clubId: number,
    query: GetApplicationsQueryDto,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('application.club', 'club')
      .where('application.club_id = :clubId', { clubId });

    // Filtrer par statut si spécifié
    if (query.status) {
      queryBuilder.andWhere('application.status = :status', {
        status: query.status,
      });
    }

    // Appliquer le tri et la pagination
    queryBuilder.orderBy('application.id', 'DESC').skip(skip).take(limit);

    // Exécuter la requête
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((app) => this.mapToApplicationResponse(app)),
      total,
      page,
      limit,
    };
  }

  // Compter les applications par club et statut
  async countByClubAndStatus(clubId: number, status: Status): Promise<number> {
    return this.applicationRepository
      .createQueryBuilder('application')
      .where('application.club_id = :clubId', { clubId })
      .andWhere('application.status = :status', { status })
      .getCount();
  }

  // Mapper vers DTO de réponse complet
  private mapToApplicationResponse(application: Application) {
    return {
      id: application.id,
      status: application.status,
      adminResponse: application.response || '',
      whyJoin: application.whyJoin || '',
      previousClub: application.previousClub,
      goalsInClub: application.goalsInClub || '',
      phoneNumber: application.phoneNumber || '',
      skills: application.skills,
      expectations: application.expectations,
      availability: application.availability,
      additionalComments: application.additionalComments,
      isMemberOfOtherClub: application.isMemberOfOtherClub || false,
      userId: application.user?.id || 0,
      userName: application.user?.name || '',
      userLastName: application.user?.lastName || '',
      userEmail: application.user?.email || '',
      userImage: application.user?.image,
      clubId: application.club?.id || 0,
      clubName: application.club?.name || '',
      createdAt: application.createdAt?.toString() || '',
      updatedAt: application.updatedAt?.toString() || '',
    };
  }
  // ✅ OBTENIR LES MEMBRES DU BUREAU AVEC PAGINATION - NOUVELLE MÉTHODE
  async getBureauMembersPaginated(clubId: number, query: GetMembersQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .leftJoinAndSelect('membership.club', 'club')
      .where('membership.club_id = :clubId', { clubId })
      .andWhere(
        '(membership.date_fin IS NULL OR membership.date_fin >= :today)',
        { today: new Date() },
      )
      .andWhere('membership.role NOT IN (:...roles)', { roles: ['MEMBER', 'member'] }); // ✅ FILTRE BUREAU ROBUSTE

    // Recherche par nom ou email
    if (query.search) {
      queryBuilder.andWhere(
        '(user.name LIKE :search OR user.last_name LIKE :search OR user.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Appliquer le tri et la pagination
    queryBuilder.orderBy('membership.id', 'DESC').skip(skip).take(limit);

    // Exécuter la requête
    const [data, total] = await queryBuilder.getManyAndCount();

    console.log(
      `[Bureau Members] Club: ${clubId}, Page: ${page}, Total: ${total}, Returned: ${data.length}`,
    );

    return {
      data: data.map((m) => this.mapToMemberResponse(m)),
      total,
      page,
      limit,
    };
  }
}
