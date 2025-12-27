import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { TransactionsModule } from './transactions/transaction.module';
import { AdminModule } from './admin/admin.module';
import { ClubsModule } from './clubs/clubs.module';
import { SeedModule } from './database/seeds/seed.module';
import { DashboardModule } from './member-dasboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

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
      synchronize: false,
      logging: true,
    }),
    EventsModule,
    TransactionsModule,
    AdminModule,
    ClubsModule,
    SeedModule,
    DashboardModule,
    AuthModule,
    MailModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
