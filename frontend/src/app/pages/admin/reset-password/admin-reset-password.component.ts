import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="reset-wrapper">
      <div class="reset-card">
        
        <div class="reset-header">
          <div class="icon-circle">
            <span class="material-symbols-outlined icon">key</span>
          </div>
          <h1 class="reset-title">Nouveau mot de passe</h1>
          <p class="reset-subtitle">Définissez un nouveau mot de passe sécurisé pour votre compte admin</p>
        </div>

        <div class="error-banner" *ngIf="errorMessage">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="success-banner" *ngIf="successMessage">
          <span class="material-symbols-outlined">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>

        <form *ngIf="!successMessage" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form" novalidate>

          <div class="form-group" [class.has-error]="f['newPassword'].invalid && (f['newPassword'].touched || isSubmitted)">
            <label for="newPassword" class="form-label">Nouveau mot de passe</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">lock</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="newPassword" 
                formControlName="newPassword" 
                class="form-control" 
                placeholder="••••••••">
              <button type="button" class="btn-toggle-pwd" (click)="showPassword = !showPassword">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="error-msg" *ngIf="f['newPassword'].invalid && (f['newPassword'].touched || isSubmitted)">
              <span *ngIf="f['newPassword'].errors?.['required']">Veuillez saisir votre nouveau mot de passe.</span>
              <span *ngIf="f['newPassword'].errors?.['minlength']">Le mot de passe doit contenir au moins 6 caractères.</span>
            </div>
          </div>

          <div class="form-group" [class.has-error]="(f['confirmPassword'].invalid || resetForm.errors?.['mismatch']) && (f['confirmPassword'].touched || isSubmitted)">
            <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">lock_reset</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                class="form-control" 
                placeholder="••••••••">
            </div>
            <div class="error-msg" *ngIf="(f['confirmPassword'].invalid || resetForm.errors?.['mismatch']) && (f['confirmPassword'].touched || isSubmitted)">
              <span *ngIf="f['confirmPassword'].errors?.['required']">Veuillez confirmer votre mot de passe.</span>
              <span *ngIf="resetForm.errors?.['mismatch']">Les deux mots de passe ne correspondent pas.</span>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            <span class="material-symbols-outlined btn-icon" *ngIf="!isLoading">save</span>
            <span class="material-symbols-outlined btn-spinner" *ngIf="isLoading">sync</span>
            <span>{{ isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}</span>
          </button>

        </form>

        <div class="reset-footer" *ngIf="successMessage">
          <a routerLink="/admin/login" class="btn-login-redirect">
            <span class="material-symbols-outlined">login</span>
            <span>Se connecter maintenant</span>
          </a>
        </div>

        <div class="reset-footer" *ngIf="!successMessage">
          <a routerLink="/admin/login" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Retour à la connexion</span>
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .reset-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 20px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .reset-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 20px;
      padding: 40px 32px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    .reset-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      background: #e0f2fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .icon {
      font-size: 34px;
      color: #0284c7;
    }

    .reset-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    .reset-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #991b1b;
      font-size: 0.9rem;
    }

    .success-banner {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #166534;
      font-size: 0.9rem;
    }

    .reset-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 12px;
      color: #94a3b8;
      font-size: 20px;
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #0f172a;

      &:focus {
        outline: none;
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      }
    }

    .btn-toggle-pwd {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
    }

    .error-msg {
      font-size: 0.8rem;
      color: #ef4444;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;

      &:hover:not(:disabled) {
        background: #0369a1;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-login-redirect {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      background: #16a34a;
      color: #ffffff;
      text-decoration: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
    }

    .btn-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .reset-footer {
      margin-top: 28px;
      text-align: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 0.9rem;

      &:hover {
        color: #0284c7;
      }
    }
  `]
})
export class AdminResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token = '';
  isSubmitted = false;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.errorMessage = 'Jeton de réinitialisation absent ou invalide.';
    }

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  get f() { return this.resetForm.controls; }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.authService.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la réinitialisation du mot de passe.';
      }
    });
  }
}
