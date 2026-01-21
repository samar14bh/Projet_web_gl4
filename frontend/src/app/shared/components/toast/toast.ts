import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../Core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./toast.html',
  styleUrl: './toast.css',
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
