import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdminLoginComponent } from './pages/admin/login/admin-login.component';
import { AdminForgotPasswordComponent } from './pages/admin/forgot-password/admin-forgot-password.component';
import { AdminResetPasswordComponent } from './pages/admin/reset-password/admin-reset-password.component';
import { AdminLayoutComponent } from './pages/admin/layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { AdminRendezVousComponent } from './pages/admin/rendez-vous/admin-rendez-vous.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'admin/connexion',
    component: AdminLoginComponent
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin/forgot-password',
    component: AdminForgotPasswordComponent
  },
  {
    path: 'admin/reset-password',
    component: AdminResetPasswordComponent
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'tableau-de-bord',
        pathMatch: 'full'
      },
      {
        path: 'tableau-de-bord',
        component: AdminDashboardComponent
      },
      {
        path: 'rendez-vous',
        component: AdminRendezVousComponent
      },
      {
        path: 'soins',
        loadComponent: () => import('./pages/admin/soins/admin-soins.component').then(m => m.AdminSoinsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/admin/messages/admin-messages.component').then(m => m.AdminMessagesComponent)
      },
      {
        path: 'avis',
        loadComponent: () => import('./pages/admin/avis/admin-avis.component').then(m => m.AdminAvisComponent)
      },
      {
        path: 'equipe',
        loadComponent: () => import('./pages/admin/team/admin-team.component').then(m => m.AdminTeamComponent)
      },
      {
        path: 'contenu',
        loadComponent: () => import('./pages/admin/settings/admin-cabinet-settings.component').then(m => m.AdminCabinetSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
