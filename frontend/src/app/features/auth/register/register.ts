import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterDto, StudyMajor } from '../../../Core/models/auth.models';
import { AuthService } from '../../../Core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button';
import { Observable, of, map, catchError, delay } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedFile = signal<File | null>(null);
  selectedFileName = signal('');
  imagePreview = signal('');
  fileError = signal('');

  // Clés pour le localStorage
  private readonly FORM_STORAGE_KEY = 'register_form_data';
  private readonly IMAGE_STORAGE_KEY = 'register_image_data';

  studyMajors = [
    { value: StudyMajor.BIO, label: 'BIO' },
    { value: StudyMajor.GL, label: 'GL' },
    { value: StudyMajor.CH, label: 'CH' },
    { value: StudyMajor.IIA, label: 'IIA' },
    { value: StudyMajor.IMI, label: 'IMI' },
    { value: StudyMajor.RT, label: 'RT' }
  ];

  registerForm = this.fb.nonNullable.group({
    email: ['', 
      [Validators.required, Validators.email],
      [this.emailValidator.bind(this)] // Validateur asynchrone
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    major: ['', [Validators.required]],
    dateOfBirth: ['', 
      [Validators.required, this.minimumAgeValidator(18)] // Validateur d'âge
    ]
  });

  ngOnInit(): void {
    this.restoreFormData();
    
    // Sauvegarde automatique lors des changements
    this.registerForm.valueChanges.subscribe(() => {
      this.saveFormData();
    });
    
    // Nettoie le localStorage si le formulaire est soumis avec succès
    this.registerForm.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        // Si l'utilisateur a déjà soumis avec succès, on nettoie
        if (this.successMessage()) {
          this.clearFormData();
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoie le localStorage si le formulaire a été soumis avec succès
    if (this.successMessage()) {
      this.clearFormData();
    }
  }

  // Validateur d'âge minimum
  private minimumAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= minAge ? null : { minimumAge: { requiredAge: minAge, actualAge: age } };
    };
  }

 private emailValidator(control: AbstractControl): Observable<ValidationErrors | null> {
  if (!control.value || control.errors?.['required'] || control.errors?.['email']) {
    return of(null);
  }

  return this.authService.checkEmailExists(control.value).pipe(
    map(response => {
      return response.exists ? { emailTaken: true } : null;
    }),
    catchError(() => of(null)) 
  );
}

  // Sauvegarde des données du formulaire
  private saveFormData(): void {
    try {
      // Sauvegarde les données du formulaire
      const formData = this.registerForm.getRawValue();
      localStorage.setItem(this.FORM_STORAGE_KEY, JSON.stringify(formData));
      
      // Sauvegarde les métadonnées de l'image (pas le fichier lui-même)
      if (this.selectedFile()) {
        const imageData = {
          fileName: this.selectedFileName(),
          preview: this.imagePreview()
        };
        localStorage.setItem(this.IMAGE_STORAGE_KEY, JSON.stringify(imageData));
      } else {
        localStorage.removeItem(this.IMAGE_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du formulaire:', error);
    }
  }

  // Restauration des données du formulaire
  private restoreFormData(): void {
    try {
      // Restaure les données du formulaire
      const savedFormData = localStorage.getItem(this.FORM_STORAGE_KEY);
      if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        
        // Met à jour le formulaire
        this.registerForm.patchValue(formData, { emitEvent: false });
        
        // Restaure les métadonnées de l'image
        const savedImageData = localStorage.getItem(this.IMAGE_STORAGE_KEY);
        if (savedImageData) {
          const imageData = JSON.parse(savedImageData);
          this.selectedFileName.set(imageData.fileName);
          this.imagePreview.set(imageData.preview);
          // Note: on ne peut pas restaurer le File objet, on indique juste qu'il y avait une image
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la restauration du formulaire:', error);
      this.clearFormData();
    }
  }

  // Nettoyage des données sauvegardées
  private clearFormData(): void {
    localStorage.removeItem(this.FORM_STORAGE_KEY);
    localStorage.removeItem(this.IMAGE_STORAGE_KEY);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

    this.fileError.set('');

    if (!allowedTypes.includes(file.type)) {
      this.fileError.set('Format non supporté. Utilisez JPG, PNG ou GIF.');
      this.selectedFile.set(null);
      this.selectedFileName.set('');
      this.imagePreview.set('');
      return;
    }

    if (file.size > maxSize) {
      this.fileError.set('L\'image ne doit pas dépasser 5 MB.');
      this.selectedFile.set(null);
      this.selectedFileName.set('');
      this.imagePreview.set('');
      return;
    }

    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      this.imagePreview.set(preview);
      // Sauvegarde après chargement de l'image
      this.saveFormData();
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData: RegisterDto = {
      ...this.registerForm.getRawValue(),
      major: this.registerForm.value.major as StudyMajor
    };

    const registerObservable = this.selectedFile()
      ? this.authService.registerWithImage(formData, this.selectedFile()!)
      : this.authService.register(formData);

    registerObservable.subscribe({
      next: (response) => {
        this.successMessage.set('✓ Compte créé avec succès !');
        this.isLoading.set(false);
        
        // Nettoyage des données sauvegardées après succès
        this.clearFormData();
        
        // Stocker temporairement l'utilisateur (non vérifié)
        if (response.user) {
          this.authService.currentUser.set(response.user);
        }
        
        // Redirige vers la page de confirmation
        setTimeout(() => {
          this.router.navigate(['/register-success'], { 
            queryParams: { email: formData.email } 
          });
        }, 1500);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de l\'inscription');
        this.isLoading.set(false);
      }
    });
  }

  // Méthode pour effacer manuellement les données sauvegardées
  clearSavedData(): void {
    this.clearFormData();
    this.registerForm.reset();
    this.selectedFile.set(null);
    this.selectedFileName.set('');
    this.imagePreview.set('');
    this.fileError.set('');
  }
}