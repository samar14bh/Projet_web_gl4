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

  constructor() {
    // Initialiser le formulaire
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      coverImage: [''],
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
    if (this.event()) {
      this.patchFormValues();
    }
  }

  /**
   * Pré-remplir le formulaire en mode édition
   */
  patchFormValues() {
    const event = this.event();
    if (!event) return;

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      coverImage: event.coverImage,
      startDate: this.formatDateForInput(event.startDate),
      endDate: this.formatDateForInput(event.endDate),
      address: event.address,
      capacity: event.capacity,
      memberOnly: event.memberOnly,
      status: event.status,
      sPaid: event.sPaid,
      subscriptionFees: event.subscriptionFees,
      clubId: event.clubId,
    });
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
  onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.eventForm.value;

    if (this.isEditMode()) {
      // Mode édition
      const updateDto: UpdateEventDto = formValue;
      this.eventService.updateEvent(this.event()!.id, updateDto).subscribe({
        next: (updatedEvent) => {
          this.isSubmitting.set(false);
          this.onSuccess.emit(updatedEvent);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitError.set(error.error?.message || 'Erreur lors de la modification');
          console.error('Erreur modification événement:', error);
        },
      });
    } else {
      // Mode création
      const createDto: CreateEventDto = formValue;
      this.eventService.createEvent(createDto).subscribe({
        next: (newEvent) => {
          this.isSubmitting.set(false);
          this.onSuccess.emit(newEvent);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitError.set(error.error?.message || 'Erreur lors de la création');
          console.error('Erreur création événement:', error);
        },
      });
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
}
