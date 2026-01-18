
import { Injectable, NotFoundException } from '@nestjs/common';
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
  try {
    // On retire la vérification du membershipRepository.findOne qui bloquait tout
    const [stats, upcomingEvents] = await Promise.all([
      this.getMemberStats(userId),
      this.getUpcomingEvents(userId),
    ]);

    return {
      stats,
      upcomingEvents,
    };
  } catch (error) {
    console.error('Erreur dashboard:', error);
    throw new Error(`Impossible de charger le tableau de bord: ${error.message}`);
  }
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
      .where('registration.user.id = :userId', { userId })
      .andWhere('event.startDate > :now', { now })
      .andWhere('registration.status = :status', {
        status: RegistrationStatus.REGISTERED,
      })
      .getCount();

    // 3. Taux de participation
    const totalPastEvents = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoin('registration.event', 'event')
      .where('registration.user.id = :userId', { userId })
      .andWhere('event.endDate < :now', { now })
      .getCount();

    const attendedEvents = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoin('registration.event', 'event')
      .where('registration.user.id = :userId', { userId })
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
      .where('payment.user.id = :userId', { userId })
      .andWhere('payment.status = :status', { status: Status.APPROVED })
      .andWhere('payment.date BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getRawOne();

    const monthlyExpenses = parseFloat(monthlyExpensesResult?.total || '0');

    return {
      clubsCount,
      upcomingEventsCount,
      participationRate,
      monthlyExpenses,
    };
  }

 /*private async getUpcomingEvents(userId: number): Promise<UpcomingEventDto[]> {
  const now = new Date();

  // DEBUG : Utilisation de LEFT JOIN et suppression des filtres de date pour test
  const registrations = await this.registrationRepository
    .createQueryBuilder('registration')
    .innerJoinAndSelect('registration.event', 'event')
    .leftJoinAndSelect('event.club', 'club') // LEFT JOIN pour voir l'event même sans club
    .where('registration.user.id = :userId', { userId })
    // .andWhere('event.end_date >= :now', { now }) // COMMENTÉ POUR TEST
    .orderBy('event.startDate', 'ASC')
    .getMany();

  console.log(`[DEBUG] Inscriptions trouvées (sans filtres) : ${registrations.length}`);

  return registrations.map(registration => {
    const event = registration.event;
    const eventDate = new Date(event.startDate);

    return {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      address: event.address,
      clubName: event.club?.name || 'Club inconnu', 
      clubLogo: event.club?.logo,
      subscriptionFees: event.subscriptionFees,
      registrationStatus: registration.status,
      paymentStatus: 'Test',
      formattedDate: `${eventDate.getDate()} ${eventDate.toLocaleString('fr-FR', { month: 'short' })}`,
      formattedTime: eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isFree: event.subscriptionFees === 0,
    };
  });
}*/
private async getUpcomingEvents(userId: number): Promise<UpcomingEventDto[]> {
  const registrations = await this.registrationRepository
    .createQueryBuilder('registration')
    .innerJoinAndSelect('registration.event', 'event')
    .leftJoinAndSelect('event.club', 'club')
    .where('registration.user.id = :userId', { userId })
    .getMany();

  return Promise.all(
    registrations.map(async (registration) => {
      const event = registration.event;

      // 1. On cherche si un paiement "APPROVED" ou "CONFIRMED" existe pour cet event et cet user
      const payments = await this.paymentRepository.find({
        where: {
          user: { id: userId },
          event: { id: event.id },
        },
      });

      // 2. Logique pour déterminer le texte du statut
      let paymentStatus = 'En attente';
      const fees = Number(event.subscriptionFees);

      if (fees === 0) {
        paymentStatus = 'Gratuit';
      } else {
        const hasPaid = payments.some(p => 
          p.status === PaymentStatus.CONFIRMED
        );
        paymentStatus = hasPaid ? 'Payé' : 'En attente';
      }

      const eventDate = new Date(event.startDate);

      return {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        address: event.address || 'Lieu non spécifié',
        clubName: event.club?.name || 'Club Indépendant',
        clubLogo: event.club?.logo,
        subscriptionFees: fees, // On envoie le prix
        registrationStatus: registration.status,
        paymentStatus: paymentStatus, // On envoie "Payé", "En attente" ou "Gratuit"
        formattedDate: `${eventDate.getDate()} ${eventDate.toLocaleString('fr-FR', { month: 'short' })}`,
        formattedTime: eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isFree: fees === 0,
      };
    })
  );
}
}
