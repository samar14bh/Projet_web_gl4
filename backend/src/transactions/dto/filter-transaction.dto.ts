import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TransactionType,
  TransactionCategory,
  TransactionStatus,
} from '../entities/transaction.entity';

/**
 * DTO pour les filtres de recherche de transactions
 */
export class FilterTransactionDto {
  @IsOptional()
  @IsEnum(['month', 'quarter', 'year', 'all'])
  period?: 'month' | 'quarter' | 'year' | 'all';

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clubId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
