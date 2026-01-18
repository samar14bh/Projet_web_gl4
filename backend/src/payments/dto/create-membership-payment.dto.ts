import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../common/enums';


/**
 * DTO for processing annual club membership payment
 */
export class CreateMembershipPaymentDto {
    @IsNotEmpty()
    @IsNumber()
    membershipId: number;

    @IsNotEmpty()
    @IsNumber()
    clubId: number;

    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsOptional()
    @IsEnum(PaymentMethod)
    method?: PaymentMethod;

    @IsOptional()
    @IsString()
    paymentMethodId?: string;
}
