import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  readonly clubName = input.required<string>();
  readonly close = output<void>();
  readonly submitted = output<{ subject: string; message: string }>();

  readonly subject = signal('');
  readonly message = signal('');
  readonly isSending = signal(false);
  readonly isSuccess = signal(false);

  onSubmit() {
    if (!this.subject().trim() || !this.message().trim()) return;

    this.isSending.set(true);

    setTimeout(() => {
      this.submitted.emit({
        subject: this.subject(),
        message: this.message()
      });
      this.isSending.set(false);
      this.isSuccess.set(true);

      setTimeout(() => {
        this.close.emit();
      }, 2000);
    }, 1500);
  }
}
