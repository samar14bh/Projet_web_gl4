import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../Core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { ButtonComponent } from '../../../shared/components/button/button';


@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css']
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isLoading = signal(true);
  success = signal(false);
  errorMessage = signal('');
  showResendButton = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    
    if (!token) {
      this.errorMessage.set('Lien de vérification invalide ou expiré');
      this.showResendButton.set(true);
      this.isLoading.set(false);
      return;
    }

    // Envoyer le token au backend via POST
    this.http.post(`${environment.apiUrl}/verify-email`, { token })
      .subscribe({
        next: (response: any) => {
          this.success.set(true);
          this.isLoading.set(false);
          
          // Mettre à jour l'utilisateur localement
          const currentUser = this.authService.currentUser();
          if (currentUser) {
            this.authService.currentUser.set({
              ...currentUser,
              emailVerified: true
            });
          }
          
          // Optionnel : Supprimer le token de l'URL sans recharger la page
          this.router.navigate([], { 
            replaceUrl: true,
            queryParams: {},
            queryParamsHandling: ''
          });
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message || 
            'Une erreur est survenue lors de la vérification'
          );
          this.showResendButton.set(true);
          this.isLoading.set(false);
          
          this.router.navigate([], { 
            replaceUrl: true,
            queryParams: { 
              error: error.error?.message || 'Erreur de vérification' 
            }
          });
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendVerificationEmail(): void {
    // Récupérer l'email de l'utilisateur s'il est connecté
    const currentUser = this.authService.currentUser();
    if (currentUser?.email) {
      this.isLoading.set(true);
      this.http.post(`${environment.apiUrl}/resend-verification`, { email: currentUser.email })
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.errorMessage.set('Nouveau lien de vérification envoyé !');
            this.showResendButton.set(false);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(error.error?.message || 'Erreur lors de l\'envoi');
          }
        });
    }
  }
}