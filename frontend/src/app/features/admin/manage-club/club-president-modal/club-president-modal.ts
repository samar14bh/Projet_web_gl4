import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ClubService } from '../../../../Core/services/club.service';
import { lastValueFrom } from 'rxjs';

interface President {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userImage?: string;
  dateDebut: Date;
}

interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  image?: string;
}

@Component({
  selector: 'app-club-president-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './club-president-modal.html',
  styleUrl: './club-president-modal.css',
})
export class ClubPresidentModalComponent {
  private readonly clubService = inject(ClubService);

  // Inputs
  clubId = input.required<number>();
  clubName = input.required<string>();

  // Outputs
  onClose = output<void>();
  onSuccess = output<void>();

  // State
  president = signal<President | null>(null);
  allUsers = signal<User[]>([]);
  selectedUserId = signal<number | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.clubId();
      if (id) {
        this.loadData();
      }
    });
  }

  /**
   * Charger les données
   */
  async loadData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Charger le président actuel
      const presidentData = await lastValueFrom(
        this.clubService.getClubPresident(this.clubId())
      );
      this.president.set(presidentData);

      // Charger tous les utilisateurs
      const users = await lastValueFrom(this.clubService.getAllUsers());
      this.allUsers.set(users);
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      this.errorMessage.set('Erreur lors du chargement des données');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Assigner un nouveau président
   */
  async assignPresident() {
    if (!this.selectedUserId()) {
      this.errorMessage.set('Veuillez sélectionner un utilisateur');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await lastValueFrom(
        this.clubService.assignPresident(this.clubId(), this.selectedUserId()!)
      );

      this.onSuccess.emit();
      await this.loadData();
      this.selectedUserId.set(null);
    } catch (error: any) {
      console.error('Erreur assignation:', error);
      this.errorMessage.set(
        error?.error?.message || 'Erreur lors de l\'assignation du président'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Supprimer le président actuel
   */
  async removePresident() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer le président actuel ?')) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await lastValueFrom(
        this.clubService.removePresident(this.clubId())
      );

      this.onSuccess.emit();
      await this.loadData();
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      this.errorMessage.set(
        error?.error?.message || 'Erreur lors de la suppression du président'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Fermer le modal
   */
  close() {
    this.onClose.emit();
  }
}
