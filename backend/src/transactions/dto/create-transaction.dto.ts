import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';
import {
  TransactionType,
  TransactionCategory,
  TransactionStatus,
} from '../entities/transaction.entity';

/**
 * DTO pour la création d'une transaction
 */
export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsEnum(TransactionCategory)
  @IsNotEmpty()
  category: TransactionCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsNumber()
  @IsNotEmpty()
  clubId: number;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsOptional()
  eventId?: number;
}
