import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVousResponse, StatutRendezVous } from '../../../models/rendez-vous.model';

@Component({
  selector: 'app-admin-rendez-vous',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-rdv-page">
      
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des Rendez-vous</h1>
          <p class="page-subtitle">Consultez, confirmez ou refusez les demandes de consultations dentaires</p>
        </div>

        <button (click)="chargerRendezVous()" class="btn-refresh" [disabled]="isLoading">
          <span class="material-symbols-outlined" [class.spin]="isLoading">refresh</span>
          <span>Actualiser</span>
        </button>
      </div>

      <!-- Error / Success Notification Banners -->
      <div class="alert-banner error" *ngIf="errorMessage">
        <span class="material-symbols-outlined icon">error</span>
        <span>{{ errorMessage }}</span>
        <button class="btn-close" (click)="errorMessage = ''">×</button>
      </div>

      <div class="alert-banner success" *ngIf="successMessage">
        <span class="material-symbols-outlined icon">check_circle</span>
        <span>{{ successMessage }}</span>
        <button class="btn-close" (click)="successMessage = ''">×</button>
      </div>

      <!-- Filter Controls -->
      <div class="filters-card">
        <div class="filter-tabs">
          <button 
            *ngFor="let tab of filterTabs" 
            class="tab-btn" 
            [class.active]="selectedStatut === tab.value"
            (click)="changerFiltre(tab.value)">
            <span>{{ tab.label }}</span>
            <span class="count-badge" [class.pending-count]="tab.value === 'EN_ATTENTE'">
              {{ getCountForStatut(tab.value) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-card">
        
        <div class="loading-overlay" *ngIf="isLoading">
          <span class="material-symbols-outlined spinner">sync</span>
          <p>Chargement des demandes de rendez-vous...</p>
        </div>

        <div class="empty-state" *ngIf="!isLoading && rendezVousList.length === 0">
          <span class="material-symbols-outlined empty-icon">inbox</span>
          <h3>Aucun rendez-vous trouvé</h3>
          <p>Aucune demande ne correspond au filtre sélectionné.</p>
        </div>

        <div class="table-responsive" *ngIf="!isLoading && rendezVousList.length > 0">
          <table class="rdv-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Coordonnées</th>
                <th>Soin</th>
                <th>Date & Heure</th>
                <th>Statut</th>
                <th>Message / Remarques</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rdv of rendezVousList" [class.highlight-pending]="rdv.statut === 'EN_ATTENTE'">
                <td>
                  <div class="patient-cell">
                    <strong class="name">{{ rdv.nomComplet }}</strong>
                    <span class="date-creation">Demande du {{ formatDateTime(rdv.dateCreation) }}</span>
                  </div>
                </td>
                <td>
                  <div class="contact-cell">
                    <a [href]="'tel:' + rdv.telephone" class="contact-link">
                      <span class="material-symbols-outlined icon-sm">call</span> {{ rdv.telephone }}
                    </a>
                    <a [href]="'mailto:' + rdv.email" class="contact-link email">
                      <span class="material-symbols-outlined icon-sm">mail</span> {{ rdv.email }}
                    </a>
                  </div>
                </td>
                <td>
                  <span class="soin-pill">{{ rdv.soin }}</span>
                </td>
                <td>
                  <div class="datetime-cell">
                    <strong class="date-val">{{ formatDate(rdv.dateSouhaitee) }}</strong>
                    <span class="time-val"><span class="material-symbols-outlined icon-sm">schedule</span> {{ rdv.heureSouhaitee }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="rdv.statut.toLowerCase()">
                    <span class="dot"></span>
                    {{ getStatusLabel(rdv.statut) }}
                  </span>
                </td>
                <td>
                  <div class="message-cell">
                    <p class="msg-text" *ngIf="rdv.message">{{ rdv.message }}</p>
                    <p class="msg-empty" *ngIf="!rdv.message"><em>Aucun message</em></p>
                    <p class="motif-refus" *ngIf="rdv.motifRefus">
                      <strong>Motif de refus :</strong> {{ rdv.motifRefus }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="actions-cell">
                    
                    <!-- Confirm Button -->
                    <button 
                      *ngIf="rdv.statut === 'EN_ATTENTE'" 
                      (click)="demanderConfirmation(rdv)"
                      class="btn-action confirm" 
                      title="Confirmer le rendez-vous">
                      <span class="material-symbols-outlined">check_circle</span>
                      <span>Confirmer</span>
                    </button>

                    <!-- Refuse Button -->
                    <button 
                      *ngIf="rdv.statut === 'EN_ATTENTE'" 
                      (click)="ouvrirModalRefus(rdv)"
                      class="btn-action refuse" 
                      title="Refuser la demande">
                      <span class="material-symbols-outlined">cancel</span>
                      <span>Refuser</span>
                    </button>

                    <!-- Cancel Button for Confirmed appointments -->
                    <button 
                      *ngIf="rdv.statut === 'CONFIRME'" 
                      (click)="demanderAnnulation(rdv)"
                      class="btn-action cancel" 
                      title="Annuler le rendez-vous">
                      <span class="material-symbols-outlined">block</span>
                      <span>Annuler</span>
                    </button>

                    <!-- Status tag if already processed -->
                    <span class="done-tag" *ngIf="rdv.statut === 'REFUSE' || rdv.statut === 'ANNULE'">
                      Traité
                    </span>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Refusal Modal -->
      <div class="modal-backdrop" *ngIf="showRefusalModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Refuser la demande de rendez-vous</h3>
            <button class="btn-modal-close" (click)="fermerModalRefus()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedRdvForRefusal">
            <p>
              Vous êtes sur le point de refuser la demande de 
              <strong>{{ selectedRdvForRefusal.nomComplet }}</strong> pour le 
              <strong>{{ selectedRdvForRefusal.dateSouhaitee }} à {{ selectedRdvForRefusal.heureSouhaitee }}</strong>.
            </p>
            <div class="form-group">
              <label for="motifRefus">Motif du refus (facultatif)</label>
              <textarea 
                id="motifRefus" 
                [(ngModel)]="motifRefusText" 
                rows="3" 
                class="form-control" 
                placeholder="Ex. Créneau indisponible, indisponibilité du chirurgien-dentiste..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="fermerModalRefus()" class="btn-modal-cancel">Annuler</button>
            <button (click)="confirmerRefus()" class="btn-modal-confirm-refuse" [disabled]="isProcessingAction">
              <span class="material-symbols-outlined" *ngIf="!isProcessingAction">cancel</span>
              <span>{{ isProcessingAction ? 'Traitement...' : 'Confirmer le refus' }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .admin-rdv-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
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

    .btn-refresh {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      color: #334155;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #f8fafc;
        border-color: #94a3b8;
      }

      .spin {
        animation: spin 1s linear infinite;
      }
    }

    .alert-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;

      .icon {
        margin-right: 10px;
      }

      &.error {
        background: #fef2f2;
        border: 1px solid #fca5a5;
        color: #991b1b;
      }

      &.success {
        background: #f0fdf4;
        border: 1px solid #86efac;
        color: #166534;
      }

      .btn-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
      }
    }

    .filters-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #f1f5f9;
        color: #0f172a;
      }

      &.active {
        background: #0284c7;
        color: #ffffff;

        .count-badge {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }
      }
    }

    .count-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      background: #e2e8f0;
      color: #334155;

      &.pending-count {
        background: #fef3c7;
        color: #92400e;
      }
    }

    .table-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      position: relative;
    }

    .loading-overlay, .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: #64748b;

      .spinner {
        font-size: 36px;
        color: #0284c7;
        animation: spin 1s linear infinite;
      }

      .empty-icon {
        font-size: 48px;
        color: #94a3b8;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .rdv-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 14px 16px;
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
        vertical-align: middle;
      }

      tr.highlight-pending {
        background: #fffbeb;

        &:hover {
          background: #fef3c7;
        }
      }

      tr:hover {
        background: #f8fafc;
      }
    }

    .patient-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .name {
        color: #0f172a;
        font-size: 0.95rem;
      }

      .date-creation {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }

    .contact-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .contact-link {
        color: #0284c7;
        text-decoration: none;
        font-size: 0.85rem;

        &:hover {
          text-decoration: underline;
        }

        &.email {
          color: #475569;
        }

        .icon-sm {
          font-size: 14px;
          vertical-align: middle;
        }
      }
    }

    .soin-pill {
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-block;
    }

    .datetime-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .date-val {
        color: #0f172a;
      }

      .time-val {
        font-size: 0.85rem;
        color: #0284c7;

        .icon-sm {
          font-size: 14px;
          vertical-align: middle;
        }
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.en_attente {
        background: #fef3c7;
        color: #b45309;
        .dot { background: #d97706; }
      }

      &.confirme {
        background: #dcfce7;
        color: #15803d;
        .dot { background: #16a34a; }
      }

      &.refuse {
        background: #fee2e2;
        color: #b91c1c;
        .dot { background: #dc2626; }
      }

      &.annule {
        background: #f1f5f9;
        color: #64748b;
        .dot { background: #94a3b8; }
      }
    }

    .message-cell {
      max-width: 220px;

      .msg-text {
        margin: 0;
        font-size: 0.85rem;
        color: #475569;
        white-space: pre-wrap;
        max-height: 60px;
        overflow-y: auto;
      }

      .msg-empty {
        margin: 0;
        font-size: 0.8rem;
        color: #94a3b8;
      }

      .motif-refus {
        margin: 6px 0 0 0;
        font-size: 0.8rem;
        color: #dc2626;
      }
    }

    .actions-cell {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      .material-symbols-outlined {
        font-size: 18px;
      }

      &.confirm {
        background: #16a34a;
        color: #ffffff;
        &:hover { background: #15803d; }
      }

      &.refuse {
        background: #dc2626;
        color: #ffffff;
        &:hover { background: #b91c1c; }
      }

      &.cancel {
        background: #64748b;
        color: #ffffff;
        &:hover { background: #475569; }
      }
    }

    .done-tag {
      font-size: 0.8rem;
      color: #94a3b8;
      font-style: italic;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: #0f172a;
      }

      .btn-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
      }
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      color: #334155;
      font-size: 0.95rem;

      p {
        margin: 0;
      }
    }

    .modal-footer {
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-modal-cancel {
      padding: 10px 16px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-modal-confirm-refuse {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      background: #dc2626;
      color: #ffffff;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;

      &:hover:not(:disabled) {
        background: #b91c1c;
      }

      &:disabled {
        opacity: 0.7;
      }
    }
  `]
})
export class AdminRendezVousComponent implements OnInit {
  rendezVousList: RendezVousResponse[] = [];
  allAppointments: RendezVousResponse[] = [];
  selectedStatut: StatutRendezVous | 'TOUS' = 'TOUS';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Modal State
  showRefusalModal = false;
  selectedRdvForRefusal: RendezVousResponse | null = null;
  motifRefusText = '';
  isProcessingAction = false;

  filterTabs: { label: string; value: StatutRendezVous | 'TOUS' }[] = [
    { label: 'Tous', value: 'TOUS' },
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Confirmés', value: 'CONFIRME' },
    { label: 'Refusés', value: 'REFUSE' },
    { label: 'Annulés', value: 'ANNULE' }
  ];

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.chargerRendezVous();
  }

  chargerRendezVous(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const paramStatut = this.selectedStatut === 'TOUS' ? undefined : this.selectedStatut;

    this.rendezVousService.obtenirRendezVousAdmin(paramStatut).subscribe({
      next: (data) => {
        this.rendezVousList = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Accès refusé. Session expirée ou droits insuffisants.';
        } else {
          this.errorMessage = 'Impossible de charger la liste des rendez-vous.';
        }
      }
    });
  }

  changerFiltre(statut: StatutRendezVous | 'TOUS'): void {
    this.selectedStatut = statut;
    this.chargerRendezVous();
  }

  getCountForStatut(statut: StatutRendezVous | 'TOUS'): number {
    if (statut === 'TOUS') {
      return this.rendezVousList.length;
    }
    return this.rendezVousList.filter(r => r.statut === statut).length;
  }

  demanderConfirmation(rdv: RendezVousResponse): void {
    if (!confirm(`Confirmer le rendez-vous de ${rdv.nomComplet} le ${rdv.dateSouhaitee} à ${rdv.heureSouhaitee} ?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.rendezVousService.confirmerRendezVousAdmin(rdv.id).subscribe({
      next: (updated) => {
        if (updated.notificationWarning) {
          this.errorMessage = updated.notificationWarning;
        } else {
          this.successMessage = `Rendez-vous de ${updated.nomComplet} confirmé avec succès. E-mail de confirmation envoyé à ${updated.email}.`;
        }
        this.chargerRendezVous();
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage = err.error?.message || 'Ce créneau horaire est déjà occupé par un autre rendez-vous confirmé.';
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de la confirmation du rendez-vous.';
        }
      }
    });
  }

  ouvrirModalRefus(rdv: RendezVousResponse): void {
    this.selectedRdvForRefusal = rdv;
    this.motifRefusText = '';
    this.showRefusalModal = true;
  }

  fermerModalRefus(): void {
    this.showRefusalModal = false;
    this.selectedRdvForRefusal = null;
    this.motifRefusText = '';
  }

  confirmerRefus(): void {
    if (!this.selectedRdvForRefusal) return;

    this.isProcessingAction = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.rendezVousService.refuserRendezVousAdmin(this.selectedRdvForRefusal.id, this.motifRefusText).subscribe({
      next: (updated) => {
        this.isProcessingAction = false;
        if (updated.notificationWarning) {
          this.errorMessage = updated.notificationWarning;
        } else {
          this.successMessage = `Demande de ${updated.nomComplet} refusée. E-mail de notification envoyé à ${updated.email}.`;
        }
        this.fermerModalRefus();
        this.chargerRendezVous();
      },
      error: (err) => {
        this.isProcessingAction = false;
        this.errorMessage = err.error?.message || 'Erreur lors du refus de la demande.';
        this.fermerModalRefus();
      }
    });
  }

  demanderAnnulation(rdv: RendezVousResponse): void {
    if (!confirm(`Voulez-vous vraiment annuler le rendez-vous confirmé de ${rdv.nomComplet} ?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.rendezVousService.annulerRendezVousAdmin(rdv.id).subscribe({
      next: (updated) => {
        this.successMessage = `Rendez-vous de ${updated.nomComplet} annulé.`;
        this.chargerRendezVous();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l’annulation du rendez-vous.';
      }
    });
  }

  getStatusLabel(statut: StatutRendezVous): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'CONFIRME': return 'Confirmé';
      case 'REFUSE': return 'Refusé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  formatDateTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    const dateObj = new Date(dateTimeStr);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
