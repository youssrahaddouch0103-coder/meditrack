import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="forgot-wrapper">
      <div class="forgot-card">
        
        <div class="forgot-header">
          <div class="icon-circle">
            <span class="material-symbols-outlined icon">lock_reset</span>
          </div>
          <h1 class="forgot-title">Récupération de compte</h1>
          <p class="forgot-subtitle">Choisissez votre méthode de récupération d'accès admin</p>
        </div>

        <!-- Navigation par Onglets (2 méthodes uniquement) -->
        <div class="tab-nav">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab === 'login_email'"
            (click)="switchTab('login_email')">
            <span class="material-symbols-outlined tab-icon">mail</span>
            <span>Mot de passe oublié ?</span>
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab === 'emergency_code'"
            (click)="switchTab('emergency_code')">
            <span class="material-symbols-outlined tab-icon">key</span>
            <span>Code d'urgence</span>
          </button>
        </div>

        <!-- Bannières d'alerte -->
        <div class="success-banner" *ngIf="successMessage">
          <span class="material-symbols-outlined">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>

        <div class="error-banner" *ngIf="errorMessage">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- METHODE 1 : Email administrateur (contact@meditrack.local) -->
        <form *ngIf="activeTab === 'login_email'" [formGroup]="forgotForm" (ngSubmit)="submitForgotEmail()" class="forgot-form" novalidate>
          <div class="form-instruction">
            Saisissez l'adresse e-mail de votre compte administrateur. Un lien sécurisé de réinitialisation vous sera envoyé par e-mail.
          </div>

          <div class="form-group" [class.has-error]="f['email'].invalid && (f['email'].touched || isSubmitted)">
            <label for="email" class="form-label">Email administrateur</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">mail</span>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control" 
                placeholder="contact@meditrack.local">
            </div>
            <div class="error-msg" *ngIf="f['email'].invalid && (f['email'].touched || isSubmitted)">
              <span *ngIf="f['email'].errors?.['required']">L'adresse e-mail est obligatoire.</span>
              <span *ngIf="f['email'].errors?.['email']">Format d'adresse e-mail invalide.</span>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            <span class="material-symbols-outlined btn-icon" *ngIf="!isLoading">send</span>
            <span class="material-symbols-outlined btn-spinner" *ngIf="isLoading">sync</span>
            <span>{{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}</span>
          </button>
        </form>

        <!-- METHODE 2 : Code de récupération d'urgence (Si aucun e-mail n'est accessible) -->
        <form *ngIf="activeTab === 'emergency_code'" [formGroup]="emergencyForm" (ngSubmit)="submitEmergencyCode()" class="forgot-form" novalidate>
          <div class="form-instruction alert-instruction">
            Si vous n'avez plus accès à votre boîte mail, saisissez l'un de vos <strong>codes de récupération d'urgence</strong> à usage unique pour redéfinir directement votre mot de passe.
          </div>

          <div class="form-group" [class.has-error]="ef['recoveryCode'].invalid && (ef['recoveryCode'].touched || isSubmitted)">
            <label for="recoveryCode" class="form-label">Code de récupération d'urgence</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">key</span>
              <input 
                type="text" 
                id="recoveryCode" 
                formControlName="recoveryCode" 
                class="form-control code-input" 
                placeholder="A7K9-X2PM">
            </div>
            <div class="error-msg" *ngIf="ef['recoveryCode'].invalid && (ef['recoveryCode'].touched || isSubmitted)">
              <span *ngIf="ef['recoveryCode'].errors?.['required']">Le code d'urgence est obligatoire.</span>
            </div>
          </div>

          <div class="form-group" [class.has-error]="ef['newLoginEmail'].invalid && (ef['newLoginEmail'].touched || isSubmitted)">
            <label for="newLoginEmail" class="form-label">Nouvelle adresse e-mail de connexion</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">mail</span>
              <input 
                type="email" 
                id="newLoginEmail" 
                formControlName="newLoginEmail" 
                class="form-control" 
                placeholder="contact@meditrack.local">
            </div>
            <div class="error-msg" *ngIf="ef['newLoginEmail'].invalid && (ef['newLoginEmail'].touched || isSubmitted)">
              <span *ngIf="ef['newLoginEmail'].errors?.['required']">L'adresse e-mail de connexion est obligatoire.</span>
              <span *ngIf="ef['newLoginEmail'].errors?.['email']">Format d'adresse e-mail invalide.</span>
            </div>
          </div>

          <div class="form-group" [class.has-error]="ef['newPassword'].invalid && (ef['newPassword'].touched || isSubmitted)">
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
            <div class="error-msg" *ngIf="ef['newPassword'].invalid && (ef['newPassword'].touched || isSubmitted)">
              <span *ngIf="ef['newPassword'].errors?.['required']">Le mot de passe est obligatoire.</span>
              <span *ngIf="ef['newPassword'].errors?.['minlength']">Au moins 6 caractères requis.</span>
            </div>
          </div>

          <div class="form-group" [class.has-error]="(ef['confirmPassword'].invalid || emergencyForm.errors?.['mismatch']) && (ef['confirmPassword'].touched || isSubmitted)">
            <label for="confirmPassword" class="form-label">Confirmer le nouveau mot de passe</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">lock_reset</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                class="form-control" 
                placeholder="••••••••">
            </div>
            <div class="error-msg" *ngIf="(ef['confirmPassword'].touched || isSubmitted) && emergencyForm.errors?.['mismatch']">
              Les mots de passe ne correspondent pas.
            </div>
          </div>

          <button type="submit" class="btn-submit btn-danger" [disabled]="isLoading">
            <span class="material-symbols-outlined btn-icon" *ngIf="!isLoading">verified_user</span>
            <span class="material-symbols-outlined btn-spinner" *ngIf="isLoading">sync</span>
            <span>{{ isLoading ? 'Récupération...' : 'Réinitialiser le mot de passe' }}</span>
          </button>
        </form>

        <div class="forgot-footer">
          <a routerLink="/admin/login" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Retour à la connexion</span>
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .forgot-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 20px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .forgot-card {
      width: 100%;
      max-width: 480px;
      background: #ffffff;
      border-radius: 20px;
      padding: 36px 30px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    .forgot-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .icon-circle {
      width: 60px;
      height: 60px;
      background: #e0f2fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
    }

    .icon {
      font-size: 32px;
      color: #0284c7;
    }

    .forgot-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px 0;
    }

    .forgot-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .tab-nav {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .tab-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 10px 6px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;

      .tab-icon {
        font-size: 18px;
      }

      &:hover {
        color: #0f172a;
      }

      &.active {
        background: #ffffff;
        color: #0284c7;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    }

    .success-banner {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #166534;
      font-size: 0.875rem;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #991b1b;
      font-size: 0.875rem;
    }

    .forgot-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-instruction {
      font-size: 0.85rem;
      color: #475569;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      border-left: 3px solid #0284c7;
      line-height: 1.4;
    }

    .alert-instruction {
      border-left-color: #ef4444;
      background: #fef2f2;
      color: #991b1b;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.825rem;
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
      padding: 11px 14px 11px 40px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #0f172a;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      }
    }

    .code-input {
      font-family: monospace;
      font-size: 1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
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
      font-size: 0.775rem;
      color: #ef4444;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 6px;

      &:hover:not(:disabled) {
        background: #0369a1;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-danger {
      background: #dc2626;
      &:hover:not(:disabled) {
        background: #b91c1c;
      }
    }

    .btn-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .forgot-footer {
      margin-top: 24px;
      text-align: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;

      &:hover {
        color: #0284c7;
      }
    }
  `]
})
export class AdminForgotPasswordComponent implements OnInit {
  activeTab: 'login_email' | 'emergency_code' = 'login_email';
  forgotForm!: FormGroup;
  emergencyForm!: FormGroup;

  isSubmitted = false;
  isLoading = false;
  showPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['contact@meditrack.local', [Validators.required, Validators.email]]
    });

    this.emergencyForm = this.fb.group({
      recoveryCode: ['', [Validators.required]],
      newLoginEmail: ['contact@meditrack.local', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const pwd = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pwd === confirm ? null : { mismatch: true };
  }

  switchTab(tab: 'login_email' | 'emergency_code'): void {
    this.activeTab = tab;
    this.isSubmitted = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  get f() { return this.forgotForm.controls; }
  get ef() { return this.emergencyForm.controls; }

  submitForgotEmail(): void {
    this.isSubmitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.authService.requestPasswordReset(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
        this.isSubmitted = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la demande.';
      }
    });
  }

  submitEmergencyCode(): void {
    this.isSubmitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.emergencyForm.invalid) return;

    this.isLoading = true;
    const val = this.emergencyForm.value;
    this.authService.recoverWithEmergencyCode(val.recoveryCode, val.newLoginEmail, val.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message;
        this.emergencyForm.reset();
        this.isSubmitted = false;
        setTimeout(() => {
          this.router.navigate(['/admin/login']);
        }, 2500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Code d’urgence invalide ou déjà utilisé.';
      }
    });
  }
}
