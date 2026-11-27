import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RendezVousService } from '../../services/rendez-vous.service';
import { CareService } from '../../services/care.service';
import { CabinetSettingsService } from '../../services/cabinet-settings.service';
import { CabinetSettings } from '../../models/cabinet-settings.model';
import { TIME_SLOT_OPTIONS } from '../../config/cabinet.config';
import { CreationRendezVousRequest } from '../../models/rendez-vous.model';

export function futureOrTodayDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return { pastDate: true };
  }
  return null;
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss'
})
export class AppointmentComponent implements OnInit, OnDestroy {
  settings: CabinetSettings = {};
  timeSlotOptions = TIME_SLOT_OPTIONS;

  appointmentForm!: FormGroup;
  isSubmitted = false;
  isSubmitting = false;
  submissionSuccess = false;
  successMessage = '';
  errorMessage = '';

  minDate: string = new Date().toISOString().split('T')[0];
  careOptions: string[] = [];

  private careSubscription!: Subscription;
  private settingsSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService,
    private careService: CareService,
    private settingsService: CabinetSettingsService
  ) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\s\+\-\.]{8,20}$/)]],
      email: ['', [Validators.required, Validators.email]],
      careType: ['', [Validators.required]],
      preferredDate: ['', [Validators.required, futureOrTodayDateValidator]],
      preferredTime: ['', [Validators.required]],
      message: ['', [Validators.maxLength(500)]],
      privacyConsent: [false, [Validators.requiredTrue]]
    });

    this.settingsSubscription = this.settingsService.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
      }
    });

    this.careService.getPublicCareTitles().subscribe({
      next: (titres) => {
        if (titres && titres.length > 0) {
          this.careOptions = titres;
        }
      }
    });

    this.careSubscription = this.careService.selectedCare$.subscribe(selectedCareTitle => {
      if (selectedCareTitle && this.appointmentForm) {
        this.appointmentForm.patchValue({ careType: selectedCareTitle });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.careSubscription) {
      this.careSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  get f() {
    return this.appointmentForm.controls;
  }

  formatPhoneRaw(phone?: string): string {
    return this.settingsService.formatPhoneRaw(phone);
  }

  formatWhatsAppLink(phone?: string): string {
    return this.settingsService.formatWhatsAppLink(phone);
  }

  formatLocationDisplay(): string {
    return this.settingsService.formatLocationDisplay(this.settings);
  }

  formatWeekdayHours(): string {
    return `${this.settings.mondayMorning || '09:30 - 13:00'} | ${this.settings.mondayAfternoon || '15:30 - 19:00'}`;
  }

  formatSaturdayHours(): string {
    return this.settings.saturdayMorning || '09:30 - 13:00';
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';
    this.submissionSuccess = false;

    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const requestBody: CreationRendezVousRequest = {
      nomComplet: this.appointmentForm.value.fullName,
      telephone: this.appointmentForm.value.phone,
      email: this.appointmentForm.value.email,
      soin: this.appointmentForm.value.careType,
      dateSouhaitee: this.appointmentForm.value.preferredDate,
      heureSouhaitee: this.appointmentForm.value.preferredTime,
      message: this.appointmentForm.value.message || ''
    };

    this.rendezVousService.creerDemande(requestBody).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submissionSuccess = true;
        this.successMessage = 'Votre demande de rendez-vous a bien été enregistrée. Elle est en attente de confirmation par le cabinet.';
        this.appointmentForm.reset({
          fullName: '',
          phone: '',
          email: '',
          careType: '',
          preferredDate: '',
          preferredTime: '',
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
          this.errorMessage = 'Impossible de contacter le serveur backend. Veuillez vérifier votre connexion.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l’enregistrement de votre demande. Veuillez réessayer.';
        }
      }
    });
  }
}
