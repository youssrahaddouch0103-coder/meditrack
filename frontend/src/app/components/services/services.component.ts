import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CareService } from '../../services/care.service';
import { CarePhotoService } from '../../services/care-photo.service';
import { SoinItem, CLINICAL_DISCLAIMER } from '../../config/soins.config';
import { CarePhoto } from '../../models/care-photo.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit, OnDestroy {
  soinsList: SoinItem[] = [];
  selectedService: SoinItem | null = null;
  isModalOpen = false;
  isLoadingSoins = false;
  
  // Gallery state
  photosList: CarePhoto[] = [];
  activePhotoIndex = 0;
  isLoadingPhotos = false;
  clinicalDisclaimer = CLINICAL_DISCLAIMER;

  // Lightbox Fullscreen state
  isLightboxOpen = false;
  lightboxIndex = 0;

  // Touch Swipe coordinates
  private touchStartX = 0;
  private touchEndX = 0;

  constructor(
    private careService: CareService,
    private carePhotoService: CarePhotoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadSoins();
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  loadSoins(): void {
    this.isLoadingSoins = true;
    this.careService.getSoinsPublics().subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          this.soinsList = items.map(s => ({
            id: s.codeSlug,
            title: s.titre,
            shortDescription: s.descriptionCourte,
            detailedDescription: s.descriptionDetaillee,
            imageUrl: s.photoCouvertureUrl,
            imageAlt: s.photoCouvertureAlt || s.titre,
            icon: 'sparkles'
          }));
        } else {
          this.soinsList = this.careService.getSoins();
        }
        this.isLoadingSoins = false;
      },
      error: () => {
        this.soinsList = this.careService.getSoins();
        this.isLoadingSoins = false;
      }
    });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) {
      return '/assets/images/soins/couronne-zircone.png';
    }

    let cleanUrl = url.trim();

    if (cleanUrl.startsWith('http://localhost:8080') || cleanUrl.startsWith('http://localhost:4200')) {
      cleanUrl = cleanUrl.replace(/^http:\/\/localhost:(8080|4200)/, '');
    }

    if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
      const path = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
      return `http://localhost:8080${path}`;
    }

    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }

    return cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (!imgElement.src.includes('/assets/images/soins/couronne-zircone.png')) {
      imgElement.src = '/assets/images/soins/couronne-zircone.png';
    }
  }

  openModal(service: SoinItem): void {
    this.selectedService = service;
    this.isModalOpen = true;
    this.activePhotoIndex = 0;
    this.photosList = [];
    this.isLoadingPhotos = true;

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }

    this.carePhotoService.getPhotosByCare(service.id).subscribe({
      next: (photos) => {
        this.isLoadingPhotos = false;
        if (photos && photos.length > 0) {
          this.photosList = photos;
          const coverIdx = photos.findIndex(p => p.isCover);
          this.activePhotoIndex = coverIdx >= 0 ? coverIdx : 0;
        } else {
          this.photosList = this.getFallbackPhotosForService(service);
          this.activePhotoIndex = 0;
        }
      },
      error: () => {
        this.isLoadingPhotos = false;
        this.photosList = this.getFallbackPhotosForService(service);
        this.activePhotoIndex = 0;
      }
    });
  }

  private getFallbackPhotosForService(service: SoinItem): CarePhoto[] {
    const slug = (service.id || '').toLowerCase();
    const now = new Date().toISOString();

    if (slug.includes('zircone')) {
      return [
        {
          id: 1,
          careId: service.id,
          fileName: 'couronne-zircone-1.png',
          imageUrl: 'assets/images/soins/couronne-zircone-1.png',
          altText: 'Couronne en zircone - Pose clinique et rendu naturel',
          caption: 'Photo 1 / 3 — Vue de face et esthétique dentaire',
          displayOrder: 1,
          isCover: true,
          createdAt: now
        },
        {
          id: 2,
          careId: service.id,
          fileName: 'couronne-zircone-2.png',
          imageUrl: 'assets/images/soins/couronne-zircone-2.png',
          altText: 'Couronne en zircone - Vue rapprochée des détails céramiques',
          caption: 'Photo 2 / 3 — Préparation clinique et empreinte de précision',
          displayOrder: 2,
          isCover: false,
          createdAt: now
        },
        {
          id: 3,
          careId: service.id,
          fileName: 'couronne-zircone-3.png',
          imageUrl: 'assets/images/soins/couronne-zircone-3.png',
          altText: 'Couronne en zircone - Sourire harmonieux rétabli',
          caption: 'Photo 3 / 3 — Résultat esthétique final après cimentation',
          displayOrder: 3,
          isCover: false,
          createdAt: now
        }
      ];
    } else if (slug.includes('composite')) {
      return [
        {
          id: 4,
          careId: service.id,
          fileName: 'restauration-composite-1.png',
          imageUrl: 'assets/images/soins/restauration-composite-1.png',
          altText: 'Restauration en résine composite naturelle',
          caption: 'Photo 1 / 3 — Obturation invisible de la cavité',
          displayOrder: 1,
          isCover: true,
          createdAt: now
        },
        {
          id: 5,
          careId: service.id,
          fileName: 'restauration-composite-2.png',
          imageUrl: 'assets/images/soins/restauration-composite-2.png',
          altText: 'Sélection de la teinte biomimétique',
          caption: 'Photo 2 / 3 — Application stratifiée de la résine',
          displayOrder: 2,
          isCover: false,
          createdAt: now
        },
        {
          id: 6,
          careId: service.id,
          fileName: 'restauration-composite-3.png',
          imageUrl: 'assets/images/soins/restauration-composite-3.png',
          altText: 'Polissage et lissage de surface',
          caption: 'Photo 3 / 3 — Brillance et intégration marginale parfaite',
          displayOrder: 3,
          isCover: false,
          createdAt: now
        }
      ];
    } else if (slug.includes('amovible')) {
      return [
        {
          id: 7,
          careId: service.id,
          fileName: 'prothese-amovible-1.png',
          imageUrl: 'assets/images/soins/prothese-amovible-1.png',
          altText: 'Prothèse dentaire amovible sur mesure',
          caption: 'Photo 1 / 3 — Structure prothétique complète ajustée',
          displayOrder: 1,
          isCover: true,
          createdAt: now
        },
        {
          id: 8,
          careId: service.id,
          fileName: 'prothese-amovible-2.png',
          imageUrl: 'assets/images/soins/prothese-amovible-2.png',
          altText: 'Essayage clinique et réglage de l\'occlusion',
          caption: 'Photo 2 / 3 — Contrôle de stabilité et confort masticatoire',
          displayOrder: 2,
          isCover: false,
          createdAt: now
        },
        {
          id: 9,
          careId: service.id,
          fileName: 'prothese-amovible-3.png',
          imageUrl: 'assets/images/soins/prothese-amovible-3.png',
          altText: 'Restitution de l\'harmonie du visage',
          caption: 'Photo 3 / 3 — Rendu esthétique naturel et stabilité',
          displayOrder: 3,
          isCover: false,
          createdAt: now
        }
      ];
    } else if (slug.includes('detartrage')) {
      return [
        {
          id: 10,
          careId: service.id,
          fileName: 'detartrage-1.png',
          imageUrl: 'assets/images/soins/detartrage-1.png',
          altText: 'Soin de détartrage professionnel aux ultrasons',
          caption: 'Photo 1 / 3 — Élimination du tartre et de la plaque',
          displayOrder: 1,
          isCover: true,
          createdAt: now
        },
        {
          id: 11,
          careId: service.id,
          fileName: 'detartrage-2.png',
          imageUrl: 'assets/images/soins/detartrage-2.png',
          altText: 'Polissage prophylactique des surfaces dentaires',
          caption: 'Photo 2 / 3 — Élimination des taches de surface',
          displayOrder: 2,
          isCover: false,
          createdAt: now
        },
        {
          id: 12,
          careId: service.id,
          fileName: 'detartrage-3.png',
          imageUrl: 'assets/images/soins/detartrage-3.png',
          altText: 'Contrôle de l\'état gingival',
          caption: 'Photo 3 / 3 — Gencives saines et propreté optimale',
          displayOrder: 3,
          isCover: false,
          createdAt: now
        }
      ];
    } else {
      return [
        {
          id: 13,
          careId: service.id,
          fileName: 'blanchiment-dentaire-1.png',
          imageUrl: 'assets/images/soins/blanchiment-dentaire-1.png',
          altText: 'Sourire éclatant après éclaircissement dentaire',
          caption: 'Photo 1 / 3 — Traitement professionnel sous supervision',
          displayOrder: 1,
          isCover: true,
          createdAt: now
        },
        {
          id: 14,
          careId: service.id,
          fileName: 'blanchiment-dentaire-2.png',
          imageUrl: 'assets/images/soins/blanchiment-dentaire-2.png',
          altText: 'Protection des tissus gingivaux avant traitement',
          caption: 'Photo 2 / 3 — Application du gel d\'éclaircissement sécurisé',
          displayOrder: 2,
          isCover: false,
          createdAt: now
        },
        {
          id: 15,
          careId: service.id,
          fileName: 'blanchiment-dentaire-3.png',
          imageUrl: 'assets/images/soins/blanchiment-dentaire-3.png',
          altText: 'Résultat d\'éclat immédiat après séance',
          caption: 'Photo 3 / 3 — Gain de plusieurs nuances de teinte',
          displayOrder: 3,
          isCover: false,
          createdAt: now
        }
      ];
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedService = null;
    this.photosList = [];
    this.restoreBodyScroll();
  }

  setActivePhoto(index: number): void {
    if (index >= 0 && index < this.photosList.length) {
      this.activePhotoIndex = index;
    }
  }

  prevPhoto(): void {
    if (this.photosList.length === 0) return;
    this.activePhotoIndex = (this.activePhotoIndex - 1 + this.photosList.length) % this.photosList.length;
  }

  nextPhoto(): void {
    if (this.photosList.length === 0) return;
    this.activePhotoIndex = (this.activePhotoIndex + 1) % this.photosList.length;
  }

  openLightbox(index: number): void {
    if (this.photosList.length === 0) return;
    this.lightboxIndex = index;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
  }

  prevLightboxPhoto(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.photosList.length === 0) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.photosList.length) % this.photosList.length;
  }

  nextLightboxPhoto(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.photosList.length === 0) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.photosList.length;
  }

  selectCareAndNavigate(careTitle: string, event: Event): void {
    event.stopPropagation();
    this.closeModal();
    this.careService.selectCare(careTitle);
    this.router.navigate(['/rendez-vous']);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.isLightboxOpen) {
      if (event.key === 'Escape') this.closeLightbox();
      if (event.key === 'ArrowLeft') this.prevLightboxPhoto();
      if (event.key === 'ArrowRight') this.nextLightboxPhoto();
      return;
    }

    if (this.isModalOpen) {
      if (event.key === 'Escape') this.closeModal();
      if (event.key === 'ArrowLeft') this.prevPhoto();
      if (event.key === 'ArrowRight') this.nextPhoto();
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      if (this.isLightboxOpen) this.nextLightboxPhoto();
      else if (this.isModalOpen) this.nextPhoto();
    }
    if (this.touchEndX > this.touchStartX + swipeThreshold) {
      if (this.isLightboxOpen) this.prevLightboxPhoto();
      else if (this.isModalOpen) this.prevPhoto();
    }
  }

  private restoreBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}
