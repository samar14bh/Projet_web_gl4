import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { PageNotFound } from "./Pages/page-not-found/page-not-found";
import {roleGuard} from './Core/guards/role.guard';


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
        loadComponent: () => import('./Pages/member-dashboard/member-dashboard').then(m => m.MemberDashboardComponent),
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
      }, {
        path: 'clubs',
        loadComponent: () => import('./features/clubs/explore-clubs/explore-clubs/explore-clubs').then(m => m.ExploreClubsComponent),
        title: 'Explorer les clubs',
        canActivate: [roleGuard],
        data: { role: 'USER' }
      },
      {
        path: 'home',
        loadComponent: () => import('./Pages/landing-page/landing-page').then(m => m.LandingPageComponent),
        title: 'ClubHub - Découvrez et rejoignez des clubs'
      },

      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register')
          .then(m => m.RegisterComponent)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email')
          .then(m => m.VerifyEmailComponent)
      },
      {
        path: 'register-success',
        loadComponent: () => import('./features/auth/register/register-success')
          .then(m => m.RegisterSuccessComponent),
        title: 'Inscription réussie'
      },

       {
      path: 'notifications',
      loadComponent: () => import('./Pages/notifications/notifications')
        .then(m => m.NotificationComponent),
      title: 'Notifications',
         canActivate: [roleGuard],
        data: { role: 'USER' }
    },
       {
        path: 'verify-success',
        loadComponent: () => import('./features/auth/verify-success/verify-success')
          .then(m => m.VerifySuccessComponent),
        title: 'Inscription réussie'
      },
      {
        path: 'payment',  // ← PAGE 11: Payment Page
        loadComponent: () => import('./features/member/payment-page/payment-page').then(m => m.PaymentPageComponent),

        title: 'Paiement'
      },
      {
        path: 'payment/success',  // Payment Success Page
        loadComponent: () => import('./features/member/payment-success/payment-success').then(m => m.PaymentSuccessComponent),
        title: 'Paiement confirmé'
      },
      {
        path: 'my-payments',  // ← PAGE 10
        loadComponent: () => import('./features/member/my-payments/my-payments').then(m => m.MyPaymentsComponent),
        title: 'Mes paiements'
      },
      // Dashboard du club avec clubId
      {
        path: 'club-manager/:clubId/dashboard',
        loadComponent: () => import('./features/club-manager/dashboard/dashboard')
          .then(m => m.ClubManagerDashboardComponent),
        title: 'Tableau de bord du club'
      },

      // Gestion du club avec clubId
      {
        path: 'club-manager/:clubId/manage-club',
        loadComponent: () => import('./features/club-manager/manage-club/manage-club')
          .then(m => m.ManageClubComponent),
        title: 'Gérer le club'
      },

      // Gestion des membres avec clubId
      {
        path: 'club-manager/:clubId/manage-members',
        loadComponent: () => import('./features/club-manager/manage-members/manage-members')
          .then(m => m.ManageMembersComponent),
        title: 'Gérer les membres'
      }


,
    {path: '**',
      component: PageNotFound,
        title: 'Page non trouvée'
    }

    ]
  }
];

