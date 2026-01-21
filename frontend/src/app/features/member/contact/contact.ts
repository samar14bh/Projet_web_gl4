import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  readonly subject = signal('');
  readonly message = signal('');
  readonly isSending = signal(false);
  readonly isSuccess = signal(false);
  readonly errorMessage = signal('');

  onSubmit() {
    console.log(this.recipientEmail());
    console.log(this.subject());
    console.log(this.message());
    if (!this.subject().trim() || !this.message().trim()) return;

    this.isSending.set(true);
    this.errorMessage.set('');

    this.mailService.sendContactClubEmail(
      this.recipientEmail(),
      this.subject(),
      this.message()
    ).subscribe({
      next: () => {
        this.isSending.set(false);
        this.isSuccess.set(true);
        setTimeout(() => {
          this.close.emit();
        }, 2000);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.isSending.set(false);
        this.errorMessage.set('Échec de l\'envoi du message. Veuillez réessayer.');
      }
    });
  }
}
