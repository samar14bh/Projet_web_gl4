import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { GeneralUser } from '../../users/entities/general-user.entity';
import { Club } from '../../clubs/entities/club.entity';
import { Category } from '../../clubs/entities/category.entity';
import { Event } from '../../events/entities/event.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Registration } from '../../events/entities/registration.entity';
import { Payment } from '../../payments/entities/payment.entity';

// Seeders
import { CategorySeeder } from './seeders/category.seeder';
import { UserSeeder } from './seeders/user.seeder';
import { ClubSeeder } from './seeders/club.seeder';
import { MembershipSeeder } from './seeders/membership.seeder';
import { EventSeeder } from './seeders/event.seeder';
import { TransactionSeeder } from './seeders/transaction.seeder';
import { RegistrationSeeder } from './seeders/registration.seeder';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(GeneralUser)
    private readonly generalUserRepository: Repository<GeneralUser>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    // Seeders
    private readonly categorySeeder: CategorySeeder,
    private readonly userSeeder: UserSeeder,
    private readonly clubSeeder: ClubSeeder,
    private readonly membershipSeeder: MembershipSeeder,
    private readonly eventSeeder: EventSeeder,
    private readonly transactionSeeder: TransactionSeeder,
    private readonly registrationSeeder: RegistrationSeeder,
  ) {
  }

  /**
   * Exécuter le seed complet
   */
  async run(): Promise<void> {
    this.logger.log('🌱 Starting database seeding...');

    try {
      // 1. Nettoyer la base de données
      await this.clean();

      // 2. Seed dans l'ordre des dépendances
      this.logger.log('📂 Seeding categories...');
      const categories = await this.categorySeeder.seed();

      this.logger.log('👥 Seeding users...');
      const users = await this.userSeeder.seed();

      this.logger.log('🏢 Seeding clubs...');
      const clubs = await this.clubSeeder.seed(categories);

      this.logger.log('🎫 Seeding memberships...');
      await this.membershipSeeder.seed(users, clubs);

      this.logger.log('📅 Seeding events...');
      const events = await this.eventSeeder.seed(clubs);

      this.logger.log('💰 Seeding transactions...');
      await this.transactionSeeder.seed(clubs, users, events);

      this.logger.log('📝 Seeding registrations...');
      await this.registrationSeeder.seed(events, users);

      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  /**
   * Nettoyer toutes les tables
   */
  /**
   * Nettoyer toutes les tables
   */
  private async clean(): Promise<void> {
    this.logger.log('🧹 Cleaning database...');

    try {
      // Désactiver les contraintes de clés étrangères temporairement
      await this.generalUserRepository.query('SET FOREIGN_KEY_CHECKS = 0');

      // Vider les tables dans l'ordre inverse des dépendances
      await this.paymentRepository.query('TRUNCATE TABLE payments');
      await this.registrationRepository.query('TRUNCATE TABLE registrations');
      await this.transactionRepository.query('TRUNCATE TABLE transactions');
      await this.eventRepository.query('TRUNCATE TABLE events');
      await this.membershipRepository.query('TRUNCATE TABLE memberships');
      await this.clubRepository.query('TRUNCATE TABLE clubs');
      await this.categoryRepository.query('TRUNCATE TABLE categories');
      await this.generalUserRepository.query('TRUNCATE TABLE general_users');

      // Réactiver les contraintes
      await this.generalUserRepository.query('SET FOREIGN_KEY_CHECKS = 1');

      this.logger.log('✅ Database cleaned');
    } catch (error) {
      this.logger.error('Error cleaning database:', error);
      // Réactiver les contraintes même en cas d'erreur
      await this.generalUserRepository.query('SET FOREIGN_KEY_CHECKS = 1');
      throw error;
    }
  }
}
