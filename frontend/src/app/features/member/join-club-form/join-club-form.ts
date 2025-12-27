import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipService } from '../../../Core/services/membership.service';
import { CreateApplicationDto } from '../../../Core/dtos/create-application.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-join-club-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './join-club-form.html',
  styleUrls: ['./join-club-form.css'],
})
export class JoinClubForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private membershipService = inject(MembershipService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  private destroy$ = new Subject<void>();
  private storageKey = '';

  joinClubForm: FormGroup;
  private clubId: number;
  private userId: number;
  showSuccessMessage = false;

  constructor() {
    this.clubId = Number(this.route.snapshot.paramMap.get('clubId'));
    console.log("Joining club with ID:", this.clubId);
    this.userId = 1;
    this.storageKey = `join-club-form-${this.userId}-${this.clubId}`;

    this.joinClubForm = this.fb.group({
      whyJoin: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      previousClub: ['', [Validators.maxLength(255)]],
      goalsInClub: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(1000)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,20}$/)]],
      skills: ['', [Validators.maxLength(500)]],
      expectations: ['', [Validators.maxLength(500)]],
      availability: ['', [Validators.maxLength(100)]],
      additionalComments: ['', [Validators.maxLength(500)]],
      isMemberOfOtherClub: [false],
    });
  }

  ngOnInit() {
    this.loadSavedForm();

    this.joinClubForm.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveFormToStorage();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSavedForm() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Ne charger que si les données ont moins de 7 jours
        const savedTimestamp = parsedData.timestamp;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        if (savedTimestamp && savedTimestamp > sevenDaysAgo) {
          this.joinClubForm.patchValue(parsedData.formData);
          console.log('Données du formulaire restaurées');
        } else {
          // Supprimer les anciennes données
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

    this.membershipService.createApplication(dto).subscribe({
      next: (res) => {
        console.log('Application submitted successfully', res);
        this.showSuccessMessage = true;

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
