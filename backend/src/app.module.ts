import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { TransactionsModule } from './transactions/transaction.module';
import { AdminModule } from './admin/admin.module';
import { ClubsModule } from './clubs/clubs.module';
// ... tes autres imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT!) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'club_management',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ⚠️ À mettre à false en production
      logging: true,
    }),
    EventsModule,
    TransactionsModule,
    AdminModule,
    ClubsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
