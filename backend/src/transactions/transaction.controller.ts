import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { CreateTransactionDto, FilterTransactionDto } from './dto';

/**
 * Controller pour la gestion des transactions financières
 * Route de base: /api/transactions
 */
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * POST /api/transactions
   * Créer une nouvelle transaction (dépense manuelle)
   */
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  /**
   * GET /api/transactions
   * Récupérer toutes les transactions avec filtres
   */
  @Get()
  findAll(@Query() filters: FilterTransactionDto) {
    return this.transactionsService.findAll(filters);
  }

  /**
   * GET /api/transactions/stats
   * Récupérer les statistiques financières
   */
  @Get('stats')
  getStats(@Query('clubId') clubId?: string, @Query('period') period?: string) {
    return this.transactionsService.getFinancialStats(
      clubId ? parseInt(clubId) : undefined,
      period,
    );
  }

  /**
   * GET /api/transactions/monthly
   * Récupérer les données mensuelles pour le graphique
   */
  @Get('monthly')
  getMonthly(
    @Query('clubId') clubId?: string,
    @Query('months') months?: string,
  ) {
    return this.transactionsService.getMonthlyData(
      clubId ? parseInt(clubId) : undefined,
      months ? parseInt(months) : 6,
    );
  }

  /**
   * GET /api/transactions/:id
   * Récupérer une transaction par son ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  /**
   * DELETE /api/transactions/:id
   * Supprimer une transaction
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }
}
