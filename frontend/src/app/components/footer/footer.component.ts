import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CabinetSettingsService } from '../../services/cabinet-settings.service';
import { CabinetSettings } from '../../models/cabinet-settings.model';
import { CABINET_INFO } from '../../config/cabinet.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  cabinet = CABINET_INFO;
  settings: CabinetSettings = {};
  currentYear: number = new Date().getFullYear();

  quickLinks = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'cabinet', label: 'Le cabinet' },
    { id: 'soins', label: 'Soins' },
    { id: 'equipe', label: 'Équipe' },
    { id: 'rendez-vous', label: 'Rendez-vous' },
    { id: 'contact', label: 'Contact' }
  ];

  constructor(
    private authService: AuthService,
    private settingsService: CabinetSettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.settingsService.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
      }
    });
  }

  formatPhoneRaw(phone?: string): string {
    return this.settingsService.formatPhoneRaw(phone);
  }

  formatWhatsAppLink(phone?: string): string {
    return this.settingsService.formatWhatsAppLink(phone);
  }

  formatInstagramHandle(url?: string): string {
    return this.settingsService.formatInstagramHandle(url);
  }

  formatLocationDisplay(): string {
    return this.settingsService.formatLocationDisplay(this.settings);
  }

  formatWeekdayHours(): string {
    return `${this.settings.mondayMorning || '09:30 - 13:00'} | ${this.settings.mondayAfternoon || '15:30 - 19:00'}`;
  }

  formatSaturdayHours(): string {
    return this.settings.saturdayMorning || '09:30 - 13:00';
  }

  scrollToSection(id: string, event: Event): void {
    event.preventDefault();
    if (typeof document !== 'undefined') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = id;
      }
    }
  }

  onAdminAccess(event: Event): void {
    event.preventDefault();
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/tableau-de-bord']);
    } else {
      this.authService.logout();
      this.router.navigate(['/admin/connexion']);
    }
  }

  preventDisabledClick(event: MouseEvent): void {
    event.preventDefault();
  }
}
