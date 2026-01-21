import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

/**
 * Service Stripe - Paiements sécurisés
 * Place in: src/payments/stripe.service.ts
 */
@Injectable()
export class StripeService {
  private stripe: Stripe;

  // ✅ Devise supportée par Stripe (USD à la place de TND)
  private readonly SUPPORTED_CURRENCY = 'usd'; // ou 'eur', 'gbp', etc.

  // ✅ Taux de change (TND vers USD)
  // À jour au: 2025-01-21 | 1 TND = ~0.32 USD
  private readonly TND_TO_USD_RATE = 0.32;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
          'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover' as any,
    });
  }

  /**
   * ✅ Convertir TND en USD
   */
  private convertTndToUsd(amountInTnd: number): number {
    const amountInUsd = amountInTnd * this.TND_TO_USD_RATE;
    // Arrondir à 2 décimales
    return Math.round(amountInUsd * 100) / 100;
  }

  /**
   * ✅ Créer un PaymentIntent avec devise supportée
   */
  async createPaymentIntent(options: {
    amount: number; // Montant en TND
    currency?: string; // Ignoré - on utilise toujours USD
    metadata?: Record<string, string | number>;
    description?: string;
    receipt_email?: string;
  }): Promise<Stripe.PaymentIntent> {
    try {
      // Convertir TND en USD (Stripe n'accepte que USD pour ce compte)
      const amountInUsd = this.convertTndToUsd(options.amount);

      // Convertir en cents (Stripe utilise les cents)
      const amountInCents = Math.round(amountInUsd * 100);

      console.log(`💱 Conversion: ${options.amount} TND = ${amountInUsd} USD = ${amountInCents} cents`);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: this.SUPPORTED_CURRENCY, // ✅ USD au lieu de TND
        metadata: {
          ...options.metadata,
          originalAmount: String(options.amount),
          originalCurrency: 'tnd',
          convertedCurrency: this.SUPPORTED_CURRENCY,
          exchangeRate: String(this.TND_TO_USD_RATE),
        } as Record<string, string>,
        description: options.description,
        receipt_email: options.receipt_email,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`✅ PaymentIntent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Error creating PaymentIntent:', error);
      throw error;
    }
  }

  /**
   * Récupérer un PaymentIntent
   */
  async retrievePaymentIntent(
      paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Confirmer un PaymentIntent avec la méthode de paiement
   */
  async confirmPaymentIntent(
      paymentIntentId: string,
      paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  /**
   * Créer un SetupIntent pour enregistrer une méthode de paiement
   */
  async createSetupIntent(): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create({
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  /**
   * Rembourser un paiement
   */
  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }

  /**
   * Récupérer la clé publique
   */
  getPublishableKey(): string {
    const key = process.env.STRIPE_PUBLISHABLE_KEY || '';
    if (!key) {
      throw new Error('STRIPE_PUBLISHABLE_KEY is not defined');
    }
    return key;
  }

  /**
   * ✅ Obtenir la devise supportée
   */
  getSupportedCurrency(): string {
    return this.SUPPORTED_CURRENCY;
  }

  /**
   * ✅ Obtenir le taux de change
   */
  getExchangeRate(): number {
    return this.TND_TO_USD_RATE;
  }
}