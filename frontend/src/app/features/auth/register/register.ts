import { Component, inject, signal, effect, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, NavigationStart } from '@angular/router';
import { RegisterDto, StudyMajor } from '../../../Core/models/auth.models';
import { AuthService } from '../../../Core/services/auth.service';
import { StorageService } from '../../../Core/services/storage.service';
import { AuthValidators } from '../../../shared/validators/auth.validators';
import { ButtonComponent } from '../../../shared/components/button/button';
import { debounceTime, filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  // Constants
  private readonly FORM_KEY = 'register_form_data';
  private readonly IMAGE_KEY = 'register_image_data';

  // Signals d'état
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedFile = signal<File | null>(null);
  selectedFileName = signal('');
  imagePreview = signal('');
  fileError = signal('');

  studyMajors = Object.values(StudyMajor).map(val => ({ value: val, label: val }));

  registerForm = this.fb.nonNullable.group({
    email: ['', 
      [Validators.required, Validators.email],
      [AuthValidators.emailAvailable(this.authService)]
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    major: ['', [Validators.required]],
    dateOfBirth: ['', [Validators.required, AuthValidators.minimumAge(18)]]
  });

  // Convertir les changements du formulaire en signal
  private formChanges = toSignal(
    this.registerForm.valueChanges.pipe(debounceTime(500)),
    { initialValue: this.registerForm.value }
  );

  // Convertir les événements de navigation en signal
  private navigationEvents = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    )
  );

  constructor() {
    // Effect pour sauvegarder automatiquement le formulaire
    effect(() => {
      const formValue = this.formChanges();
      if (formValue) {
        this.saveFormData();
      }
    });

    // Effect pour sauvegarder lors de la navigation
    effect(() => {
      const navEvent = this.navigationEvents();
      if (navEvent) {
        this.saveFormData();
      }
    });

    // Effect pour sauvegarder l'image quand elle change
    effect(() => {
      const preview = this.imagePreview();
      const fileName = this.selectedFileName();
      
      if (preview && fileName) {
        this.storageService.setItem(this.IMAGE_KEY, {
          fileName,
          preview
        });
      }
    });
  }

  @HostListener('window:beforeunload')
  onUnload(): void {
    this.saveFormData();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.restoreFormData();
  }

  private saveFormData(): void {
    const formData = this.registerForm.getRawValue();
    
    // Ne sauvegarder que si le formulaire contient des données
    const hasData = Object.values(formData).some(value => value !== '' && value !== null);
    
    if (hasData) {
      this.storageService.setItem(this.FORM_KEY, {
        ...formData,
        timestamp: new Date().getTime()
      });
    }
  }

  private restoreFormData(): void {
    const savedForm = this.storageService.getItem<any>(this.FORM_KEY);
    
    if (savedForm) {
      // Vérifier que les données ne sont pas trop anciennes (24 heures)
      const MAX_DRAFT_AGE = 24 * 60 * 60 * 1000;
      const draftAge = new Date().getTime() - (savedForm.timestamp || 0);

      if (draftAge < MAX_DRAFT_AGE) {
        // Retirer le timestamp avant de patcher le formulaire
        const { timestamp, ...formData } = savedForm;
        this.registerForm.patchValue(formData, { emitEvent: false });
      } else {
        // Supprimer les données expirées
        this.clearSavedData();
      }
    }

    const savedImage = this.storageService.getItem<any>(this.IMAGE_KEY);
    if (savedImage) {
      this.selectedFileName.set(savedImage.fileName);
      this.imagePreview.set(savedImage.preview);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Validation de la taille du fichier (par exemple 5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      this.fileError.set('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    // Validation du type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.fileError.set('Type de fichier non supporté (JPG, PNG, GIF, WEBP)');
      return;
    }

    this.fileError.set('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFile.set(file);
      this.selectedFileName.set(file.name);
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.selectedFileName.set('');
    this.imagePreview.set('');
    this.storageService.removeItem(this.IMAGE_KEY);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const dto: RegisterDto = {
      ...this.registerForm.getRawValue(),
      major: this.registerForm.value.major as StudyMajor
    };

    const request = this.selectedFile() 
      ? this.authService.registerWithImage(dto, this.selectedFile()!)
      : this.authService.register(dto);

    request.subscribe({
      next: () => {
        this.successMessage.set('Compte créé avec succès !');
        this.clearSavedData();
        setTimeout(() => this.router.navigate(['/register-success']), 1500);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de l\'inscription');
        this.isLoading.set(false);
      }
    });
  }

  clearSavedData(): void {
    this.storageService.removeItem(this.FORM_KEY);
    this.storageService.removeItem(this.IMAGE_KEY);
    this.registerForm.reset();
    this.imagePreview.set('');
    this.selectedFileName.set('');
    this.selectedFile.set(null);
    this.fileError.set('');
  }
}