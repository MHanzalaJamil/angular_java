import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class PaginationComponent {

  currentPage = input.required<number>();
  totalPages = input.required<number>();

  pageChanged = output<number>();

  pages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const pages: number[] = [];

    pages.push(0);

    const start = Math.max(1, current - 2);
    const end = Math.min(total - 2, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    pages.push(total - 1);

    return [...new Set(pages)];
  });

  goToPage(page: number): void {
    if (page !== this.currentPage()) {
      this.pageChanged.emit(page);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.pageChanged.emit(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.pageChanged.emit(this.currentPage() + 1);
    }
  }
}
