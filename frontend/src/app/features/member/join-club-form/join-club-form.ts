import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, numberAttribute, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { MembershipService } from '../../../Core/services/membership.service';
import { ClubService } from '../../../Core/services/club.service';
import { CreateApplicationDto } from '../../../Core/dtos/application/create-application.dto';
import { debounceTime, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntilDestroyed, rxResource } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Error } from '../../../shared/components/error/error';
import { NotificationService } from '../../../Core/services/notification.service';
import { Loader } from '../../../shared/components/loader/loader';
import { AuthService } from '../../../Core/services/auth.service';

const FORM_EXPIRATION_DAYS = 7;
const SUCCESS_REDIRECT_DELAY_MS = 2000;
const FORM_SAVE_DEBOUNCE_MS = 1000;

@Component({
  selector: 'app-join-club-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Error, Loader],
  templateUrl: './join-club-form.html',
  styleUrls: ['./join-club-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinClubForm implements OnInit {
  private readonly membershipService = inject(MembershipService);
  private readonly authService = inject(AuthService);
  private readonly clubService = inject(ClubService);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly location = inject(Location);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);


  readonly clubId = input.required<number>();

  private readonly userId = this.authService.currentUser()?.id;
  private storageKey!: string;

  readonly joinClubForm: FormGroup;
  readonly success = signal(false);
  readonly errorMessage = signal('');

  readonly statusResource = rxResource({
    params: () => ({ clubId: this.clubId(), userId: this.userId }),
    stream: ({ params }) => {
      if (params.userId === undefined) {
        this.router.navigate(['/login']);
        return EMPTY;
      }
      return this.clubService.getUserClubStatus(params.clubId, Number(params.userId));
    }
  });

  constructor() {
    this.joinClubForm = this.fb.group({
      whyJoin: [null, [Validators.required, Validators.minLength(50), Validators.maxLength(1000), CustomValidators.noWhitespace()]],
      previousClub: [null, [Validators.required, Validators.maxLength(255), CustomValidators.noWhitespace()]],
      goalsInClub: [null, [Validators.required, Validators.minLength(30), Validators.maxLength(1000), CustomValidators.noWhitespace()]],
      phoneNumber: [null, [Validators.required, CustomValidators.phoneNumber()]],
      skills: [null, [Validators.required, Validators.maxLength(500), CustomValidators.noWhitespace()]],
      expectations: [null, [Validators.required, Validators.maxLength(500), CustomValidators.noWhitespace()]],
      availability: [null, [Validators.required, Validators.maxLength(100), CustomValidators.noWhitespace()]],
      additionalComments: [null, [Validators.required, Validators.maxLength(500), CustomValidators.noWhitespace()]],
      isMemberOfOtherClub: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.storageKey = `join-club-form-${this.userId}-${this.clubId()}`;
    this.loadSavedForm();

    this.joinClubForm.valueChanges
      .pipe(
        debounceTime(FORM_SAVE_DEBOUNCE_MS),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.saveFormToStorage();
      });
  }


  private loadSavedForm(): void {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const savedTimestamp = parsedData.timestamp;
        const expirationTime = Date.now() - (FORM_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

        if (savedTimestamp && savedTimestamp > expirationTime) {
          this.joinClubForm.patchValue(parsedData.formData);
          console.log('Données du formulaire restaurées');
        } else {
          localStorage.removeItem(this.storageKey);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données sauvegardées:', error);
    }
  }

  private saveFormToStorage(): void {
    try {
      const dataToSave = {
        formData: this.joinClubForm.value,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }

  private clearSavedForm(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Erreur lors de la suppression des données sauvegardées:', error);
    }
  }

  submitForm(): void {
    if (this.joinClubForm.invalid) {
      this.joinClubForm.markAllAsTouched();
      return;
    }

    const dto: CreateApplicationDto = {
      ...this.joinClubForm.value,
      userId: Number(this.userId),
      clubId: Number(this.clubId())
    };


    this.membershipService.createApplication(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Application submitted successfully', res);

          this.success.set(true);
          this.clearSavedForm();

          setTimeout(() => {
            this.location.back();
            this.cdr.markForCheck(); // Ensure change detection with OnPush
          }, SUCCESS_REDIRECT_DELAY_MS);
        },
        error: (err) => {
          console.error('Error submitting application', err);
          this.errorMessage.set('Une erreur est survenue lors de l\'envoi du formulaire. Vos données sont sauvegardées.');
        },
      });
  }

  getLength(controlName: string): number {
    return (this.joinClubForm.get(controlName)?.value ?? '').length;
  }
}

