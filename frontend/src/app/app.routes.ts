import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from "./Pages/dashboard/dashboard";
import { PageNotFound } from "./Pages/page-not-found/page-not-found";
import { roleGuard } from './Core/guards/role.guard';

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
   
    ],
  },
  {
    path: '**',
    component: PageNotFound
  }
];