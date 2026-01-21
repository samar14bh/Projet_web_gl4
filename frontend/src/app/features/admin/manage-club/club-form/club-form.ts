import {Component, effect, inject, input, output, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { FileUploadService } from '../../../../Core/services/file-upload.service';
import { ClubService } from '../../../../Core/services/club.service'
import {Club, CreateClubDto} from '../../../../Core/models/club.model';
import {lastValueFrom} from 'rxjs';
import {environment} from '../../../../../environments/environment';

/**
 * Formulaire de création d'un club
 */
@Component({
  selector: 'app-club-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './club-form.html',
  styleUrl: './club-form.css',
})
export class ClubFormComponent {
  // Input pour le mode édition
  club = input<Club | null>(null);

// Outputs
  onSuccess = output<void>();
  onCancel = output<void>();

// Effect pour pré-remplir le formulaire
  constructor() {
    effect(() => {
      const clubData = this.club();

      if (clubData) {
        // Mode édition
        this.loadClubData(clubData);
      } else {
        // Mode création → reset total
        this.resetForm();
      }
    });

  }
  /**
   * Charger les données d'un club existant
   */
  loadClubData(club: Club) {
    this.name = club.name;
    this.slug = club.slug;
    this.description = club.description;
    this.contactEmail = club.contactEmail;
    this.categoryId = club.categoryId;
    this.isPublic = club.isPublic;
    this.membershipFeeAmount = club.membershipFeeAmount;
    this.creationDate = new Date(club.creationDate).toISOString().split('T')[0];

    // Charger les images existantes
    if (club.logo) {
      this.logoPreview.set(environment.uploadsUrl + club.logo);
    }

    if (club.coverImage) {
      this.coverImagePreview.set(environment.uploadsUrl + club.coverImage);
    }

  }
  private readonly fileUploadService = inject(FileUploadService);
  private readonly clubsService = inject(ClubService);

  name = '';
  slug = '';
  description = '';
  contactEmail = '';
  categoryId: number | null = null;
  isPublic = true; // Par défaut public
  membershipFeeAmount = 0; // Par défaut gratuit
  creationDate = new Date().toISOString().split('T')[0];

  // Logo
  selectedLogo: File | null = null;
  logoPreview = signal<string | null>(null);

// Cover Image ← AJOUTER
  selectedCoverImage: File | null = null;
  coverImagePreview = signal<string | null>(null);

  // State
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

// Validation errors
  errors = {
    name: '',
    slug: '',
    description: '',
    contactEmail: '',
    categoryId: '',
    membershipFeeAmount: '',
    creationDate: '',
    logo: '',
    coverImage: '',
  };

  /**
   * Gérer la sélection du logo
   */
  async onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedLogo = null;
      this.logoPreview.set(null);
      this.errors.logo = '';
      return;
    }

    // Valider l'image
    const validation = this.fileUploadService.validateImage(file);
    if (!validation.valid) {
      this.errors.logo = validation.error || 'Fichier invalide';
      this.selectedLogo = null;
      this.logoPreview.set(null);
      return;
    }

    // Stocker le fichier et générer le preview
    this.selectedLogo = file;
    this.errors.logo = '';

    try {
      const base64 = await this.fileUploadService.fileToBase64(file);
      this.logoPreview.set(base64);
    } catch (error) {
      console.error('Erreur preview:', error);
      this.errors.logo = 'Erreur lors du chargement du preview';
    }
  }

  /**
   * Supprimer le logo sélectionné
   */
  removeLogo() {
    this.selectedLogo = null;
    this.logoPreview.set(null);
    this.errors.logo = '';
  }
  /**
   * Gérer la sélection de la cover image
   */
  async onCoverImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.selectedCoverImage = null;
      this.coverImagePreview.set(null);
      this.errors.coverImage = '';
      return;
    }

    // Valider l'image (taille max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errors.coverImage = 'Fichier trop volumineux (max 5 MB)';
      this.selectedCoverImage = null;
      this.coverImagePreview.set(null);
      return;
    }

    const validation = this.fileUploadService.validateImage(file);
    if (!validation.valid) {
      this.errors.coverImage = validation.error || 'Fichier invalide';
      this.selectedCoverImage = null;
      this.coverImagePreview.set(null);
      return;
    }

    this.selectedCoverImage = file;
    this.errors.coverImage = '';

    try {
      const base64 = await this.fileUploadService.fileToBase64(file);
      this.coverImagePreview.set(base64);
    } catch (error) {
      console.error('Erreur preview:', error);
      this.errors.coverImage = 'Erreur lors du chargement du preview';
    }
  }

  /**
   * Supprimer la cover image sélectionnée
   */
  removeCoverImage() {
    this.selectedCoverImage = null;
    this.coverImagePreview.set(null);
    this.errors.coverImage = '';
  }

  /**
   * Valider le formulaire
   */
  /**
   * Valider le formulaire
   */
  validateForm(): boolean {
    console.log('🔍 validateForm() appelé'); // ← AJOUTER EN HAUT
    let isValid = true;

    // Nom
    if (!this.name.trim()) {
      this.errors.name = 'Le nom est requis';
      isValid = false;
    } else if (this.name.trim().length < 3) {
      this.errors.name = 'Le nom doit contenir au moins 3 caractères';
      isValid = false;
    } else {
      this.errors.name = '';
    }

    // Slug
    if (!this.slug.trim()) {
      this.errors.slug = 'Le slug est requis';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(this.slug.trim())) {
      this.errors.slug = 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets';
      isValid = false;
    } else {
      this.errors.slug = '';
    }

    // Description
    if (!this.description.trim()) {
      this.errors.description = 'La description est requise';
      isValid = false;
    } else if (this.description.trim().length < 10) {
      this.errors.description = 'La description doit contenir au moins 10 caractères';
      isValid = false;
    } else {
      this.errors.description = '';
    }

    // Email de contact
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.contactEmail.trim()) {
      this.errors.contactEmail = "L'email de contact est requis";
      isValid = false;
    } else if (!emailRegex.test(this.contactEmail.trim())) {
      this.errors.contactEmail = 'Email invalide';
      isValid = false;
    } else {
      this.errors.contactEmail = '';
    }

    // Catégorie
    if (!this.categoryId) {
      this.errors.categoryId = 'La catégorie est requise';
      isValid = false;
    } else {
      this.errors.categoryId = '';
    }

    // Cotisation
    if (this.membershipFeeAmount < 0) {
      this.errors.membershipFeeAmount = 'Le montant ne peut pas être négatif';
      isValid = false;
    } else {
      this.errors.membershipFeeAmount = '';
    }

    // Date de création
    if (!this.creationDate) {
      this.errors.creationDate = 'La date de création est requise';
      isValid = false;
    } else {
      this.errors.creationDate = '';
    }

    console.log('📊 Résultat validation:', isValid); // ← AJOUTER À LA FIN AVANT return
    console.log('📋 Erreurs:', this.errors); // ← AJOUTER AUSSIonS

    return isValid;
  }

  /**
   * Soumettre le formulaire
   */
  /**
   * Soumettre le formulaire
   */
  async onSubmit() {
    console.log('🔥 onSubmit() appelé !');
    // Réinitialiser l'erreur
    this.submitError.set(null);

    // Valider
    if (!this.validateForm()) {
      console.log('❌ Validation échouée');
      return;
    }

    console.log('✅ Validation réussie');
    this.isSubmitting.set(true);

    try {
      console.log('📤 Début de la', this.club() ? 'modification' : 'création');

      const formData = new FormData();

      formData.append('name', this.name.trim());
      formData.append('slug', this.slug.trim());
      formData.append('description', this.description.trim());
      formData.append('contactEmail', this.contactEmail.trim());
      formData.append('categoryId', String(Number(this.categoryId)));
      formData.append('isPublic', this.isPublic.toString());
      formData.append('membershipFeeAmount', this.membershipFeeAmount.toString());
      formData.append('creationDate', new Date(this.creationDate).toISOString());

      // Ajouter les fichiers UNIQUEMENT si nouveaux
      if (this.selectedLogo) {
        formData.append('logo', this.selectedLogo, this.selectedLogo.name);
      }
      if (this.selectedCoverImage) {
        formData.append('coverImage', this.selectedCoverImage, this.selectedCoverImage.name);
      }

      let result;
      if (this.club()) {
        // Mode édition
        result = await lastValueFrom(
          this.clubsService.updateClubWithLogo(this.club()!.id, formData)
        );
        console.log('✅ Club modifié:', result);
      } else {
        // Mode création
        result = await lastValueFrom(
          this.clubsService.createClubWithLogo(formData)
        );
        console.log('✅ Club créé:', result);
      }

      console.log('🎉 Opération terminée avec succès !');
      this.onSuccess.emit();
      this.resetForm();
    }catch (error: any) {
      console.error('❌ Erreur création club:', error);
      console.error('Message backend:', error?.error?.message);

      if (Array.isArray(error?.error?.message)) {
        this.submitError.set(error.error.message.join(', '));
      } else {
        this.submitError.set(
          error?.error?.message || 'Erreur lors de la création du club',
        );
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Réinitialiser le formulaire
   */
  /**
   * Réinitialiser le formulaire
   */
  resetForm() {
    this.name = '';
    this.slug = '';
    this.description = '';
    this.contactEmail = '';
    this.categoryId = null;
    this.isPublic = true;
    this.membershipFeeAmount = 0;
    this.creationDate = new Date().toISOString().split('T')[0];
    this.selectedLogo = null;
    this.selectedCoverImage = null;
    this.coverImagePreview.set(null);
    this.logoPreview.set(null);
    this.errors = {
      name: '',
      slug: '',
      description: '',
      contactEmail: '',
      categoryId: '',
      membershipFeeAmount: '',
      creationDate: '',
      logo: '',
      coverImage: '',
    };
  }

  /**
   * Annuler
   */
  cancel() {
    this.onCancel.emit();
  }
}
