import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO for processing event registration payment
 */
export class CreateEventPaymentDto {
    @IsNotEmpty()
    @IsNumber()
    eventId: number;

    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsOptional()
    @IsString()
    paymentMethodId?: string;
}
