import {
  Component,
  signal,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { EventService } from '../../../../Core/services/event.service';
import { CreateEventDto, UpdateEventDto } from '../../../../Core/models/event.model';
import { EventStatus, EventType } from '../../../../Core/models/event.model';
import { effect } from '@angular/core';
import { FileUploadService } from '../../../../Core/services/file-upload.service';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

/**
 * Composant formulaire pour créer/éditer un événement
 */
@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css',
})
export class EventFormComponent {
  // ========== SERVICES ==========
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly fileUploadService = inject(FileUploadService);

  // ========== INPUTS/OUTPUTS ==========
  event = input<any | null>(null); // Événement à éditer (null = création)
  onSuccess = output<any>(); // Événement créé/modifié
  onCancel = output<void>(); // Annulation

  // ========== SIGNALS ==========
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  // ========== ENUMS ==========
  EventStatus = EventStatus;
  EventType = EventType;

  eventStatusOptions = [
    { value: EventStatus.UPCOMING, label: 'À venir' },
    { value: EventStatus.ONGOING, label: 'En cours' },
    { value: EventStatus.COMPLETED, label: 'Terminé' },
    { value: EventStatus.CANCELLED, label: 'Annulé' },
  ];

  eventTypeOptions = [
    { value: EventType.AG, label: 'Assemblée Générale' },
    { value: EventType.HACKATHON, label: 'Hackathon' },
    { value: EventType.MEET, label: 'Rencontre' },
    { value: EventType.TEAM_BUILDING, label: 'Team Building' },
    { value: EventType.OTHER, label: 'Autre' },
  ];

  // ========== FORM ==========
  eventForm: FormGroup;

  // ========== COMPUTED ==========
  isEditMode = computed(() => this.event() !== null);
  formTitle = computed(() => this.isEditMode() ? 'Modifier l\'événement' : 'Créer un événement');
  submitButtonLabel = computed(() => this.isEditMode() ? 'Enregistrer' : 'Créer');

  // Upload d'image
  selectedCoverImage = signal<File | null>(null);
  coverImagePreview = signal<string | null>(null);
  imageError = signal<string | null>(null);

