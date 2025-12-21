import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

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
        redirectTo: 'club-manager/dashboard',
        pathMatch: 'full'
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
        path: 'my-payments',  // ← PAGE 10
        loadComponent: () => import('./features/member/my-payments/my-payments').then(m => m.MyPaymentsComponent),
        title: 'Mes paiements'
      },
      {
        path: 'club-manager/dashboard',  // ← PAGE 12
        loadComponent: () => import('./features/club-manager/dashboard/dashboard').then(m => m.ClubManagerDashboardComponent),
        title: 'Dashboard Responsable'
      },
      {
        path: 'club-manager/manage-club',  // ← PAGE 13
        loadComponent: () => import('./features/club-manager/manage-club/manage-club').then(m => m.ManageClubComponent),
        title: 'Gérer mon club'
      },
      {
        path: 'club-manager/manage-members',  // ← PAGE 14
        loadComponent: () => import('./features/club-manager/manage-members/manage-members').then(m => m.ManageMembersComponent),
        title: 'Gérer les membres'
      }
    ],
  },
  {
    path: '**',
    redirectTo: 'club-manager/dashboard'
  }
];
