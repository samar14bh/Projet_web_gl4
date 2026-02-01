import { Component, inject, signal, OnInit, OnDestroy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../Core/services/auth.service';
import { UserService } from '../../Core/services/user.service';
import { StorageService } from '../../Core/services/storage.service';
import { UserProfileService } from '../../Core/services/user-profile.service';
import { StudyMajor } from '../../Core/models/auth.models';
import { AuthValidators } from '../../shared/validators/auth.validators';

interface ProfileFormValue {
  name: string;
  lastName: string;
  major: StudyMajor;
  dateOfBirth: string;
  password: string;
}

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
  private readonly userProfileService = inject(UserProfileService);
  private readonly router = inject(Router);
  profileForm!: FormGroup;
  readonly user = this.authService.currentUser;
  readonly imagePreview = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  
  readonly currentImageUrl = computed(() => 
    this.userProfileService.getImageUrl(this.user()?.image)
  );

  readonly majors = this.userProfileService.getAllMajors();
  
  private formSubscription?: Subscription;
  private readonly FORM_CACHE_KEY_PREFIX = 'profile_form_draft';

  constructor() {
    effect(() => {
      const user = this.user();
      if (user && this.profileForm?.valid && !this.isSubmitting()) {
        this.saveDraft();
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.restoreDraft();
    this.setupFormTracking();
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  private initForm(): void {
    const u = this.user();
    this.profileForm = this.fb.nonNullable.group({
      name: [u?.name || '', [Validators.required, Validators.minLength(2)]],
      lastName: [u?.lastName || '', [Validators.required, Validators.minLength(2)]],
      major: [u?.major || '', [Validators.required]],
      dateOfBirth: [
        this.userProfileService.formatDateForInput(u?.dateOfBirth), 
        [Validators.required, AuthValidators.minimumAge(18)]
      ],
      password: ['', [Validators.minLength(8)]]
    });
  }

  private setupFormTracking(): void {
    this.formSubscription = this.profileForm.valueChanges.subscribe(() => {
      if (this.profileForm.valid) {
        this.saveDraft();
      }
    });
  }

  private saveDraft(): void {
    const cacheKey = this.getFormCacheKey();
    if (cacheKey) {
      this.storageService.setItem(cacheKey, this.profileForm.value);
    }
  }

 
  private restoreDraft(): void {
    const cacheKey = this.getFormCacheKey();
    if (!cacheKey) return;

    const draft = this.storageService.getItem<ProfileFormValue>(cacheKey);
    if (draft) {
      this.profileForm.patchValue(draft, { emitEvent: false });
    }
  }

  private getFormCacheKey(): string | null {
    const userId = this.user()?.id;
    return userId ? `${this.FORM_CACHE_KEY_PREFIX}_${userId}` : null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      console.error('Le fichier sélectionné n\'est pas une image');
      return;
    }
    const MAX_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      console.error('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    this.selectedFile.set(file);
    this.generateImagePreview(file);
  }


  private generateImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.onerror = () => {
      console.error('Erreur lors de la lecture du fichier');
      this.imagePreview.set(null);
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.isSubmitting()) return;

    const userId = this.user()?.id;
    if (!userId) {
      console.error('ID utilisateur manquant');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.prepareFormValue();

    this.userService
      .updateProfile(Number(userId), formValue, this.selectedFile() ?? undefined)
      .subscribe({
        next: () => this.handleSubmitSuccess(),
        error: (error) => this.handleSubmitError(error)
      });
  }

 
  private prepareFormValue(): Partial<ProfileFormValue> {
    const value = this.profileForm.value as ProfileFormValue;
    if (!value.password) {
      const { password, ...rest } = value;
      return rest;
    }
    
    return value;
  }

  private handleSubmitSuccess(): void {
    const cacheKey = this.getFormCacheKey();
    if (cacheKey) {
      this.storageService.removeItem(cacheKey);
    }
    
    this.profileForm.get('password')?.reset();
    this.isSubmitting.set(false);
    this.router.navigate(['/profile']);
  }


  private handleSubmitError(error: any): void {
    console.error('Erreur lors de la mise à jour du profil:', error);
    this.isSubmitting.set(false);
  }

  
  cancelEdit(): void {
    const cacheKey = this.getFormCacheKey();
    if (cacheKey) {
      this.storageService.removeItem(cacheKey);
    }
    this.router.navigate(['/profile']);
  }
}