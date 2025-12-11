import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Club } from '../clubs/entities/club.entity';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Membership } from '../memberships/entities/membership.entity'; // ← Vérifie ce chemin

/**
 * Module pour le dashboard administrateur
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Club,
      User,
      Event,
      Transaction,
      Membership,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
