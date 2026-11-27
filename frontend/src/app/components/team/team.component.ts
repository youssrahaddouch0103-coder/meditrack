import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { TeamMember } from '../../models/team-member.model';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  isLoading = true;
  hasError = false;

  private fallbackTeamMembers: TeamMember[] = [
    {
      id: 1,
      nomComplet: 'Dr Youness Kâa',
      titre: 'Chirurgien-dentiste',
      photoUrl: 'assets/team-1.png',
      photoAlt: 'Dr Youness Kâa, Chirurgien-dentiste au cabinet YT Smile Center',
      description: 'Chirurgien-dentiste attentif et passionné, il accompagne chaque patient avec professionnalisme et bienveillance.',
      specialite: 'Chirurgie dentaire, Omnipratique, Soins esthétiques',
      specialtiesList: ['Chirurgie dentaire', 'Omnipratique', 'Soins esthétiques'],
      ordreAffichage: 1,
      actif: true
    },
    {
      id: 2,
      nomComplet: 'Dr Tarik',
      titre: 'Chirurgien-dentiste',
      photoUrl: 'assets/team-2.png',
      photoAlt: 'Dr Tarik, Chirurgien-dentiste au cabinet YT Smile Center',
      description: 'Chirurgien-dentiste attentif et engagé, il veille à offrir à chaque patient des soins de qualité dans un climat de confiance.',
      specialite: 'Chirurgie dentaire, Omnipratique, Soins préventifs',
      specialtiesList: ['Chirurgie dentaire', 'Omnipratique', 'Soins préventifs'],
      ordreAffichage: 2,
      actif: true
    }
  ];

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.chargerEquipe();
  }

  chargerEquipe(): void {
    this.isLoading = true;
    this.hasError = false;
    this.teamService.getPublicTeamMembers().subscribe({
      next: (members) => {
        if (members && members.length > 0) {
          this.teamMembers = members.map(m => ({
            ...m,
            specialtiesList: this.parseSpecialties(m.specialite)
          }));
        } else {
          this.teamMembers = this.fallbackTeamMembers;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'équipe, utilisation des données locales de secours :', err);
        this.teamMembers = this.fallbackTeamMembers;
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  parseSpecialties(specialite?: string): string[] {
    if (!specialite) return [];
    return specialite.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  trackByMemberId(index: number, item: TeamMember): number {
    return item.id;
  }

  getImageUrl(url?: string): string {
    return this.teamService.getImageUrl(url);
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && !imgElement.src.endsWith('assets/team-1.png')) {
      imgElement.src = 'assets/team-1.png';
    }
  }

  navigateToAppointment(event: Event): void {
    event.preventDefault();
    if (typeof document !== 'undefined') {
      const rdvElement = document.getElementById('rendez-vous');
      if (rdvElement) {
        rdvElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        const heroElement = document.getElementById('accueil');
        if (heroElement) {
          heroElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }
}
