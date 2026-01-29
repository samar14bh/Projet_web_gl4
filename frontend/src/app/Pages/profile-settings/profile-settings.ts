import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../Core/services/auth.service';
import { UserService } from '../../Core/services/user.service';
import { StorageService } from '../../Core/services/storage.service';
import { StudyMajor } from '../../Core/models/auth.models';
import { AuthValidators } from '../../shared/validators/auth.validators';

const FORM_CACHE_KEY = 'profile_form_draft';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  profileForm!: FormGroup;
  user = this.authService.currentUser;
  imagePreview = signal<string | null>(null);
  isSubmitting = signal(false);
  majors = Object.values(StudyMajor);
  
  private selectedFile: File | null = null;
  private formSubscription?: Subscription;

  ngOnInit(): void {
    this.initForm();
    this.restoreDraft();
    this.trackChanges();
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  private initForm(): void {
    const u = this.user();
    this.profileForm = this.fb.nonNullable.group({
      name: [u?.name || '', [Validators.required]],
      lastName: [u?.lastName || '', [Validators.required]],
      major: [u?.major || '', [Validators.required]],
      dateOfBirth: [this.formatDate(u?.dateOfBirth), [Validators.required, AuthValidators.minimumAge(18)]]
    });
  }

  private trackChanges(): void {
    this.formSubscription = this.profileForm.valueChanges.subscribe(value => {
      if (this.profileForm.valid) {
        this.storageService.setItem(FORM_CACHE_KEY, value);
      }
    });
  }

  private restoreDraft(): void {
    const draft = this.storageService.getItem<any>(FORM_CACHE_KEY);
    if (draft) {
      this.profileForm.patchValue(draft);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    const userId = this.user()?.id;
    if (!userId || this.profileForm.invalid) return;

    this.isSubmitting.set(true);
    this.userService.updateProfile(Number(userId), this.profileForm.value, this.selectedFile ?? undefined)
      .subscribe({
        next: () => {
          this.storageService.removeItem(FORM_CACHE_KEY);
          this.router.navigate(['/profile']);
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
  }

  private formatDate(date?: string | Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
}