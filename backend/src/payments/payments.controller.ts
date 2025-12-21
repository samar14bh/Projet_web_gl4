import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
    CreateMembershipPaymentDto,
    CreateEventPaymentDto,
    FilterPaymentDto,
} from './dto';

/**
 * Controller for payment operations
 */
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * Process club membership payment
     * POST /payments/membership
     */
    @Post('membership')
    async processMembershipPayment(@Body() dto: CreateMembershipPaymentDto) {
        return this.paymentsService.processMembershipPayment(dto);
    }

    /**
     * Process event registration payment
     * POST /payments/event
     */
    @Post('event')
    async processEventPayment(@Body() dto: CreateEventPaymentDto) {
        return this.paymentsService.processEventPayment(dto);
    }

    /**
     * Get user payment history
     * GET /payments/history/:userId
     */
    @Get('history/:userId')
    async getPaymentHistory(
        @Param('userId', ParseIntPipe) userId: number,
        @Query() filters: FilterPaymentDto,
    ) {
        return this.paymentsService.getPaymentHistory(userId, filters);
    }

    /**
     * Get user payment statistics
     * GET /payments/stats/:userId
     */
    @Get('stats/:userId')
    async getUserPaymentStats(@Param('userId', ParseIntPipe) userId: number) {
        return this.paymentsService.getUserPaymentStats(userId);
    }
}
