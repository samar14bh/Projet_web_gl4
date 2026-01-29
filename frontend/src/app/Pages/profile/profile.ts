import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { StudyMajor } from '../../Core/models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
   readonly authService = inject(AuthService);
   readonly router = inject(Router);

  user = this.authService.currentUser;
  isEditing = signal(false);
 getUserFullName(): string {
    return this.authService.userFullName();
  }

  userAge = computed(() => {
    const user = this.user();
    if (!user?.dateOfBirth) return null;
    
    const birthDate = new Date(user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  });

  formattedBirthDate = computed(() => {
    const user = this.user();
    if (!user?.dateOfBirth) return '';
    
    const date = new Date(user.dateOfBirth);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  });

  majorFullName = computed(() => {
    const user = this.user();
    if (!user?.major) return '';
    
    const majorNames: Record<StudyMajor, string> = {
      [StudyMajor.GL]: 'Génie Logiciel',
      [StudyMajor.RT]: 'Réseaux et Télécommunications',
      [StudyMajor.IMI]: 'Informatique et Multimédia',
      [StudyMajor.IIA]: 'Intelligence Artificielle Appliquée',
      [StudyMajor.BIO]: 'Bio-Informatique',
      [StudyMajor.CH]: 'Chimie'
    };
    
    return majorNames[user.major] || user.major;
  });

  userInitials = this.authService.userInitials;
  isEmailVerified = this.authService.isEmailVerified;

  async logout(): Promise<void> {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Déconnexion réussie');
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
      }
    });
  }

  editProfile(): void {
    this.isEditing.set(true);
    this.router.navigate(['/settings']);
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) return '';
    return imagePath.startsWith('http') 
      ? imagePath 
      : `/api/uploads/${imagePath}`;
  }
}