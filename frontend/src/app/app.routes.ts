import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { PageNotFound } from "./Pages/page-not-found/page-not-found";
import { guestGuard } from './Core/guards/guest.guard';
import { roleGuard } from './Core/guards/role.guard';
import { clubRoleGuard } from './Core/guards/club-role.guard';
import { UserRoleInClub } from './Core/dtos/application/membership-club.dto';


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
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'my-events',
        canActivate: [roleGuard],
        data: { role: 'USER' },
        loadComponent: () =>
          import('./Pages/user-events/user-events').then(m => m.UserEvents)
      },
      {
        path: 'discover-events/:clubId',
        canActivate: [roleGuard],
        data: { role: 'USER' },
        loadComponent: () =>
          import('./Pages/user-events/user-events').then(m => m.UserEvents)
      },
      {
        path: 'my-clubs',
        canActivate: [roleGuard],
        data: { role: 'USER' },
        loadComponent: () =>
          import('./Pages/user-clubs/user-clubs').then(m => m.UserClubs)
      },
      {
        path: 'my-clubs/:clubId',
        loadComponent: () =>
          import('./Pages/club-details/club-details').then(m => m.ClubDetails),
        canActivate: [roleGuard],
        data: { role: 'USER' }
      },
      {
        path: 'user-event-details/:userId/:eventId',
        loadComponent: () => import('./Pages/event-details/event-details').then(m => m.EventDetails),
        canActivate: [roleGuard],
        data: { role: 'USER' }
      },


      {
        path: 'dashboard',
        loadComponent: () => import('./Pages/member-dashboard/member-dashboard').then(m => m.MemberDashboardComponent),
        title: 'Tableau de bord',
        canActivate: [roleGuard],
        data: { role: 'USER' }
      },
      {
        path: 'events/:clubId',
        loadComponent: () => import('./features/club-manager/events-manager/events-manager').then(m => m.EventsManagerComponent),
        title: 'Gérer les événements',
        canActivate: [roleGuard],
        data: { role: 'USER' }
      },
      {
        path: 'finances/:clubId',
        loadComponent: () => import('./features/club-manager/finances/finances').then(m => m.FinancesComponent),
        title: 'Finances du club',
        canActivate: [roleGuard],
        data: { role: 'USER' }
      },
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard',
        canActivate: [roleGuard],
        data: { role: 'ADMIN' }
      },
      {
        path: 'admin/clubs',
        loadComponent: () => import('./features/admin/manage-club/manage-club').then(m => m.ManageClubsComponent),
        title: 'Gestion des clubs',
        canActivate: [roleGuard],
        data: { role: 'ADMIN' }

      },
      {
        path: 'join-club/:clubId',
        loadComponent: () =>
          import('./features/member/join-club-form/join-club-form')
            .then(m => m.JoinClubForm),

        title: 'Join Club',
        canActivate: [roleGuard],
        data: { role: 'USER' }
      },
      {
        path: 'my-applications',
        loadComponent: () =>
          import('./Pages/user-applications/user-applications')
            .then(m => m.UserApplications),
        title: 'My Applications',
        canActivate: [roleGuard],
        data: { role: 'USER' }
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
          .then(m => m.LoginComponent),
        title: 'Connexion',
        canActivate: [guestGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register')
          .then(m => m.RegisterComponent),
        title: 'Inscription',
        canActivate: [guestGuard]
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
        path: 'payment',
        loadComponent: () => import('./Pages/payment-page/payment-page')
          .then(m => m.PaymentPageComponent),
        canActivate: [roleGuard],
        data: { title: 'Paiement Sécurisé', role: 'USER' }
      },
      {
        path: 'payment/success',
        loadComponent: () => import('./Pages/payment-success/payment-success')
          .then(m => m.PaymentSuccessComponent),
        canActivate: [roleGuard],
        data: { title: 'Paiement réussi', role: 'USER' }
      },

      {
        path: 'my-payments',  // ← PAGE 10
        loadComponent: () => import('./Pages/my-payments/my-payments').then(m => m.MyPaymentsComponent),
        canActivate: [roleGuard],
        data: { role: 'USER' },
        title: 'Mes paiements'
      },
      {
        path: 'club-manager/:clubId/dashboard',
        loadComponent: () => import('./Pages/club-manager/dashboard/dashboard')
          .then(m => m.ClubManagerDashboardComponent),
        canActivate: [roleGuard],
        data: { role: 'USER' },
        title: 'Tableau de bord du club'
      },

      // Gestion du club avec clubId
      {
        path: 'club-manager/:clubId/manage-club',
        loadComponent: () => import('./Pages/club-manager/manage-club/manage-club')
          .then(m => m.ManageClubComponent),
        canActivate: [roleGuard],
        data: { role: 'USER' },
        title: 'Gérer le club'
      },

      // Gestion des membres avec clubId
      {
        path: 'club-manager/:clubId/manage-members',
        loadComponent: () => import('./Pages/club-manager/manage-members/manage-members')
          .then(m => m.ManageMembersComponent),
        canActivate: [roleGuard],
        data: { role: 'USER' },
        title: 'Gérer les membres'
      },
      {
        path: 'club-responsability/:membershipId',
        loadComponent: () => import('./Pages/club-responsability/club-responsability').then(m => m.ClubResponsability),
        title: 'Responsabilités Club',
        canActivate: [clubRoleGuard]
      },
      {
        path: 'club-responsability/:membershipId/documents',
        loadComponent: () => import('./Pages/club-documents/club-documents').then(m => m.ClubDocuments),
        title: 'Documents du Club',
        canActivate: [clubRoleGuard],
        data: { clubRoles: [UserRoleInClub.PRESIDENT, UserRoleInClub.SECRETARY] }
      }
      ,
       {
    path: 'profile',
     loadComponent: () => import('./Pages/profile/profile').then(m => m.ProfileComponent),
     canActivate: [roleGuard],
        data: { role: 'USER' },
         title: 'Profile'
  },
   {
    path: 'settings',
     loadComponent: () => import('./Pages/profile-settings/profile-settings').then(m => m.ProfileSettings),
     canActivate: [roleGuard],
        data: { role: 'USER' },
         title: 'Paramètres'
  },
      {
        path: '**',
        component: PageNotFound,
        title: 'Page non trouvée'
      }

    ]
  }
];

