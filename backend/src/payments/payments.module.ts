import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Club } from '../clubs/entities/club.entity';
import { Event } from '../events/entities/event.entity';
import { Registration } from '../events/entities/registration.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Payment,
            Membership,
            Club,
            Event,
            Registration,
        ]),
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
