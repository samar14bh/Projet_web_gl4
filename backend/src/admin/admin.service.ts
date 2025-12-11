import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../clubs/entities/club.entity';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { EventStatus } from '../common/enums/event-status.enum';

/**
 * Service pour le dashboard administrateur
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  /**
   * Récupérer les statistiques globales
   */
  async getGlobalStats(period: string) {
    const dateRange = this.calculateDateRange(period);

    // Total des clubs
    const totalClubs = await this.clubRepository.count();

    // Clubs actifs (isActive = true)
    const activeClubs = await this.clubRepository
      .createQueryBuilder('club')
      .where('club.isActive = :isActive', { isActive: true })
      .getCount();

    // Total des membres (utilisateurs avec au moins une membership)
    const totalMembers = await this.membershipRepository
      .createQueryBuilder('membership')
      .select('COUNT(DISTINCT membership.user_id)', 'count')
      .getRawOne()
      .then((result) => parseInt(result.count || '0'));

    // Nouveaux membres ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newMembersThisMonth = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.dateDebut >= :startDate', { startDate: startOfMonth })
      .getCount();

    // Total des événements
    const totalEvents = await this.eventRepository.count();

    // Événements à venir (UPCOMING)
    const upcomingEvents = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.UPCOMING })
      .andWhere('event.startDate >= :now', { now: new Date() })
      .getCount();

    // Revenus totaux
    const revenueResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type: TransactionType.REVENUE })
      .andWhere('transaction.date >= :startDate', { startDate: dateRange.start })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Validations en attente (simulation - à adapter selon votre logique)
    const pendingApprovals = 0; // À implémenter si vous avez une table de demandes

    return {
      totalClubs,
      activeClubs,
      totalMembers,
      totalEvents,
      upcomingEvents,
      totalRevenue,
      pendingApprovals,
      newMembersThisMonth,
    };
  }

  /**
   * Récupérer les clubs les plus actifs
   */
  async getTopClubs(period: string, limit: number = 4) {
    const dateRange = this.calculateDateRange(period);

    // Récupérer les clubs avec le plus d'événements dans la période
    const clubsWithEventCount = await this.clubRepository
      .createQueryBuilder('club')
      .leftJoin('club.events', 'event', 'event.startDate >= :startDate', { startDate: dateRange.start })
      .where('club.isActive = :isActive', { isActive: true })
      .select('club.id', 'id')
      .addSelect('club.name', 'name')
      .addSelect('club.logo', 'logo')
      .addSelect('COUNT(event.id)', 'eventCount')
      .groupBy('club.id')
      .orderBy('eventCount', 'DESC')
      .limit(limit)
      .getRawMany();

    // Récupérer les détails pour chaque club
    const topClubs = await Promise.all(
      clubsWithEventCount.map(async (clubData) => {
        const club = await this.clubRepository.findOne({ where: { id: clubData.id } });

        // Compter les membres actifs
        const members = await this.membershipRepository
          .createQueryBuilder('membership')
          .where('membership.club_id = :clubId', { clubId: club!.id })
          .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', { now: new Date() })
          .getCount();

        // Compter les événements dans la période
        const events = await this.eventRepository
          .createQueryBuilder('event')
          .where('event.club_id = :clubId', { clubId: club!.id })
          .andWhere('event.startDate >= :startDate', { startDate: dateRange.start })
          .getCount();

        // Calculer les revenus
        const revenueResult = await this.transactionRepository
          .createQueryBuilder('transaction')
          .select('SUM(transaction.amount)', 'total')
          .where('transaction.club_id = :clubId', { clubId: club!.id })
          .andWhere('transaction.type = :type', { type: TransactionType.REVENUE })
          .andWhere('transaction.date >= :startDate', { startDate: dateRange.start })
          .getRawOne();

        const revenue = parseFloat(revenueResult?.total || '0');

        // Calculer la croissance (simulation simple basée sur les événements)
        const growth = '+' + Math.min(Math.floor((events / 5) * 10), 20) + '%';

        return {
          id: club!.id,
          name: club!.name,
          logo:
            club!.logo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(club!.name)}&background=6366f1&color=fff`,
          members,
          events,
          revenue,
          growth,
        };
      }),
    );

    return topClubs;
  }

  /**
   * Récupérer les activités récentes
   */
  async getRecentActivities(limit: number = 5) {
    const activities: any[] = [];

    // Récupérer les derniers événements créés
    const recentEvents = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.club', 'club')
      .orderBy('event.createdAt', 'DESC')
      .limit(3)
      .getMany();

    recentEvents.forEach((event) => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event_created',
        title: 'Nouvel événement',
        description: `${event.title} programmé par ${event.club?.name || 'Club'}`,
        user: 'Système',
        timestamp: event.createdAt,
        icon: 'bi-calendar-plus',
        color: 'primary',
      });
    });

    // Récupérer les derniers clubs créés
    const recentClubs = await this.clubRepository
      .createQueryBuilder('club')
      .orderBy('club.creationDate', 'DESC')
      .limit(2)
      .getMany();

    recentClubs.forEach((club) => {
      activities.push({
        id: `club-${club.id}`,
        type: 'club_created',
        title: 'Nouveau club créé',
        description: `${club.name} a été créé`,
        user: 'Admin System',
        timestamp: club.creationDate,
        icon: 'bi-plus-circle',
        color: 'success',
      });
    });

    // Récupérer les derniers membres
    const recentMemberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.club', 'club')
      .leftJoinAndSelect('membership.user', 'user')
      .orderBy('membership.dateDebut', 'DESC')
      .limit(2)
      .getMany();

    recentMemberships.forEach((membership) => {
      activities.push({
        id: `membership-${membership.id}`,
        type: 'member_joined',
        title: 'Nouveau membre',
        description: `${membership.user?.name || 'Utilisateur'} a rejoint ${membership.club?.name || 'le club'}`,
        user: 'Système',
        timestamp: membership.dateDebut,
        icon: 'bi-person-plus',
        color: 'info',
      });
    });

    // Récupérer les dernières transactions
    const recentTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.club', 'club')
      .orderBy('transaction.createdAt', 'DESC')
      .limit(2)
      .getMany();

    recentTransactions.forEach((transaction) => {
      activities.push({
        id: `transaction-${transaction.id}`,
        type: transaction.type === TransactionType.REVENUE ? 'payment_received' : 'expense_created',
        title: transaction.type === TransactionType.REVENUE ? 'Paiement reçu' : 'Dépense enregistrée',
        description: transaction.description,
        user: 'Système de paiement',
        timestamp: transaction.createdAt,
        icon: 'bi-cash-coin',
        color: transaction.type === TransactionType.REVENUE ? 'success' : 'warning',
      });
    });

    // Trier par date décroissante et limiter
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  }

  /**
   * Récupérer la tendance des membres
   */
  async getMembershipTrend(months: number = 6) {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const trend: Array<{ month: string; count: number }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Compter les membres ayant rejoint avant la fin du mois
      const count = await this.membershipRepository
        .createQueryBuilder('membership')
        .where('membership.dateDebut < :endDate', { endDate: nextMonth })
        .select('COUNT(DISTINCT membership.user_id)', 'count')
        .getRawOne()
        .then((result) => parseInt(result.count || '0'));

      trend.push({
        month: monthNames[date.getMonth()],
        count,
      });
    }

    return trend;
  }

  /**
   * Récupérer la tendance des événements
   */
  async getEventsTrend(months: number = 6) {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const trend: Array<{ month: string; count: number }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const count = await this.eventRepository
        .createQueryBuilder('event')
        .where('event.startDate >= :startDate', { startDate: date })
        .andWhere('event.startDate < :endDate', { endDate: nextMonth })
        .getCount();

      trend.push({
        month: monthNames[date.getMonth()],
        count,
      });
    }

    return trend;
  }

  /**
   * Récupérer la tendance des revenus
   */
  async getRevenueTrend(months: number = 6) {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const trend: Array<{ month: string; amount: number }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const result = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.REVENUE })
        .andWhere('transaction.date >= :startDate', { startDate: date })
        .andWhere('transaction.date < :endDate', { endDate: nextMonth })
        .getRawOne();

      trend.push({
        month: monthNames[date.getMonth()],
        amount: parseFloat(result?.total || '0'),
      });
    }

    return trend;
  }

  /**
   * Récupérer les alertes
   */
  async getAlerts() {
    const alerts: any[] = [];

    // Clubs inactifs
    const inactiveClubs = await this.clubRepository
      .createQueryBuilder('club')
      .where('club.isActive = :isActive', { isActive: false })
      .getCount();

    if (inactiveClubs > 0) {
      alerts.push({
        id: 1,
        type: 'warning',
        title: `${inactiveClubs} club(s) inactif(s)`,
        description: 'Certains clubs sont marqués comme inactifs',
        action: 'Voir',
        link: '/admin/clubs?filter=inactive',
      });
    }

    // Événements à venir
    const upcomingEvents = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.UPCOMING })
      .andWhere('event.startDate >= :now', { now: new Date() })
      .getCount();

    if (upcomingEvents > 5) {
      alerts.push({
        id: 2,
        type: 'info',
        title: `${upcomingEvents} événement(s) à venir`,
        description: 'Plusieurs événements sont programmés prochainement',
        action: 'Voir',
        link: '/admin/events',
      });
    }

    // Info générale
    alerts.push({
      id: 3,
      type: 'info',
      title: 'Rapport mensuel disponible',
      description: `Le rapport de ${new Date().toLocaleString('fr-FR', { month: 'long' })} est prêt à être téléchargé`,
      action: 'Télécharger',
      link: '#',
    });

    return alerts;
  }

  /**
   * Récupérer la distribution des clubs par catégorie
   */
  async getClubsByCategory() {
    const clubsWithCategory = await this.clubRepository
      .createQueryBuilder('club')
      .leftJoinAndSelect('club.category', 'category')
      .where('club.isActive = :isActive', { isActive: true })
      .getMany();

    const categoryMap = new Map<string, number>();
    const total = clubsWithCategory.length;

    clubsWithCategory.forEach((club) => {
      const categoryName = club.category?.name || 'Autres';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    const distribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    }));

    // Trier par nombre décroissant
    distribution.sort((a, b) => b.count - a.count);

    return distribution;
  }

  /**
   * Calculer la plage de dates selon la période
   */
  private calculateDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return { start, end };
  }
}
