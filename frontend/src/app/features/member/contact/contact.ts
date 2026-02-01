import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MailService } from '../../../Core/services/mail.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private readonly mailService = inject(MailService);

  readonly clubName = input.required<string>();
  readonly recipientEmail = input.required<string>();
  readonly close = output<void>();

  readonly isSending = signal(false);
  readonly isSuccess = signal(false);
  readonly errorMessage = signal('');

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isSending.set(true);
    this.errorMessage.set('');

    const { subject, message } = form.value;

    this.mailService.sendContactClubEmail(
      this.recipientEmail(),
      subject,
      message
    ).subscribe({
      next: () => {
        this.isSuccess.set(true);
        this.isSending.set(false);
        setTimeout(() => {
          this.close.emit();
        }, 2000);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.errorMessage.set('Échec de l\'envoi du message. Veuillez réessayer.');
        this.isSending.set(false);
      }
    });
  }
}
