import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContactService } from '../../services/contact.service';
import { CabinetSettingsService } from '../../services/cabinet-settings.service';
import { CabinetSettings, FormattedScheduleDay } from '../../models/cabinet-settings.model';
import { CreationMessageContactRequest } from '../../models/contact.model';
import { CABINET_INFO } from '../../config/cabinet.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  cabinet = CABINET_INFO;
  settings: CabinetSettings = {};
  scheduleList: FormattedScheduleDay[] = [];

  googleMapsSearchUrl: string = 'https://www.google.com/maps/search/?api=1&query=Temara%2C+Maroc';
  googleMapsDirectionsUrl: string = 'https://www.google.com/maps/dir/?api=1&destination=Temara%2C+Maroc';
  safeGoogleMapsEmbedUrl!: SafeResourceUrl;

  contactForm!: FormGroup;
  isSubmitted = false;
  isSubmitting = false;
  submissionSuccess = false;
  successMessage = '';
  errorMessage = '';

  subjectOptions: string[] = [
    'Demande d’information',
    'Rendez-vous',
    'Soins et tarifs',
    'Urgence dentaire',
    'Réclamation',
    'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private el: ElementRef,
    private contactService: ContactService,
    private settingsService: CabinetSettingsService,
    private sanitizer: DomSanitizer
  ) {
    this.updateGoogleMapsUrls(this.settingsService.getCurrentSettings());
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9\s\+\-\.]{8,20}$/)]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
      privacyConsent: [false, [Validators.requiredTrue]]
    });

    this.settingsService.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
        this.scheduleList = this.settingsService.getScheduleList(settings);
        this.updateGoogleMapsUrls(settings);
      }
    });
  }

  updateGoogleMapsUrls(settings: CabinetSettings): void {
    const mapsUrl = (settings.googleMapsUrl || '').trim() || 'https://maps.google.com/?q=Temara+Maroc';
    this.googleMapsSearchUrl = mapsUrl;
    this.googleMapsDirectionsUrl = mapsUrl;

    const embedUrl = this.settingsService.getGoogleMapsEmbedUrl(settings);
    this.safeGoogleMapsEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  get f() {
    return this.contactForm.controls;
  }

  formatPhoneRaw(phone?: string): string {
    return this.settingsService.formatPhoneRaw(phone);
  }

  formatWhatsAppLink(phone?: string): string {
    return this.settingsService.formatWhatsAppLink(phone);
  }

  formatInstagramHandle(url?: string): string {
    return this.settingsService.formatInstagramHandle(url);
  }

  formatLocationDisplay(): string {
    return this.settingsService.formatLocationDisplay(this.settings);
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';
    this.submissionSuccess = false;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    this.isSubmitting = true;

    const requestBody: CreationMessageContactRequest = {
      nomComplet: this.contactForm.value.name,
      email: this.contactForm.value.email,
      telephone: this.contactForm.value.phone || '',
      sujet: this.contactForm.value.subject,
      message: this.contactForm.value.message
    };

    this.contactService.envoyerMessage(requestBody).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submissionSuccess = true;
        this.successMessage = 'Votre message a bien été envoyé. Notre secrétariat vous répondra dans les meilleurs délais.';
        this.contactForm.reset({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          privacyConsent: false
        });
        this.isSubmitted = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submissionSuccess = false;
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l’envoi de votre message. Veuillez réessayer.';
        }
      }
    });
  }

  private focusFirstInvalidField(): void {
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        const firstInvalidControl: HTMLElement | null = this.el.nativeElement.querySelector(
          '.form-group.has-error .form-control, .checkbox-group.has-error .checkbox-input'
        );
        if (firstInvalidControl) {
          firstInvalidControl.focus();
        }
      }, 50);
    }
  }
}
