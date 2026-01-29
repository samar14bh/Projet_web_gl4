import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../Core/services/auth.service';
import { LoginDto } from '../../../Core/models/auth.models';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly STORAGE_KEY = 'pending_login_email';

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

  constructor() {
    this.restoreFormData();

    this.loginForm.get('email')?.valueChanges.subscribe(value => {
      if (value) {
        localStorage.setItem(this.STORAGE_KEY, value);
      }
    });
  }

  private restoreFormData(): void {
    const savedEmail = localStorage.getItem(this.STORAGE_KEY);
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail });
    }
  }

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const cleanValue = value.replace(/[^0-9]/g, '');
    const limitedValue = cleanValue.slice(0, 6);
    
    if (value !== limitedValue) {
      this.otpForm.patchValue({ otp: limitedValue });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const loginData: LoginDto = this.loginForm.getRawValue();

    this.authService.login(loginData).subscribe({
      next: (response) => {
        localStorage.removeItem(this.STORAGE_KEY);
        
        if ('requiresOtp' in response && response.requiresOtp) {
          this.showOtpInput.set(true);
          this.userEmail.set(loginData.email);
          this.isLoading.set(false);
        } else {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigate([returnUrl]);
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

    const otpValue = this.otpForm.value.otp!;

    this.authService.verifyOtp({
      email: this.userEmail(),
      otp: otpValue
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Code OTP invalide');
        this.isLoading.set(false);
        this.otpForm.patchValue({ otp: '' });
      }
    });
  }

  cancelOtp(): void {
    this.showOtpInput.set(false);
    this.otpForm.reset();
    this.userEmail.set('');
    this.errorMessage.set('');
  }
}