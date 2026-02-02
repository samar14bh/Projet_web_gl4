import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { Registration } from './entities/registration.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Club } from '../clubs/entities/club.entity';

/**
 * Module pour la gestion des événements
 */
@Module({
  imports: [TypeOrmModule.forFeature([Event, Registration, Transaction, Club])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
