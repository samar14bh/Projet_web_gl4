// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { routes } from './app.routes';
import { authInterceptor } from './Core/interceptors/auth.interceptor'; // Notez le nom en minuscule

// Enregistrer la locale française
registerLocaleData(localeFr, 'fr-FR');

/**
 * Configuration globale de l'application Angular 20
 * Mode zoneless activé
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(), // Nécessaire pour EventService
      withInterceptors([authInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'fr-FR' }, // Définir la locale par défaut
  ]
};
