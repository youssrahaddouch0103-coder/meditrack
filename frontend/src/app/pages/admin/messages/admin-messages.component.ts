import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { MessageContactResponse } from '../../../models/contact.model';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-messages-page">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Messages de Contact</h1>
          <p class="page-subtitle">Consultez et gérez les messages reçus depuis le formulaire public du site</p>
        </div>

        <button (click)="chargerMessages()" class="btn-refresh" [disabled]="isLoading">
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

      <!-- Filters & Counter Bar -->
      <div class="filters-card">
        <div class="filter-tabs">
          <button 
            class="tab-btn" 
            [class.active]="filterLu === 'TOUS'"
            (click)="changerFiltre('TOUS')">
            <span>Tous les messages</span>
            <span class="count-badge">{{ messagesList.length }}</span>
          </button>

          <button 
            class="tab-btn" 
            [class.active]="filterLu === 'NON_LU'"
            (click)="changerFiltre('NON_LU')">
            <span>Non lus</span>
            <span class="count-badge unread-count">{{ unreadCount }}</span>
          </button>

          <button 
            class="tab-btn" 
            [class.active]="filterLu === 'LU'"
            (click)="changerFiltre('LU')">
            <span>Lus</span>
            <span class="count-badge">{{ readCount }}</span>
          </button>
        </div>
      </div>

      <!-- Messages Table Section -->
      <div class="table-card">
        
        <div class="loading-overlay" *ngIf="isLoading">
          <span class="material-symbols-outlined spinner">sync</span>
          <p>Chargement des messages...</p>
        </div>

        <div class="empty-state" *ngIf="!isLoading && filteredMessages.length === 0">
          <span class="material-symbols-outlined empty-icon">mail</span>
          <h3>Aucun message trouvé</h3>
          <p>Aucun message ne correspond au filtre sélectionné.</p>
        </div>

        <div class="table-responsive" *ngIf="!isLoading && filteredMessages.length > 0">
          <table class="messages-table">
            <thead>
              <tr>
                <th>État</th>
                <th>Expéditeur</th>
                <th>Coordonnées</th>
                <th>Sujet</th>
                <th>Aperçu du message</th>
                <th>Date & Heure</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let msg of filteredMessages" 
                [class.unread-row]="!msg.lu"
                (click)="ouvrirModalDetail(msg)">
                
                <td>
                  <span class="status-badge" [class.read]="msg.lu" [class.unread]="!msg.lu">
                    <span class="dot"></span>
                    {{ msg.lu ? 'Lu' : 'Non lu' }}
                  </span>
                </td>

                <td>
                  <strong class="sender-name">{{ msg.nomComplet }}</strong>
                </td>

                <td (click)="$event.stopPropagation()">
                  <div class="contact-links">
                    <a [href]="'mailto:' + msg.email" class="contact-link">
                      <span class="material-symbols-outlined icon-sm">mail</span> {{ msg.email }}
                    </a>
                    <a *ngIf="msg.telephone" [href]="'tel:' + msg.telephone" class="contact-link tel">
                      <span class="material-symbols-outlined icon-sm">call</span> {{ msg.telephone }}
                    </a>
                    <span *ngIf="!msg.telephone" class="no-tel">Non renseigné</span>
                  </div>
                </td>

                <td>
                  <span class="subject-tag">{{ msg.sujet }}</span>
                </td>

                <td>
                  <div class="message-preview" title="{{ msg.message }}">
                    {{ getPreviewText(msg.message) }}
                  </div>
                </td>

                <td>
                  <span class="datetime-str">{{ formatDateTime(msg.dateEnvoi) }}</span>
                </td>

                <td (click)="$event.stopPropagation()">
                  <div class="actions-cell">
                    
                    <!-- Toggle Read/Unread -->
                    <button 
                      *ngIf="!msg.lu"
                      (click)="basculerEtatLu(msg, true)"
                      class="btn-action mark-read"
                      title="Marquer comme lu">
                      <span class="material-symbols-outlined">mark_email_read</span>
                      <span>Marquer lu</span>
                    </button>

                    <button 
                      *ngIf="msg.lu"
                      (click)="basculerEtatLu(msg, false)"
                      class="btn-action mark-unread"
                      title="Remettre en non lu">
                      <span class="material-symbols-outlined">mark_email_unread</span>
                      <span>Remettre non lu</span>
                    </button>

                    <!-- Delete Button -->
                    <button 
                      (click)="supprimerMessage(msg)"
                      class="btn-action delete"
                      title="Supprimer le message">
                      <span class="material-symbols-outlined">delete</span>
                    </button>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Message Detail Modal -->
      <div class="modal-backdrop" *ngIf="selectedMessage">
        <div class="modal-card">
          
          <div class="modal-header">
            <div class="modal-title-area">
              <span class="status-badge" [class.read]="selectedMessage.lu" [class.unread]="!selectedMessage.lu">
                <span class="dot"></span>
                {{ selectedMessage.lu ? 'Message Lu' : 'Nouveau Message' }}
              </span>
              <h3>{{ selectedMessage.sujet }}</h3>
            </div>
            <button class="btn-modal-close" (click)="fermerModalDetail()">×</button>
          </div>

          <div class="modal-body">
            
            <div class="sender-info-box">
              <div class="info-row">
                <span class="info-label">Expéditeur :</span>
                <strong class="info-val">{{ selectedMessage.nomComplet }}</strong>
              </div>

              <div class="info-row">
                <span class="info-label">Adresse E-mail :</span>
                <a [href]="'mailto:' + selectedMessage.email" class="email-link">
                  <span class="material-symbols-outlined icon-sm">mail</span>
                  {{ selectedMessage.email }}
                </a>
              </div>

              <div class="info-row" *ngIf="selectedMessage.telephone">
                <span class="info-label">Téléphone :</span>
                <a [href]="'tel:' + selectedMessage.telephone" class="tel-link">
                  <span class="material-symbols-outlined icon-sm">call</span>
                  {{ selectedMessage.telephone }}
                </a>
              </div>

              <div class="info-row">
                <span class="info-label">Date d'envoi :</span>
                <span class="info-val">{{ formatDateTime(selectedMessage.dateEnvoi) }}</span>
              </div>
            </div>

            <!-- Full Message Body (Text Only, no innerHTML) -->
            <div class="message-content-box">
              <h4 class="box-title">Contenu du message :</h4>
              <p class="message-text">{{ selectedMessage.message }}</p>
            </div>

          </div>

          <div class="modal-footer">
            
            <button 
              *ngIf="!selectedMessage.lu" 
              (click)="basculerEtatLu(selectedMessage, true)" 
              class="btn-modal-action mark-read">
              <span class="material-symbols-outlined">mark_email_read</span>
              <span>Marquer comme lu</span>
            </button>

            <button 
              *ngIf="selectedMessage.lu" 
              (click)="basculerEtatLu(selectedMessage, false)" 
              class="btn-modal-action mark-unread">
              <span class="material-symbols-outlined">mark_email_unread</span>
              <span>Remettre en non lu</span>
            </button>

            <button 
              (click)="supprimerMessage(selectedMessage)" 
              class="btn-modal-action delete">
              <span class="material-symbols-outlined">delete</span>
              <span>Supprimer</span>
            </button>

            <button (click)="fermerModalDetail()" class="btn-modal-close-footer">
              Fermer
            </button>

          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .admin-messages-page {
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

      &.unread-count {
        background: #ef4444;
        color: #ffffff;
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

    .messages-table {
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

      tr {
        cursor: pointer;
        transition: background 0.15s ease;

        &:hover {
          background: #f8fafc;
        }

        &.unread-row {
          background: #f0f9ff;
          font-weight: 600;

          &:hover {
            background: #e0f2fe;
          }

          .sender-name {
            color: #0369a1;
            font-size: 0.95rem;
          }
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

      &.unread {
        background: #fee2e2;
        color: #dc2626;
        .dot { background: #dc2626; }
      }

      &.read {
        background: #f1f5f9;
        color: #64748b;
        .dot { background: #94a3b8; }
      }
    }

    .contact-links {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.85rem;

      .contact-link {
        color: #0284c7;
        text-decoration: none;

        &:hover { text-decoration: underline; }

        &.tel { color: #475569; }

        .icon-sm {
          font-size: 14px;
          vertical-align: middle;
        }
      }

      .no-tel {
        font-size: 0.8rem;
        color: #94a3b8;
        font-style: italic;
      }
    }

    .subject-tag {
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-block;
    }

    .message-preview {
      max-width: 260px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #475569;
      font-size: 0.85rem;
    }

    .datetime-str {
      font-size: 0.85rem;
      color: #64748b;
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
      padding: 6px 10px;
      border: none;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      .material-symbols-outlined { font-size: 16px; }

      &.mark-read {
        background: #e0f2fe;
        color: #0284c7;
        &:hover { background: #bae6fd; }
      }

      &.mark-unread {
        background: #f1f5f9;
        color: #64748b;
        &:hover { background: #e2e8f0; }
      }

      &.delete {
        background: #fef2f2;
        color: #dc2626;
        padding: 6px;
        &:hover { background: #fee2e2; }
      }
    }

    /* Modal Styles */
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
      max-width: 600px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
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
        gap: 8px;

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
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .sender-info-box {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .info-row {
        display: flex;
        gap: 12px;
        font-size: 0.9rem;

        .info-label {
          width: 110px;
          color: #64748b;
          font-weight: 600;
        }

        .info-val { color: #0f172a; }

        .email-link, .tel-link {
          color: #0284c7;
          text-decoration: none;
          font-weight: 600;

          &:hover { text-decoration: underline; }

          .icon-sm { font-size: 16px; vertical-align: middle; }
        }
      }
    }

    .message-content-box {
      .box-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: #334155;
        margin: 0 0 10px 0;
      }

      .message-text {
        margin: 0;
        padding: 16px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        font-size: 0.95rem;
        color: #0f172a;
        line-height: 1.6;
        white-space: pre-wrap; /* Preserve text formatting securely */
        word-break: break-word;
      }
    }

    .modal-footer {
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-modal-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;

      .material-symbols-outlined { font-size: 18px; }

      &.mark-read {
        background: #e0f2fe;
        color: #0284c7;
        &:hover { background: #bae6fd; }
      }

      &.mark-unread {
        background: #f1f5f9;
        color: #475569;
        &:hover { background: #e2e8f0; }
      }

      &.delete {
        background: #fef2f2;
        color: #dc2626;
        &:hover { background: #fee2e2; }
      }
    }

    .btn-modal-close-footer {
      padding: 8px 16px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;

      &:hover { background: #f1f5f9; }
    }
  `]
})
export class AdminMessagesComponent implements OnInit {
  messagesList: MessageContactResponse[] = [];
  filterLu: 'TOUS' | 'LU' | 'NON_LU' = 'TOUS';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  selectedMessage: MessageContactResponse | null = null;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.chargerMessages();
  }

  chargerMessages(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactService.obtenirMessagesAdmin().subscribe({
      next: (data) => {
        this.messagesList = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Accès refusé. Session expirée ou droits insuffisants.';
        } else {
          this.errorMessage = 'Impossible de charger la liste des messages de contact.';
        }
      }
    });
  }

  get filteredMessages(): MessageContactResponse[] {
    if (this.filterLu === 'NON_LU') {
      return this.messagesList.filter(m => !m.lu);
    }
    if (this.filterLu === 'LU') {
      return this.messagesList.filter(m => m.lu);
    }
    return this.messagesList;
  }

  get unreadCount(): number {
    return this.messagesList.filter(m => !m.lu).length;
  }

  get readCount(): number {
    return this.messagesList.filter(m => m.lu).length;
  }

  changerFiltre(filtre: 'TOUS' | 'LU' | 'NON_LU'): void {
    this.filterLu = filtre;
  }

  ouvrirModalDetail(msg: MessageContactResponse): void {
    this.selectedMessage = msg;
    // Si le message est non lu, le marquer automatiquement comme lu lors de la consultation
    if (!msg.lu) {
      this.basculerEtatLu(msg, true);
    }
  }

  fermerModalDetail(): void {
    this.selectedMessage = null;
  }

  basculerEtatLu(msg: MessageContactResponse, lu: boolean): void {
    const actionObs = lu 
      ? this.contactService.marquerCommeLuAdmin(msg.id)
      : this.contactService.marquerCommeNonLuAdmin(msg.id);

    actionObs.subscribe({
      next: (updated) => {
        msg.lu = updated.lu;
        if (this.selectedMessage && this.selectedMessage.id === msg.id) {
          this.selectedMessage.lu = updated.lu;
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors du changement d’état du message.';
      }
    });
  }

  supprimerMessage(msg: MessageContactResponse): void {
    if (!confirm(`Voulez-vous vraiment supprimer le message de ${msg.nomComplet} ("${msg.sujet}") ?`)) {
      return;
    }

    this.contactService.supprimerMessageAdmin(msg.id).subscribe({
      next: () => {
        this.successMessage = 'Message supprimé avec succès.';
        this.messagesList = this.messagesList.filter(m => m.id !== msg.id);
        if (this.selectedMessage && this.selectedMessage.id === msg.id) {
          this.fermerModalDetail();
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression du message.';
      }
    });
  }

  getPreviewText(text: string): string {
    if (!text) return '';
    return text.length > 60 ? text.substring(0, 60) + '...' : text;
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
