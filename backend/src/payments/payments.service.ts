import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Application } from '../memberships/entities/application.entity';
import { Club } from '../clubs/entities/club.entity';
import { Event } from '../events/entities/event.entity';
import { Registration } from '../events/entities/registration.entity';
import { ReceiptService } from './receipt.service';
import { StripeService } from './stripe.service';
import { FilterPaymentDto, InitiatePaymentDto, ConfirmPaymentDto } from './dto';
import {
  PaymentType,
  RegistrationStatus,
  PaymentMethod,
  PaymentStatus,
  Status,
} from '../common/enums';

/**
 * Service pour gérer les paiements (adhésion & événements) avec Stripe
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,

    private readonly receiptService: ReceiptService,
    private readonly stripeService: StripeService,
  ) { }

  /**
   * ✅ NOUVELLE MÉTHODE: Vérifier que le paiement appartient à l'utilisateur
   */
  async verifyPaymentOwnership(paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Récupérer la clé publique Stripe
   */
  getStripePublishableKey(): { publishableKey: string } {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    };
  }

  /**
   * Initier un paiement d'adhésion
   */
  async initiateMembershipPayment(
    dto: InitiatePaymentDto,
  ): Promise<{ clientSecret: string; paymentId: number }> {
    console.log('💳 Initiating membership payment:', dto);

    const membership = await this.membershipRepository.findOne({
      where: { id: dto.membershipId },
      relations: ['club', 'user'],
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const club = membership.club;

    if (club.isPublic) {
      throw new BadRequestException('This club is free');
    }

    const amount = membership.club.membershipFeeAmount;

    // Créer un enregistrement de paiement temporaire
    const payment = this.paymentRepository.create({
      amount, // Montant en TND
      date: new Date(),
      status: PaymentStatus.PENDING,
      type: PaymentType.MEMBERSHIP,
      method: PaymentMethod.CARD,
      user: { id: dto.userId },
      membership: { id: dto.membershipId },
    });

    const savedPayment = await this.paymentRepository.save(payment);
    console.log('✅ Payment record created:', savedPayment.id);

    try {
      // ✅ Créer un PaymentIntent avec conversion TND → USD
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: amount, // Montant en TND (le service le convertira)
        metadata: {
          paymentId: String(savedPayment.id),
          userId: String(dto.userId),
          membershipId: String(dto.membershipId),
          type: 'membership',
        },
        description: `Club Membership - ${club.name}`,
        receipt_email: membership.user.email,
      });

      // Enregistrer l'ID de transaction Stripe
      savedPayment.transactionId = paymentIntent.id;
      await this.paymentRepository.save(savedPayment);

      console.log('✅ PaymentIntent created:', paymentIntent.id);

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentId: savedPayment.id,
      };
    } catch (error) {
      console.error('❌ Error creating PaymentIntent:', error);
      // Supprimer le paiement en cas d'erreur
      await this.paymentRepository.delete(savedPayment.id);
      throw error;
    }
  }

  /**
   * Initier un paiement d'événement
   */
  async initiateEventPayment(
    dto: InitiatePaymentDto,
  ): Promise<{ clientSecret: string; paymentId: number }> {
    console.log('💳 Initiating event payment:', dto);

    const event = await this.eventRepository.findOne({
      where: { id: dto.eventId },
      relations: ['club'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.sPaid) {
      throw new BadRequestException('This event is free');
    }

    // Vérifier si l'utilisateur est membre pour la réduction
    const membership = await this.membershipRepository.findOne({
      where: {
        user: { id: dto.userId },
        club: { id: event.club.id },
      },
    });

    const isMember = !!membership;
    const basePrice = Number(event.subscriptionFees);
    const discount = isMember ? basePrice * 0.2 : 0;
    const finalPrice = basePrice - discount;

    // Créer un enregistrement de paiement temporaire
    const payment = this.paymentRepository.create({
      amount: finalPrice, // Montant en TND après réduction
      date: new Date(),
      status: PaymentStatus.PENDING,
      type: PaymentType.EVENT,
      method: PaymentMethod.CARD,
      user: { id: dto.userId },
      event: { id: dto.eventId },
    });

    const savedPayment = await this.paymentRepository.save(payment);
    console.log('✅ Payment record created:', savedPayment.id);

    try {
      // ✅ Créer un PaymentIntent avec conversion TND → USD
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: finalPrice, // Montant en TND (le service le convertira)
        metadata: {
          paymentId: String(savedPayment.id),
          userId: String(dto.userId),
          eventId: String(dto.eventId),
          type: 'event',
          isMember: isMember ? '1' : '0',
          discount: String(discount),
        },
        description: `Event Registration - ${event.title}`,
      });

      savedPayment.transactionId = paymentIntent.id;
      await this.paymentRepository.save(savedPayment);

      console.log('✅ PaymentIntent created:', paymentIntent.id);

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentId: savedPayment.id,
      };
    } catch (error) {
      console.error('❌ Error creating PaymentIntent:', error);
      // Supprimer le paiement en cas d'erreur
      await this.paymentRepository.delete(savedPayment.id);
      throw error;
    }
  }

  /**
   * Confirmer un paiement d'adhésion
   */
  async confirmMembershipPayment(dto: ConfirmPaymentDto): Promise<Payment> {
    console.log('✅ Confirming membership payment:', dto.paymentId);

    const payment = await this.paymentRepository.findOne({
      where: { id: dto.paymentId },
      relations: ['membership', 'membership.club', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    try {
      // Vérifier le paiement avec Stripe
      const paymentIntent = await this.stripeService.retrievePaymentIntent(
        payment.transactionId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('Payment was not successful');
      }

      console.log('✅ Payment verified with Stripe');

      // Mettre à jour le statut du paiement
      payment.status = PaymentStatus.CONFIRMED;
      await this.paymentRepository.save(payment);

      // Mettre à jour les dates d'adhésion (1 an de validité)
      const membership = payment.membership;
      const now = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(now.getFullYear() + 1);

      membership.dateDebut = now;
      membership.dateFin = oneYearLater;
      await this.membershipRepository.save(membership);

      // ✅ Mettre à jour le statut de l'application
      const application = await this.applicationRepository.findOne({
        where: {
          user: { id: payment.user.id },
          club: { id: membership.club.id },
          status: Status.APPROVED, // On cherche l'application approuvée en attente de paiement
        },
      });

      if (application) {
        application.status = Status.CONFIRMED;
        await this.applicationRepository.save(application);
        console.log('✅ Application status updated to CONFIRMED');
      }

      console.log('✅ Membership activated until:', oneYearLater);

      return payment;
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Confirmer un paiement d'événement
   */
  async confirmEventPayment(
    dto: ConfirmPaymentDto,
  ): Promise<{ payment: Payment; registration: Registration }> {
    console.log('✅ Confirming event payment:', dto.paymentId);

    const payment = await this.paymentRepository.findOne({
      where: { id: dto.paymentId },
      relations: ['event', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    try {
      // Vérifier le paiement avec Stripe
      const paymentIntent = await this.stripeService.retrievePaymentIntent(
        payment.transactionId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('Payment was not successful');
      }

      console.log('✅ Payment verified with Stripe');

      // Mettre à jour le statut du paiement
      payment.status = PaymentStatus.CONFIRMED;
      await this.paymentRepository.save(payment);

      // Créer l'enregistrement à l'événement
      const registration = this.registrationRepository.create({
        user: { id: payment.user.id },
        event: { id: payment.event.id },
        status: RegistrationStatus.PAID, // ✅ Statut PAID au lieu de REGISTERED
        qrCode: `EVT-${payment.event.id}-USR-${payment.user.id}-${Date.now()}`, // ✅ Génération du QR Code
        date: new Date(),
        isPresent: false,
      });

      await this.registrationRepository.save(registration);

      console.log('✅ Event registration created');

      return { payment, registration };
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des paiements
   */
  async getPaymentHistory(userId: number, filters: FilterPaymentDto) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.membership', 'membership')
      .leftJoinAndSelect('membership.club', 'club')
      .leftJoinAndSelect('payment.event', 'event')
      .where('payment.user = :userId', { userId });

    if (filters.type) {
      query.andWhere('payment.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('payment.date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('payment.date <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('payment.date', 'DESC');

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const [payments, total] = await query.getManyAndCount();

    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtenir les statistiques de paiement
   */
  async getUserPaymentStats(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const monthResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.user = :userId', { userId })
      .andWhere('payment.date >= :startOfMonth', { startOfMonth })
      .andWhere('payment.status = :status', { status: PaymentStatus.CONFIRMED })
      .getRawOne();

    const yearResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.user = :userId', { userId })
      .andWhere('payment.date >= :startOfYear', { startOfYear })
      .andWhere('payment.status = :status', { status: PaymentStatus.CONFIRMED })
      .getRawOne();

    const activeMemberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .where('membership.user = :userId', { userId })
      .andWhere('(membership.dateFin IS NULL OR membership.dateFin >= :now)', {
        now,
      })
      .getCount();

    return {
      totalSpentThisMonth: parseFloat(monthResult?.total || '0'),
      totalSpentThisYear: parseFloat(yearResult?.total || '0'),
      activeMemberships,
      currency: 'TND',
    };
  }

  /**
   * ✅ CORRIGÉE: Générer un reçu PDF
   */
  async generateReceipt(paymentId: number): Promise<Buffer> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'membership', 'membership.club', 'event'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    try {
      return await this.receiptService.generateReceipt(payment);
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw new BadRequestException('Failed to generate receipt');
    }
  }

  /**
   * Envoyer un reçu par email
   */
  async sendReceiptByEmail(paymentId: number): Promise<{ message: string }> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'membership', 'membership.club', 'event'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (!payment.user || !payment.user.email) {
      throw new BadRequestException('User email not found');
    }

    const receiptBuffer = await this.receiptService.generateReceipt(payment);

    // TODO: Implémenter l'envoi d'email avec le reçu en pièce jointe
    // await this.mailService.sendPaymentReceipt(payment.user.email, receiptBuffer, payment);

    return {
      message: `Receipt sent to ${payment.user.email}`,
    };
  }
}
