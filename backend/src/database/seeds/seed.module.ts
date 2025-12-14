import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';

// Entities
import { User } from '../../users/entities/user.entity';
import { GeneralUser } from '../../users/entities/general-user.entity';
import { Admin } from '../../users/entities/admin.entity';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      GeneralUser,
      Admin,
      Club,
      Category,
      Event,
      Membership,
      Transaction,
      Registration,
      Payment,
    ]),
  ],
  providers: [
    SeedService,
    CategorySeeder,
    UserSeeder,
    ClubSeeder,
    MembershipSeeder,
    EventSeeder,
    TransactionSeeder,
    RegistrationSeeder,
  ],
  exports: [SeedService], // ← AJOUTER pour l'export
})
export class SeedModule {}
