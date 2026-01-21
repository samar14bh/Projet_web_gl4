import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubManagerService } from './club-manager.service';
import { ClubManagerController } from './club-manager.controller';
import { Club } from '../clubs/entities/club.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { ClubsModule } from '../clubs/clubs.module';
import { EventsModule } from '../events/events.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { TransactionsModule } from '../transactions/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Club, Membership]),
    ClubsModule,
    EventsModule,
    MembershipsModule,
    TransactionsModule,
  ],
  controllers: [ClubManagerController],
  providers: [ClubManagerService],
  exports: [ClubManagerService],
})
export class ClubManagerModule {}
