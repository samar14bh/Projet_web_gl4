import { Component, inject, resource, ChangeDetectionStrategy } from '@angular/core';
import { MembershipService } from '../../Core/services/membership.service';
import { Router } from '@angular/router';
import { ApplicationList } from '../../features/applications/application-list/application-list';
import { CommonModule } from '@angular/common';
import { Loader } from '../../shared/components/loader/loader';
import { Error } from '../../shared/components/error/error';
import { AuthService } from '../../Core/services/auth.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-user-applications',
  imports: [
    ApplicationList,
    CommonModule,
    Loader,
    Error

  ],
  templateUrl: './user-applications.html',
  styleUrl: './user-applications.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserApplications {
  private readonly membershipService = inject(MembershipService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  applications = resource({
    params: () => ({ userId: Number(this.authService.currentUser()?.id ?? 0) }),
    loader: async ({ params }) => {
      try {
        return await firstValueFrom(this.membershipService.getApplicationsByUser(params.userId)) ?? [];
      } catch {
        return [];
      }
    }
  });




  readonly onViewDetails = (applicationId: number): void => {
    this.router.navigate(['/applications', applicationId]);
  };
}
