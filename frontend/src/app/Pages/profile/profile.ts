import { Component, inject, computed } from '@angular/core';
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

 
  user = this.authService.currentUser;

  getUserFullName = computed(() => {
    const u = this.user();
    return u ? `${u.name} ${u.lastName}` : '';
  });

  userAge = computed(() => {
    const dob = this.user()?.dateOfBirth;
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  });

 
displayImageUrl = computed(() => {
  const imagePath = this.user()?.image;
  if (!imagePath) return null;
  
  return imagePath.startsWith('http') 
    ? imagePath 
    : `/api/uploads/${imagePath}`;
});
  majorFullName = computed(() => {
    const major = this.user()?.major;
    if (!major) return 'Non renseignée';
    
    const majorNames: Record<string, string> = {
      [StudyMajor.GL]: 'Génie Logiciel',
      [StudyMajor.RT]: 'Réseaux et Télécommunications',
      [StudyMajor.IMI]: 'Informatique et Multimédia',
      [StudyMajor.IIA]: 'Intelligence Artificielle Appliquée',
      [StudyMajor.BIO]: 'Bio-Informatique',
      [StudyMajor.CH]: 'Chimie'
    };
    
    return majorNames[major] || major;
  });

 
  userInitials = computed(() => {
    const name = this.user()?.name;
    return name ? name.charAt(0).toUpperCase() : '?';
  });

  editProfile(): void {
    this.router.navigate(['/settings']);
  }

  
}