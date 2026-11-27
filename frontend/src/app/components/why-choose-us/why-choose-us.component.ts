import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CabinetSettingsService } from '../../services/cabinet-settings.service';
import { CabinetSettings } from '../../models/cabinet-settings.model';

export interface Advantage {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.scss'
})
export class WhyChooseUsComponent implements OnInit {
  settings: CabinetSettings = {};

  advantages: Advantage[] = [
    {
      id: 'equipe',
      icon: 'groups',
      title: 'Équipe qualifiée et à l’écoute',
      description: 'Des praticiens d’expérience et une équipe attentive qui prennent le temps de vous écouter, de vous rassurer et de personnaliser vos soins.'
    },
    {
      id: 'equipement',
      icon: 'biotech',
      title: 'Équipements modernes',
      description: 'Un plateau technique de dernière génération avec imagerie numérique 3D et empreinte optique pour des diagnostics fiables et un confort maximal.'
    },
    {
      id: 'hygiene',
      icon: 'verified_user',
      title: 'Hygiène et sécurité rigoureuses',
      description: 'Protocoles de stérilisation et de désinfection appliqués en continu selon les normes sanitaires hospitalières les plus exigeantes.'
    },
    {
      id: 'personnalise',
      icon: 'person_heart',
      title: 'Soins personnalisés',
      description: 'Chaque plan de traitement est élaboré sur mesure en fonction de votre santé bucco-dentaire, vos attentes esthétiques et votre budget.'
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
    return this.settingsService.getImageUrl(url, 'assets/why-us-clinic.png');
  }
}
