import {Component, inject, input, resource} from '@angular/core';
import {MembershipService} from '../../Core/services/membership.service';
import {ApplicationResponseDto} from '../../Core/dtos/application-response.dto';
import {ActivatedRoute} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {Loader} from '../../shared/components/loader/loader';
import {Error} from '../../shared/components/error/error';

@Component({
  selector: 'app-application-response',
  imports: [
    DatePipe,
    CommonModule,
    Loader,
    Error
  ],
  templateUrl: './application-response.html',
  styleUrl: './application-response.css',
})
export class ApplicationResponse {
  private route = inject(ActivatedRoute);
  membershipService=inject(MembershipService);
  id :number=Number(this.route.snapshot.paramMap.get('applicationId'));
  application = resource({
    params:()=>({ applicationId: this.id }),
    loader: async ({ params }) => {
      try {
        return await this.membershipService.getApplicationById(params.applicationId).toPromise() ?? null;
      } catch {
        return null;
      }
    }
  });







}
