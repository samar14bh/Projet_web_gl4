import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../Core/services/auth.service';
import { StorageService } from '../../../Core/services/storage.service'; 
import { LoginDto } from '../../../Core/models/auth.models';
import { ButtonComponent } from '../../../shared/components/button/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly PENDING_EMAIL_KEY = 'pending_login_email';
  private readonly FORM_DRAFT_KEY = 'login_form_draft';
  
  isLoading = signal(false);
  errorMessage = signal('');
  showOtpInput = signal(false);
  userEmail = signal('');
  
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  otpForm = this.fb.nonNullable.group({
    otp: ['', [
      Validators.required, 
      Validators.minLength(6), 
      Validators.maxLength(6),
      Validators.pattern(/^[0-9]{6}$/)
    ]]
  });

  // Convertir les changements du formulaire en signal
  private formChanges = toSignal(
    this.loginForm.valueChanges.pipe(debounceTime(500)),
    { initialValue: this.loginForm.value }
  );

  constructor() {
    // Effect pour sauvegarder automatiquement le formulaire
    effect(() => {
      const formValue = this.formChanges();
      this.saveFormDraft(formValue);
    });
  }

  ngOnInit(): void {
    // Restaurer le brouillon du formulaire si disponible
    this.restoreFormDraft();
  }

  private saveFormDraft(formValue: any): void {
    // Sauvegarder uniquement si le formulaire contient des données
    if (formValue?.email || formValue?.password) {
      this.storageService.setItem(this.FORM_DRAFT_KEY, {
        email: formValue.email || '',
        password: formValue.password || '',
        timestamp: new Date().getTime()
      });
    }
  }

  private restoreFormDraft(): void {
    const draft = this.storageService.getItem<{
      email: string;
      password: string;
      timestamp: number;
    }>(this.FORM_DRAFT_KEY);

    if (draft) {
      // Vérifier que le brouillon n'est pas trop ancien (24 heures)
      const MAX_DRAFT_AGE = 24 * 60 * 60 * 1000;
      const draftAge = new Date().getTime() - draft.timestamp;

      if (draftAge < MAX_DRAFT_AGE) {
        this.loginForm.patchValue({
          email: draft.email,
          password: draft.password
        }, { emitEvent: false }); // emitEvent: false pour éviter de sauvegarder immédiatement
      } else {
        // Supprimer le brouillon expiré
        this.storageService.removeItem(this.FORM_DRAFT_KEY);
      }
    }
  }

  private clearFormDraft(): void {
    this.storageService.removeItem(this.FORM_DRAFT_KEY);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const loginData: LoginDto = this.loginForm.getRawValue();

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.storageService.setItem(this.PENDING_EMAIL_KEY, loginData.email);
        
        if ('requiresOtp' in response && response.requiresOtp) {
          this.showOtpInput.set(true);
          this.userEmail.set(loginData.email);
          this.isLoading.set(false);
        } else {
          this.clearFormDraft();
          this.handleNavigation();
        }
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Email ou mot de passe incorrect');
        this.isLoading.set(false);
      }
    });
  }

  onVerifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.verifyOtp({
      email: this.userEmail(),
      otp: this.otpForm.value.otp!
    }).subscribe({
      next: () => {
        this.clearFormDraft();
        this.handleNavigation();
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Code OTP invalide');
        this.isLoading.set(false);
        this.otpForm.patchValue({ otp: '' });
      }
    });
  }

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/[^0-9]/g, '').slice(0, 6);
    this.otpForm.patchValue({ otp: cleanValue }, { emitEvent: false });
  }

  cancelOtp(): void {
    this.showOtpInput.set(false);
    this.otpForm.reset();
    this.errorMessage.set('');
  }

  private handleNavigation(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigate([returnUrl]);
  }
}