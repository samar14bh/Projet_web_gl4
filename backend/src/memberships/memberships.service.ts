import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { Application } from './entities/application.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { Status, MemberRole } from '../common/enums';

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
  ) {}

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
}
