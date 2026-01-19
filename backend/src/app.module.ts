import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { TransactionsModule } from './transactions/transaction.module';
import { AdminModule } from './admin/admin.module';
import { ClubsModule } from './clubs/clubs.module';
import { MembershipsModule } from './memberships/memberships.module';
import { SeedModule } from './database/seeds/seed.module';
import { DashboardModule } from './member-dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SseModule } from './sse/sse.module';


// ... tes autres imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    EventsModule,
    TransactionsModule,
    AdminModule,
    ClubsModule,
    MembershipsModule,
    SeedModule,
    DashboardModule,
    AuthModule,
    MailModule,
    PaymentsModule,
    NotificationsModule,
    SseModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
