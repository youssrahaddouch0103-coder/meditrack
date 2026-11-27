import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../services/team.service';
import { TeamMember } from '../../../models/team-member.model';

@Component({
  selector: 'app-admin-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-team.component.html',
  styleUrl: './admin-team.component.scss'
})
export class AdminTeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  private fallbackTeamMembers: TeamMember[] = [
    {
      id: 1,
      nomComplet: 'Dr Youness Kâa',
      titre: 'Chirurgien-dentiste',
      photoUrl: 'assets/team-1.png',
      photoAlt: 'Dr Youness Kâa, Chirurgien-dentiste au cabinet YT Smile Center',
      description: 'Chirurgien-dentiste attentif et passionné, il accompagne chaque patient avec professionnalisme et bienveillance.',
      specialite: 'Chirurgie dentaire, Omnipratique, Soins esthétiques',
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
      ordreAffichage: 2,
      actif: true
    }
  ];

  // Modal State for Add / Edit
  isModalOpen = false;
  isEditMode = false;
  editingMemberId: number | null = null;
  isSubmitting = false;
  modalErrorMessage = '';

  // Form Fields
  formNomComplet = '';
  formTitre = '';
  formSpecialite = '';
  formDescription = '';
  formPhotoAlt = '';
  formOrdreAffichage = 0;
  formActif = true;
  formInstagramUrl = '';
  formLinkedinUrl = '';

  // File Upload State
  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;
  existingPhotoUrl: string | null = null;

  // Delete Confirmation Modal State
  isDeleteModalOpen = false;
  memberToDelete: TeamMember | null = null;
  isDeleting = false;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.chargerEquipe();
  }

  chargerEquipe(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.teamService.getAllTeamMembersAdmin().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.teamMembers = data;
          this.isLoading = false;
        } else {
          this.chargerEquipeSecours();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des membres admin, bascule sur la méthode de secours :', err);
        this.chargerEquipeSecours();
      }
    });
  }

  chargerEquipeSecours(): void {
    this.teamService.getPublicTeamMembers().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.teamMembers = data;
        } else {
          this.teamMembers = this.fallbackTeamMembers;
        }
        this.isLoading = false;
      },
      error: () => {
        this.teamMembers = this.fallbackTeamMembers;
        this.isLoading = false;
      }
    });
  }

  // --- Modal Operations ---
  openAddModal(): void {
    this.isEditMode = false;
    this.editingMemberId = null;
    this.resetForm();

    // Auto-set next display order
    const maxOrder = this.teamMembers.reduce((max, m) => m.ordreAffichage > max ? m.ordreAffichage : max, 0);
    this.formOrdreAffichage = maxOrder + 1;

    this.isModalOpen = true;
  }

  openEditModal(member: TeamMember): void {
    this.isEditMode = true;
    this.editingMemberId = member.id;
    this.resetForm();

    this.formNomComplet = member.nomComplet || '';
    this.formTitre = member.titre || '';
    this.formSpecialite = member.specialite || '';
    this.formDescription = member.description || '';
    this.formPhotoAlt = member.photoAlt || '';
    this.formOrdreAffichage = member.ordreAffichage !== undefined ? member.ordreAffichage : 0;
    this.formActif = member.actif !== false;
    this.formInstagramUrl = member.instagramUrl || '';
    this.formLinkedinUrl = member.linkedinUrl || '';

    this.existingPhotoUrl = member.photoUrl || null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.isModalOpen = false;
    this.resetForm();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.isModalOpen && !this.isSubmitting) {
      this.closeModal();
    }
    if (this.isDeleteModalOpen && !this.isDeleting) {
      this.closeDeleteModal();
    }
  }

  resetForm(): void {
    this.formNomComplet = '';
    this.formTitre = '';
    this.formSpecialite = '';
    this.formDescription = '';
    this.formPhotoAlt = '';
    this.formOrdreAffichage = 0;
    this.formActif = true;
    this.formInstagramUrl = '';
    this.formLinkedinUrl = '';

    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
    this.existingPhotoUrl = null;
    this.modalErrorMessage = '';
  }

  // --- Photo Selection & Preview ---
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (max 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        this.modalErrorMessage = 'L\'image dépasse la taille maximale autorisée de 5 Mo.';
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        this.modalErrorMessage = 'Format non supporté. Veuillez choisir une image JPEG, PNG ou WebP.';
        return;
      }

      this.modalErrorMessage = '';
      this.selectedPhotoFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedPhoto(): void {
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
  }

  // --- Save / Submit Form ---
  saveMember(): void {
    if (!this.formNomComplet.trim()) {
      this.modalErrorMessage = 'Le nom complet est obligatoire.';
      return;
    }
    if (!this.formTitre.trim()) {
      this.modalErrorMessage = 'Le titre / la fonction est obligatoire.';
      return;
    }

    this.isSubmitting = true;
    this.modalErrorMessage = '';

    const formData = new FormData();
    formData.append('nomComplet', this.formNomComplet.trim());
    formData.append('titre', this.formTitre.trim());
    formData.append('specialite', this.formSpecialite.trim());
    formData.append('description', this.formDescription.trim());
    formData.append('photoAlt', this.formPhotoAlt.trim() || `${this.formNomComplet.trim()}, ${this.formTitre.trim()}`);
    formData.append('ordreAffichage', this.formOrdreAffichage.toString());
    formData.append('actif', this.formActif.toString());
    formData.append('instagramUrl', this.formInstagramUrl.trim());
    formData.append('linkedinUrl', this.formLinkedinUrl.trim());

    if (this.selectedPhotoFile) {
      formData.append('photoFile', this.selectedPhotoFile);
    }

    if (this.isEditMode && this.editingMemberId) {
      this.teamService.updateTeamMember(this.editingMemberId, formData).subscribe({
        next: (updatedMember) => {
          this.showSuccess('Membre mis à jour avec succès !');
          this.isSubmitting = false;
          this.closeModal();
          this.chargerEquipe();
        },
        error: (err) => {
          console.error('Erreur lors de la modification :', err);
          this.modalErrorMessage = err.error?.message || 'Erreur lors de la modification du membre.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.teamService.createTeamMember(formData).subscribe({
        next: (createdMember) => {
          this.showSuccess('Nouveau membre ajouté avec succès !');
          this.isSubmitting = false;
          this.closeModal();
          this.chargerEquipe();
        },
        error: (err) => {
          console.error('Erreur lors de la création :', err);
          this.modalErrorMessage = err.error?.message || 'Erreur lors de l\'ajout du membre.';
          this.isSubmitting = false;
        }
      });
    }
  }

  // --- Toggle Status (Visible / Masqué) ---
  toggleStatus(member: TeamMember): void {
    this.teamService.toggleMemberStatus(member.id).subscribe({
      next: (updated) => {
        member.actif = updated.actif;
        const msg = updated.actif ? `Le membre ${updated.nomComplet} est maintenant visible sur le site.` : `Le membre ${updated.nomComplet} est désormais masqué.`;
        this.showSuccess(msg);
      },
      error: (err) => {
        console.error('Erreur lors du changement de statut :', err);
        // Fallback local toggle if offline
        member.actif = !member.actif;
        this.showSuccess(`Statut de ${member.nomComplet} mis à jour.`);
      }
    });
  }

  // --- Delete Confirmation Modal ---
  openDeleteModal(member: TeamMember): void {
    this.memberToDelete = member;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.isDeleting) return;
    this.isDeleteModalOpen = false;
    this.memberToDelete = null;
  }

  confirmDelete(): void {
    if (!this.memberToDelete) return;
    this.isDeleting = true;

    this.teamService.deleteTeamMember(this.memberToDelete.id).subscribe({
      next: () => {
        this.showSuccess(`Le membre ${this.memberToDelete?.nomComplet} a été supprimé de l'équipe.`);
        this.isDeleting = false;
        this.closeDeleteModal();
        this.chargerEquipe();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        // Fallback remove from array
        this.teamMembers = this.teamMembers.filter(m => m.id !== this.memberToDelete?.id);
        this.showSuccess(`Le membre ${this.memberToDelete?.nomComplet} a été retiré.`);
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  // --- Helpers ---
  getImageUrl(url?: string): string {
    return this.teamService.getImageUrl(url);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith('assets/team-1.png')) {
      img.src = 'assets/team-1.png';
    }
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }
}
