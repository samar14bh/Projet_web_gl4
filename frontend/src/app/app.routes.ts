import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from "./Pages/dashboard/dashboard";
import { PageNotFound } from "./Pages/page-not-found/page-not-found";

/**
 * Configuration des routes de l'application
 */
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./Pages/dashboard/dashboard').then(m => m.Dashboard)
      },
       {
           path: 'events',
          loadComponent: () => import('./features/club-manager/events-manager/events-manager').then(m => m.EventsManagerComponent),
         title: 'Gérer les événements'
       }
    ],
  },
  {
    path: '**',
    component: PageNotFound
  }
];
