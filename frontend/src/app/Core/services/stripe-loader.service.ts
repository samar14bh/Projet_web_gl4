import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

/**
 * Service pour charger le script Stripe dynamiquement
 * Évite les chargements multiples et gère les erreurs
 */
@Injectable({
  providedIn: 'root'
})
export class StripeLoaderService {
  private stripePromise: Promise<any>;
  private stripeLoaded = false;
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.stripePromise = this.loadStripeScript();
  }

  /**
   * Charger le script Stripe
   */
  private loadStripeScript(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Vérifier si Stripe est déjà chargé
      if ((window as any).Stripe && this.stripeLoaded) {
        resolve((window as any).Stripe);
        return;
      }

      // Vérifier si le script est déjà en cours de chargement
      const head = document.head;
      if (head.querySelector('#stripe-script')) {
        const checkStripe = setInterval(() => {
          if ((window as any).Stripe) {
            this.stripeLoaded = true;
            clearInterval(checkStripe);
            resolve((window as any).Stripe);
          }
        }, 100);
        return;
      }

      // Créer et ajouter le script
      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'id', 'stripe-script');
      this.renderer.setAttribute(script, 'src', 'https://js.stripe.com/v3/');
      this.renderer.setAttribute(script, 'async', 'true');

      script.onload = () => {
        this.stripeLoaded = true;
        resolve((window as any).Stripe);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Stripe script'));
      };

      this.renderer.appendChild(head, script);
    });
  }

  /**
   * Obtenir une instance Stripe
   */
  async getStripe(publishableKey: string): Promise<any> {
    const Stripe = await this.stripePromise;
    return Stripe(publishableKey);
  }

  /**
   * Vérifier si Stripe est chargé
   */
  isLoaded(): boolean {
    return this.stripeLoaded && !!(window as any).Stripe;
  }
}
