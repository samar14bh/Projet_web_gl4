import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { PaymentType, Status } from '../../common/enums';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsOptional()
  membershipId?: number;

  @IsNumber()
  @IsOptional()
  eventId?: number;
}
