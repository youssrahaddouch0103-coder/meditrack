import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { CABINET_INFO } from '../../config/cabinet.config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  cabinet = CABINET_INFO;
  isMenuOpen = false;
  activeLink = 'accueil';

  navLinks = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'cabinet', label: 'Le cabinet' },
    { id: 'soins', label: 'Soins' },
    { id: 'equipe', label: 'Équipe' },
    { id: 'contact', label: 'Contact' }
  ];

  constructor(public themeService: ThemeService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  setActive(id: string, event?: Event) {
    this.activeLink = id;
    this.isMenuOpen = false;
    if (event && typeof document !== 'undefined') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  navigateToAppointment(event: Event): void {
    event.preventDefault();
    this.setActive('rendez-vous');
    if (typeof document !== 'undefined') {
      const rdvElement = document.getElementById('rendez-vous');
      if (rdvElement) {
        rdvElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'rendez-vous';
      }
    }
  }
}
