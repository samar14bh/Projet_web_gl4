import {Component, inject, resource} from '@angular/core';
import {MembershipService} from '../../Core/services/membership.service';
import {Router} from '@angular/router';
import {ApplicationList} from '../../features/applications/application-list/application-list';
import {CommonModule} from '@angular/common';
import {Loader} from '../../shared/components/loader/loader';
import {Error} from '../../shared/components/error/error';
import {AuthService} from '../../Core/services/auth.service';
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
})
export class UserApplications {
  private readonly membershipService = inject(MembershipService);
  private readonly router = inject(Router);
  private readonly USER_ID = inject(AuthService).currentUser()?.id ?? 0;

  applications = resource({
    params:()=>({ userId: Number(this.USER_ID )}),
    loader: async ({ params }) => {
      try {
        return await this.membershipService.getApplicationsByUser(params.userId).toPromise() ?? [];
        console.log("the applications are ", this.applications);
        console.log("the user id is ", params.userId);
      } catch {
        return [];
      }
    }
  });




  readonly onViewDetails = (applicationId: number): void => {
    this.router.navigate(['/applications', applicationId]);
  };
}
