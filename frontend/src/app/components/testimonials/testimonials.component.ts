import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AvisService } from '../../services/avis.service';
import { CareService } from '../../services/care.service';
import { AvisResponse, CreationAvisRequest } from '../../models/avis.model';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  testimonials: AvisResponse[] = [];
  isLoading = true;
  fetchError = false;

  stars = [1, 2, 3, 4, 5];

  // Modal & Form state
  isModalOpen = false;
  reviewForm!: FormGroup;
  isSubmitted = false;
  isSubmitting = false;
  submissionSuccess = false;
  successMessage = '';
  errorMessage = '';

  careOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private avisService: AvisService,
    private careService: CareService
  ) {}

  ngOnInit(): void {
    this.careOptions = this.careService.getSoinsTitles();
    this.chargerAvisPublics();

    this.reviewForm = this.fb.group({
      authorName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      careType: ['', [Validators.required, Validators.maxLength(150)]],
      comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      privacyConsent: [false, [Validators.requiredTrue]]
    });
  }

  chargerAvisPublics(): void {
    this.isLoading = true;
    this.fetchError = false;
    this.avisService.obtenirAvisPublics().subscribe({
      next: (data) => {
        this.testimonials = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.fetchError = true;
      }
    });
  }

  get f() {
    return this.reviewForm.controls;
  }

  get commentLength(): number {
    return this.reviewForm.get('comment')?.value?.length || 0;
  }

  setRating(starValue: number): void {
    this.reviewForm.patchValue({ rating: starValue });
  }

  openReviewModal(): void {
    this.isModalOpen = true;
    this.submissionSuccess = false;
    this.errorMessage = '';
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeReviewModal(): void {
    this.isModalOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  onSubmitReview(): void {
    this.isSubmitted = true;
    this.errorMessage = '';
    this.submissionSuccess = false;

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const request: CreationAvisRequest = {
      nomAuteur: this.reviewForm.value.authorName,
      note: this.reviewForm.value.rating,
      soinConcerne: this.reviewForm.value.careType,
      commentaire: this.reviewForm.value.comment
    };

    this.avisService.proposerAvis(request).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.submissionSuccess = true;
        this.successMessage = res.message || 'Merci pour votre avis. Il sera publié après validation par notre équipe.';
        this.reviewForm.reset({
          authorName: '',
          rating: 5,
          careType: '',
          comment: '',
          privacyConsent: false
        });
        this.isSubmitted = false;

        setTimeout(() => {
          if (this.submissionSuccess && this.isModalOpen) {
            this.closeReviewModal();
          }
        }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submissionSuccess = false;
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l’envoi de votre avis. Veuillez réessayer.';
        }
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Patient du cabinet';
    const d = new Date(dateStr);
    return 'Patient (' + d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) + ')';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isModalOpen) {
      this.closeReviewModal();
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
