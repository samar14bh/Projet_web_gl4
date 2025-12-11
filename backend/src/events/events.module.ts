import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { Registration } from './entities/registration.entity';

/**
 * Module pour la gestion des événements
 */
@Module({
  imports: [TypeOrmModule.forFeature([Event, Registration])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
