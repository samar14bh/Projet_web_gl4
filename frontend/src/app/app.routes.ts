import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from "./Pages/dashboard/dashboard";
import { PageNotFound } from "./Pages/page-not-found/page-not-found";
import { UserEvents } from './Pages/UserEvents/user-events/user-events';

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
        path: 'my-events',
        loadComponent: () =>
          import('./Pages/UserEvents/user-events/user-events').then(m => m.UserEvents)
      },
      {
        path: 'user-event-details/:userId/:eventId',
        loadComponent: () => import('./Pages/UserEvents/event-details/event-details').then(m => m.EventDetails)
      },


      {
        path: 'dashboard',
        loadComponent: () => import('./Pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/club-manager/events-manager/events-manager').then(m => m.EventsManagerComponent),
        title: 'Gérer les événements'
      },
      {
        path: 'finances',  // ← NOUVELLE ROUTE
        loadComponent: () => import('./features/club-manager/finances/finances').then(m => m.FinancesComponent),
        title: 'Finances du club'
      },
      {
        path: 'admin/dashboard',  // ← NOUVELLE ROUTE
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard'
      },
      {
        path: 'admin/clubs',  // ← NOUVELLE ROUTE
        loadComponent: () => import('./features/admin/manage-club/manage-club').then(m => m.ManageClubsComponent),
        title: 'Gestion des clubs'
      },

    ],
  },
  {
    path: '**',
    component: PageNotFound
  }
];
