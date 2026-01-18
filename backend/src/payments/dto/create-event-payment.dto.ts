import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../common/enums';


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
    @IsEnum(PaymentMethod)
    method?: PaymentMethod;

    @IsOptional()
    @IsString()
    paymentMethodId?: string;
}
