import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant Button moderne avec Signals (Angular 20)
 * Utilise les nouveaux input() et output() signals
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  // Inputs avec Signals (Angular 20)
  label = input.required<string>();
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  icon = input<string>('');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  // Output avec Signal
  clicked = output<void>();

  // Classes CSS dynamiques avec computed
  buttonClasses = computed(() => {
    return `btn-${this.variant()} btn-${this.size()}`;
  });

  handleClick() {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
