import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button';


@Component({
  selector: 'app-verify-success',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './verify-success.html',
  styleUrls: ['./verify-success.css']
})
export class VerifySuccessComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  
  countdown = signal(5);
  private countdownInterval: any;

  ngOnInit(): void {
    // Redirection automatique après 5 secondes
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown.update(count => {
        if (count <= 1) {
          this.clearCountdown();
          this.goToLogin();
          return 0;
        }
        return count - 1;
      });
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  goToLogin(): void {
    this.clearCountdown();
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.clearCountdown();
    this.router.navigate(['/']);
  }
}