import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVousResponse } from '../../../models/rendez-vous.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Tableau de Bord</h1>
          <p class="page-subtitle">Vue d'ensemble de la gestion des demandes de rendez-vous du cabinet</p>
        </div>
        <a routerLink="/admin/rendez-vous" class="btn-primary">
          <span class="material-symbols-outlined">format_list_bulleted</span>
          <span>Gérer tous les rendez-vous</span>
        </a>
      </div>

      <!-- KPI Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon-bg">
            <span class="material-symbols-outlined icon">calendar_today</span>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Demandes</span>
            <span class="stat-value">{{ totalCount }}</span>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon-bg">
            <span class="material-symbols-outlined icon">pending_actions</span>
          </div>
          <div class="stat-info">
            <span class="stat-label">En Attente</span>
            <span class="stat-value">{{ pendingCount }}</span>
          </div>
        </div>

        <div class="stat-card confirmed">
          <div class="stat-icon-bg">
            <span class="material-symbols-outlined icon">check_circle</span>
          </div>
          <div class="stat-info">
            <span class="stat-label">Confirmés</span>
            <span class="stat-value">{{ confirmedCount }}</span>
          </div>
        </div>

        <div class="stat-card refused">
          <div class="stat-icon-bg">
            <span class="material-symbols-outlined icon">cancel</span>
          </div>
          <div class="stat-info">
            <span class="stat-label">Refusés / Annulés</span>
            <span class="stat-value">{{ refusedOrCanceledCount }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Pending Demands Section -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">
            <span class="material-symbols-outlined title-icon">schedule</span>
            <span>Dernières demandes en attente</span>
          </h2>
          <a routerLink="/admin/rendez-vous" [queryParams]="{statut: 'EN_ATTENTE'}" class="section-link">
            <span>Voir toutes les demandes en attente ({{ pendingCount }})</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>

        <div class="loading-state" *ngIf="isLoading">
          <span class="material-symbols-outlined spinner">sync</span>
          <p>Chargement des demandes...</p>
        </div>

        <div class="empty-state" *ngIf="!isLoading && pendingList.length === 0">
          <span class="material-symbols-outlined empty-icon">done_all</span>
          <p>Aucune demande en attente de traitement.</p>
        </div>

        <div class="table-responsive" *ngIf="!isLoading && pendingList.length > 0">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Téléphone / Email</th>
                <th>Soin</th>
                <th>Date & Heure souhaitées</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rdv of pendingList.slice(0, 5)">
                <td>
                  <strong class="patient-name">{{ rdv.nomComplet }}</strong>
                </td>
                <td>
                  <div class="contact-details">
                    <span><span class="material-symbols-outlined icon-sm">phone</span> {{ rdv.telephone }}</span>
                    <span class="text-sub"><span class="material-symbols-outlined icon-sm">mail</span> {{ rdv.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="soin-badge">{{ rdv.soin }}</span>
                </td>
                <td>
                  <div class="datetime-info">
                    <span class="date"><span class="material-symbols-outlined icon-sm">calendar_today</span> {{ rdv.dateSouhaitee }}</span>
                    <span class="time"><span class="material-symbols-outlined icon-sm">schedule</span> {{ rdv.heureSouhaitee }}</span>
                  </div>
                </td>
                <td>
                  <a routerLink="/admin/rendez-vous" class="btn-table-action">
                    <span>Traiter</span>
                    <span class="material-symbols-outlined">chevron_right</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .page-title {
        font-size: 1.8rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 6px 0;
      }

      .page-subtitle {
        font-size: 0.95rem;
        color: #64748b;
        margin: 0;
      }
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s ease;

      &:hover {
        background: #0369a1;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

      .stat-icon-bg {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
          font-size: 28px;
        }
      }

      &.total .stat-icon-bg {
        background: #e0f2fe;
        color: #0284c7;
      }

      &.pending .stat-icon-bg {
        background: #fef3c7;
        color: #d97706;
      }

      &.confirmed .stat-icon-bg {
        background: #dcfce7;
        color: #16a34a;
      }

      &.refused .stat-icon-bg {
        background: #fee2e2;
        color: #dc2626;
      }

      .stat-label {
        display: block;
        font-size: 0.875rem;
        color: #64748b;
        font-weight: 500;

      }

      .stat-value {
        font-size: 1.75rem;
        font-weight: 800;
        color: #0f172a;
      }
    }

    .section-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .section-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;

        .title-icon {
          color: #d97706;
        }
      }

      .section-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #0284c7;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 40px;
      color: #64748b;

      .spinner {
        font-size: 32px;
        animation: spin 1s linear infinite;
      }

      .empty-icon {
        font-size: 48px;
        color: #16a34a;
        margin-bottom: 8px;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .dashboard-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 12px 16px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #64748b;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      td {
        padding: 16px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.9rem;
        color: #334155;
      }

      tr:last-child td {
        border-bottom: none;
      }
    }

    .patient-name {
      color: #0f172a;
    }

    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.85rem;

      .text-sub {
        color: #64748b;
      }

      .icon-sm {
        font-size: 14px;
        vertical-align: middle;
      }
    }

    .soin-badge {
      background: #f1f5f9;
      color: #334155;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .datetime-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.85rem;

      .icon-sm {
        font-size: 14px;
        vertical-align: middle;
        color: #0284c7;
      }
    }

    .btn-table-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: #e0f2fe;
      color: #0284c7;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;

      &:hover {
        background: #bae6fd;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  allAppointments: RendezVousResponse[] = [];
  pendingList: RendezVousResponse[] = [];
  isLoading = true;

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.rendezVousService.obtenirRendezVousAdmin().subscribe({
      next: (data) => {
        this.allAppointments = data;
        this.pendingList = data.filter(rdv => rdv.statut === 'EN_ATTENTE');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get totalCount(): number {
    return this.allAppointments.length;
  }

  get pendingCount(): number {
    return this.allAppointments.filter(r => r.statut === 'EN_ATTENTE').length;
  }

  get confirmedCount(): number {
    return this.allAppointments.filter(r => r.statut === 'CONFIRME').length;
  }

  get refusedOrCanceledCount(): number {
    return this.allAppointments.filter(r => r.statut === 'REFUSE' || r.statut === 'ANNULE').length;
  }
}
