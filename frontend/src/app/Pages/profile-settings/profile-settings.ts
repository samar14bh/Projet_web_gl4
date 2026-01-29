import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { UserService } from '../../Core/services/user.service';
import { StudyMajor } from '../../Core/models/auth.models';

@Component({
  selector: 'app-profile-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  user = this.authService.currentUser;
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;
  isSubmitting = signal(false);
  majors = Object.values(StudyMajor);
  formData = {
    name: this.user()?.name || '',
    lastName: this.user()?.lastName || '',
    major: this.user()?.major || '',
    dateOfBirth: this.user()?.dateOfBirth ? new Date(this.user()!.dateOfBirth).toISOString().split('T')[0] : '',
  };

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) return;

    const numericId = Number(userId);
    if (isNaN(numericId)) return;

    this.isSubmitting.set(true);
    this.userService.updateProfile(numericId, this.formData, this.selectedFile || undefined)
      .subscribe({
        next: (updatedUser) => {

          console.log('Données reçues:', updatedUser);
          console.log('État actuel du signal:', this.authService.currentUser());
          
          this.isSubmitting.set(false);
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 100);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Erreur mise à jour:', err);
          console.error('Détails:', err.error);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}