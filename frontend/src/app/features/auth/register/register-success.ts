import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../Core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-success.html',
  styleUrls: ['./register-success.css']
})
export class RegisterSuccessComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  userEmail = signal('');
  isLoading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  resendDisabled = signal(false);
  countdown = signal(60);
  private countdownInterval: any;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userEmail.set(params['email'] || '');
    });
    this.startResendCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startResendCountdown(): void {
    this.resendDisabled.set(true);
    this.countdown.set(60);

    this.countdownInterval = setInterval(() => {
      this.countdown.update(count => {
        if (count <= 1) {
          clearInterval(this.countdownInterval);
          this.resendDisabled.set(false);
          return 0;
        }
        return count - 1;
      });
    }, 1000);
  }

  resendEmail(): void {
    if (!this.userEmail() || this.resendDisabled()) return;

    this.isLoading.set(true);
    this.message.set('');

    setTimeout(() => {
      this.isLoading.set(false);
      this.message.set('Email de vérification renvoyé !');
      this.messageType.set('success');
      this.startResendCountdown();
    }, 1500);
  }
}
