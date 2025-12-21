import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
    @IsString()
    paymentMethodId?: string;
}
