import {Component, Input, input, output, Output} from '@angular/core';
import {ApplicationResponseDto} from '../../../Core/dtos/application-response.dto';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-application-item',
  imports: [
    DatePipe
  ],
  templateUrl: './application-item.html',
  styleUrl: './application-item.css',
})
export class ApplicationItem {
  application  = input.required<ApplicationResponseDto>();
  viewDetails = output<number>();



  onViewDetails(): void {
    this.viewDetails.emit(this.application().id);
  }




}
