import { Component, input, output, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant Modal moderne avec Signals (Angular 20)
 * Utilise viewChild() pour accéder aux éléments du template
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  // Inputs
  isOpen = input.required<boolean>();
  title = input.required<string>();
  showClose = input<boolean>(true);
  showFooter = input<boolean>(true);
  closeOnOverlayClick = input<boolean>(true);

  // Output
  closed = output<void>();

  // ViewChild avec Signal (Angular 20)
  modalContainer = viewChild<ElementRef>('modalContainer');

  constructor() {
    // Effect pour gérer le scroll du body
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  close() {
    this.closed.emit();
  }

  handleOverlayClick(event: MouseEvent) {
    // Vérifier si le clic est sur l'overlay et pas sur le modal
    if (this.closeOnOverlayClick() && event.target === event.currentTarget) {
      this.close();
    }
  }
}
