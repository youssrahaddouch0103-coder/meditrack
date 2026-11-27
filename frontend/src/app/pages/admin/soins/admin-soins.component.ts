import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CareService } from '../../../services/care.service';
import { CarePhotoService } from '../../../services/care-photo.service';
import { Soin, StatutSoin, CreationSoinRequest } from '../../../models/soin.model';
import { CarePhoto } from '../../../models/care-photo.model';
import { SOINS_LIST } from '../../../config/soins.config';

export interface PendingUploadItem {
  file: File;
  previewUrl: string;
  altText: string;
  caption: string;
}

export interface CareFormGalleryItem {
  file?: File;
  existingPhoto?: CarePhoto;
  previewUrl: string;
  altText: string;
  caption: string;
  displayOrder: number;
}

@Component({
  selector: 'app-admin-soins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-soins.component.html',
  styleUrl: './admin-soins.component.scss'
})
export class AdminSoinsComponent implements OnInit, OnDestroy {
  soinsList: Soin[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  newlyCreatedCare: Soin | null = null;

  // View mode tab: 'soins' or 'photos'
  activeTab: 'soins' | 'photos' = 'soins';

  // Care Form Modal State (Add / Edit)
  isCareFormOpen = false;
  isEditingCare = false;
  editingCareId: number | string | null = null;

  formTitre = '';
  formDescriptionCourte = '';
  formDescriptionDetaillee = '';
  formPhotoAlt = '';
  formOrdre = 1;
  formStatut: StatutSoin = 'PUBLIE';
  
  selectedCoverFile: File | null = null;
  coverFilePreview: string | null = null;
  existingCoverUrl: string | null = null;
  
  // Gallery items inside Care Form Modal
  formGalleryItems: CareFormGalleryItem[] = [];
  failedGalleryItems: CareFormGalleryItem[] = [];
  savedCareAfterCreation: Soin | null = null;

  isSubmittingCare = false;
  submissionProgressMessage = '';
  formError = '';

  // Care Delete Confirmation Modal
  deletingCare: Soin | null = null;
  isDeletingCare = false;

  // Care Gallery Modal & Tab State
  isGalleryModalOpen = false;
  selectedCareForPhotos: Soin | null = null;
  photos: CarePhoto[] = [];
  isLoadingPhotos = false;
  
  // Pending Multi-file Upload State
  pendingUploads: PendingUploadItem[] = [];
  isUploadingPhotos = false;
  uploadPhotoError = '';

  // Photo Edit & Delete Modal States
  editingPhoto: CarePhoto | null = null;
  editAltText = '';
  editCaption = '';
  isUpdatingPhoto = false;

  deletingPhoto: CarePhoto | null = null;
  isDeletingPhoto = false;

  constructor(
    private careService: CareService,
    private carePhotoService: CarePhotoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAllSoins();
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.isGalleryModalOpen) {
        this.closeGalleryModal();
      } else if (this.isCareFormOpen && !this.isSubmittingCare) {
        this.closeCareFormModal();
      } else if (this.deletingCare) {
        this.cancelDeleteCare();
      } else if (this.editingPhoto) {
        this.closeEditPhotoModal();
      } else if (this.deletingPhoto) {
        this.cancelDeletePhoto();
      }
    }
  }

  loadAllSoins(): void {
    this.soinsList = this.getFallbackAdminSoins();
    this.isLoading = true;
    this.errorMessage = '';

    // 2. Récupérer la liste des soins depuis l'API serveur
    this.careService.getAllSoinsAdmin().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const timestamp = Date.now();
          console.log('[AdminSoins] Soins chargés depuis le serveur (API) :', data);
          this.soinsList = data.map(item => ({
            ...item,
            id: item.id || (item.codeSlug as any),
            photoCouvertureUrl: item.photoCouvertureUrl ? `${item.photoCouvertureUrl}?v=${timestamp}` : item.photoCouvertureUrl
          }));
        } else {
          console.warn('[AdminSoins] L’API a retourné une liste vide. Conservation des soins restaurés.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[AdminSoins] Erreur chargement API. Conservation des soins restaurés:', err);
        this.isLoading = false;
      }
    });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) {
      return '/assets/images/soins/couronne-zircone.png';
    }

    let cleanUrl = url.trim();

    // Prevent double http://localhost:8080 or double /api
    if (cleanUrl.startsWith('http://localhost:8080') || cleanUrl.startsWith('http://localhost:4200')) {
      cleanUrl = cleanUrl.replace(/^http:\/\/localhost:(8080|4200)/, '');
    }

    if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
      const path = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
      const fullUrl = `http://localhost:8080${path}`;
      console.log('[Cover Image URL]', fullUrl);
      return fullUrl;
    }

    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      console.log('[Cover Image URL]', cleanUrl);
      return cleanUrl;
    }

    const relativeUrl = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    console.log('[Cover Image URL]', relativeUrl);
    return relativeUrl;
  }

  handleImageError(event: Event, soin?: Soin): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('[Cover Image Load Error] URL non chargée:', imgElement.src, soin);
    if (!imgElement.src.includes('/assets/images/soins/couronne-zircone.png')) {
      imgElement.src = '/assets/images/soins/couronne-zircone.png';
    }
  }

  private getFallbackAdminSoins(): Soin[] {
    return SOINS_LIST.map((item, index) => ({
      id: index + 1,
      codeSlug: item.id,
      titre: item.title,
      descriptionCourte: item.shortDescription,
      descriptionDetaillee: item.detailedDescription,
      photoCouvertureUrl: item.imageUrl,
      photoCouvertureAlt: item.imageAlt,
      ordreAffichage: index + 1,
      statut: 'PUBLIE' as StatutSoin
    }));
  }

  private getFallbackPhotosForCareSlug(slug: string): CarePhoto[] {
    const s = (slug || '').toLowerCase();
    const now = new Date().toISOString();

    if (s.includes('zircone')) {
      return [
        { id: 1, careId: slug, fileName: 'couronne-zircone-1.png', imageUrl: 'assets/images/soins/couronne-zircone-1.png', altText: 'Couronne en zircone - Pose clinique et rendu naturel', caption: 'Photo 1 / 3 — Vue de face et esthétique dentaire', displayOrder: 1, isCover: true, createdAt: now },
        { id: 2, careId: slug, fileName: 'couronne-zircone-2.png', imageUrl: 'assets/images/soins/couronne-zircone-2.png', altText: 'Couronne en zircone - Vue rapprochée des détails céramiques', caption: 'Photo 2 / 3 — Préparation clinique et empreinte de précision', displayOrder: 2, isCover: false, createdAt: now },
        { id: 3, careId: slug, fileName: 'couronne-zircone-3.png', imageUrl: 'assets/images/soins/couronne-zircone-3.png', altText: 'Couronne en zircone - Sourire harmonieux rétabli', caption: 'Photo 3 / 3 — Résultat esthétique final après cimentation', displayOrder: 3, isCover: false, createdAt: now }
      ];
    } else if (s.includes('composite')) {
      return [
        { id: 4, careId: slug, fileName: 'restauration-composite-1.png', imageUrl: 'assets/images/soins/restauration-composite-1.png', altText: 'Restauration en résine composite naturelle', caption: 'Photo 1 / 3 — Obturation invisible de la cavité', displayOrder: 1, isCover: true, createdAt: now },
        { id: 5, careId: slug, fileName: 'restauration-composite-2.png', imageUrl: 'assets/images/soins/restauration-composite-2.png', altText: 'Sélection de la teinte biomimétique', caption: 'Photo 2 / 3 — Application stratifiée de la résine', displayOrder: 2, isCover: false, createdAt: now },
        { id: 6, careId: slug, fileName: 'restauration-composite-3.png', imageUrl: 'assets/images/soins/restauration-composite-3.png', altText: 'Polissage et lissage de surface', caption: 'Photo 3 / 3 — Brillance et intégration marginale parfaite', displayOrder: 3, isCover: false, createdAt: now }
      ];
    } else if (s.includes('amovible')) {
      return [
        { id: 7, careId: slug, fileName: 'prothese-amovible-1.png', imageUrl: 'assets/images/soins/prothese-amovible-1.png', altText: 'Prothèse dentaire amovible sur mesure', caption: 'Photo 1 / 3 — Structure prothétique complète ajustée', displayOrder: 1, isCover: true, createdAt: now },
        { id: 8, careId: slug, fileName: 'prothese-amovible-2.png', imageUrl: 'assets/images/soins/prothese-amovible-2.png', altText: 'Essayage clinique et réglage de l\'occlusion', caption: 'Photo 2 / 3 — Contrôle de stabilité et confort masticatoire', displayOrder: 2, isCover: false, createdAt: now },
        { id: 9, careId: slug, fileName: 'prothese-amovible-3.png', imageUrl: 'assets/images/soins/prothese-amovible-3.png', altText: 'Restitution de l\'harmonie du visage', caption: 'Photo 3 / 3 — Rendu esthétique naturel et stabilité', displayOrder: 3, isCover: false, createdAt: now }
      ];
    } else if (s.includes('detartrage')) {
      return [
        { id: 10, careId: slug, fileName: 'detartrage-1.png', imageUrl: 'assets/images/soins/detartrage-1.png', altText: 'Soin de détartrage professionnel aux ultrasons', caption: 'Photo 1 / 3 — Élimination du tartre et de la plaque', displayOrder: 1, isCover: true, createdAt: now },
        { id: 11, careId: slug, fileName: 'detartrage-2.png', imageUrl: 'assets/images/soins/detartrage-2.png', altText: 'Polissage prophylactique des surfaces dentaires', caption: 'Photo 2 / 3 — Élimination des taches de surface', displayOrder: 2, isCover: false, createdAt: now },
        { id: 12, careId: slug, fileName: 'detartrage-3.png', imageUrl: 'assets/images/soins/detartrage-3.png', altText: 'Contrôle de l\'état gingival', caption: 'Photo 3 / 3 — Gencives saines et propreté optimale', displayOrder: 3, isCover: false, createdAt: now }
      ];
    } else {
      return [
        { id: 13, careId: slug, fileName: 'blanchiment-dentaire-1.png', imageUrl: 'assets/images/soins/blanchiment-dentaire-1.png', altText: 'Sourire éclatant après éclaircissement dentaire', caption: 'Photo 1 / 3 — Traitement professionnel sous supervision', displayOrder: 1, isCover: true, createdAt: now },
        { id: 14, careId: slug, fileName: 'blanchiment-dentaire-2.png', imageUrl: 'assets/images/soins/blanchiment-dentaire-2.png', altText: 'Protection des tissus gingivaux avant traitement', caption: 'Photo 2 / 3 — Application du gel d\'éclaircissement sécurisé', displayOrder: 2, isCover: false, createdAt: now },
        { id: 15, careId: slug, fileName: 'blanchiment-dentaire-3.png', imageUrl: 'assets/images/soins/blanchiment-dentaire-3.png', altText: 'Résultat d\'éclat immédiat après séance', caption: 'Photo 3 / 3 — Gain de plusieurs nuances de teinte', displayOrder: 3, isCover: false, createdAt: now }
      ];
    }
  }

  // Care Form Handlers
  openAddCareModal(): void {
    this.isEditingCare = false;
    this.editingCareId = null;
    this.formTitre = '';
    this.formDescriptionCourte = '';
    this.formDescriptionDetaillee = '';
    this.formPhotoAlt = '';
    this.formOrdre = this.soinsList.length + 1;
    this.formStatut = 'PUBLIE';
    this.selectedCoverFile = null;
    this.coverFilePreview = null;
    this.existingCoverUrl = null;
    this.formGalleryItems = [];
    this.failedGalleryItems = [];
    this.savedCareAfterCreation = null;
    this.formError = '';
    this.submissionProgressMessage = '';
    this.newlyCreatedCare = null;
    this.isCareFormOpen = true;
    this.lockBodyScroll();
  }

  openEditCareModal(treatment: Soin): void {
    console.log("Soin sélectionné :", treatment);
    console.log("ID envoyé :", treatment.id || (treatment as any)._id);

    const id = treatment.id || (treatment as any)._id || treatment.codeSlug;
    if (!id) {
      console.error("Le soin ne possède pas d’identifiant serveur:", treatment);
      this.formError = "Le soin ne possède pas d’identifiant serveur.";
      return;
    }

    this.isEditingCare = true;
    this.editingCareId = id;
    this.formTitre = treatment.titre;
    this.formDescriptionCourte = treatment.descriptionCourte;
    this.formDescriptionDetaillee = treatment.descriptionDetaillee;
    this.formPhotoAlt = treatment.photoCouvertureAlt || '';
    this.formOrdre = treatment.ordreAffichage;
    this.formStatut = treatment.statut;
    this.selectedCoverFile = null;
    this.coverFilePreview = null;
    this.existingCoverUrl = treatment.photoCouvertureUrl || null;
    this.formGalleryItems = [];
    this.failedGalleryItems = [];
    this.savedCareAfterCreation = null;
    this.formError = '';
    this.submissionProgressMessage = '';
    this.newlyCreatedCare = null;
    this.isCareFormOpen = true;
    this.lockBodyScroll();

    // Load existing photos into form gallery with fallback
    this.carePhotoService.getPhotosByCare(treatment.codeSlug).subscribe({
      next: (photos) => {
        const activePhotos = (photos && photos.length > 0) ? photos : this.getFallbackPhotosForCareSlug(treatment.codeSlug);
        this.formGalleryItems = activePhotos.map(p => ({
          existingPhoto: p,
          previewUrl: p.imageUrl,
          altText: p.altText,
          caption: p.caption || '',
          displayOrder: p.displayOrder
        }));
      },
      error: () => {
        const activePhotos = this.getFallbackPhotosForCareSlug(treatment.codeSlug);
        this.formGalleryItems = activePhotos.map(p => ({
          existingPhoto: p,
          previewUrl: p.imageUrl,
          altText: p.altText,
          caption: p.caption || '',
          displayOrder: p.displayOrder
        }));
      }
    });
  }

  closeCareFormModal(): void {
    if (this.isSubmittingCare) return;
    this.isCareFormOpen = false;
    this.isEditingCare = false;
    this.editingCareId = null;
    this.formTitre = '';
    this.formDescriptionCourte = '';
    this.formDescriptionDetaillee = '';
    this.formPhotoAlt = '';
    this.formStatut = 'PUBLIE';
    this.formOrdre = 1;
    this.formError = '';
    this.submissionProgressMessage = '';
    this.selectedCoverFile = null;
    this.coverFilePreview = null;
    this.existingCoverUrl = null;
    this.formGalleryItems = [];
    this.failedGalleryItems = [];
    this.savedCareAfterCreation = null;
    this.restoreBodyScroll();
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
        this.formError = 'Format d’image non autorisé pour la couverture. Acceptés : JPEG, PNG, WebP.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.formError = 'La photo de couverture dépasse la taille maximale autorisée (5 Mo).';
        return;
      }

      this.selectedCoverFile = file;
      this.formError = '';

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.coverFilePreview = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onCareFormGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.formError = '';
      const filesArray = Array.from(input.files);

      for (const file of filesArray) {
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
          this.formError = `Format non autorisé pour "${file.name}". Acceptés : JPEG, PNG, WebP.`;
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          this.formError = `Le fichier "${file.name}" dépasse 5 Mo.`;
          return;
        }

        const defaultAlt = file.name.substring(0, file.name.lastIndexOf('.')) || (this.formTitre || 'Photo de galerie');
        const nextOrder = this.formGalleryItems.length + 1;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.formGalleryItems.push({
              file: file,
              previewUrl: e.target.result as string,
              altText: defaultAlt,
              caption: '',
              displayOrder: nextOrder
            });
          }
        };
        reader.readAsDataURL(file);
      }
      input.value = '';
    }
  }

  removeFormGalleryItem(index: number): void {
    if (index >= 0 && index < this.formGalleryItems.length) {
      const item = this.formGalleryItems[index];
      if (item.existingPhoto && item.existingPhoto.id > 0) {
        this.carePhotoService.deletePhoto(item.existingPhoto.id).subscribe({
          next: () => {
            this.formGalleryItems.splice(index, 1);
          },
          error: () => {
            this.formGalleryItems.splice(index, 1);
          }
        });
      } else {
        this.formGalleryItems.splice(index, 1);
      }
    }
  }

  submitCareForm(): void {
    if (this.isSubmittingCare) return;

    if (!this.formTitre || this.formTitre.trim().length < 2) {
      this.formError = 'Le nom du soin est obligatoire (minimum 2 caractères).';
      return;
    }
    if (!this.formDescriptionCourte || this.formDescriptionCourte.trim().length === 0) {
      this.formError = 'La description courte est obligatoire.';
      return;
    }
    if (!this.formDescriptionDetaillee || this.formDescriptionDetaillee.trim().length === 0) {
      this.formError = 'La description détaillée est obligatoire.';
      return;
    }

    const newItems = this.formGalleryItems.filter(item => item.file != null);
    for (let i = 0; i < newItems.length; i++) {
      if (!newItems[i].altText || newItems[i].altText.trim().length === 0) {
        this.formError = `Le texte alternatif (balise alt) est obligatoire pour la photo de galerie #${i + 1} (${newItems[i].file?.name}).`;
        return;
      }
    }

    this.isSubmittingCare = true;
    this.submissionProgressMessage = this.isEditingCare ? 'Mise à jour du soin...' : 'Création du soin en cours...';
    this.formError = '';
    this.successMessage = '';
    this.failedGalleryItems = [];

    const payload: CreationSoinRequest = {
      titre: this.formTitre.trim(),
      descriptionCourte: this.formDescriptionCourte.trim(),
      descriptionDetaillee: this.formDescriptionDetaillee.trim(),
      photoCouvertureAlt: this.formPhotoAlt.trim() || this.formTitre.trim(),
      ordreAffichage: this.formOrdre,
      statut: this.formStatut
    };

    if (this.isEditingCare) {
      const id = this.editingCareId;
      if (!id) {
        this.formError = "Le soin ne possède pas d’identifiant serveur.";
        this.isSubmittingCare = false;
        return;
      }

      console.log("URL modification :", `/api/admin/soins/${id}`);

      this.careService.modifierSoin(id, payload, this.selectedCoverFile || undefined).subscribe({
        next: (updatedSoin) => {
          console.log("Modification du soin réussie sur le serveur (HTTP 200) :", updatedSoin);
          this.handlePostCareSave(updatedSoin, newItems);
        },
        error: (err) => {
          this.isSubmittingCare = false;
          this.submissionProgressMessage = '';

          console.error('Erreur API lors de la modification du soin:', {
            status: err.status,
            statusText: err.statusText,
            message: err.error?.message || err.message,
            errorObject: err.error,
            url: err.url
          });

          this.formError = err.error?.message || err.message || 'Impossible de modifier le soin. Erreur serveur.';
        }
      });
    } else {
      this.careService.creerSoin(payload, this.selectedCoverFile || undefined).subscribe({
        next: (createdSoin) => {
          console.log('[AdminSoins] Création du soin réussie:', createdSoin);
          this.handlePostCareSave(createdSoin, newItems);
        },
        error: (err) => {
          this.isSubmittingCare = false;
          this.submissionProgressMessage = '';

          console.error('[AdminSoins] Erreur API lors de la création du soin:', {
            status: err.status,
            statusText: err.statusText,
            message: err.error?.message || err.message,
            errorObject: err.error,
            url: err.url
          });

          this.formError = err.error?.message || err.message || 'Impossible de créer le soin. Erreur serveur.';
        }
      });
    }
  }

  private handlePostCareSave(savedSoin: Soin, newGalleryItems: CareFormGalleryItem[]): void {
    this.savedCareAfterCreation = savedSoin;

    if (newGalleryItems.length === 0) {
      this.finalizeSuccess(savedSoin, 0);
      return;
    }

    this.submissionProgressMessage = `Téléversement des ${newGalleryItems.length} photos de la galerie...`;

    const filesToUpload = newGalleryItems.map(item => item.file!);
    const combinedAlt = newGalleryItems.map(item => item.altText.trim()).join(' | ');
    const combinedCaption = newGalleryItems.map(item => item.caption.trim()).filter(c => c.length > 0).join(' | ');

    this.carePhotoService.uploadPhotos(
      savedSoin.codeSlug,
      filesToUpload,
      combinedAlt,
      combinedCaption
    ).subscribe({
      next: () => {
        this.finalizeSuccess(savedSoin, newGalleryItems.length);
      },
      error: (err) => {
        this.isSubmittingCare = false;
        this.submissionProgressMessage = '';
        this.failedGalleryItems = newGalleryItems;
        this.formError = `Le soin "${savedSoin.titre}" a été enregistré, mais l'envoi des photos de la galerie a échoué (${err.error?.message || err.message}).`;
      }
    });
  }

  retryFailedPhotoUploads(): void {
    if (!this.savedCareAfterCreation || this.failedGalleryItems.length === 0) return;

    this.isSubmittingCare = true;
    this.submissionProgressMessage = `Nouvelle tentative de téléversement des ${this.failedGalleryItems.length} photos...`;
    this.formError = '';

    const filesToUpload = this.failedGalleryItems.map(item => item.file!);
    const combinedAlt = this.failedGalleryItems.map(item => item.altText.trim()).join(' | ');
    const combinedCaption = this.failedGalleryItems.map(item => item.caption.trim()).filter(c => c.length > 0).join(' | ');

    this.carePhotoService.uploadPhotos(
      this.savedCareAfterCreation.codeSlug,
      filesToUpload,
      combinedAlt,
      combinedCaption
    ).subscribe({
      next: () => {
        const count = this.failedGalleryItems.length;
        this.failedGalleryItems = [];
        this.finalizeSuccess(this.savedCareAfterCreation!, count);
      },
      error: (err) => {
        this.isSubmittingCare = false;
        this.submissionProgressMessage = '';
        this.formError = `Échec de la nouvelle tentative (${err.error?.message || err.message || 'Erreur réseau'}). Veuillez vérifier vos fichiers et réessayer.`;
      }
    });
  }

  private finalizeSuccess(soin: Soin, uploadedPhotosCount: number): void {
    this.isSubmittingCare = false;
    this.submissionProgressMessage = '';
    this.newlyCreatedCare = soin;
    this.successMessage = uploadedPhotosCount > 0
      ? `Le soin "${soin.titre}" et ses ${uploadedPhotosCount} photo(s) de galerie ont été enregistrés avec succès.`
      : `Le soin "${soin.titre}" a été enregistré avec succès.`;
    this.closeCareFormModal();
    this.loadAllSoins();
  }

  // Reorder Care Services
  moveCareUp(index: number): void {
    if (index <= 0) return;
    const reordered = [...this.soinsList];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;

    const ids = reordered.map(s => s.id);
    this.careService.reordonnerSoins(ids).subscribe({
      next: (data) => {
        if (data && data.length > 0) this.soinsList = data;
      }
    });
  }

  moveCareDown(index: number): void {
    if (index >= this.soinsList.length - 1) return;
    const reordered = [...this.soinsList];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;

    const ids = reordered.map(s => s.id);
    this.careService.reordonnerSoins(ids).subscribe({
      next: (data) => {
        if (data && data.length > 0) this.soinsList = data;
      }
    });
  }

  // Delete Care Handlers
  confirmDeleteCare(soin: Soin): void {
    this.deletingCare = soin;
    this.lockBodyScroll();
  }

  cancelDeleteCare(): void {
    this.deletingCare = null;
    this.restoreBodyScroll();
  }

  executeDeleteCare(): void {
    if (!this.deletingCare) return;

    this.isDeletingCare = true;
    this.careService.supprimerOuArchiverSoin(this.deletingCare.id).subscribe({
      next: () => {
        this.isDeletingCare = false;
        this.successMessage = `Opération réalisée avec succès pour le soin "${this.deletingCare?.titre}".`;
        this.deletingCare = null;
        this.restoreBodyScroll();
        this.loadAllSoins();
      },
      error: () => {
        this.isDeletingCare = false;
        this.errorMessage = 'Échec lors de la suppression ou archivage du soin.';
      }
    });
  }

  // Care Gallery Modal Handlers
  openCarePhotos(soin: Soin): void {
    this.selectedCareForPhotos = soin;
    this.isGalleryModalOpen = true;
    this.pendingUploads = [];
    this.uploadPhotoError = '';
    this.loadPhotosForSelectedCare();
    this.lockBodyScroll();
  }

  closeGalleryModal(): void {
    this.isGalleryModalOpen = false;
    this.pendingUploads = [];
    this.uploadPhotoError = '';
    this.restoreBodyScroll();
  }

  switchTab(tab: 'soins' | 'photos'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadPhotosForSelectedCare(): void {
    if (!this.selectedCareForPhotos) return;
    this.isLoadingPhotos = true;
    this.carePhotoService.getPhotosByCare(this.selectedCareForPhotos.codeSlug).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.photos = data;
        } else {
          this.photos = this.getFallbackPhotosForCareSlug(this.selectedCareForPhotos!.codeSlug);
        }
        this.isLoadingPhotos = false;
      },
      error: () => {
        this.photos = this.getFallbackPhotosForCareSlug(this.selectedCareForPhotos!.codeSlug);
        this.isLoadingPhotos = false;
      }
    });
  }

  // Multi-file Selection & Previews for Gallery Modal
  onSecondaryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadPhotoError = '';
      const filesArray = Array.from(input.files);

      for (const file of filesArray) {
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
          this.uploadPhotoError = `Format non autorisé pour "${file.name}". Acceptés : JPEG, PNG, WebP.`;
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          this.uploadPhotoError = `Le fichier "${file.name}" dépasse 5 Mo.`;
          return;
        }

        const defaultAlt = file.name.substring(0, file.name.lastIndexOf('.')) || (this.selectedCareForPhotos?.titre || 'Photo du soin');

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.pendingUploads.push({
              file: file,
              previewUrl: e.target.result as string,
              altText: defaultAlt,
              caption: ''
            });
          }
        };
        reader.readAsDataURL(file);
      }
      input.value = '';
    }
  }

  removePendingUpload(index: number): void {
    if (index >= 0 && index < this.pendingUploads.length) {
      this.pendingUploads.splice(index, 1);
    }
  }

  clearUploadFiles(): void {
    this.pendingUploads = [];
    this.uploadPhotoError = '';
  }

  submitSecondaryPhotosUpload(): void {
    if (!this.selectedCareForPhotos) return;
    if (this.pendingUploads.length === 0) {
      this.uploadPhotoError = 'Veuillez sélectionner au moins une image.';
      return;
    }

    for (let i = 0; i < this.pendingUploads.length; i++) {
      if (!this.pendingUploads[i].altText || this.pendingUploads[i].altText.trim().length === 0) {
        this.uploadPhotoError = `Le texte alternatif (balise alt) est obligatoire pour l'image #${i + 1} (${this.pendingUploads[i].file.name}).`;
        return;
      }
    }

    this.isUploadingPhotos = true;
    this.uploadPhotoError = '';
    this.successMessage = '';

    const filesToUpload = this.pendingUploads.map(item => item.file);
    const combinedAlt = this.pendingUploads.map(item => item.altText.trim()).join(' | ');
    const combinedCaption = this.pendingUploads.map(item => item.caption.trim()).filter(c => c.length > 0).join(' | ');

    this.carePhotoService.uploadPhotos(
      this.selectedCareForPhotos.codeSlug,
      filesToUpload,
      combinedAlt,
      combinedCaption
    ).subscribe({
      next: () => {
        this.isUploadingPhotos = false;
        this.successMessage = `${filesToUpload.length} photo(s) ajoutée(s) à la galerie avec succès.`;
        this.clearUploadFiles();
        this.loadPhotosForSelectedCare();
      },
      error: (err) => {
        this.isUploadingPhotos = false;
        this.uploadPhotoError = err.error?.message || 'Erreur lors du téléversement.';
      }
    });
  }

  setCoverPhoto(photo: CarePhoto): void {
    if (photo.id <= 0) return;
    this.carePhotoService.setCoverPhoto(photo.id).subscribe({
      next: () => {
        this.successMessage = 'Photo définie comme photo de couverture.';
        this.loadPhotosForSelectedCare();
        this.loadAllSoins();
      }
    });
  }

  openEditPhotoModal(photo: CarePhoto): void {
    this.editingPhoto = photo;
    this.editAltText = photo.altText;
    this.editCaption = photo.caption || '';
  }

  closeEditPhotoModal(): void {
    this.editingPhoto = null;
  }

  savePhotoEdit(): void {
    if (!this.editingPhoto) return;
    if (!this.editAltText || this.editAltText.trim().length === 0) {
      this.errorMessage = 'Le texte alternatif est obligatoire.';
      return;
    }

    if (this.editingPhoto.id <= 0) {
      this.closeEditPhotoModal();
      return;
    }

    this.isUpdatingPhoto = true;
    this.carePhotoService.updatePhotoInfo(this.editingPhoto.id, {
      altText: this.editAltText.trim(),
      caption: this.editCaption.trim()
    }).subscribe({
      next: () => {
        this.isUpdatingPhoto = false;
        this.successMessage = 'Informations de la photo mises à jour.';
        this.closeEditPhotoModal();
        this.loadPhotosForSelectedCare();
      },
      error: () => {
        this.isUpdatingPhoto = false;
        this.errorMessage = 'Échec de la mise à jour.';
      }
    });
  }

  movePhotoUp(index: number): void {
    if (!this.selectedCareForPhotos || index <= 0) return;
    const reorderedIds = this.photos.map(p => p.id);
    const temp = reorderedIds[index];
    reorderedIds[index] = reorderedIds[index - 1];
    reorderedIds[index - 1] = temp;

    this.carePhotoService.reorderPhotos(this.selectedCareForPhotos.codeSlug, reorderedIds).subscribe({
      next: (newPhotos) => {
        this.photos = newPhotos;
      }
    });
  }

  movePhotoDown(index: number): void {
    if (!this.selectedCareForPhotos || index >= this.photos.length - 1) return;
    const reorderedIds = this.photos.map(p => p.id);
    const temp = reorderedIds[index];
    reorderedIds[index] = reorderedIds[index + 1];
    reorderedIds[index + 1] = temp;

    this.carePhotoService.reorderPhotos(this.selectedCareForPhotos.codeSlug, reorderedIds).subscribe({
      next: (newPhotos) => {
        this.photos = newPhotos;
      }
    });
  }

  confirmDeletePhoto(photo: CarePhoto): void {
    this.deletingPhoto = photo;
  }

  cancelDeletePhoto(): void {
    this.deletingPhoto = null;
  }

  executeDeletePhoto(): void {
    if (!this.deletingPhoto) return;

    const photoToRemove = this.deletingPhoto;
    this.isDeletingPhoto = true;

    if (photoToRemove.id && photoToRemove.id > 0) {
      this.carePhotoService.deletePhoto(photoToRemove.id).subscribe({
        next: () => {
          this.isDeletingPhoto = false;
          this.successMessage = 'Photo supprimée de la galerie avec succès.';
          this.deletingPhoto = null;
          this.photos = this.photos.filter(p => p.id !== photoToRemove.id);
          this.loadPhotosForSelectedCare();
          this.loadAllSoins();
        },
        error: (err) => {
          console.warn('[DeletePhoto Warning] Échec suppression serveur, nettoyage local:', err);
          this.isDeletingPhoto = false;
          this.photos = this.photos.filter(p => p !== photoToRemove && p.id !== photoToRemove.id);
          this.successMessage = 'Photo retirée de l’affichage.';
          this.deletingPhoto = null;
        }
      });
    } else {
      this.photos = this.photos.filter(p => p !== photoToRemove);
      this.isDeletingPhoto = false;
      this.successMessage = 'Photo retirée de la galerie.';
      this.deletingPhoto = null;
    }
  }

  private lockBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  private restoreBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}
