import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '../memberships/entities/membership.entity';
import { Application } from '../memberships/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { Club } from './entities/club.entity';
import { Repository, Not } from 'typeorm';
import { CreateApplicationDto } from '../memberships/dto/create-application.dto';
import { CreateMembershipDto } from '../memberships/dto/create-membership.dto';
import { Status } from '../common/enums/status.enum';
import { MemberRole } from '../common/enums/member-role.enum';
import { ApplicationResponseDto } from "../memberships/dto/application-response.dto";
import { MembershipClubDto } from '../memberships/dto/membership-club.dto';

/**
 * Service pour gérer les adhésions (memberships) et les candidatures (applications)
 */
@Injectable()
export class MembershipsService {
    constructor(
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        @InjectRepository(Application)
        private readonly applicationRepository: Repository<Application>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Club)
        private readonly clubRepository: Repository<Club>,
    ) { }

    /**
     * Créer une candidature pour rejoindre un club
     * L'utilisateur soumet une demande qui doit être approuvée par un admin du club
     */
    async createApplication(
        createApplicationDto: CreateApplicationDto,
    ): Promise<ApplicationResponseDto> {
        const { userId, clubId } = createApplicationDto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec ID ${userId} introuvable`);
        }

        const club = await this.clubRepository.findOne({ where: { id: clubId } });
        if (!club) {
            throw new NotFoundException(`Club avec ID ${clubId} introuvable`);
        }

        const existingMembership = await this.membershipRepository.findOne({
            where: {
                user: { id: userId },
                club: { id: clubId },
            },
        });

        if (existingMembership) {
            throw new ConflictException(
                'Vous êtes déjà membre de ce club',
            );
        }

        const existingApplication = await this.applicationRepository.findOne({
            where: {
                user: { id: userId },
                membership: {
                    club: { id: clubId },
                },
                status: Status.PENDING,
            },
        });

        if (existingApplication) {
            throw new ConflictException(
                'Vous avez déjà une candidature en attente pour ce club',
            );
        }


        const application: Application = this.applicationRepository.create({
            user,
            status: Status.PENDING,
            ...createApplicationDto,
            club
        });

        const app = await this.applicationRepository.save(application)
        return this.toResponseDto(app)
    }

    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club avec ID ${clubId} introuvable`);
    }

    const existingMembership = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
      },
    });

    if (existingMembership) {
      throw new ConflictException('Vous êtes déjà membre de ce club');
    }

    const existingApplication = await this.applicationRepository.findOne({
      where: {
        user: { id: userId },
        membership: {
          club: { id: clubId },
        },
        status: Status.PENDING,
      },
    });

    if (existingApplication) {
      throw new ConflictException(
        'Vous avez déjà une candidature en attente pour ce club',
      );
    }

    const application: Application = this.applicationRepository.create({
      user,
      status: Status.PENDING,
      ...createApplicationDto,
      club,
    });

    const app = await this.applicationRepository.save(application);
    return this.toResponseDto(app);
  }
  /**
   * Approuver une candidature
   * Seuls les admins/présidents du club peuvent approuver
   */
  async approveApplication(
    applicationId: number,
    response?: string,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['membership', 'user'],
    });

    if (!application) {
      throw new NotFoundException(
        `Candidature avec ID ${applicationId} introuvable`,
      );
    }

    if (application.status !== Status.PENDING) {
      throw new BadRequestException('Cette candidature a déjà été traitée');
    }

    const membership = this.membershipRepository.create({
      user: application.user,
      club: application.membership.club,
      dateDebut: new Date(),
      role: MemberRole.MEMBER,
    });
    application.status = Status.APPROVED;
    application.response = response || 'Candidature approuvée';
    application.membership = await this.membershipRepository.save(membership);

    return await this.applicationRepository.save(application);
  }

  /**
   * Rejeter une candidature
   */
  async rejectApplication(
    applicationId: number,
    response?: string,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['membership'],
    });

    if (!application) {
      throw new NotFoundException(
        `Candidature avec ID ${applicationId} introuvable`,
      );
    }

    /**
     * Récupérer toutes les candidatures d'un utilisateur
     */
    async getUserApplications(userId: number): Promise<ApplicationResponseDto[]> {
        const application = await this.applicationRepository.find({
            where: { user: { id: userId } },
            relations: ['club', 'user'], // Added 'user' to load user data
            order: { createdAt: 'DESC' },
        });
        return application.map(
            (app) => this.toResponseDto(app)
        )
    }

    application.status = Status.REJECTED;
    application.response = response || 'Candidature rejetée';

    if (application.membership) {
      await this.membershipRepository.remove(application.membership);
    }

    return await this.applicationRepository.save(application);
  }

  /**
   * Créer une adhésion directement (sans candidature)
   * Utilisé par les admins pour ajouter directement des membres
   */
  async createMembership(
    createMembershipDto: CreateMembershipDto,
  ): Promise<Membership> {
    const { userId, clubId, dateDebut, dateFin, role } = createMembershipDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID ${userId} introuvable`);
    }

    const club = await this.clubRepository.findOne({ where: { id: clubId } });
    if (!club) {
      throw new NotFoundException(`Club avec ID ${clubId} introuvable`);
    }

    const existingMembership = await this.membershipRepository.findOne({
      where: {
        user: { id: userId },
        club: { id: clubId },
      },
    });

    if (existingMembership) {
      throw new ConflictException('Cet utilisateur est déjà membre de ce club');
    }

    const membership = this.membershipRepository.create({
      user,
      club,
      dateDebut: new Date(dateDebut),
      dateFin: dateFin ? new Date(dateFin) : undefined,
      role: role || MemberRole.MEMBER,
    });

    return await this.membershipRepository.save(membership);
  }

  /**
   * Récupérer toutes les candidatures d'un club
   */
  async getClubApplications(
    clubId: number,
    status?: Status,
  ): Promise<Application[]> {
    const query = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('application.membership', 'membership')
      .leftJoinAndSelect('membership.club', 'club')
      .where('club.id = :clubId', { clubId });

    if (status) {
      query.andWhere('application.status = :status', { status });
    }

    return await query.getMany();
  }

  /**
   * Récupérer toutes les candidatures d'un utilisateur
   */
  async getUserApplications(userId: number): Promise<ApplicationResponseDto[]> {
    const application = await this.applicationRepository.find({
      where: { user: { id: userId } },
      relations: ['club', 'user'], // Added 'user' to load user data
      order: { createdAt: 'DESC' },
    });
    return application.map((app) => this.toResponseDto(app));
  }

  /**
   * Mettre à jour le rôle d'un membre
   */
  async updateMemberRole(
    membershipId: number,
    newRole: MemberRole,
  ): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
      relations: ['user', 'club'],
    });

    if (!membership) {
      throw new NotFoundException(
        `Adhésion avec ID ${membershipId} introuvable`,
      );
    }

    async deleteApplication(applicationId: number) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
        });
        if (!application) {
            throw new NotFoundException(
                `Candidature avec ID ${applicationId} introuvable`,
            );
        }
        if (application.status !== Status.PENDING) {
            throw new BadRequestException(
                'Seules les candidatures en attente peuvent être annulées',
            );
        }
        await this.applicationRepository.remove(application);

    await this.membershipRepository.remove(membership);
  }

  /**
   * Récupérer les membres d'un club
   */
  async getClubMembers(clubId: number): Promise<Membership[]> {
    return await this.membershipRepository.find({
      where: { club: { id: clubId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getApplicationResponse(
    applicationId: number,
  ): Promise<ApplicationResponseDto | null> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['user', 'club'],
    });

    if (!application) {
      throw new NotFoundException(
        `Candidature avec ID ${applicationId} introuvable`,
      );
    }

    return this.toResponseDto(application);
  }

  async deleteApplication(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException(
        `Candidature avec ID ${applicationId} introuvable`,
      );
    }


    async getAllClubSpecialMemberships(userId: number): Promise<MembershipClubDto[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec ID ${userId} introuvable`);
        }

        const memberships = await this.membershipRepository.find({
            where: {
                user: { id: userId },
                role: Not(MemberRole.MEMBER)
            },
            relations: ['club'],
            order: { createdAt: 'DESC' },
        });
        return memberships.map(m => ({
            id: m.club.id,
            name: m.club.name,
            description: m.club.description,
            logo: m.club.logo,
            userRole: m.role,
            membershipId: m.id,
            dateDebut: m.dateDebut
        }));
    }


    toResponseDto(application: Application): ApplicationResponseDto {
        return {
            id: application.id,
            status: application.status,
            adminResponse: application.response,
            whyJoin: application.whyJoin,
            previousClub: application.previousClub,
            goalsInClub: application.goalsInClub,
            phoneNumber: application.phoneNumber,
            skills: application.skills,
            expectations: application.expectations,
            availability: application.availability,
            additionalComments: application.additionalComments,
            isMemberOfOtherClub: application.isMemberOfOtherClub,
            userId: application.user?.id,
            userName: application.user?.name,
            userEmail: application.user?.email,
            clubId: application.club?.id,
            clubName: application.club?.name,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
        };
    }
    await this.applicationRepository.remove(application);
  }
  toResponseDto(application: Application): ApplicationResponseDto {
    return {
      id: application.id,
      status: application.status,
      adminResponse: application.response,
      whyJoin: application.whyJoin,
      previousClub: application.previousClub,
      goalsInClub: application.goalsInClub,
      phoneNumber: application.phoneNumber,
      skills: application.skills,
      expectations: application.expectations,
      availability: application.availability,
      additionalComments: application.additionalComments,
      isMemberOfOtherClub: application.isMemberOfOtherClub,
      userId: application.user?.id,
      userName: application.user?.name,
      userEmail: application.user?.email,
      clubId: application.club?.id,
      clubName: application.club?.name,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
