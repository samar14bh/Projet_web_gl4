import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button';


@Component({
  selector: 'app-verify-error',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './verify-error.html',
  styleUrls: ['./verify-error.css']
})
export class VerifyErrorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  errorMessage = signal('Une erreur est survenue lors de la vérification de votre email.');
  errorDetails = signal('');
  showResendButton = signal(false);
  isLoading = signal(false);

  ngOnInit() {
    // Récupérer le message d'erreur depuis l'URL
    const message = this.route.snapshot.queryParamMap.get('message');
    if (message) {
      this.errorMessage.set(decodeURIComponent(message));
      
      // Détecter le type d'erreur pour afficher le bon message
      const errorMsg = this.errorMessage().toLowerCase();
      if (errorMsg.includes('invalide') || errorMsg.includes('invalid')) {
        this.errorDetails.set('Le lien de vérification est incorrect ou a déjà été utilisé.');
        this.showResendButton.set(true);
      } else if (errorMsg.includes('expiré') || errorMsg.includes('expired')) {
        this.errorDetails.set('Le lien de vérification a expiré (valable 1 heure seulement).');
        this.showResendButton.set(true);
      } else {
        this.errorDetails.set('Veuillez réessayer ou contacter le support.');
      }
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  resendVerification(): void {
    this.isLoading.set(true);
    
    // Récupérer l'email depuis le localStorage ou les query params
    const userEmail = localStorage.getItem('pendingVerificationEmail') || '';
    
    if (userEmail) {
      // Ici, vous devrez implémenter l'appel à votre service
      // Exemple: this.authService.resendVerificationEmail(userEmail).subscribe(...)
      console.log(`Renvoyer le lien de vérification à: ${userEmail}`);
      
      // Simulation d'appel API
      setTimeout(() => {
        this.isLoading.set(false);
        alert(`Un nouveau lien de vérification a été envoyé à ${userEmail}`);
        this.showResendButton.set(false);
      }, 1500);
    } else {
      // Si pas d'email trouvé, rediriger vers la page de réinitialisation
      this.router.navigate(['/request-verification']);
    }
  }
}