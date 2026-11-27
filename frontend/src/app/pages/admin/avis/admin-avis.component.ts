import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../../services/avis.service';
import { AvisResponse, StatutAvis } from '../../../models/avis.model';

@Component({
  selector: 'app-admin-avis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-avis-page">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des Avis Clients</h1>
          <p class="page-subtitle">Modérez et gérez les témoignages déposés par les visiteurs avant publication sur le site</p>
        </div>

        <button (click)="chargerAvis()" class="btn-refresh" [disabled]="isLoading">
          <span class="material-symbols-outlined" [class.spin]="isLoading">refresh</span>
          <span>Actualiser</span>
        </button>
      </div>

      <!-- Alert Banners -->
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

      <!-- Filter Tabs -->
      <div class="filters-card">
        <div class="filter-tabs">
          <button 
            class="tab-btn" 
            [class.active]="filtreStatut === 'EN_ATTENTE'"
            (click)="changerFiltre('EN_ATTENTE')">
            <span>En attente de modération</span>
            <span class="count-badge pending-count">{{ pendingCount }}</span>
          </button>

          <button 
            class="tab-btn" 
            [class.active]="filtreStatut === 'APPROUVE'"
            (click)="changerFiltre('APPROUVE')">
            <span>Approuvés (Publics)</span>
            <span class="count-badge approved-count">{{ approvedCount }}</span>
          </button>

          <button 
            class="tab-btn" 
            [class.active]="filtreStatut === 'REFUSE'"
            (click)="changerFiltre('REFUSE')">
            <span>Refusés</span>
            <span class="count-badge refused-count">{{ refusedCount }}</span>
          </button>

          <button 
            class="tab-btn" 
            [class.active]="filtreStatut === 'TOUS'"
            (click)="changerFiltre('TOUS')">
            <span>Tous les avis</span>
            <span class="count-badge">{{ avisList.length }}</span>
          </button>
        </div>
      </div>

      <!-- Reviews Cards / Table List -->
      <div class="content-card">
        
        <div class="loading-overlay" *ngIf="isLoading">
          <span class="material-symbols-outlined spinner">sync</span>
          <p>Chargement des avis...</p>
        </div>

        <div class="empty-state" *ngIf="!isLoading && filteredAvis.length === 0">
          <span class="material-symbols-outlined empty-icon">rate_review</span>
          <h3>Aucun avis trouvé</h3>
          <p>Aucun avis ne correspond au filtre sélectionné.</p>
        </div>

        <div class="avis-grid" *ngIf="!isLoading && filteredAvis.length > 0">
          <div 
            *ngFor="let item of filteredAvis" 
            class="admin-avis-item"
            [class.pending-item]="item.statut === 'EN_ATTENTE'"
            (click)="ouvrirModalDetail(item)">
            
            <div class="item-header">
              <div class="author-area">
                <div class="avatar-circle">
                  <span>{{ item.nomAuteur.charAt(0) }}</span>
                </div>
                <div>
                  <h4 class="author-name">{{ item.nomAuteur }}</h4>
                  <span class="care-badge">{{ item.soinConcerne }}</span>
                </div>
              </div>

              <div class="header-right">
                <span class="status-badge" [ngClass]="item.statut.toLowerCase()">
                  <span class="dot"></span>
                  {{ getStatutLabel(item.statut) }}
                </span>
              </div>
            </div>

            <div class="item-rating">
              <span 
                *ngFor="let star of stars" 
                class="material-symbols-outlined star" 
                [class.filled]="star <= item.note">star</span>
              <span class="rating-num">{{ item.note }} / 5</span>
              <span class="date-str">{{ formatDateTime(item.dateCreation) }}</span>
            </div>

            <div class="item-body">
              <p class="comment-preview">« {{ item.commentaire }} »</p>
            </div>

            <div class="item-actions" (click)="$event.stopPropagation()">
              
              <button 
                *ngIf="item.statut !== 'APPROUVE'"
                (click)="approuver(item)"
                class="btn-act approve"
                title="Approuver l'avis">
                <span class="material-symbols-outlined">check_circle</span>
                <span>Approuver</span>
              </button>

              <button 
                *ngIf="item.statut !== 'REFUSE'"
                (click)="refuser(item)"
                class="btn-act refuse"
                title="Refuser l'avis">
                <span class="material-symbols-outlined">cancel</span>
                <span>Refuser</span>
              </button>

              <button 
                (click)="supprimer(item)"
                class="btn-act delete"
                title="Supprimer définitivement">
                <span class="material-symbols-outlined">delete</span>
                <span>Supprimer</span>
              </button>

            </div>

          </div>
        </div>

      </div>

      <!-- Detail Modal -->
      <div class="modal-backdrop" *ngIf="selectedAvis">
        <div class="modal-card">
          
          <div class="modal-header">
            <div class="modal-title-area">
              <span class="status-badge" [ngClass]="selectedAvis.statut.toLowerCase()">
                <span class="dot"></span>
                {{ getStatutLabel(selectedAvis.statut) }}
              </span>
              <h3>Avis de {{ selectedAvis.nomAuteur }}</h3>
            </div>
            <button class="btn-modal-close" (click)="fermerModalDetail()">×</button>
          </div>

          <div class="modal-body">
            
            <div class="detail-row">
              <span class="label">Auteur :</span>
              <strong>{{ selectedAvis.nomAuteur }}</strong>
            </div>

            <div class="detail-row">
              <span class="label">Soin concerné :</span>
              <span class="care-badge">{{ selectedAvis.soinConcerne }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Note attribuée :</span>
              <div class="stars-inline">
                <span 
                  *ngFor="let star of stars" 
                  class="material-symbols-outlined star" 
                  [class.filled]="star <= selectedAvis.note">star</span>
                <span>({{ selectedAvis.note }} / 5)</span>
              </div>
            </div>

            <div class="detail-row">
              <span class="label">Date de dépôt :</span>
              <span>{{ formatDateTime(selectedAvis.dateCreation) }}</span>
            </div>

            <div class="detail-row" *ngIf="selectedAvis.dateDecision">
              <span class="label">Date de décision :</span>
              <span>{{ formatDateTime(selectedAvis.dateDecision) }}</span>
            </div>

            <div class="comment-full-box">
              <h4>Commentaire complet :</h4>
              <p class="comment-text">{{ selectedAvis.commentaire }}</p>
            </div>

          </div>

          <div class="modal-footer">
            <button 
              *ngIf="selectedAvis.statut !== 'APPROUVE'" 
              (click)="approuver(selectedAvis)" 
              class="btn-act approve">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Approuver l'avis</span>
            </button>

            <button 
              *ngIf="selectedAvis.statut !== 'REFUSE'" 
              (click)="refuser(selectedAvis)" 
              class="btn-act refuse">
              <span class="material-symbols-outlined">cancel</span>
              <span>Refuser l'avis</span>
            </button>

            <button 
              (click)="supprimer(selectedAvis)" 
              class="btn-act delete">
              <span class="material-symbols-outlined">delete</span>
              <span>Supprimer</span>
            </button>

            <button (click)="fermerModalDetail()" class="btn-close-footer">
              Fermer
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .admin-avis-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
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

      &:hover:not(:disabled) {
        background: #f8fafc;
      }

      .spin {
        animation: spin 1s linear infinite;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .alert-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;

      .icon { margin-right: 10px; }

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

      &.pending-count { background: #ef4444; color: #ffffff; }
      &.approved-count { background: #22c55e; color: #ffffff; }
      &.refused-count { background: #94a3b8; color: #ffffff; }
    }

    .content-card {
      position: relative;
    }

    .loading-overlay, .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: #64748b;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;

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

    .avis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .admin-avis-item {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
      }

      &.pending-item {
        border-left: 4px solid #ef4444;
        background: #fffdfd;
      }
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .author-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .author-name {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
    }

    .care-badge {
      font-size: 0.75rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #475569;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;

      .dot { width: 6px; height: 6px; border-radius: 50%; }

      &.en_attente {
        background: #fee2e2;
        color: #dc2626;
        .dot { background: #dc2626; }
      }

      &.approuve {
        background: #dcfce7;
        color: #166534;
        .dot { background: #166534; }
      }

      &.refuse {
        background: #f1f5f9;
        color: #64748b;
        .dot { background: #94a3b8; }
      }
    }

    .item-rating {
      display: flex;
      align-items: center;
      gap: 4px;

      .star {
        font-size: 18px;
        color: #cbd5e1;
        &.filled { color: #f59e0b; }
      }

      .rating-num {
        font-size: 0.85rem;
        font-weight: 700;
        color: #334155;
        margin-left: 4px;
      }

      .date-str {
        margin-left: auto;
        font-size: 0.8rem;
        color: #94a3b8;
      }
    }

    .item-body {
      .comment-preview {
        margin: 0;
        font-size: 0.9rem;
        color: #334155;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .item-actions {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }

    .btn-act {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: none;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;

      .material-symbols-outlined { font-size: 16px; }

      &.approve {
        background: #dcfce7;
        color: #15803d;
        &:hover { background: #bbf7d0; }
      }

      &.refuse {
        background: #fee2e2;
        color: #b91c1c;
        &:hover { background: #fca5a5; }
      }

      &.delete {
        background: #f1f5f9;
        color: #64748b;
        &:hover { background: #e2e8f0; color: #ef4444; }
      }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
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
      max-width: 560px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .modal-title-area {
        display: flex;
        flex-direction: column;
        gap: 6px;

        h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
        }
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
      gap: 12px;

      .detail-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;

        .label {
          width: 130px;
          color: #64748b;
          font-weight: 600;
        }

        .stars-inline {
          display: flex;
          align-items: center;
          gap: 2px;
          .star { font-size: 16px; color: #cbd5e1; &.filled { color: #f59e0b; } }
        }
      }

      .comment-full-box {
        margin-top: 10px;

        h4 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: #334155;
        }

        .comment-text {
          margin: 0;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.95rem;
          color: #0f172a;
          line-height: 1.6;
          white-space: pre-wrap; /* Render securely */
          word-break: break-word;
        }
      }
    }

    .modal-footer {
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn-close-footer {
      padding: 8px 16px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class AdminAvisComponent implements OnInit {
  avisList: AvisResponse[] = [];
  filtreStatut: 'TOUS' | StatutAvis = 'EN_ATTENTE';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  selectedAvis: AvisResponse | null = null;
  stars = [1, 2, 3, 4, 5];

  constructor(private avisService: AvisService) {}

  ngOnInit(): void {
    this.chargerAvis();
  }

  chargerAvis(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.avisService.obtenirTousAvisAdmin().subscribe({
      next: (data) => {
        this.avisList = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Accès refusé. Session expirée ou droits insuffisants.';
        } else {
          this.errorMessage = 'Impossible de charger les avis.';
        }
      }
    });
  }

  get filteredAvis(): AvisResponse[] {
    if (this.filtreStatut === 'TOUS') {
      return this.avisList;
    }
    return this.avisList.filter(a => a.statut === this.filtreStatut);
  }

  get pendingCount(): number {
    return this.avisList.filter(a => a.statut === 'EN_ATTENTE').length;
  }

  get approvedCount(): number {
    return this.avisList.filter(a => a.statut === 'APPROUVE').length;
  }

  get refusedCount(): number {
    return this.avisList.filter(a => a.statut === 'REFUSE').length;
  }

  changerFiltre(filtre: 'TOUS' | StatutAvis): void {
    this.filtreStatut = filtre;
  }

  ouvrirModalDetail(avis: AvisResponse): void {
    this.selectedAvis = avis;
  }

  fermerModalDetail(): void {
    this.selectedAvis = null;
  }

  approuver(avis: AvisResponse): void {
    this.avisService.approuverAvisAdmin(avis.id).subscribe({
      next: (res) => {
        this.successMessage = 'L’avis a été approuvé et est maintenant visible sur le site.';
        avis.statut = 'APPROUVE';
        avis.dateDecision = res.avis.dateDecision;
        if (this.selectedAvis && this.selectedAvis.id === avis.id) {
          this.selectedAvis.statut = 'APPROUVE';
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’approbation de l’avis.';
      }
    });
  }

  refuser(avis: AvisResponse): void {
    this.avisService.refuserAvisAdmin(avis.id).subscribe({
      next: (res) => {
        this.successMessage = 'L’avis a été refusé.';
        avis.statut = 'REFUSE';
        avis.dateDecision = res.avis.dateDecision;
        if (this.selectedAvis && this.selectedAvis.id === avis.id) {
          this.selectedAvis.statut = 'REFUSE';
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors du refus de l’avis.';
      }
    });
  }

  supprimer(avis: AvisResponse): void {
    if (!confirm(`Voulez-vous vraiment supprimer définitivement l'avis de ${avis.nomAuteur} ?`)) {
      return;
    }

    this.avisService.supprimerAvisAdmin(avis.id).subscribe({
      next: () => {
        this.successMessage = 'L’avis a été supprimé.';
        this.avisList = this.avisList.filter(a => a.id !== avis.id);
        if (this.selectedAvis && this.selectedAvis.id === avis.id) {
          this.fermerModalDetail();
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression de l’avis.';
      }
    });
  }

  getStatutLabel(statut: StatutAvis): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVE': return 'Approuvé';
      case 'REFUSE': return 'Refusé';
      default: return statut;
    }
  }

  formatDateTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    const d = new Date(dateTimeStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
