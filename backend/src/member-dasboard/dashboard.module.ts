import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Membership } from '../memberships/entities/membership.entity';
import { Registration } from '../events/entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Club } from '../clubs/entities/club.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Membership,
      Registration,
      Event,
      Payment,
      Club,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService], 
})
export class DashboardModule {}