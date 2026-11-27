import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CabinetSettingsService } from '../../../services/cabinet-settings.service';
import { AuthService } from '../../../services/auth.service';
import { CabinetSettings } from '../../../models/cabinet-settings.model';
import { AdminAccountInfoResponse } from '../../../models/auth.model';

@Component({
  selector: 'app-admin-cabinet-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-cabinet-settings.component.html',
  styleUrl: './admin-cabinet-settings.component.scss'
})
export class AdminCabinetSettingsComponent implements OnInit {

  settings: CabinetSettings = {};
  adminAccount: AdminAccountInfoResponse | null = null;
  activeSection: 'cabinet' | 'security' = 'cabinet';

  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  isDirty = false;

  // Modals et formulaires de sécurité
  showLoginEmailModal = false;
  showPasswordModal = false;
  showEmergencyCodesModal = false;

  loginEmailForm = { newLoginEmail: '', currentPassword: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  generatedCodes: string[] = [];
  generatedWarning = '';
  securitySuccess = '';
  securityError = '';
  isSecuritySubmitting = false;
  showCurrentPassword = false;
  showNewPassword = false;
  copiedCodes = false;

  // Selected Photo Files & Previews
  heroFile: File | null = null;
  heroPreview: string | null = null;

  whyFile: File | null = null;
  whyPreview: string | null = null;

  aboutFile: File | null = null;
  aboutPreview: string | null = null;

  constructor(
    private cabinetSettingsService: CabinetSettingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerParametres();
    this.chargerCompteAdmin();
  }

  chargerCompteAdmin(): void {
    this.authService.getAdminAccountInfo().subscribe({
      next: (info) => {
        this.adminAccount = info;
      },
      error: (err) => {
        console.error('Erreur chargement infos sécurité admin :', err);
      }
    });
  }

  chargerParametres(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cabinetSettingsService.getAdminSettings().subscribe({
      next: (data) => {
        this.settings = { ...data };
        this.isLoading = false;
        this.isDirty = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des paramètres du cabinet :', err);
        this.errorMessage = 'Impossible de charger la configuration du cabinet.';
        this.isLoading = false;
      }
    });
  }

  markAsDirty(): void {
    this.isDirty = true;
  }

  // --- Photo Handling ---
  onPhotoSelected(event: Event, type: 'hero' | 'why' | 'about'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate size (8 Mo max)
      if (file.size > 8 * 1024 * 1024) {
        this.errorMessage = 'L\'image dépasse la taille maximale autorisée de 8 Mo.';
        return;
      }

      // Validate format
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        this.errorMessage = 'Format non supporté. Veuillez choisir une image JPEG, PNG ou WebP.';
        return;
      }

      this.errorMessage = '';
      this.markAsDirty();

      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'hero') {
          this.heroFile = file;
          this.heroPreview = reader.result as string;
        } else if (type === 'why') {
          this.whyFile = file;
          this.whyPreview = reader.result as string;
        } else if (type === 'about') {
          this.aboutFile = file;
          this.aboutPreview = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  cancelPhotoSelection(type: 'hero' | 'why' | 'about'): void {
    if (type === 'hero') {
      this.heroFile = null;
      this.heroPreview = null;
    } else if (type === 'why') {
      this.whyFile = null;
      this.whyPreview = null;
    } else if (type === 'about') {
      this.aboutFile = null;
      this.aboutPreview = null;
    }
  }

  // --- Save Settings ---
  saveSettings(): void {
    // Basic validation
    if (this.settings.email && !this.isValidEmail(this.settings.email)) {
      this.errorMessage = 'Veuillez saisir une adresse e-mail valide.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();

    // Text fields
    if (this.settings.heroImageAlt) formData.append('heroImageAlt', this.settings.heroImageAlt);
    if (this.settings.whyChooseUsImageAlt) formData.append('whyChooseUsImageAlt', this.settings.whyChooseUsImageAlt);
    if (this.settings.aboutImageAlt) formData.append('aboutImageAlt', this.settings.aboutImageAlt);

    if (this.settings.landlinePhone) formData.append('landlinePhone', this.settings.landlinePhone);
    if (this.settings.mobilePhone) formData.append('mobilePhone', this.settings.mobilePhone);
    if (this.settings.email) formData.append('email', this.settings.email);
    if (this.settings.instagramUrl) formData.append('instagramUrl', this.settings.instagramUrl);

    if (this.settings.addressLine) formData.append('addressLine', this.settings.addressLine);
    if (this.settings.city) formData.append('city', this.settings.city);
    if (this.settings.postalCode) formData.append('postalCode', this.settings.postalCode);
    if (this.settings.country) formData.append('country', this.settings.country);

    if (this.settings.googleMapsUrl) formData.append('googleMapsUrl', this.settings.googleMapsUrl);

    if (this.settings.mondayMorning) formData.append('mondayMorning', this.settings.mondayMorning);
    if (this.settings.mondayAfternoon) formData.append('mondayAfternoon', this.settings.mondayAfternoon);
    if (this.settings.tuesdayMorning) formData.append('tuesdayMorning', this.settings.tuesdayMorning);
    if (this.settings.tuesdayAfternoon) formData.append('tuesdayAfternoon', this.settings.tuesdayAfternoon);
    if (this.settings.wednesdayMorning) formData.append('wednesdayMorning', this.settings.wednesdayMorning);
    if (this.settings.wednesdayAfternoon) formData.append('wednesdayAfternoon', this.settings.wednesdayAfternoon);
    if (this.settings.thursdayMorning) formData.append('thursdayMorning', this.settings.thursdayMorning);
    if (this.settings.thursdayAfternoon) formData.append('thursdayAfternoon', this.settings.thursdayAfternoon);
    if (this.settings.fridayMorning) formData.append('fridayMorning', this.settings.fridayMorning);
    if (this.settings.fridayAfternoon) formData.append('fridayAfternoon', this.settings.fridayAfternoon);
    if (this.settings.saturdayMorning) formData.append('saturdayMorning', this.settings.saturdayMorning);
    if (this.settings.saturdayAfternoon) formData.append('saturdayAfternoon', this.settings.saturdayAfternoon);
    if (this.settings.sundayMorning) formData.append('sundayMorning', this.settings.sundayMorning);
    if (this.settings.sundayAfternoon) formData.append('sundayAfternoon', this.settings.sundayAfternoon);

    // Photos
    if (this.heroFile) formData.append('heroPhoto', this.heroFile);
    if (this.whyFile) formData.append('whyChooseUsPhoto', this.whyFile);
    if (this.aboutFile) formData.append('aboutPhoto', this.aboutFile);

    this.cabinetSettingsService.updateAdminSettings(formData).subscribe({
      next: (updated) => {
        this.settings = { ...updated };
        this.heroFile = null;
        this.heroPreview = null;
        this.whyFile = null;
        this.whyPreview = null;
        this.aboutFile = null;
        this.aboutPreview = null;

        this.isSaving = false;
        this.isDirty = false;
        this.showSuccess('Toutes les modifications du cabinet ont été enregistrées avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde :', err);
        this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement des modifications.';
        this.isSaving = false;
      }
    });
  }

  cancelModifications(): void {
    this.cancelPhotoSelection('hero');
    this.cancelPhotoSelection('why');
    this.cancelPhotoSelection('about');
    this.chargerParametres();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isDirty) {
      $event.returnValue = true;
    }
  }

  // --- Helpers ---
  getImageUrl(url?: string, defaultAsset: string = 'assets/hero-dentist.png'): string {
    return this.cabinetSettingsService.getImageUrl(url, defaultAsset);
  }

  handleImageError(event: Event, defaultAsset: string = 'assets/hero-dentist.png'): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith(defaultAsset)) {
      img.src = defaultAsset;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  // --- Security Action Methods ---
  openLoginEmailModal(): void {
    this.securitySuccess = '';
    this.securityError = '';
    this.loginEmailForm = { newLoginEmail: this.adminAccount?.loginEmail || '', currentPassword: '' };
    this.showLoginEmailModal = true;
  }

  submitUpdateLoginEmail(): void {
    if (!this.loginEmailForm.newLoginEmail || !this.loginEmailForm.currentPassword) {
      this.securityError = 'Tous les champs sont obligatoires.';
      return;
    }
    this.isSecuritySubmitting = true;
    this.securityError = '';
    this.securitySuccess = '';

    this.authService.updateLoginEmail(this.loginEmailForm.newLoginEmail, this.loginEmailForm.currentPassword).subscribe({
      next: (res) => {
        this.isSecuritySubmitting = false;
        this.securitySuccess = res.message;
        this.showLoginEmailModal = false;
        this.chargerCompteAdmin();
      },
      error: (err) => {
        this.isSecuritySubmitting = false;
        this.securityError = err.error?.message || 'Erreur lors de la modification de l\'email de connexion.';
      }
    });
  }

  openPasswordModal(): void {
    this.securitySuccess = '';
    this.securityError = '';
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.showPasswordModal = true;
  }

  submitUpdatePassword(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      this.securityError = 'Tous les champs sont obligatoires.';
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.securityError = 'Les nouveaux mots de passe ne correspondent pas.';
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.securityError = 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.isSecuritySubmitting = true;
    this.securityError = '';
    this.securitySuccess = '';

    this.authService.updatePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
      next: (res) => {
        this.isSecuritySubmitting = false;
        this.securitySuccess = res.message;
        this.showPasswordModal = false;
        this.chargerCompteAdmin();
      },
      error: (err) => {
        this.isSecuritySubmitting = false;
        this.securityError = err.error?.message || 'Erreur lors de la modification du mot de passe.';
      }
    });
  }

  generateEmergencyCodes(): void {
    if (!confirm('Attention : La génération d\'une nouvelle série de 10 codes d\'urgence invalidera définitivement tous vos anciens codes d\'urgence. Voulez-vous continuer ?')) {
      return;
    }

    this.isSecuritySubmitting = true;
    this.securityError = '';
    this.copiedCodes = false;

    this.authService.generateEmergencyCodes().subscribe({
      next: (res) => {
        this.isSecuritySubmitting = false;
        this.generatedCodes = res.codes;
        this.generatedWarning = res.warning;
        this.showEmergencyCodesModal = true;
        this.chargerCompteAdmin();
      },
      error: (err) => {
        this.isSecuritySubmitting = false;
        this.securityError = err.error?.message || 'Erreur lors de la génération des codes d\'urgence.';
      }
    });
  }

  copyEmergencyCodes(): void {
    if (this.generatedCodes.length > 0) {
      const text = "CODES DE RÉCUPÉRATION D'URGENCE - CABINET DENTAIRE YT SMILE CENTER\n\n" +
        this.generatedCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
        "\n\nAttention : Chaque code n'est utilisable qu'une seule fois. Conservez-les en lieu sûr !";
      navigator.clipboard.writeText(text);
      this.copiedCodes = true;
      setTimeout(() => this.copiedCodes = false, 3000);
    }
  }

  closeModals(): void {
    this.showLoginEmailModal = false;
    this.showPasswordModal = false;
    this.showEmergencyCodesModal = false;
  }
}
