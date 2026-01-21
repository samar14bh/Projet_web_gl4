import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface PaymentDto {
  membershipId?: number;
  clubId?: number;
  userId: number;
  eventId?: number;
  method?: string;
}

/**
 * Payment Service - Frontend
 * Gère l'intégration Stripe et le traitement des paiements
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  // ✅ Taux de change TND → USD (pour l'affichage)
  private readonly TND_TO_USD_RATE = 0.32;
  private readonly DISPLAY_CURRENCY = 'USD'; // Afficher en USD car Stripe n'accepte que USD

  // Signals
  payments = signal<any[]>([]);
  paymentStats = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Obtenir la clé publique Stripe
   */
  getStripePublishableKey(): Observable<{ publishableKey: string }> {
    return this.http.get<{ publishableKey: string }>(
      `${this.apiUrl}/stripe/publishable-key`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Initier un paiement d'adhésion
   */
  initiateMembershipPayment(userId: number, membershipId: number): Observable<{
    clientSecret: string;
    paymentId: number;
  }> {
    return this.http.post<{ clientSecret: string; paymentId: number }>(
      `${this.apiUrl}/membership/initiate`,
      { userId, membershipId }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Confirmer un paiement d'adhésion
   */
  confirmMembershipPayment(paymentId: number, paymentIntentId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/membership/confirm`,
      { paymentId, paymentMethodId: paymentIntentId }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Initier un paiement d'événement
   */
  initiateEventPayment(userId: number, eventId: number): Observable<{
    clientSecret: string;
    paymentId: number;
  }> {
    return this.http.post<{ clientSecret: string; paymentId: number }>(
      `${this.apiUrl}/event/initiate`,
      { userId, eventId }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Confirmer un paiement d'événement
   */
  confirmEventPayment(paymentId: number, paymentIntentId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/event/confirm`,
      { paymentId, paymentMethodId: paymentIntentId }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * ✅ Convertir TND en USD pour l'affichage
   */
  convertTndToUsd(amountInTnd: number): number {
    return Math.round(amountInTnd * this.TND_TO_USD_RATE * 100) / 100;
  }

  /**
   * ✅ Formater la devise (USD pour Stripe)
   */
  formatCurrencyForDisplay(amountInTnd: number): string {
    const amountInUsd = this.convertTndToUsd(amountInTnd);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.DISPLAY_CURRENCY,
    }).format(amountInUsd);
  }

  /**
   * ✅ Afficher le montant en TND avec conversion
   */
  formatCurrencyWithConversion(amountInTnd: number): string {
    const amountInUsd = this.convertTndToUsd(amountInTnd);
    return `$${amountInUsd.toFixed(2)} USD (≈ ${amountInTnd.toFixed(2)} TND)`;
  }

  /**
   * Obtenir l'historique des paiements
   */
  getPaymentHistory(userId: number, filters?: any): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/history/${userId}`,
      { params: filters }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les statistiques de paiement
   */
  getPaymentStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * ✅ CORRIGÉE: Télécharger le reçu en PDF
   * La requête sera envoyée avec le JWT du header Authorization automatiquement
   * grâce au HttpClientModule avec Interceptors
   */
  downloadReceipt(paymentId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${paymentId}/receipt`,
      { responseType: 'blob' }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error downloading receipt:', error);
        // Si c'est une erreur d'authentification (401), proposer de se reconnecter
        if (error.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur lors du téléchargement: ${error.statusText}`);
      })
    );
  }



  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Requête invalide.';
      } else if (error.status >= 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }
    }

    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  clearError() {
    this.error.set(null);
  }
}