  constructor() {
    // Initialiser le formulaire
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      address: [''],
      capacity: [null, [Validators.min(1)]],
      memberOnly: [false],
      status: [EventStatus.UPCOMING, Validators.required],
      sPaid: [EventType.OTHER, Validators.required],
      subscriptionFees: [0, [Validators.required, Validators.min(0)]],
      clubId: [1, Validators.required], // TODO: Récupérer le club de l'utilisateur connecté
    });

    // Si mode édition, pré-remplir le formulaire
    effect(() => {
      const event = this.event();
      if (event) {
        this.patchFormValues();
      } else {
        // Mode création → réinitialiser tout
        this.resetForm();
      }
    });
  }

  /**
   * Pré-remplir le formulaire en mode édition
   */
  patchFormValues() {
    const event = this.event();
    if (!event) return;

    // Déterminer le clubId
    const clubId = event.club?.id || event.clubId || 1;

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      startDate: this.formatDateForInput(event.startDate),
      endDate: this.formatDateForInput(event.endDate),
      address: event.address,
      capacity: event.capacity,
      memberOnly: event.memberOnly,
      status: event.status,
      sPaid: event.sPaid,
      subscriptionFees: event.subscriptionFees,
      clubId: clubId,  // ← Utilisez la variable
    });

    // Charger l'image existante
    if (event.coverImage) {
      const imageUrl = event.coverImage.startsWith('http')
        ? event.coverImage
        : `${environment.uploadsUrl}${event.coverImage}`;
      this.coverImagePreview.set(imageUrl);
    }

    // Debug - À SUPPRIMER APRÈS
    console.log('clubId assigné:', clubId);
    console.log('event.club:', event.club);
    console.log('event:', event);

    // Marquer le formulaire comme valide et non modifié
    this.eventForm.markAsPristine();
    this.eventForm.markAsUntouched();
    this.eventForm.updateValueAndValidity();
  }
  /**
   * Gérer la sélection de l'image
   */
  async onCoverImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedCoverImage.set(null);
      this.coverImagePreview.set(null);
      this.imageError.set(null);
      return;
    }

    // Valider l'image (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('Fichier trop volumineux (max 5 MB)');
      this.selectedCoverImage.set(null);
      this.coverImagePreview.set(null);
      return;
    }

    const validation = this.fileUploadService.validateImage(file);
    if (!validation.valid) {
      this.imageError.set(validation.error || 'Fichier invalide');
      this.selectedCoverImage.set(null);
      this.coverImagePreview.set(null);
      return;
    }

    this.selectedCoverImage.set(file);
    this.imageError.set(null);

    try {
      const base64 = await this.fileUploadService.fileToBase64(file);
      this.coverImagePreview.set(base64);
    } catch (error) {
      console.error('Erreur preview:', error);
      this.imageError.set('Erreur lors du chargement du preview');
    }
  }

  /**
   * Supprimer l'image sélectionnée
   */
  removeCoverImage() {
    this.selectedCoverImage.set(null);
    this.coverImagePreview.set(null);
    this.imageError.set(null);
  }

  /**
   * Formater une date pour input datetime-local
   */
  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Soumettre le formulaire
   */
  /**
   * Soumettre le formulaire
   */
  async onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      const formValue = this.eventForm.value;
      const formData = new FormData();

      // Ajouter tous les champs
      formData.append('title', formValue.title);
      formData.append('description', formValue.description || '');
      formData.append('startDate', formValue.startDate);
      formData.append('endDate', formValue.endDate);
      formData.append('address', formValue.address || '');
      formData.append('capacity', formValue.capacity?.toString() || '');
      formData.append('memberOnly', formValue.memberOnly.toString());
      formData.append('status', formValue.status);
      formData.append('sPaid', formValue.sPaid);
      formData.append('subscriptionFees', formValue.subscriptionFees.toString());
      formData.append('clubId', formValue.clubId.toString());

      // Ajouter l'image si sélectionnée
      if (this.selectedCoverImage()) {
        formData.append('coverImage', this.selectedCoverImage()!, this.selectedCoverImage()!.name);
      }

      let result;
      if (this.isEditMode()) {
        // Mode édition
        result = await lastValueFrom(
          this.eventService.updateEventWithFile(this.event()!.id, formData)
        );
      } else {
        // Mode création
        result = await lastValueFrom(
          this.eventService.createEventWithFile(formData)
        );
      }

      this.isSubmitting.set(false);
      this.onSuccess.emit(result);
    } catch (error: any) {
      this.isSubmitting.set(false);
      this.submitError.set(error?.error?.message || 'Erreur lors de la sauvegarde');
      console.error('Erreur:', error);
    }
  }

  /**
   * Annuler le formulaire
   */
  cancel() {
    this.onCancel.emit();
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Récupérer le message d'erreur d'un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['min']) return `Valeur minimum: ${field.errors['min'].min}`;

    return 'Erreur de validation';
  }
  /**
   * Obtenir l'URL complète d'une image
   */
  getImageUrl(path: string | null | undefined): string {
    if (!path) {
      return 'https://via.placeholder.com/400x200?text=No+Image';
    }

    // Si le chemin commence déjà par http, le retourner tel quel
    if (path.startsWith('http')) {
      return path;
    }

    // Sinon, ajouter l'URL du backend
    return `${environment.uploadsUrl}${path}`;
  }
  /**
   * Réinitialiser le formulaire
   */
  resetForm() {
    this.eventForm.reset({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      address: '',
      capacity: null,
      memberOnly: false,
      status: EventStatus.UPCOMING,
      sPaid: EventType.OTHER,
      subscriptionFees: 0,
      clubId: 1,
    });

    // Réinitialiser les signals d'image
    this.selectedCoverImage.set(null);
    this.coverImagePreview.set(null);
    this.imageError.set(null);
    this.submitError.set(null);
  }
}
