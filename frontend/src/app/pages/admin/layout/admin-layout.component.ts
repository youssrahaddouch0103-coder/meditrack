import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ContactService } from '../../../services/contact.service';
import { AvisService } from '../../../services/avis.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Admin Top Navbar -->
      <header class="admin-header">
        <div class="admin-header-content">
          
          <!-- Brand Logo & Title (Left Extremity) -->
          <div class="brand-area" (click)="goToDashboard()">
            <span class="material-symbols-outlined brand-icon">medical_services</span>
            <div class="brand-text">
              <span class="brand-title">YT Smile Center</span>
              <span class="brand-badge">Espace Admin</span>
            </div>
          </div>

          <!-- Desktop Navigation Bar (Center) -->
          <nav class="admin-navigation desktop-nav">
            <a routerLink="/admin/tableau-de-bord" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">dashboard</span>
              <span>Tableau de bord</span>
            </a>
            <a routerLink="/admin/rendez-vous" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">calendar_month</span>
              <span>Rendez-vous</span>
            </a>
            <a routerLink="/admin/soins" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">collections</span>
              <span>Soins & Photos</span>
            </a>
            <a routerLink="/admin/messages" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">mail</span>
              <span>Messages</span>
              <span class="unread-nav-badge" *ngIf="unreadMessagesCount > 0">{{ unreadMessagesCount }}</span>
            </a>
            <a routerLink="/admin/avis" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">rate_review</span>
              <span>Avis</span>
              <span class="unread-nav-badge" *ngIf="pendingAvisCount > 0">{{ pendingAvisCount }}</span>
            </a>
            <a routerLink="/admin/equipe" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">badge</span>
              <span>Équipe</span>
            </a>
            <a routerLink="/admin/contenu" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">settings_suggest</span>
              <span>Contenu du cabinet</span>
            </a>
            <a routerLink="/" class="nav-item external-link" target="_blank" (click)="closeMobileMenu()">
              <span class="material-symbols-outlined">open_in_new</span>
              <span>Voir le site</span>
            </a>
          </nav>

          <!-- User Actions & Logout (Right Extremity) -->
          <div class="admin-user-actions">
            <div class="user-info" [title]="userEmail">
              <span class="material-symbols-outlined user-avatar">account_circle</span>
              <span class="user-email">{{ userEmail }}</span>
            </div>

            <button (click)="logout()" class="btn-logout" title="Déconnexion">
              <span class="material-symbols-outlined">logout</span>
              <span class="btn-logout-text">Déconnexion</span>
            </button>

            <!-- Responsive Hamburger Toggle -->
            <button 
              type="button" 
              class="hamburger-btn" 
              (click)="toggleMobileMenu()" 
              [attr.aria-expanded]="isMobileMenuOpen" 
              title="Menu de navigation">
              <span class="material-symbols-outlined">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
            </button>
          </div>

        </div>

        <!-- Mobile Dropdown Navigation Panel -->
        <nav class="mobile-nav-panel" *ngIf="isMobileMenuOpen">
          <a routerLink="/admin/tableau-de-bord" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">dashboard</span>
            <span>Tableau de bord</span>
          </a>
          <a routerLink="/admin/rendez-vous" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">calendar_month</span>
            <span>Rendez-vous</span>
          </a>
          <a routerLink="/admin/soins" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">collections</span>
            <span>Soins & Photos</span>
          </a>
          <a routerLink="/admin/messages" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">mail</span>
            <span>Messages</span>
            <span class="unread-nav-badge" *ngIf="unreadMessagesCount > 0">{{ unreadMessagesCount }}</span>
          </a>
          <a routerLink="/admin/avis" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">rate_review</span>
            <span>Avis</span>
            <span class="unread-nav-badge" *ngIf="pendingAvisCount > 0">{{ pendingAvisCount }}</span>
          </a>
          <a routerLink="/admin/equipe" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">badge</span>
            <span>Équipe</span>
          </a>
          <a routerLink="/admin/contenu" routerLinkActive="active" class="mobile-nav-item" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">settings_suggest</span>
            <span>Contenu du cabinet</span>
          </a>
          <a routerLink="/" class="mobile-nav-item external-link" target="_blank" (click)="closeMobileMenu()">
            <span class="material-symbols-outlined">open_in_new</span>
            <span>Voir le site</span>
          </a>
        </nav>
      </header>

      <!-- Main Content Outlet -->
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      min-height: 100vh;
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background-color: #f8fafc;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .admin-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 0 20px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .admin-header-content {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: clamp(8px, 1.2vw, 20px);
      height: 68px;
    }

    .brand-area {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      white-space: nowrap;
      margin: 0;
      padding: 0;
    }

    .brand-icon {
      font-size: 28px;
      color: #0284c7;
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .brand-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }

    .brand-badge {
      font-size: 0.7rem;
      font-weight: 600;
      color: #0284c7;
      background: #e0f2fe;
      padding: 1px 6px;
      border-radius: 10px;
      display: inline-block;
      width: fit-content;
    }

    /* Desktop Navigation Bar */
    .admin-navigation.desktop-nav {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(2px, 0.5vw, 10px);
    }

    .nav-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: 8px;
      color: #64748b;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
      line-height: 1.2;
      transition: all 0.2s ease;

      .material-symbols-outlined {
        font-size: 19px;
      }

      &:hover {
        color: #0284c7;
        background: #f1f5f9;
      }

      &.active {
        color: #0284c7;
        background: #e0f2fe;
        font-weight: 600;
      }
    }

    .unread-nav-badge {
      background: #ef4444;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    /* User Actions & Logout (Right Extremity) */
    .admin-user-actions {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #475569;
      font-size: 0.85rem;
      min-width: 0;
    }

    .user-avatar {
      font-size: 22px;
      color: #64748b;
      flex-shrink: 0;
    }

    .user-email {
      max-width: 180px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 0.85rem;
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #ef4444;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #fef2f2;
        border-color: #fca5a5;
      }
    }

    /* Hamburger Menu Button */
    .hamburger-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #0f172a;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #e2e8f0;
        color: #0284c7;
      }
    }

    /* Mobile Dropdown Panel */
    .mobile-nav-panel {
      display: none;
      flex-direction: column;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 16px;
      gap: 6px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    }

    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: #475569;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.2s ease;

      .material-symbols-outlined {
        font-size: 22px;
        color: #64748b;
      }

      &:hover, &.active {
        color: #0284c7;
        background: #e0f2fe;
        font-weight: 600;

        .material-symbols-outlined {
          color: #0284c7;
        }
      }
    }

    /* Main Content Area */
    .admin-content {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 32px 20px;
      box-sizing: border-box;
    }

    /* RESPONSIVE BREAKPOINTS */
    @media (max-width: 1350px) {
      .admin-navigation.desktop-nav {
        display: none;
      }

      .hamburger-btn {
        display: flex;
      }

      .mobile-nav-panel {
        display: flex;
      }
    }

    @media (max-width: 640px) {
      .brand-title {
        display: none;
      }
      .user-email {
        display: none;
      }
      .btn-logout-text {
        display: none;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  unreadMessagesCount = 0;
  pendingAvisCount = 0;
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private contactService: ContactService,
    private avisService: AvisService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerCompteurs();
  }

  chargerCompteurs(): void {
    this.contactService.compterMessagesNonLusAdmin().subscribe({
      next: (res) => {
        this.unreadMessagesCount = res.count;
      },
      error: () => {}
    });

    this.avisService.compterAvisEnAttenteAdmin().subscribe({
      next: (res) => {
        this.pendingAvisCount = res.count;
      },
      error: () => {}
    });
  }

  get userEmail(): string {
    return this.authService.getUserEmail() || 'admin@meditrack.local';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (typeof window !== 'undefined' && window.innerWidth >= 1350) {
      this.closeMobileMenu();
    }
  }

  goToDashboard(): void {
    this.closeMobileMenu();
    this.router.navigate(['/admin/tableau-de-bord']);
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/admin/connexion']);
  }
}
