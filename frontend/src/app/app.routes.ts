import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
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
        path: 'my-events',
        loadComponent: () =>
          import('./Pages/user-events/user-events').then(m => m.UserEvents)
      },
      {
        path: 'discover-events/:clubId',
        loadComponent: () =>
          import('./Pages/user-events/user-events').then(m => m.UserEvents)
      },
      {
        path: 'my-clubs',
        loadComponent: () =>
          import('./Pages/user-clubs/user-clubs').then(m => m.UserClubs)
      },
      {
        path: 'my-clubs/:clubId',
        loadComponent: () =>
          import('./Pages/club-details/club-details').then(m => m.ClubDetails)
      },
      {
        path: 'user-event-details/:userId/:eventId',
        loadComponent: () => import('./Pages/event-details/event-details').then(m => m.EventDetails)
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
      {
        path: 'join-club/:clubId',
        loadComponent: () =>
          import('./features/member/join-club-form/join-club-form')
            .then(m => m.JoinClubForm),
        title: 'Join Club'
      },
      {
        path: 'my-applications',
        loadComponent: () =>
          import('./Pages/user-applications/user-applications')
            .then(m => m.UserApplications),
        title: 'My Applications'
      },
      {
        path: 'applications/:applicationId',
        loadComponent: () =>
          import('./Pages/application-response/application-response')
            .then(m => m.ApplicationResponse),
        title: 'Application Details'
      }



    ],
  },
  {
    path: '**',
    component: PageNotFound
  }
];
