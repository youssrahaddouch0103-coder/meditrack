import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        
        <div class="login-header">
          <div class="icon-circle">
            <span class="material-symbols-outlined icon">admin_panel_settings</span>
          </div>
          <h1 class="login-title">Administration Cabinet</h1>
          <p class="login-subtitle">Connectez-vous pour gérer le cabinet dentaire</p>
        </div>

        <!-- Error message banner -->
        <div class="error-banner" *ngIf="errorMessage" role="alert">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate autocomplete="off">
          
          <!-- Email field -->
          <div class="form-group" [class.has-error]="f['email'].invalid && (f['email'].touched || isSubmitted)">
            <label for="email" class="form-label">Adresse e-mail</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">mail</span>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control" 
                placeholder="votre.email@exemple.fr"
                autocomplete="off">
            </div>
            <div class="error-msg" *ngIf="f['email'].invalid && (f['email'].touched || isSubmitted)">
              <span *ngIf="f['email'].errors?.['required']">Veuillez saisir votre adresse e-mail.</span>
              <span *ngIf="f['email'].errors?.['email']">Format d’adresse e-mail invalide.</span>
            </div>
          </div>

          <!-- Password field -->
          <div class="form-group" [class.has-error]="f['motDePasse'].invalid && (f['motDePasse'].touched || isSubmitted)">
            <div class="label-row">
              <label for="motDePasse" class="form-label">Mot de passe</label>
              <a routerLink="/admin/forgot-password" class="forgot-link">Mot de passe oublié ?</a>
            </div>
            <div class="input-wrapper">
              <span class="material-symbols-outlined field-icon">lock</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="motDePasse" 
                formControlName="motDePasse" 
                class="form-control" 
                placeholder="••••••••"
                autocomplete="new-password">
              <button type="button" class="btn-toggle-pwd" (click)="togglePasswordVisibility()" aria-label="Afficher ou masquer le mot de passe">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="error-msg" *ngIf="f['motDePasse'].invalid && (f['motDePasse'].touched || isSubmitted)">
              <span *ngIf="f['motDePasse'].errors?.['required']">Veuillez saisir votre mot de passe.</span>
            </div>
          </div>

          <!-- Submit button -->
          <button 
            type="submit" 
            class="btn-login" 
            [disabled]="isLoading"
            [class.loading]="isLoading">
            <span class="material-symbols-outlined btn-icon" *ngIf="!isLoading">login</span>
            <span class="material-symbols-outlined btn-spinner" *ngIf="isLoading">sync</span>
            <span>{{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}</span>
          </button>

        </form>

        <div class="login-footer">
          <a routerLink="/" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Retour au site public</span>
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 20px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 20px;
      padding: 40px 32px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
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
      font-size: 36px;
      color: #0284c7;
    }

    .login-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    .login-subtitle {
      font-size: 0.9rem;
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
      font-weight: 500;
    }

    .login-form {
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

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .forgot-link {
      font-size: 0.825rem;
      color: #0284c7;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: #0369a1;
        text-decoration: underline;
      }
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
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #0284c7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
      }
    }

    .has-error .form-control {
      border-color: #ef4444;
    }

    .btn-toggle-pwd {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #475569;
      }
    }

    .error-msg {
      font-size: 0.8rem;
      color: #ef4444;
      margin-top: 4px;
    }

    .btn-login {
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
      transition: all 0.2s ease;
      margin-top: 8px;

      &:hover:not(:disabled) {
        background: #0369a1;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .login-footer {
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
      transition: color 0.2s ease;

      &:hover {
        color: #0284c7;
      }
    }
  `]
})
export class AdminLoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  returnUrl: string = '/admin/tableau-de-bord';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/tableau-de-bord']);
      return;
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/tableau-de-bord';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    // Forcer l'effacement de toute re-injection automatique par le navigateur
    setTimeout(() => {
      if (this.loginForm) {
        this.loginForm.reset({ email: '', motDePasse: '' });
      }
    }, 150);
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur d’authentification (Backend).';
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de la connexion. Veuillez réessayer.';
        }
      }
    });
  }
}
