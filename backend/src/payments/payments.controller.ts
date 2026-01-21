import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
  Res,
  StreamableFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { InitiatePaymentDto, ConfirmPaymentDto, FilterPaymentDto } from './dto';

/**
 * Controller for payment operations
 * All payments are now processed through Stripe
 */
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Initiate membership payment - GET Stripe client secret
   * POST /payments/membership/initiate
   */
  @Post('membership/initiate')
  @HttpCode(HttpStatus.CREATED)
  async initiateMembershipPayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiateMembershipPayment(dto);
  }

  /**
   * Confirm membership payment after Stripe processing
   * POST /payments/membership/confirm
   */
  @Post('membership/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmMembershipPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmMembershipPayment(dto);
  }

  /**
   * Initiate event payment - GET Stripe client secret
   * POST /payments/event/initiate
   */
  @Post('event/initiate')
  @HttpCode(HttpStatus.CREATED)
  async initiateEventPayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiateEventPayment(dto);
  }

  /**
   * Confirm event payment after Stripe processing
   * POST /payments/event/confirm
   */
  @Post('event/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEventPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmEventPayment(dto);
  }

  /**
   * Get Stripe publishable key for frontend
   * GET /payments/stripe/publishable-key
   */
  @Get('stripe/publishable-key')
  getStripePublishableKey() {
    return {
      publishableKey: this.stripeService.getPublishableKey(),
    };
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
      'Content-Disposition': `attachment; filename="receipt-${id}.pdf"`,
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
