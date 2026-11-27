import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabinetSettingsService } from '../../services/cabinet-settings.service';
import { CabinetSettings } from '../../models/cabinet-settings.model';
import { CABINET_INFO } from '../../config/cabinet.config';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  cabinet = CABINET_INFO;
  settings: CabinetSettings = {};

  heroHighlights = [
    { icon: 'health_and_safety', title: 'Soins personnalisés' },
    { icon: 'verified_user', title: 'Équipe qualifiée' },
    { icon: 'location_on', title: 'Témara, Maroc' }
  ];

  constructor(private settingsService: CabinetSettingsService) {}

  ngOnInit(): void {
    this.settingsService.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
        this.heroHighlights[2].title = this.settingsService.formatLocationDisplay(settings);
      }
    });
  }

  getImageUrl(url?: string): string {
    return this.settingsService.getImageUrl(url, 'assets/hero-dentist.png');
  }
}
