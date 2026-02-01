import {Component, effect, inject, signal} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipService } from '../../../Core/services/membership.service';
import { ClubService } from '../../../Core/services/club.service';
import { CreateApplicationDto } from '../../../Core/dtos/create-application.dto';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed, rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Error } from '../../../shared/components/error/error';
import {Loader} from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-join-club-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Error, Loader],
  templateUrl: './join-club-form.html',
  styleUrls: ['./join-club-form.css'],
})
export class JoinClubForm {
  private fb = inject(FormBuilder);
  private membershipService = inject(MembershipService);
  private clubService = inject(ClubService);
  private route = inject(ActivatedRoute);
  protected location = inject(Location);

  private storageKey = '';

  joinClubForm: FormGroup;
  private clubId: number;
  private userId: number;
  success = signal(false);

  statusResource = rxResource({
    stream: () =>
      this.clubService.getUserClubStatus(this.clubId, this.userId)
  });








  constructor() {
    this.clubId = Number(this.route.snapshot.paramMap.get('clubId'));
    this.userId = 17;
    this.storageKey = `join-club-form-${this.userId}-${this.clubId}`;

    this.joinClubForm = this.fb.group({
      whyJoin: [null, [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      previousClub: [null, [Validators.required, Validators.maxLength(255)]],
      goalsInClub: [null, [Validators.required, Validators.minLength(30), Validators.maxLength(1000)]],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^[0-9]{8,20}$/)]],
      skills: [null, [Validators.required, Validators.maxLength(500)]],
      expectations: [null, [Validators.required, Validators.maxLength(500)]],
      availability: [null, [Validators.required, Validators.maxLength(100)]],
      additionalComments: [null, [Validators.required, Validators.maxLength(500)]],
      isMemberOfOtherClub: [null, [Validators.required]],
    });
    effect(() => {
      const status = this.statusResource.value(); // get the value
      console.log("Club status:", status);
    });

    this.loadSavedForm();

    this.joinClubForm.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.saveFormToStorage();
      });
  }


  private loadSavedForm() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const savedTimestamp = parsedData.timestamp;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        if (savedTimestamp && savedTimestamp > sevenDaysAgo) {
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

  private saveFormToStorage() {
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

  private clearSavedForm() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Erreur lors de la suppression des données sauvegardées:', error);
    }
  }

  submitForm() {
    if (this.joinClubForm.invalid) {
      this.joinClubForm.markAllAsTouched();
      return;
    }

    const dto: CreateApplicationDto = {
      ...this.joinClubForm.value,
      userId: this.userId,
      clubId: this.clubId
    };

    this.membershipService.createApplication(dto)
      .subscribe({
        next: (res) => {
          console.log('Application submitted successfully', res);

          this.success.set(true);

          this.clearSavedForm();

          setTimeout(() => {
            this.location.back();
          }, 2000);
        },
        error: (err) => {
          console.error('Error submitting application', err);
          alert('Une erreur est survenue lors de l\'envoi du formulaire. Vos données sont sauvegardées.');
        },
      });
  }

  getLength(controlName: string): number {
    return (this.joinClubForm.get(controlName)?.value ?? '').length;
  }
}

