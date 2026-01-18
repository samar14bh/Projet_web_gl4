import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Membership } from '../memberships/entities/membership.entity';
import { Registration } from '../events/entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Club } from '../clubs/entities/club.entity';

import { RegistrationStatus } from '../common/enums/registration-status.enum';
import { Status } from '../common/enums/status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { DashboardResponseDto } from './dashboard-response.dto';
import { DashboardStatsDto } from './dashboard-stats.dto';
import { UpcomingEventDto } from './upcoming-event.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,

    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
  ) { }

  async getMemberDashboard(userId: number): Promise<DashboardResponseDto> {
    const stats = await this.getMemberStats(userId);
    const upcomingEvents = await this.getUpcomingEvents(userId);

    return {
      stats,
      upcomingEvents,
    };
  }

  private async getMemberStats(userId: number): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Clubs rejoints
    const clubsCount = await this.membershipRepository.count({
      where: {
        user: { id: userId },
      },
    });

    // 2. Événements à venir
    const upcomingEventsCount = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoin('registration.event', 'event')
      .where('registration.user_id = :userId', { userId })
      .andWhere('event.startDate > :now', { now })
      .andWhere('registration.status = :status', {
        status: RegistrationStatus.REGISTERED,
      })
      .getCount();

    // 3. Taux de participation
    const totalPastEvents = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoin('registration.event', 'event')
      .where('registration.user_id = :userId', { userId })
      .andWhere('event.endDate < :now', { now })
      .getCount();

    const attendedEvents = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoin('registration.event', 'event')
      .where('registration.user_id = :userId', { userId })
      .andWhere('event.endDate < :now', { now })
      .andWhere('registration.status = :status', {
        status: RegistrationStatus.REGISTERED,
      })
      .getCount();

    const participationRate =
      totalPastEvents > 0
        ? Math.round((attendedEvents / totalPastEvents) * 100)
        : 0;

    // 4. Dépenses mensuelles
    const monthlyExpensesResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.user_id = :userId', { userId })
      .andWhere('payment.status = :status', { status: PaymentStatus.CONFIRMED })
      .andWhere('payment.date BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getRawOne();

    const monthlyExpenses = parseFloat(monthlyExpensesResult?.total || '0');

    // Retourne un DashboardStatsDto typé
    const stats: DashboardStatsDto = {
      clubsCount,
      upcomingEventsCount,
      participationRate,
      monthlyExpenses,
    };

    return stats;
  }

  private async getUpcomingEvents(userId: number): Promise<UpcomingEventDto[]> {
    const now = new Date();

    const registrations = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoinAndSelect('registration.event', 'event')
      .innerJoinAndSelect('event.club', 'club')
      .leftJoinAndSelect(
        'event.payments',
        'payments',
        'payments.user_id = :userId',
        { userId },
      )
      .where('registration.user_id = :userId', { userId })
      .andWhere('event.startDate > :now', { now })
      .andWhere('registration.status IN (:...statuses)', {
        statuses: [
          RegistrationStatus.REGISTERED,
          RegistrationStatus.WAITLIST,
        ],
      })
      .orderBy('event.startDate', 'ASC')
      .limit(5)
      .getMany();
    const upcomingEvents: UpcomingEventDto[] = registrations.map(registration => {
      const event = registration.event;

      let paymentStatus = 'En attente';
      if (event.subscriptionFees === 0) {
        paymentStatus = 'Gratuit';
      } else if (event.payments?.length) {
        paymentStatus = event.payments.some(
          p => p.status === PaymentStatus.CONFIRMED,
        )
          ? 'Payé'
          : 'En attente';
      }

      const eventDate = new Date(event.startDate);

      const upcomingEvent: UpcomingEventDto = {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        address: event.address,
        clubName: event.club.name,
        clubLogo: event.club.logo,
        subscriptionFees: event.subscriptionFees,
        registrationStatus: registration.status,
        paymentStatus,
        formattedDate: `${eventDate.getDate()} ${eventDate.toLocaleString('fr-FR', { month: 'short' })}`,
        formattedTime: eventDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isFree: event.subscriptionFees === 0,
      };

      return upcomingEvent;
    });

    return upcomingEvents;
  }
}