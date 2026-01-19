import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from '../memberships/entities/membership.entity';
import { Event } from '../events/entities/event.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Application } from 'src/memberships/entities/application.entity';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { User } from './entities/user.entity';

/**
 * Module pour la gestion des clubs et catégories
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Membership,
      Event,
      User,
      Transaction,
      Application,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
