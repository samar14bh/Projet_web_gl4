import {
  Component,
  signal,
  inject,
  output,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { FinanceService } from '../../../../Core/services/finance.service';
import {
  CreateTransactionDto,
  TransactionCategory,
  TransactionType,
} from '../../../../Core/models/finance.model';

/**
 * Composant formulaire pour ajouter une transaction (revenu ou dépense)
 */
@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css',
})
export class TransactionForm {
  private readonly fb = inject(FormBuilder);
  private readonly financeService = inject(FinanceService);

  // ✅ Inputs
  clubId = input.required<number>(); // ✅ ClubId passé par le parent

  // Outputs
  onSuccess = output<void>();
  onCancel = output<void>();

  // Signals
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  // Enums pour le template
  TransactionCategory = TransactionCategory;
  TransactionType = TransactionType;

  // Types de transaction disponibles
  transactionTypes = [
    { value: TransactionType.REVENUE, label: 'Revenu' },
    { value: TransactionType.EXPENSE, label: 'Dépense' },
  ];

  // Catégories disponibles
  transactionCategories = [
    { value: TransactionCategory.MEMBERSHIP, label: 'Cotisation' },
    { value: TransactionCategory.EVENT, label: 'Événement' },
    { value: TransactionCategory.DONATION, label: 'Don' },
    { value: TransactionCategory.EXPENSE, label: 'Dépense générale' },
  ];

  // ✅ Formulaire SANS clubId (sera ajouté automatiquement)
  transactionForm = this.fb.group({
    type: [TransactionType.EXPENSE, Validators.required],
    description: ['', [Validators.required, Validators.minLength(3)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category: [TransactionCategory.EXPENSE, Validators.required],
    date: [this.formatDateForInput(new Date()), Validators.required],
  });

  /**
   * Formater une date pour input date
   */
  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit() {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.transactionForm.value;
    const createDto: CreateTransactionDto = {
      type: formValue.type!,
      description: formValue.description!,
      amount: formValue.amount!,
      category: formValue.category!,
      date: formValue.date!,
      clubId: this.clubId(), // ✅ Utiliser le clubId passé en input
    };

    this.financeService.createTransaction(createDto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.transactionForm.reset({
          type: TransactionType.EXPENSE,
          category: TransactionCategory.EXPENSE,
          date: this.formatDateForInput(new Date()),
        });
        this.onSuccess.emit();
      },
      error: (error: any) => {
        this.isSubmitting.set(false);
        this.submitError.set(
          error.error?.message || "Erreur lors de l'ajout de la transaction",
        );
        console.error('Erreur ajout transaction:', error);
      },
    });
  }

  /**
   * Annuler le formulaire
   */
  cancel() {
    this.onCancel.emit();
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Récupérer le message d'erreur d'un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.transactionForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['minlength'])
      return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['min'])
      return `Montant minimum: ${field.errors['min'].min} TND`;

    return 'Erreur de validation';
  }
}
