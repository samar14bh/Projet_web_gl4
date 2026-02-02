import { Component, inject, input, resource, signal } from '@angular/core';
import { MembershipService } from '../../Core/services/membership.service';
import { ApplicationResponseDto } from '../../Core/dtos/application/application-response.dto';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Loader } from '../../shared/components/loader/loader';
import { Error } from '../../shared/components/error/error';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-application-response',
  imports: [
    DatePipe,
    CommonModule,
    Loader,
    Error,
    ConfirmModal,
    RouterModule
  ],
  templateUrl: './application-response.html',
  styleUrls: ['./application-response.css'],
})
export class ApplicationResponse {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  membershipService = inject(MembershipService);
  id: number = Number(this.route.snapshot.paramMap.get('applicationId'));

  showDeleteModal = signal(false);

  application = resource({
    params: () => ({ applicationId: this.id }),
    loader: async ({ params }) => {
      try {
        return await this.membershipService.getApplicationById(params.applicationId).toPromise() ?? null;
      } catch {
        return null;
      }
    }
  });

  onDeleteApplication() {
    this.showDeleteModal.set(true);
  }

  confirmDeleteApplication() {
    this.showDeleteModal.set(false);
    this.membershipService.deleteApplication(this.id).subscribe({
      next: () => {
        this.router.navigate(['/my-applications']);
      },
      error: (err) => {
        console.error('Failed to delete application', err);
        alert('Failed to delete application');
      }
    });
  }

  onPayFees() {
    const app = this.application.value();
    if (app?.clubId) {
      this.router.navigate(['/payment'], {
        queryParams: {
          type: 'membership',
          clubId: app.clubId
        }
      });
    } else {
      console.error('Club ID not found in application');
      alert('Impossible de naviguer vers la page de paiement : informations du club manquantes');
    }
  }
}
