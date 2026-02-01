import { Component, inject, input, output } from '@angular/core';
import { MembershipService } from '../../../Core/services/membership.service';
import { Observable } from 'rxjs';
import { ApplicationResponseDto } from '../../../Core/dtos/application/application-response.dto';
import { ApplicationItem } from '../application-item/application-item';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-list',
  imports: [
    ApplicationItem,
    CommonModule
  ],
  templateUrl: './application-list.html',
  styleUrl: './application-list.css',
})
export class ApplicationList {
  applications = input.required<ApplicationResponseDto[]>();

  viewDetails = output<number>();



  onViewDetails(applicationId: number): void {
    this.viewDetails.emit(applicationId);
  }


}
