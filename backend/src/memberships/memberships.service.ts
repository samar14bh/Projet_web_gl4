import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { Status } from '../common/enums/status.enum';

@Injectable()
export class MembershipsService {
    constructor(
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
    ) { }

    async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
        const membership = this.membershipRepository.create(createMembershipDto);
        return await this.membershipRepository.save(membership);
    }

    async findAll(filters: { clubId?: number; status?: string; page?: number; limit?: number }) {
        const { clubId, status, page = 1, limit = 10 } = filters;
        const queryBuilder = this.membershipRepository
            .createQueryBuilder('membership')
            .leftJoinAndSelect('membership.user', 'user')
            .leftJoinAndSelect('membership.club', 'club');

        if (clubId) {
            queryBuilder.andWhere('membership.club_id = :clubId', { clubId });
        }

        if (status) {
            queryBuilder.andWhere('membership.status = :status', { status });
        }

        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        queryBuilder.orderBy('membership.joinDate', 'DESC');

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<Membership> {
        const membership = await this.membershipRepository.findOne({
            where: { id },
            relations: ['user', 'club'],
        });

        if (!membership) {
            throw new NotFoundException(`Membership with ID ${id} not found`);
        }

        return membership;
    }

    async updateStatus(id: number, status: Status): Promise<Membership> {
        const membership = await this.findOne(id);
        //membership.status = status;
        return await this.membershipRepository.save(membership);
    }

    async findByUserAndClub(userId: number, clubId: number): Promise<Membership | null> {
        return await this.membershipRepository.findOne({
            where: {
                user: { id: userId },
                club: { id: clubId },
            },
            relations: ['club'],
        });
    }
}
