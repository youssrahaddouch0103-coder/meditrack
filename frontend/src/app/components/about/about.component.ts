import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabinetSettingsService } from '../../services/cabinet-settings.service';
import { CabinetSettings } from '../../models/cabinet-settings.model';
import { CABINET_INFO } from '../../config/cabinet.config';

export interface AboutFeature {
  id: string;
  icon: string;
  title: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  cabinet = CABINET_INFO;
  settings: CabinetSettings = {};

  features: AboutFeature[] = [
    {
      id: 'accompagnement',
      icon: 'person_heart',
      title: 'Accompagnement personnalisé'
    },
    {
      id: 'technologies',
      icon: 'biotech',
      title: 'Technologies modernes'
    },
    {
      id: 'environnement',
      icon: 'spa',
      title: 'Environnement accueillant'
    }
  ];

  constructor(private settingsService: CabinetSettingsService) {}

  ngOnInit(): void {
    this.settingsService.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
      }
    });
  }

  getImageUrl(url?: string): string {
    return this.settingsService.getImageUrl(url, 'assets/about-cabinet.png');
  }

  formatInstagramHandle(url?: string): string {
    return this.settingsService.formatInstagramHandle(url);
  }

  navigateToTeam(event: Event): void {
    event.preventDefault();
    if (typeof document !== 'undefined') {
      const teamElement = document.getElementById('equipe');
      if (teamElement) {
        teamElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'equipe';
      }
    }
  }
}
