import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
} from './entities/transaction.entity';
import { CreateTransactionDto, FilterTransactionDto } from './dto';

/**
 * Service pour la gestion des transactions financières
 */
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) { }

  /**
   * Créer une nouvelle transaction
   */
  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    // Générer une référence unique
    const reference = this.generateReference(
      createTransactionDto.type,
      createTransactionDto.category,
    );

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      date: new Date(createTransactionDto.date),
      reference,
    });

    return await this.transactionRepository.save(transaction);
  }

  /**
   * Récupérer toutes les transactions avec filtres et pagination
   */
  async findAll(filters: FilterTransactionDto): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      period,
      type,
      category,
      status,
      search,
      startDate,
      endDate,
      clubId,
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.club', 'club')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.event', 'event');

    // Filtre par club
    if (clubId) {
      queryBuilder.andWhere('transaction.clubId = :clubId', { clubId });
    }

    // Filtre par type
    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    // Filtre par catégorie
    if (category) {
      queryBuilder.andWhere('transaction.category = :category', { category });
    }

    // Filtre par statut
    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    // Filtre par période
    if (period) {
      const dateRange = this.calculateDateRange(period);
      queryBuilder.andWhere('transaction.date >= :startDate', {
        startDate: dateRange.start,
      });
      queryBuilder.andWhere('transaction.date <= :endDate', {
        endDate: dateRange.end,
      });
    }

    // Filtre par dates personnalisées
    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Recherche textuelle
    if (search) {
      queryBuilder.andWhere(
        '(transaction.description LIKE :search OR transaction.reference LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Tri par date décroissante
    queryBuilder.orderBy('transaction.date', 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer une transaction par son ID
   */
  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['club', 'user', 'event'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction avec l'ID ${id} introuvable`);
    }

    return transaction;
  }

  /**
   * Récupérer les statistiques financières
   */
  async getFinancialStats(
    clubId?: number,
    period?: string,
  ): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
    membershipRevenue: number;
    eventRevenue: number;
    donationRevenue: number;
    pendingPayments: number;
  }> {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    if (clubId) {
      queryBuilder.where('transaction.clubId = :clubId', { clubId });
    }

    if (period) {
      const dateRange = this.calculateDateRange(period);
      queryBuilder.andWhere('transaction.date >= :startDate', {
        startDate: dateRange.start,
      });
      queryBuilder.andWhere('transaction.date <= :endDate', {
        endDate: dateRange.end,
      });
    }

    const transactions = await queryBuilder.getMany();

    const totalRevenue = transactions
      .filter((t) => t.type === TransactionType.REVENUE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const membershipRevenue = transactions
      .filter(
        (t) =>
          t.type === TransactionType.REVENUE &&
          t.category === TransactionCategory.MEMBERSHIP,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const eventRevenue = transactions
      .filter(
        (t) =>
          t.type === TransactionType.REVENUE &&
          t.category === TransactionCategory.EVENT,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const donationRevenue = transactions
      .filter(
        (t) =>
          t.type === TransactionType.REVENUE &&
          t.category === TransactionCategory.DONATION,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // TODO: Calculer les paiements en attente depuis les memberships et events
    const pendingPayments = 0;

    return {
      totalRevenue,
      totalExpenses,
      balance: totalRevenue - totalExpenses,
      membershipRevenue,
      eventRevenue,
      donationRevenue,
      pendingPayments,
    };
  }

  /**
   * Récupérer les données mensuelles pour le graphique
   */
  async getMonthlyData(
    clubId?: number,
    months: number = 6,
  ): Promise<Array<{ month: string; revenue: number; expense: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate });

    if (clubId) {
      queryBuilder.andWhere('transaction.clubId = :clubId', { clubId });
    }

    const transactions = await queryBuilder.getMany();

    // Grouper par mois
    // ✅ CORRECT
    const monthlyData: Record<
      string,
      { month: string; revenue: number; expense: number }
    > = {};

    const monthNames = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sept',
      'Oct',
      'Nov',
      'Déc',
    ];

    // Initialiser les mois
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];

      monthlyData[monthKey] = {
        month: monthName,
        revenue: 0,
        expense: 0,
      };
    }

    // Remplir avec les transactions
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (monthlyData[monthKey]) {
        if (transaction.type === TransactionType.REVENUE) {
          monthlyData[monthKey].revenue += Number(transaction.amount);
        } else {
          monthlyData[monthKey].expense += Number(transaction.amount);
        }
      }
    });

    return Object.values(monthlyData);
  }

  /**
   * Supprimer une transaction
   */
  async remove(id: number): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
  }

  /**
   * Générer une référence unique pour la transaction
   */
  private generateReference(
    type: TransactionType,
    category: TransactionCategory,
  ): string {
    const prefix = this.getReferencePrefix(type, category);
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  /**
   * Obtenir le préfixe de référence selon le type et la catégorie
   */
  private getReferencePrefix(
    type: TransactionType,
    category: TransactionCategory,
  ): string {
    if (type === TransactionType.REVENUE) {
      switch (category) {
        case TransactionCategory.MEMBERSHIP:
          return 'MEM';
        case TransactionCategory.EVENT:
          return 'EVT';
        case TransactionCategory.DONATION:
          return 'DON';
        default:
          return 'REV';
      }
    } else {
      return 'EXP';
    }
  }

  /**
   * Calculer la plage de dates selon la période
   */
  private calculateDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2000); // Date très ancienne
        break;
    }

    return { start, end };
  }
  async getMonthlyRevenueForClub(clubId: number): Promise<number> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await this.transactionRepository.find({
      where: {
        clubId,
        type: TransactionType.REVENUE,
        date: Between(monthStart, monthEnd),
      },
    });

    return transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  async getTotalRevenueForClub(clubId: number): Promise<number> {
    const transactions = await this.transactionRepository.find({
      where: {
        clubId,
        type: TransactionType.REVENUE,
      },
    });

    return transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }
}
