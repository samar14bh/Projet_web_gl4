import { Component, input, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error {
  private readonly location = inject(Location);

  errorMessage = input('An unexpected error has occurred.')
  returnLink = input<string>('');
  buttonText = input<string>('Retour');

  goBack() {
    this.location.back();
  }
}
