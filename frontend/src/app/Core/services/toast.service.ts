import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  /**
   * Afficher un toast de succès
   */
  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  /**
   * Afficher un toast d'erreur
   */
  error(message: string, duration = 4000) {
    this.show(message, 'error', duration);
  }

  /**
   * Afficher un toast d'information
   */
  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  /**
   * Afficher un toast d'avertissement
   */
  warning(message: string, duration = 3000) {
    this.show(message, 'warning', duration);
  }

  /**
   * Afficher un toast
   */
  private show(message: string, type: Toast['type'], duration: number) {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    // Retirer automatiquement après la durée
    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  /**
   * Retirer un toast
   */
  remove(id: number) {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
