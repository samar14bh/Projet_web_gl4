import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    ParseIntPipe,
    UseGuards,
    Res,
    StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
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

    /**
     * Download payment receipt as PDF
     * GET /payments/:id/receipt
     */
    @Get(':id/receipt')
    async downloadReceipt(
        @Param('id', ParseIntPipe) id: number,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const pdfBuffer = await this.paymentsService.generateReceipt(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="recu-${id}.pdf"`,
        });

        return new StreamableFile(pdfBuffer);
    }

    /**
     * Send payment receipt by email
     * POST /payments/:id/receipt/send
     */
    @Post(':id/receipt/send')
    async sendReceipt(@Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.sendReceiptByEmail(id);
    }
}
