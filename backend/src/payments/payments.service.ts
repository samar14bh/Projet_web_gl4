import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Club } from '../clubs/entities/club.entity';
import { Event } from '../events/entities/event.entity';
import { Registration } from '../events/entities/registration.entity';
import {
    CreateMembershipPaymentDto,
    CreateEventPaymentDto,
    FilterPaymentDto,
} from './dto';
import { PaymentType, Status, RegistrationStatus } from '../common/enums';

/**
 * Service for handling payments (membership & events)
 */
@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Membership)
        private readonly membershipRepository: Repository<Membership>,
        @InjectRepository(Club)
        private readonly clubRepository: Repository<Club>,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectRepository(Registration)
        private readonly registrationRepository: Repository<Registration>,
    ) { }

    /**
     * Process annual club membership payment
     */
    async processMembershipPayment(
        dto: CreateMembershipPaymentDto,
    ): Promise<Payment> {
        const membership = await this.membershipRepository.findOne({
            where: { id: dto.membershipId },
            relations: ['club', 'user'],
        });

        if (!membership) {
            throw new NotFoundException('Membership not found');
        }

        const club = membership.club;

        if (club.isPublic) {
            throw new BadRequestException('This club is free');
        }

        // Create payment record
        const payment = this.paymentRepository.create({
            user: { id: dto.userId },
            membership: { id: dto.membershipId },
            type: PaymentType.MEMBERSHIP,
            amount: club.membershipFeeAmount,
            date: new Date(),
            status: Status.PENDING,
        });

        await this.paymentRepository.save(payment);

        // Update membership dates (1 year validity)
        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(now.getFullYear() + 1);

        membership.dateDebut = now;
        membership.dateFin = oneYearLater;
        await this.membershipRepository.save(membership);

        return payment;
    }

    /**
     * Process event registration payment
     */
    async processEventPayment(dto: CreateEventPaymentDto): Promise<{
        payment: Payment;
        registration: Registration;
    }> {
        const event = await this.eventRepository.findOne({
            where: { id: dto.eventId },
            relations: ['club'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (!event.sPaid) {
            throw new BadRequestException('This event is free');
        }

        // Check if user is member for potential discount
        const membership = await this.membershipRepository.findOne({
            where: {
                user: { id: dto.userId },
                club: { id: event.club.id },
            },
        });

        const isMember = !!membership;
        const basePrice = Number(event.subscriptionFees);

        // Apply 20% discount for members (can be made configurable)
        const discount = isMember ? basePrice * 0.2 : 0;
        const finalPrice = basePrice - discount;

        // Create payment
        const payment = this.paymentRepository.create({
            user: { id: dto.userId },
            event: { id: dto.eventId },
            type: PaymentType.EVENT,
            amount: finalPrice,
            date: new Date(),
            status: Status.CONFIRMED,
        });

        await this.paymentRepository.save(payment);

        // Create event registration
        const registration = this.registrationRepository.create({
            user: { id: dto.userId },
            event: { id: dto.eventId },
            status: RegistrationStatus.REGISTERED,
        });

        await this.registrationRepository.save(registration);

        return { payment, registration };
    }

    /**
     * Get user payment history with filters
     */
    async getPaymentHistory(userId: number, filters: FilterPaymentDto) {
        const query = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.membership', 'membership')
            .leftJoinAndSelect('membership.club', 'club')
            .leftJoinAndSelect('payment.event', 'event')
            .where('payment.user = :userId', { userId });

        if (filters.type) {
            query.andWhere('payment.type = :type', { type: filters.type });
        }

        if (filters.status) {
            query.andWhere('payment.status = :status', { status: filters.status });
        }

        if (filters.startDate) {
            query.andWhere('payment.date >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters.endDate) {
            query.andWhere('payment.date <= :endDate', { endDate: filters.endDate });
        }

        query.orderBy('payment.date', 'DESC');

        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;

        query.skip((page - 1) * limit);
        query.take(limit);

        const [payments, total] = await query.getManyAndCount();

        return {
            data: payments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get payment statistics for a user
     */
    async getUserPaymentStats(userId: number) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Total spent this month
        const monthResult = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.user = :userId', { userId })
            .andWhere('payment.date >= :startOfMonth', { startOfMonth })
            .andWhere('payment.status = :status', { status: Status.CONFIRMED })
            .getRawOne();

        // Total spent this year
        const yearResult = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.user = :userId', { userId })
            .andWhere('payment.date >= :startOfYear', { startOfYear })
            .andWhere('payment.status = :status', { status: Status.CONFIRMED })
            .getRawOne();

        // Count active memberships
        const activeMemberships = await this.membershipRepository
            .createQueryBuilder('membership')
            .where('membership.user = :userId', { userId })
            .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', {
                now,
            })
            .getCount();

        return {
            totalSpentThisMonth: parseFloat(monthResult?.total || '0'),
            totalSpentThisYear: parseFloat(yearResult?.total || '0'),
            activeMemberships,
        };
    }
}
