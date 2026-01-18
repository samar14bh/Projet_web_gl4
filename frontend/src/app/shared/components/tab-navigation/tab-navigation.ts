import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabItem } from '../../interfaces/components.interface';

/**
 * Tab navigation component with modern design
 */
@Component({
    selector: 'app-tab-navigation',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tab-navigation">
      @for (tab of tabs(); track tab.id) {
        <button
          class="tab-button"
          [class.active]="activeTab() === tab.id"
          (click)="selectTab(tab.id)"
        >
          @if (tab.icon) {
            <i [class]="'bi bi-' + tab.icon"></i>
          }
          <span>{{ tab.label }}</span>
          @if (tab.badge !== undefined && tab.badge > 0) {
            <span class="tab-badge">{{ tab.badge }}</span>
          }
        </button>
      }
    </div>
  `,
    styles: [`
    .tab-navigation {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--gray-100);
      margin-bottom: 24px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .tab-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-radius: 10px;
      color: var(--gray-500);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .tab-button:hover {
      color: var(--gray-900);
      background: var(--gray-50);
    }

    .tab-button.active {
      color: var(--primary-600);
      background: var(--primary-50);
      font-weight: 700;
    }

    .tab-button i {
      font-size: 18px;
    }

    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: var(--gray-200);
      color: var(--gray-700);
      font-size: 11px;
      font-weight: 700;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .tab-button.active .tab-badge {
      background: var(--primary-600);
      color: white;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }
  `],
})
export class TabNavigationComponent {
    // Inputs
    tabs = input.required<TabItem[]>();
    activeTab = input.required<string>();

    // Outputs
    tabChange = output<string>();

    selectTab(tabId: string) {
        this.tabChange.emit(tabId);
    }
}
