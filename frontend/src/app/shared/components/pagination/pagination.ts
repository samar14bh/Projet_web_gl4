import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  readonly paginationRange = computed(() =>
    this.getPaginationRange(this.currentPage(), this.totalPages())
  );

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.pageChange.emit(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToNextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  private getPaginationRange(
    current: number,
    total: number,
    max = 5
  ): number[] {
    const range: number[] = [];
    let start = Math.max(1, current - Math.floor(max / 2));
    let end = Math.min(total, start + max - 1);

    if (end - start < max - 1) {
      start = Math.max(1, end - max + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }
}
