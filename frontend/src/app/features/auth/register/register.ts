import { Component, inject, signal, OnInit, OnDestroy, HostListener, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, NavigationStart } from '@angular/router';
import { RegisterDto, StudyMajor } from '../../../Core/models/auth.models';
import { AuthService } from '../../../Core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button';
import { Observable, of, map, catchError, debounceTime, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedFile = signal<File | null>(null);
  selectedFileName = signal('');
  imagePreview = signal('');
  fileError = signal('');

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
      [this.emailValidator.bind(this)]
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    major: ['', [Validators.required]],
    dateOfBirth: ['', 
      [Validators.required, this.minimumAgeValidator(18)]
    ]
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.saveFormData();
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    this.saveFormData();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      return;
    }

    this.restoreFormData();
    this.registerForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.saveFormData();
      });
  }

  ngOnDestroy(): void {
    this.saveFormData();
  }

  private saveFormData(): void {
    try {
      const formData = this.registerForm.getRawValue();
      const hasData = Object.values(formData).some(value => value && value !== '');
      
      if (hasData) {
        localStorage.setItem(this.FORM_STORAGE_KEY, JSON.stringify(formData));
        
        if (this.selectedFile() && this.imagePreview()) {
          const imageData = {
            fileName: this.selectedFileName(),
            preview: this.imagePreview()
          };
          localStorage.setItem(this.IMAGE_STORAGE_KEY, JSON.stringify(imageData));
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde locale:', error);
    }
  }

  private restoreFormData(): void {
    try {
      const savedFormData = localStorage.getItem(this.FORM_STORAGE_KEY);
      if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        this.registerForm.patchValue(formData, { emitEvent: false });
        
        const savedImageData = localStorage.getItem(this.IMAGE_STORAGE_KEY);
        if (savedImageData) {
          const imageData = JSON.parse(savedImageData);
          this.selectedFileName.set(imageData.fileName);
          this.imagePreview.set(imageData.preview);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
    }
  }

  private clearFormData(): void {
    localStorage.removeItem(this.FORM_STORAGE_KEY);
    localStorage.removeItem(this.IMAGE_STORAGE_KEY);
  }

  private minimumAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
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
      map(response => response.exists ? { emailTaken: true } : null),
      catchError(() => of(null)) 
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedFile.set(file);
      this.selectedFileName.set(file.name);
      this.imagePreview.set(e.target?.result as string);
      this.saveFormData(); 
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

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
        
        if (response.user) {
          this.authService.currentUser.set(response.user);
        }
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
  clearSavedData(): void {
    this.clearFormData();
    this.registerForm.reset();
    this.selectedFile.set(null);
    this.selectedFileName.set('');
    this.imagePreview.set('');
    this.fileError.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}