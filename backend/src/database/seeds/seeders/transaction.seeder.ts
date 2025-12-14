import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../transactions/entities/transaction.entity';
import { TransactionType, TransactionCategory, TransactionStatus } from '../../../transactions/entities/transaction.entity';
import { Club } from '../../../clubs/entities/club.entity';
import { GeneralUser } from '../../../users/entities/general-user.entity';
import { Event } from '../../../events/entities/event.entity';

@Injectable()
export class TransactionSeeder {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async seed(clubs: Club[], users: GeneralUser[], events: Event[]): Promise<Transaction[]> {
    const now = new Date();
    const subDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const transactions = [
      // ========== REVENUS - COTISATIONS (MEMBERSHIP) ==========
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisation annuelle - Ahmed Ben Ali',
        amount: 20.00,
        date: subDays(5),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2025-0001',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisation annuelle - Youssef Trabelsi',
        amount: 20.00,
        date: subDays(8),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2025-0002',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisation annuelle - Sarah Mansour',
        amount: 20.00,
        date: subDays(12),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2025-0003',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisation annuelle - Mariem Khelifi',
        amount: 20.00,
        date: subDays(15),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2025-0004',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisation annuelle - Karim Hamdi',
        amount: 20.00,
        date: subDays(20),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2025-0005',
        club: clubs[0],
      },

      // ========== REVENUS - ÉVÉNEMENTS (EVENT) ==========
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Inscription Hackathon 2025 - 15 participants',
        amount: 750.00,
        date: subDays(3),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2025-0015',
        club: clubs[0],
        event: events[0], // Hackathon 2025
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Inscription Team Building Escape Game - 8 participants',
        amount: 240.00,
        date: subDays(7),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2025-0014',
        club: clubs[1],
        event: events[3], // Team Building
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Inscription Atelier Photographie - 12 participants',
        amount: 300.00,
        date: subDays(25),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2025-0013',
        club: clubs[2],
        event: events[10], // Atelier Photographie
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Inscription Tournoi Football - 5 équipes',
        amount: 50.00,
        date: subDays(10),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2025-0016',
        club: clubs[3],
        event: events[5], // Tournoi Football
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Inscription Marathon de Tunis - 18 participants',
        amount: 900.00,
        date: subDays(65),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2024-0012',
        club: clubs[3],
        event: events[11], // Marathon de Tunis
      },

      // ========== REVENUS - DONS (DONATION) ==========
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.DONATION,
        description: 'Don d\'une entreprise partenaire - TechCorp',
        amount: 500.00,
        date: subDays(18),
        status: TransactionStatus.COMPLETED,
        reference: 'DON-2025-0001',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.DONATION,
        description: 'Don anonyme pour le club',
        amount: 100.00,
        date: subDays(30),
        status: TransactionStatus.COMPLETED,
        reference: 'DON-2025-0002',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.DONATION,
        description: 'Don d\'un ancien membre - Alumni Association',
        amount: 250.00,
        date: subDays(40),
        status: TransactionStatus.COMPLETED,
        reference: 'DON-2024-0003',
        club: clubs[1],
      },

      // ========== DÉPENSES (EXPENSE) ==========
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Achat matériel informatique (3 laptops)',
        amount: 2100.00,
        date: subDays(2),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0010',
        club: clubs[0],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Location salle pour hackathon (3 jours)',
        amount: 450.00,
        date: subDays(4),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0009',
        club: clubs[0],
        event: events[0], // Hackathon
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Impression flyers et affiches publicitaires',
        amount: 120.00,
        date: subDays(10),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0008',
        club: clubs[0],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Achat fournitures pour workshop (câbles, adaptateurs)',
        amount: 85.00,
        date: subDays(14),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0007',
        club: clubs[0],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Abonnement logiciel de gestion de projet (annuel)',
        amount: 180.00,
        date: subDays(22),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0006',
        club: clubs[0],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Frais transport pour team building',
        amount: 75.00,
        date: subDays(8),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0011',
        club: clubs[1],
        event: events[3], // Team Building
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Achat matériel artistique (peinture, toiles)',
        amount: 220.00,
        date: subDays(16),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0005',
        club: clubs[2],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Achat équipement sportif (ballons, filets)',
        amount: 340.00,
        date: subDays(25),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2025-0004',
        club: clubs[3],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Frais inscription tournoi régional',
        amount: 150.00,
        date: subDays(35),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2024-0003',
        club: clubs[3],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Maintenance site web du club',
        amount: 95.00,
        date: subDays(45),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2024-0002',
        club: clubs[0],
      },

      // ========== TRANSACTIONS ANCIENNES (POUR LE GRAPHIQUE) ==========
      // Novembre 2024
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisations novembre - 25 membres',
        amount: 500.00,
        date: subDays(45),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2024-0020',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Événements novembre',
        amount: 800.00,
        date: subDays(48),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2024-0010',
        club: clubs[0],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Dépenses novembre',
        amount: 650.00,
        date: subDays(50),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2024-0020',
        club: clubs[0],
      },

      // Octobre 2024
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisations octobre - 30 membres',
        amount: 600.00,
        date: subDays(75),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2024-0015',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Événements octobre',
        amount: 1200.00,
        date: subDays(78),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2024-0008',
        club: clubs[0],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Dépenses octobre',
        amount: 890.00,
        date: subDays(80),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2024-0018',
        club: clubs[0],
      },

      // Septembre 2024
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.MEMBERSHIP,
        description: 'Cotisations septembre - 35 membres',
        amount: 700.00,
        date: subDays(105),
        status: TransactionStatus.COMPLETED,
        reference: 'MEM-2024-0010',
        club: clubs[0],
      },
      {
        type: TransactionType.REVENUE,
        category: TransactionCategory.EVENT,
        description: 'Événements septembre',
        amount: 950.00,
        date: subDays(108),
        status: TransactionStatus.COMPLETED,
        reference: 'EVT-2024-0006',
        club: clubs[0],
      },
      {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.EXPENSE,
        description: 'Dépenses septembre',
        amount: 720.00,
        date: subDays(110),
        status: TransactionStatus.COMPLETED,
        reference: 'EXP-2024-0015',
        club: clubs[0],
      },
    ];

    const createdTransactions = this.transactionRepository.create(transactions);
    const savedTransactions = await this.transactionRepository.save(createdTransactions);

    return savedTransactions;
  }
}
