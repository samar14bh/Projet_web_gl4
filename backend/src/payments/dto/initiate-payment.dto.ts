import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class InitiatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  membershipId?: number;

  @IsOptional()
  @IsNumber()
  eventId?: number;

  @IsOptional()
  paymentMethodId?: string;

  @IsOptional()
  saveCard?: boolean;
}
