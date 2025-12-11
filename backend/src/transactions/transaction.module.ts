import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transaction.controller';
import { TransactionsService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';

/**
 * Module pour la gestion des transactions financières
 */
@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
