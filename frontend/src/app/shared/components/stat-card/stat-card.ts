import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardData } from '../../interfaces/components.interface';

/**
 * Reusable statistics card component with modern design
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="variantClass()">
      <div class="stat-card-top">
        <div class="stat-icon" [class]="iconVariantClass()">
          <i [class]="'bi bi-' + icon()"></i>
        </div>
        @if (trend()) {
          <div class="stat-change" [class]="trendClass()">
            <i [class]="trendIcon()"></i>
            <span>{{ trendValue() }}</span>
          </div>
        }
      </div>
      <div class="stat-card-content">
        <h3>{{ value() }}</h3>
        <p>{{ title() }}</p>
      </div>
      @if (footer()) {
        <div class="stat-card-footer">
          <span class="stat-detail">{{ footer() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .stat-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--gray-100);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: slideIn 0.3s ease-out;
      position: relative;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
    }

    .stat-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-icon.primary { background: var(--gradient-primary); }
    .stat-icon.secondary { background: var(--gradient-secondary); }
    .stat-icon.accent { background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%); }
    .stat-icon.success { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); }
    .stat-icon.warning { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
    .stat-icon.danger { background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 10px;
    }

    .stat-change.positive { background: #ecfdf5; color: #047857; }
    .stat-change.negative { background: #fef2f2; color: #b91c1c; }
    .stat-change.neutral { background: var(--gray-100); color: var(--gray-700); }

    .stat-card-content h3 {
      font-size: 36px;
      font-weight: 800;
      color: var(--gray-900);
      margin: 0 0 4px 0;
      line-height: 1;
      letter-spacing: -1px;
    }

    .stat-card-content p {
      font-size: 14px;
      color: var(--gray-500);
      margin: 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-card-footer {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--gray-100);
    }

    .stat-detail {
      font-size: 13px;
      color: var(--gray-500);
      font-weight: 500;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class StatCardComponent {
  // Inputs
  title = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();
  trend = input<'up' | 'down' | 'neutral'>();
  trendValue = input<string>();
  variant = input<'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'>('primary');
  footer = input<string>();

  // Computed classes
  variantClass = computed(() => `variant-${this.variant()}`);
  iconVariantClass = computed(() => this.variant());

  trendClass = computed(() => {
    const t = this.trend();
    if (t === 'up') return 'positive';
    if (t === 'down') return 'negative';
    return 'neutral';
  });

  trendIcon = computed(() => {
    const t = this.trend();
    if (t === 'up') return 'bi bi-arrow-up';
    if (t === 'down') return 'bi bi-arrow-down';
    return 'bi bi-dash';
  });
}
