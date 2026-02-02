import { Component, inject, input, resource, signal, ChangeDetectionStrategy, numberAttribute } from '@angular/core';
import { MembershipService } from '../../Core/services/membership.service';
import { ApplicationResponseDto } from '../../Core/dtos/application/application-response.dto';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Loader } from '../../shared/components/loader/loader';
import { Error } from '../../shared/components/error/error';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationResponse {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  membershipService = inject(MembershipService);
  readonly applicationId = input.required<number, unknown>({ alias: 'applicationId', transform: numberAttribute });

  showDeleteModal = signal(false);

  application = resource({
    params: () => ({ applicationId: this.applicationId() }),
    loader: async ({ params }) => {
      try {
        return await firstValueFrom(this.membershipService.getApplicationById(params.applicationId)) ?? null;
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
    this.membershipService.deleteApplication(this.applicationId()).subscribe({
      next: () => {
        this.toastr.success('Success', 'Application deleted successfully');
        this.router.navigate(['/my-applications']);
      },
      error: (err) => {
        console.error('Failed to delete application', err);
        this.toastr.error('Error', 'Failed to delete application');
      }
    });
  }

  onPayFees() {
    console.log('Navigate to payment page');

  }
}
