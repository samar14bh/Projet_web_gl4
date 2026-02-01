import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { UserProfileService } from '../../Core/services/user-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly userFullName = computed(() => {
    const u = this.user();
    return u ? `${u.name} ${u.lastName}` : '';
  });

  readonly userAge = computed(() => {
    const dob = this.user()?.dateOfBirth;
    return dob ? this.userProfileService.calculateAge(dob) : null;
  });

  readonly displayImageUrl = computed(() => 
    this.userProfileService.getImageUrl(this.user()?.image)
  );

  readonly majorFullName = computed(() => {
    const major = this.user()?.major;
    return major 
      ? this.userProfileService.getMajorFullName(major) 
      : 'Non renseignée';
  });

  readonly userInitials = computed(() => 
    this.userProfileService.getUserInitials(
      this.user()?.name,
      this.user()?.lastName
    )
  );

  editProfile(): void {
    this.router.navigate(['/settings']);
  }
  getUserFullName = this.userFullName;
}